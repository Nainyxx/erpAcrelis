// services/taskWebSocketService.js

class TaskWebSocketService {
    constructor(taskId, options = {}) {
        this.taskId = taskId;
        this.ws = null;
        
        // Настройки
        this.maxConnectionAttempts = options.maxConnectionAttempts || 10;
        this.reconnectBaseDelay = options.reconnectBaseDelay || 2000;
        this.maxReconnectDelay = options.maxReconnectDelay || 30000;
        this.heartbeatInterval = options.heartbeatInterval || 30000; // 30 секунд
        this.heartbeatTimeout = options.heartbeatTimeout || 10000; // 10 секунд
        
        // Состояние
        this.connectionAttempts = 0;
        this.isConnecting = false;
        this.isAuthenticated = false; // Флаг аутентификации
        this.shouldReconnect = true;
        this.lastHeartbeat = null;
        this.heartbeatTimer = null;
        this.reconnectTimer = null;
        this.authTimeout = null;
        
        // Колбэки
        this.callbacks = {
            comment: [],
            connect: [],
            disconnect: [],
            error: [],
            auth: [],
            reconnecting: []
        };
        
        // Очередь сообщений, ожидающих отправки после аутентификации
        this.messageQueue = [];
        
        // Автоматически начинаем подключение
        this.connect();
    }

    // ==================== ПОЛУЧЕНИЕ ТОКЕНА ====================

