// ERP_front/src/components/main-comps/AccessDeniedOverlay.jsx
import React from 'react';
import './AuthPages.css';
import AcrelisLogo from '../../assets/acrelis-logo.svg';

function AccessDeniedOverlay() {
  const handleLogout = () => {
    // Очищаем все данные
    localStorage.clear();
    // Перенаправляем на страницу логина
    window.location.href = '#/login';
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <img 
        src={AcrelisLogo} 
        alt="Acrelis Logo" 
        style={{
          width: '120px',
          marginBottom: '30px'
        }}
      />
      
      <div style={{
        background: 'white',
        borderRadius: '10px',
        padding: '40px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center'
      }}>
        <h1 style={{
          color: '#5B5B5B',
          fontSize: '24px',
          fontWeight: 600,
          marginBottom: '20px'
        }}>
          Доступ запрещён
        </h1>
        
        <div style={{
          backgroundColor: '#FFEBEE',
          border: '1px solid #FFCDD2',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '30px'
        }}>
          <p style={{
            color: '#D32F2F',
            fontSize: '16px',
            lineHeight: '1.5',
            margin: 0
          }}>
            У вас недостаточно прав для доступа к системе.
          </p>
          <p style={{
            color: '#666',
            fontSize: '14px',
            lineHeight: '1.5',
            marginTop: '10px',
            marginBottom: 0
          }}>
            Обратитесь к администратору для получения доступа.
          </p>
        </div>
        
        <button
          onClick={handleLogout}
          style={{
            padding: '12px 30px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background-color 0.3s',
            width: '100%',
            maxWidth: '200px'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#5a67d8'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#667eea'}
        >
          Выйти
        </button>
        
        <div style={{
          marginTop: '30px',
          paddingTop: '20px',
          borderTop: '1px solid #e1e1e1',
          fontSize: '12px',
          color: '#999'
        }}>
          <p>Если вы считаете, что это ошибка, пожалуйста, свяжитесь с технической поддержкой.</p>
        </div>
      </div>
    </div>
  );
}

export default AccessDeniedOverlay;