// src/components/main-comps/Notification.jsx
import React, { useState, useEffect } from 'react';
import './Notification.css';

const Notification = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`notification notification-${type}`}>
      <div className="notification-content">
        {message}
      </div>
      <button 
        className="notification-close" 
        onClick={() => {
          setIsVisible(false);
          if (onClose) onClose();
        }}
      >
        ×
      </button>
    </div>
  );
};

export default Notification;