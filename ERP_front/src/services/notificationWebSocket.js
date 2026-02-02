// ERP_front/src/services/notificationWebSocket.js
class NotificationWebSocket {
  constructor() {
    this.socket = null;
    this.reconnectInterval = 3000;
    this.maxReconnectAttempts = Infinity;
    this.reconnectAttempts = 0;
    this.messageHandlers = new Map();
    this.isConnecting = false;
    this.pingInterval = null;
    this.onNotificationCallbacks = new Set();
    this.onStatusChangeCallbacks = new Set();
    this.shouldReconnect = true;
    this.isManuallyDisconnected = false;
  }

  connect() {
    if (this.isConnecting || this.socket?.readyState === WebSocket.OPEN || this.socket?.readyState === WebSocket.CONNECTING) {
      return;
    }

    if (this.isManuallyDisconnected) {
      return;
    }

    this.isConnecting = true;
    this.notifyStatusChange('connecting');
    
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      console.warn('No access token found in localStorage, will retry in 10s');
      this.isConnecting = false;
      this.notifyStatusChange('error', 'No access token');
      
      setTimeout(() => {
        if (this.shouldReconnect && !this.isManuallyDisconnected) {
          this.attemptReconnect();
        }
      }, 10000);
      return;
    }

    const wsUrl = `wss://api.acrelis.ru/ws/notifications/?token=${encodeURIComponent(token)}`;
    
    console.log('Connecting to WebSocket...');
    
