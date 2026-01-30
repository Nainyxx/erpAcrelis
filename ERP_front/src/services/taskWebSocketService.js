// services/taskWebSocketService.js
class TaskWebSocketService {
    constructor(taskId) {
        this.taskId = taskId;
        this.ws = null;
        this.messageCallbacks = [];
        this.errorCallbacks = [];
        this.connectCallbacks = [];
        this.disconnectCallbacks = [];
        this.isManualDisconnect = false;
        
        // Конфигурация
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        
        this.connect();
    }

    connect() {
        if (this.isManualDisconnect) return;
        
        const wsUrl = `wss://api.acrelis.ru/ws/task/${this.taskId}/comments/`;
        console.log(`🔌 Подключаюсь к WebSocket: ${wsUrl}`);
        
        try {
            this.ws = new WebSocket(wsUrl);
            
            this.ws.onopen = () => {
                console.log('✅ WebSocket подключен для задачи:', this.taskId);
                this.reconnectAttempts = 0;
                
                this.connectCallbacks.forEach(callback => callback());
            };
            
            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('📨 Получено сообщение WebSocket:', data);
                    this.handleMessage(data);
                } catch (error) {
                    console.error('❌ Ошибка парсинга WebSocket сообщения:', error);
                }
            };
            
            this.ws.onclose = (event) => {
                console.log('🔌 WebSocket отключен:', event.code, event.reason);
                
                this.disconnectCallbacks.forEach(callback => 
                    callback(event.code, event.reason)
                );
                
                // Автоматическое переподключение если не ручное отключение
                if (!this.isManualDisconnect && 
                    event.code !== 1000 && 
                    this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.scheduleReconnect();
                }
            };
            
            this.ws.onerror = (error) => {
                console.error('❌ WebSocket ошибка:', error);
                this.errorCallbacks.forEach(callback => 
                    callback(error)
                );
            };
            
        } catch (error) {
            console.error('❌ Ошибка создания WebSocket:', error);
        }
    }

    handleMessage(data) {
        switch(data.type) {
            case 'comment_added':
                console.log('💬 Новый комментарий через WebSocket:', data.comment);
                this.messageCallbacks.forEach(callback => 
                    callback(data.comment)
                );
                break;
                
            case 'error':
                console.error('⚠️ WebSocket ошибка:', data.message);
                this.errorCallbacks.forEach(callback => 
                    callback(new Error(data.message))
                );
                break;
                
            default:
                console.warn('⚠️ Неизвестный тип сообщения:', data.type);
        }
    }

    sendComment(content) {
        if (!this.isConnected()) {
            throw new Error('WebSocket не подключен');
        }
        
        if (!content || !content.trim()) {
            throw new Error('Комментарий не может быть пустым');
        }
        
        const message = {
            type: 'new_comment',
            content: content.trim()
        };
        
        console.log('📤 Отправляю комментарий через WebSocket:', message);
        this.ws.send(JSON.stringify(message));
    }

    isConnected() {
        return this.ws && this.ws.readyState === WebSocket.OPEN;
    }

    scheduleReconnect() {
        this.reconnectAttempts++;
        const delay = Math.min(
            this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1),
            30000 // Максимум 30 секунд
        );
        
        console.log(`🔄 Переподключение через ${delay}мс (попытка ${this.reconnectAttempts})`);
        
        setTimeout(() => {
            if (!this.isConnected() && !this.isManualDisconnect) {
                this.connect();
            }
        }, delay);
    }

    disconnect() {
        console.log('👋 Ручное отключение WebSocket');
        this.isManualDisconnect = true;
        if (this.ws) {
            this.ws.close(1000, 'Пользователь отключился');
        }
    }

    // Методы подписки на события
    onComment(callback) {
        this.messageCallbacks.push(callback);
        // Возвращаем функцию для отписки
        return () => {
            this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
        };
    }

    onError(callback) {
        this.errorCallbacks.push(callback);
        return () => {
            this.errorCallbacks = this.errorCallbacks.filter(cb => cb !== callback);
        };
    }

    onConnect(callback) {
        this.connectCallbacks.push(callback);
        return () => {
            this.connectCallbacks = this.connectCallbacks.filter(cb => cb !== callback);
        };
    }

    onDisconnect(callback) {
        this.disconnectCallbacks.push(callback);
        return () => {
            this.disconnectCallbacks = this.disconnectCallbacks.filter(cb => cb !== callback);
        };
    }
}

export default TaskWebSocketService;