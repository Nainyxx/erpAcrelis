import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // Добавляем useNavigate
import notificationWebSocket from '../../services/notificationWebSocket';
import './Notification.css';

const NotificationContainer = () => {
  const [notifications, setNotifications] = useState([]);
  const notificationsRef = useRef([]);
  const hasSubscribedRef = useRef(false); // Новый ref для отслеживания подписки
  const navigate = useNavigate(); // Хук для навигации
  
  // Обновляем ref при изменении notifications
  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  // Подключение к WebSocket при монтировании
  useEffect(() => {
    
    // Проверяем, не подписаны ли мы уже
    if (hasSubscribedRef.current) {
      return;
    }
    
    hasSubscribedRef.current = true;
    
    // Подписка на уведомления
    const unsubscribeNotifications = notificationWebSocket.subscribe((notification) => {
      
      // Генерируем уникальный ID для уведомления, чтобы избежать дубликатов
      const uniqueId = `${notification.timestamp}_${Math.random()}`;
      
      setNotifications(prev => {
        // Проверяем, нет ли уже такого уведомления (по содержимому и времени)
        const exists = prev.some(n => 
          n.title === notification.title && 
          n.message === notification.message &&
          Math.abs(new Date(n.timestamp) - new Date(notification.timestamp)) < 1000 // В пределах 1 секунды
        );
        
        if (exists) {
          return prev;
        }
        
        // Добавляем уникальный ID
        const notificationWithId = {
          ...notification,
          id: notification.id || uniqueId
        };
        
        // Ограничиваем количество уведомлений (например, 50)
        const newNotifications = [notificationWithId, ...prev];
        if (newNotifications.length > 50) {
          return newNotifications.slice(0, 50);
        }
        return newNotifications;
      });
      
      // Авто-удаление через 30 секунд, если пользователь не закрыл
      setTimeout(() => {
        setNotifications(current => {
          return current.filter(n => n.id !== (notification.id || uniqueId));
        });
      }, 30000);
    });

    // Запускаем подключение, если оно еще не запущено
    const shouldConnect = () => {
      const status = notificationWebSocket.getStatus();
      return status === 'disconnected' || status === 'closed' || status === 'error';
    };
    
    if (shouldConnect()) {
      setTimeout(() => {
        notificationWebSocket.connect();
      }, 1000);
    }

    // Очистка при размонтировании
    return () => {
      unsubscribeNotifications();
      hasSubscribedRef.current = false;
    };
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Компонент отдельного уведомления
  const NotificationItem = ({ 
    id,
    message, 
    type = 'info', 
    duration = 10000, 
    onClose,
    title = 'Уведомление',
    position = 0,
    url,
    timestamp
  }) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isExiting, setIsExiting] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
      if (duration && duration > 0) {
        timerRef.current = setTimeout(() => {
          handleClose();
        }, duration);
        
        return () => {
          if (timerRef.current) {
            clearTimeout(timerRef.current);
          }
        };
      }
    }, [duration]);

    const handleClose = () => {
      if (isExiting) return;
      
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, 300);
    };

    const handleClick = () => {
      if (url) {
        // Закрываем уведомление перед навигацией
        handleClose();
        
        // Проверяем, является ли URL относительным путем
        if (url.startsWith('/')) {
          // Относительный путь - используем навигацию React Router
          navigate(url);
        } else {
          // Внешний URL - открываем в текущем окне
          window.location.href = url;
        }
      }
    };

    const handleMouseEnter = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const handleMouseLeave = () => {
      if (duration && duration > 0 && !timerRef.current) {
        timerRef.current = setTimeout(() => {
          handleClose();
        }, 1000);
      }
    };

    if (!isVisible) return null;

    // Форматируем время
    const formatTime = (timestamp) => {
      try {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        
        if (diffMins < 1) return 'только что';
        if (diffMins < 60) return `${diffMins} мин назад`;
        if (diffHours < 24) return `${diffHours} ч назад`;
        
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } catch {
        return '';
      }
    };

    return (
      <div 
        className={`notification-wrapper ${isExiting ? 'notification-exit' : 'notification-enter'}`}
        style={{
          marginBottom: '10px',
          zIndex: 1000 - position,
          cursor: url ? 'pointer' : 'default'
        }}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={`notification notification-${type}`}>
          <div className="notification-header">
            <div className="notification-title">
              {type === 'error' && '❌ '}
              {type === 'success' && '✅ '}
              {type === 'warning' && '⚠️ '}
              {type === 'info' && 'ℹ️ '}
              <strong>{title}</strong>
            </div>
            <div className="notification-time">{formatTime(timestamp)}</div>
          </div>
          <div className="notification-content">
            <div className="notification-message">{message}</div>
            {url && (
              <div className="notification-url">
                <small>Нажмите, чтобы перейти</small>
              </div>
            )}
          </div>
          <button 
            className="notification-close" 
            onClick={(e) => {
              e.stopPropagation();
              handleClose();
            }}
            aria-label="Закрыть уведомление"
          >
            ×
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Контейнер для уведомлений - только пользовательские уведомления */}
      <div className="notifications-container">
        {notifications.map((notification, index) => (
          <NotificationItem
            key={notification.id}
            {...notification}
            position={index}
            duration={notification.type === 'error' ? 15000 : 10000}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </>
  );
};

export default NotificationContainer;