    getAuthToken() {
        try {
            // Получаем токен из localStorage
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                return null;
            }
            
            return token;
            
        } catch (error) {
            return null;
        }
    }

    // ==================== ПОДКЛЮЧЕНИЕ ====================

    connect() {
        if (this.isConnecting || this.isConnected()) {
            return;
        }
        
        if (this.connectionAttempts >= this.maxConnectionAttempts) {
            this.triggerError(new Error(`Превышено максимальное количество попыток подключения (${this.maxConnectionAttempts})`));
            return;
        }
        
        this.isConnecting = true;
        this.connectionAttempts++;
        this.isAuthenticated = false; // Сбрасываем флаг аутентификации
        
        
        // Уведомляем о начале переподключения
        this.callbacks.reconnecting.forEach(callback => 
            callback(this.connectionAttempts, this.getReconnectDelay())
        );
        
        const token = this.getAuthToken();
        
        if (!token) {
            this.isConnecting = false;
            this.scheduleReconnect();
            return;
        }
        
        // Формируем правильный URL
        const wsUrl = `wss://api.acrelis.ru/ws/task/${this.taskId}/comments/?token=${encodeURIComponent(token)}`;
        
        
        try {
            this.ws = new WebSocket(wsUrl);
            
            this.ws.onopen = this.handleOpen.bind(this);
            this.ws.onmessage = this.handleMessage.bind(this);
            this.ws.onclose = this.handleClose.bind(this);
            this.ws.onerror = this.handleError.bind(this);
            
        } catch (error) {
            this.handleError(error);
        }
    }

    handleOpen() {
        
        this.isConnecting = false;
        this.connectionAttempts = 0;
        
        // Устанавливаем таймаут на ожидание аутентификации
        this.setAuthTimeout();
        
        // Триггерим событие подключения
        this.callbacks.connect.forEach(callback => callback());
    }

    handleMessage(event) {
        try {
            const data = JSON.parse(event.data);
            
            this.processMessage(data);
            
        } catch (error) {
        }
    }

    processMessage(data) {
        switch(data.type) {
            case 'comment_added':
                this.callbacks.comment.forEach(callback => callback(data.comment));
                break;
                
            case 'auth_success':
                this.isAuthenticated = true;
                clearTimeout(this.authTimeout); // Очищаем таймаут аутентификации
                this.callbacks.auth.forEach(callback => callback());
                
                // Отправляем сообщения из очереди после аутентификации
                this.processMessageQueue();
                break;
                
            case 'auth_error':
                this.isAuthenticated = false;
                clearTimeout(this.authTimeout);
                this.triggerError(new Error(`Аутентификация: ${data.message}`));
                break;
                
            case 'error':
                this.triggerError(new Error(data.message));
                break;
                
        }
    }

    setAuthTimeout() {
        // Устанавливаем таймаут ожидания аутентификации (5 секунд)
        clearTimeout(this.authTimeout);
        this.authTimeout = setTimeout(() => {
            if (!this.isAuthenticated && this.isConnected()) {
                this.reconnect();
            }
        }, 5000);
    }

    handleClose(event) {
        
        this.isConnecting = false;
        this.isAuthenticated = false;
        clearTimeout(this.authTimeout);
        this.stopHeartbeat();
        
        this.callbacks.disconnect.forEach(callback => 
            callback(event.code, event.reason)
        );
        
        if (this.shouldReconnect) {
            this.scheduleReconnect();
        }
    }

    handleError(error) {
        
        this.isConnecting = false;
        this.isAuthenticated = false;
        clearTimeout(this.authTimeout);
        this.stopHeartbeat();
        
        this.triggerError(error);
        
        if (this.shouldReconnect) {
            this.scheduleReconnect();
        }
    }

    // ==================== ОЧЕРЕДЬ СООБЩЕНИЙ ====================

    addToMessageQueue(message) {
        this.messageQueue.push(message);
    }

    processMessageQueue() {
        if (!this.isAuthenticated) {
            return;
        }
        
        
        while (this.messageQueue.length > 0) {
            const message = this.messageQueue.shift();
            try {
                this.sendMessage(message);
            } catch (error) {
                // Можно добавить сообщение обратно в очередь или обработать ошибку
            }
        }
    }

    // ==================== ПЕРЕПОДКЛЮЧЕНИЕ ====================

    getReconnectDelay() {
        // Экспоненциальная задержка с ограничением
        const delay = Math.min(
            this.reconnectBaseDelay * Math.pow(1.5, this.connectionAttempts - 1),
            this.maxReconnectDelay
        );
        
        return delay;
    }

    scheduleReconnect() {
        clearTimeout(this.reconnectTimer);
        
        if (!this.shouldReconnect || this.isConnecting) {
            return;
        }
        
        const delay = this.getReconnectDelay();
        
        
        this.reconnectTimer = setTimeout(() => {
            if (this.shouldReconnect && !this.isConnected()) {
                this.connect();
            }
        }, delay);
    }

    reconnect() {
        this.disconnect();
        setTimeout(() => this.connect(), 1000);
    }

    // ==================== ОТПРАВКА СООБЩЕНИЙ ====================

    sendMessage(data) {
        if (!this.isConnected()) {
            throw new Error('WebSocket не подключен');
        }
        
        try {
            const message = typeof data === 'string' ? data : JSON.stringify(data);
            this.ws.send(message);
            return true;
        } catch (error) {
            throw error;
        }
    }

    sendComment(content) {
        // Проверяем аутентификацию
        if (!this.isAuthenticated) {
            
            // Добавляем в очередь и ждем аутентификации
            this.addToMessageQueue({
                type: 'new_comment',
                content: content.trim(),
                timestamp: new Date().toISOString()
            });
            
            // Бросаем специальную ошибку, чтобы фронтенд знал, что сообщение в очереди
            throw new Error('Ожидание аутентификации. Комментарий будет отправлен автоматически.');
        }
        
        const comment = content.trim();
        
        if (!comment) {
            throw new Error('Комментарий не может быть пустым');
        }
        
        if (comment.length > 1000) {
            throw new Error('Комментарий слишком длинный (макс. 1000 символов)');
        }
        
        return this.sendMessage({
            type: 'new_comment',
            content: comment,
            timestamp: new Date().toISOString()
        });
    }

    // ==================== СТАТУС И УТИЛИТЫ ====================

    isConnected() {
        return this.ws && this.ws.readyState === WebSocket.OPEN;
    }

    getStatus() {
        if (!this.ws) return 'disconnected';
        
        switch(this.ws.readyState) {
            case WebSocket.CONNECTING: return 'connecting';
            case WebSocket.OPEN: return this.isAuthenticated ? 'authenticated' : 'connected';
            case WebSocket.CLOSING: return 'closing';
            case WebSocket.CLOSED: return 'disconnected';
            default: return 'unknown';
        }
    }

    triggerError(error) {
        this.callbacks.error.forEach(callback => callback(error));
    }

    // ==================== HEARTBEAT (если нужно) ====================

    startHeartbeat() {
        this.stopHeartbeat();
        this.lastHeartbeat = Date.now();
        
        this.heartbeatTimer = setInterval(() => {
            if (!this.isConnected()) {
                return;
            }
            
            // Проверяем, не потеряли ли мы соединение
            if (this.lastHeartbeat && Date.now() - this.lastHeartbeat > this.heartbeatTimeout) {
                this.reconnect();
                return;
            }
            
            // Отправляем ping только если аутентифицированы
            if (this.isAuthenticated) {
                this.sendMessage({ type: 'ping' });
            }
        }, this.heartbeatInterval);
    }

    stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    // ==================== ПОДПИСКА НА СОБЫТИЯ ====================

    onComment(callback) {
        this.callbacks.comment.push(callback);
        return () => {
            this.callbacks.comment = this.callbacks.comment.filter(cb => cb !== callback);
        };
    }

    onConnect(callback) {
        this.callbacks.connect.push(callback);
        return () => {
            this.callbacks.connect = this.callbacks.connect.filter(cb => cb !== callback);
        };
    }

    onDisconnect(callback) {
        this.callbacks.disconnect.push(callback);
        return () => {
            this.callbacks.disconnect = this.callbacks.disconnect.filter(cb => cb !== callback);
        };
    }

    onError(callback) {
        this.callbacks.error.push(callback);
        return () => {
            this.callbacks.error = this.callbacks.error.filter(cb => cb !== callback);
        };
    }

    onAuth(callback) {
        this.callbacks.auth.push(callback);
        return () => {
            this.callbacks.auth = this.callbacks.auth.filter(cb => cb !== callback);
        };
    }

    onReconnecting(callback) {
        this.callbacks.reconnecting.push(callback);
        return () => {
            this.callbacks.reconnecting = this.callbacks.reconnecting.filter(cb => cb !== callback);
        };
    }

    // ==================== ОЧИСТКА ====================

    disconnect() {
        
        this.shouldReconnect = false;
        this.isAuthenticated = false;
        clearTimeout(this.authTimeout);
        this.stopHeartbeat();
        clearTimeout(this.reconnectTimer);
        
        // Очищаем очередь сообщений
        this.messageQueue = [];
        
        if (this.ws) {
            this.ws.close(1000, 'Пользователь закрыл соединение');
            this.ws = null;
        }
    }
}

export default TaskWebSocketService;