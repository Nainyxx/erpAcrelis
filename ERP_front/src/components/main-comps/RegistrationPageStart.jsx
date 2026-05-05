import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AuthPages.css';
import AcrelisLogo from '../../assets/acrelis-logo2.svg';

function RegistrationPageStart() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
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
  
  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Введите имя пользователя');
      return false;
    }
    
    if (!formData.password) {
      setError('Введите пароль');
      return false;
    }
    
    if (formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return false;
    }
    
    if (!formData.confirmPassword) {
      setError('Подтвердите пароль');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Сохраняем данные в localStorage для передачи на следующий шаг
    localStorage.setItem('registration_data', JSON.stringify({
      username: formData.username,
      password: formData.password
    }));
    
    // Переходим на второй шаг регистрации
    navigate('/register/step2');
  };
  
  // Функция для запрета копирования/вставки в поле подтверждения пароля
  const handleConfirmPasswordPaste = (e) => {
    e.preventDefault();
    return false;
  };
  
  const handleConfirmPasswordCopy = (e) => {
    e.preventDefault();
    return false;
  };
  
  const handleConfirmPasswordCut = (e) => {
    e.preventDefault();
    return false;
  };
  
  return (
    <div className="register_container_register_page">
      <img src={AcrelisLogo} alt="Acrelis Logo" className="login_logo_login_page" />
      
      <h1 className="login_title_login_page">Регистрация</h1>
      
      <form onSubmit={handleSubmit} className="login_form_login_page">
        {/* Поле Логин */}
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          placeholder="Логин"
          className="login_input_login_page"
          autoComplete="username"
          required
        />
        
        {/* Поле Пароля с кнопкой показа */}
        <div className="password_input_container_login_page">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Пароль"
            className="login_input_login_page password_input_login_page"
            autoComplete="new-password"
            required
          />
          <button
            type="button"
            className="password_toggle_btn_login_page"
            onClick={togglePasswordVisibility}
            title={showPassword ? "Скрыть пароль" : "Показать пароль"}
          >
            <span className="password_toggle_text_login_page">
              {showPassword ? "Скрыть" : "Показать"}
            </span>
          </button>
        </div>
        
        {/* Поле Подтверждения пароля (без кнопки показа) */}
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          onPaste={handleConfirmPasswordPaste}
          onCopy={handleConfirmPasswordCopy}
          onCut={handleConfirmPasswordCut}
          placeholder="Повторите пароль"
          className="login_input_login_page"
          autoComplete="new-password"
          required
        />
        
        {/* Сообщение об ошибке */}
        {error && (
          <div className="login_error_login_page">
            {error}
          </div>
        )}
        
        {/* Кнопка Продолжить */}
        <button type="submit" className="login_button_login_page">
          Продолжить
        </button>
        
        {/* Ссылка на вход */}
        
      </form>
    </div>
  );
}

export default RegistrationPageStart;