    try {
      this.socket = new WebSocket(wsUrl);
      
      this.socket.onopen = (event) => this.handleOpen(event);
      this.socket.onmessage = (event) => this.handleMessage(event);
      this.socket.onclose = (event) => this.handleClose(event);
      this.socket.onerror = (error) => this.handleError(error);
      
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.isConnecting = false;
      this.notifyStatusChange('error', error.message);
      
      if (this.shouldReconnect && !this.isManuallyDisconnected) {
        this.attemptReconnect();
      }
    }
  }

  handleOpen(event) {
    console.log('✅ WebSocket connection established');
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.notifyStatusChange('connected');
    this.startPing();
  }

  handleMessage(event) {
    try {
      const data = JSON.parse(event.data);
      
      switch(data.type) {
        case 'connected':
          console.log('✅ WebSocket authenticated for user:', data.username);
          this.notifyStatusChange('authenticated', `User: ${data.username}`);
          console.log('data', data)
          break;
          
        case 'notification':
          this.notifySubscribers({
            id: Date.now() + Math.random(),
            title: data.title || 'Уведомление',
            message: data.message || '',
            url: data.url || '',
            timestamp: data.timestamp || new Date().toISOString(),
            type: this.getNotificationType(data.title || data.message)
          });
          break;
          
        case 'pong':
          if (process.env.NODE_ENV === 'development') {
            console.log('🏓 Pong received');
          }
          break;
          
        default:
          if (this.messageHandlers.has(data.type)) {
            this.messageHandlers.get(data.type)(data);
          }
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  getNotificationType(content) {
    const lowerContent = content.toLowerCase();
    console.log(content)
    if (lowerContent.includes('ошибка') || lowerContent.includes('error')) {
      return 'error';
    } else if (lowerContent.includes('успех') || lowerContent.includes('success')) {
      return 'success';
    } else if (lowerContent.includes('предупреждение') || lowerContent.includes('warning')) {
      return 'warning';
    } else {
      return 'info';
    }
  }

  handleClose(event) {
    console.log('📴 WebSocket disconnected, code:', event.code);
    this.isConnecting = false;
    this.stopPing();
    
    if (event.code === 401) {
      console.warn('WebSocket authentication failed');
      this.notifyStatusChange('unauthorized', 'Authentication failed');
      this.handleTokenExpired();
      return;
    }
    
    if (event.code === 1000 && this.isManuallyDisconnected) {
      this.notifyStatusChange('disconnected', 'Manual disconnect');
      return;
    }
    
    if (event.code === 1006) {
      console.warn('Connection failed (1006), retrying...');
      this.notifyStatusChange('error', 'Connection failed');
    } else {
      this.notifyStatusChange('disconnected', `Code: ${event.code}`);
    }
    
    if (this.shouldReconnect && !this.isManuallyDisconnected) {
      this.attemptReconnect();
    }
  }

  handleError(error) {
    console.error('WebSocket error:', error);
    this.isConnecting = false;
    this.notifyStatusChange('error', 'Connection error');
    
    if (this.shouldReconnect && !this.isManuallyDisconnected) {
      setTimeout(() => {
        this.attemptReconnect();
      }, 5000);
    }
  }

  async handleTokenExpired() {
    console.log('Attempting to refresh token...');
    
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        console.error('No refresh token available');
        this.notifyStatusChange('error', 'Login required');
        return;
      }
      
      const response = await fetch('https://api.acrelis.ru/api/token/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken })
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access);
        console.log('Token refreshed successfully');
        
        setTimeout(() => {
          if (this.shouldReconnect && !this.isManuallyDisconnected) {
            this.connect();
          }
        }, 1000);
        
      } else {
        console.error('Token refresh failed');
        this.notifyStatusChange('error', 'Session expired');
        
        setTimeout(() => {
          if (this.shouldReconnect && !this.isManuallyDisconnected) {
            this.attemptReconnect();
          }
        }, 30000);
      }
      
    } catch (error) {
      console.error('Error refreshing token:', error);
      this.notifyStatusChange('error', 'Token refresh failed');
      
      setTimeout(() => {
        if (this.shouldReconnect && !this.isManuallyDisconnected) {
          this.attemptReconnect();
        }
      }, 30000);
    }
  }

  attemptReconnect() {
    if (!this.shouldReconnect || this.isManuallyDisconnected) {
      return;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.notifyStatusChange('error', 'Max reconnection attempts reached');
      return;
    }
    
    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts})...`);
    
    const delay = Math.min(
      this.reconnectInterval * Math.pow(1.5, this.reconnectAttempts - 1),
      30000
    );
    
    setTimeout(() => {
      if (this.shouldReconnect && !this.isManuallyDisconnected) {
        this.connect();
      }
    }, delay);
  }

  startPing() {
    this.stopPing();
    
    this.pingInterval = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.sendMessage({
          type: 'ping',
          timestamp: Date.now()
        });
      }
    }, 20000);
  }

  stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  sendMessage(data) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      try {
        this.socket.send(JSON.stringify(data));
        return true;
      } catch (error) {
        console.error('Error sending WebSocket message:', error);
        return false;
      }
    }
    return false;
  }

  onMessage(type, handler) {
    this.messageHandlers.set(type, handler);
  }

  subscribe(callback) {
    this.onNotificationCallbacks.add(callback);
    return () => this.unsubscribe(callback);
  }

  unsubscribe(callback) {
    this.onNotificationCallbacks.delete(callback);
  }

  subscribeToStatus(callback) {
    this.onStatusChangeCallbacks.add(callback);
    return () => this.unsubscribeFromStatus(callback);
  }

  unsubscribeFromStatus(callback) {
    this.onStatusChangeCallbacks.delete(callback);
  }

  notifySubscribers(notification) {
    this.onNotificationCallbacks.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error in notification callback:', error);
      }
    });
  }

  notifyStatusChange(status, details = '') {
    this.onStatusChangeCallbacks.forEach(callback => {
      try {
        callback(status, details);
      } catch (error) {
        console.error('Error in status callback:', error);
      }
    });
  }

  disconnect() {
    console.log('Manual WebSocket disconnect');
    this.shouldReconnect = false;
    this.isManuallyDisconnected = true;
    this.stopPing();
    
    if (this.socket) {
      this.socket.close(1000, 'Manual disconnect');
      this.socket = null;
    }
    
    this.isConnecting = false;
    this.notifyStatusChange('disconnected', 'Manual disconnect');
  }

  reconnect() {
    console.log('Manual WebSocket reconnect');
    this.isManuallyDisconnected = false;
    this.shouldReconnect = true;
    this.reconnectAttempts = 0;
    this.connect();
  }

  getStatus() {
    if (!this.socket) return 'disconnected';
    
    switch(this.socket.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'unknown';
    }
  }
}

const notificationWebSocket = new NotificationWebSocket();

if (typeof window !== 'undefined') {
  setTimeout(() => {
    notificationWebSocket.connect();
  }, 1000);
}

export default notificationWebSocket;