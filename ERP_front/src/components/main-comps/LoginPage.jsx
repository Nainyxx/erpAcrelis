// ERP_front/src/components/main-comps/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, getProjects } from '../../services/api/api';
import './AuthPages.css';
import AcrelisLogo from '../../assets/acrelis-logo.svg';

function LoginPage() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accessDenied, setAccessDenied] = useState(false);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Пожалуйста, заполните все поля');
      return;
    }
    
    setLoading(true);
    setError('');
    setAccessDenied(false);
    
    try {
      // 1. Логинимся
      await login(formData.username, formData.password);
      
      // 2. Делаем пробный запрос к API для проверки прав
      try {
        await getProjects(false, {});
        // Если запрос успешен, переходим на главную
        navigate('/projects', { replace: true });
      } catch (apiError) {
        
        // Проверяем, если это ошибка доступа 403
        if (apiError.message.includes('403') || 
            apiError.message.toLowerCase().includes('forbidden') ||
            apiError.message.includes('недостаточно прав')) {
          // ОЧИЩАЕМ localStorage и показываем заглушку
          localStorage.clear();
          setAccessDenied(true);
        } else {
          // Если другая ошибка, все равно даем доступ
          navigate('/projects', { replace: true });
        }
      }
      
    } catch (err) {
      setError(err.message || 'Ошибка авторизации. Проверьте логин и пароль.');
    } finally {
      setLoading(false);
    }
  };
  
  // Если доступ запрещен, показываем заглушку
  if (accessDenied) {
    return (
      <div className="access_denied_container_123net_prav">
        <img 
          src={AcrelisLogo} 
          alt="Acrelis Logo" 
          className="access_denied_logo_123net_prav"
        />
        
        <div className="access_denied_card_123net_prav">
          <h1 className="access_denied_title_123net_prav">
            Доступ запрещён
          </h1>
          
          <div className="access_denied_message_123net_prav">
            <p className="access_denied_error_123net_prav">
              У вас недостаточно прав для доступа к системе.
            </p>
            <p className="access_denied_hint_123net_prav">
              Обратитесь к администратору для получения доступа.
            </p>
          </div>
          
          <button
            onClick={() => {
              // localStorage уже очищен, просто перезагружаем
              window.location.href = '/#/login';
            }}
            className="access_denied_button_123net_prav"
          >
            Вернуться к входу
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="login_container_login_page">
      <img src={AcrelisLogo} alt="Acrelis Logo" className="login_logo_login_page" />
      
      <h1 className="login_title_login_page">Вход</h1>
      
      <form onSubmit={handleSubmit} className="login_form_login_page">
        {/* Поле Логин */}
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          placeholder="Логин"
          className="login_input_login_page"
          disabled={loading}
          autoComplete="username"
          required
        />
        
        {/* Поле Пароль с кнопкой показа */}
        <div className="password_input_container_login_page">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Пароль"
            className="login_input_login_page password_input_login_page"
            disabled={loading}
            autoComplete="current-password"
            required
          />
          <button
            type="button"
            className="password_toggle_btn_login_page"
            onClick={togglePasswordVisibility}
            disabled={loading}
            title={showPassword ? "Скрыть пароль" : "Показать пароль"}
          >
            <span className="password_toggle_text_login_page">
              {showPassword ? "Скрыть" : "Показать"}
            </span>
          </button>
        </div>
        
        {/* Сообщение об ошибке */}
        {error && (
          <div className="login_error_login_page">
            {error}
          </div>
        )}
        
        {/* Кнопка Войти */}
        <button type="submit" className="login_button_login_page" disabled={loading}>
          {loading ? 'Вход...' : 'Войти'}
        </button>
        
        {/* Ссылка на регистрацию */}
        
      </form>
    </div>
  );
}

export default LoginPage;