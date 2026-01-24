import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../../services/api/api';
import './AuthPages.css';
import AcrelisLogo from '../../assets/acrelis-logo.svg';

function RegistrationPageEnd() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '', // логин из первого шага (скрыто)
    fullName: '', // ФИО (новое поле)
    email: '',
    telegram: '',
    phone: '',
    birthday: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  useEffect(() => {
    // Получаем данные из первого шага
    const savedData = localStorage.getItem('registration_data');
    if (savedData) {
      try {
        const { username } = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, username }));
      } catch (err) {
        console.error('Ошибка загрузки данных из первого шага:', err);
        // Если нет данных, возвращаем на первый шаг
        navigate('/register');
      }
    } else {
      // Если нет данных, возвращаем на первый шаг
      navigate('/register');
    }
  }, [navigate]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Форматирование телефона
    if (name === 'phone') {
      const cleaned = value.replace(/\D/g, '');
      let formatted = cleaned;
      
      if (cleaned.length > 0) {
        formatted = '+7 (' + cleaned.substring(1, 4);
      }
      if (cleaned.length >= 4) {
        formatted += ') ' + cleaned.substring(4, 7);
      }
      if (cleaned.length >= 7) {
        formatted += '-' + cleaned.substring(7, 9);
      }
      if (cleaned.length >= 9) {
        formatted += '-' + cleaned.substring(9, 11);
      }
      
      setFormData(prev => ({ ...prev, [name]: formatted }));
      return;
    }
    
    // Форматирование даты рождения
    if (name === 'birthday') {
      const cleaned = value.replace(/\D/g, '');
      let formatted = cleaned;
      
      if (cleaned.length > 2) {
        formatted = cleaned.substring(0, 2) + '.' + cleaned.substring(2, 4);
      }
      if (cleaned.length > 4) {
        formatted += '.' + cleaned.substring(4, 8);
      }
      
      setFormData(prev => ({ ...prev, [name]: formatted }));
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('Введите ФИО');
      return false;
    }
    
    if (!formData.email) {
      setError('Введите email');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Введите корректный email');
      return false;
    }
    
    if (!formData.phone) {
      setError('Введите телефон');
      return false;
    }
    
    // Проверка что телефон содержит минимум 10 цифр
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 11) {
      setError('Введите корректный телефон (минимум 11 цифр)');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Получаем данные из первого шага
      const savedData = JSON.parse(localStorage.getItem('registration_data') || '{}');
      
      // Разделяем ФИО на имя и фамилию
      const fullNameParts = formData.fullName.trim().split(' ');
      const firstName = fullNameParts[0] || '';
      const lastName = fullNameParts.slice(1).join(' ') || '';
      
      // Форматируем дату рождения для API (гггг-мм-дд)
      let birthdayFormatted = '';
      if (formData.birthday) {
        const [day, month, year] = formData.birthday.split('.');
        if (day && month && year && year.length === 4) {
          birthdayFormatted = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      }
      
      // Форматируем телефон для API (убираем форматирование)
      const phoneFormatted = formData.phone.replace(/\D/g, '');
      
      // Вызываем регистрацию
      await register({
        username: savedData.username,
        password: savedData.password,
        email: formData.email,
        firstName: firstName,
        lastName: lastName,
        telegram: formData.telegram,
        phone: phoneFormatted,
        birthday: birthdayFormatted
      });
      
      setSuccess('Регистрация прошла успешно! Перенаправляем на страницу входа...');
      
      // Очищаем сохранённые данные
      localStorage.removeItem('registration_data');
      
      // Перенаправляем на логин через 2 секунды
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      setError(err.message || 'Ошибка регистрации. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleBack = () => {
    navigate('/register');
  };
  
  return (
    <div className="register_container_register_page">
      <img src={AcrelisLogo} alt="Acrelis Logo" className="login_logo_login_page" />
      
      <h1 className="login_title_login_page">Регистрация</h1>
      
      {/* Ссылка "Вернуться" */}
      <button 
        onClick={handleBack}
        className="back_link_register_page"
      >
        <span className="back_arrow_register_page">←</span>
        <span className="back_text_register_page">Вернуться на предыдущую страницу</span>
      </button>
      
      <form onSubmit={handleSubmit} className="register_form_register_page">
        {/* Поле ФИО */}
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleInputChange}
          placeholder="ФИО"
          className="login_input_login_page"
          autoComplete="name"
          required
        />
        
        {/* Первая строка: Email и Telegram */}
        <div className="register_row_register_page">
          <div className="register_half_register_page">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="E-mail"
              className="login_input_login_page"
              autoComplete="email"
              required
            />
          </div>
          <div className="register_half_register_page">
            <input
              type="text"
              name="telegram"
              value={formData.telegram}
              onChange={handleInputChange}
              placeholder="Telegram"
              className="login_input_login_page"
              autoComplete="off"
            />
          </div>
        </div>
        
        {/* Вторая строка: Телефон и Дата рождения */}
        <div className="register_row_register_page">
          <div className="register_half_register_page">
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Телефон"
              className="login_input_login_page"
              autoComplete="tel"
              required
            />
          </div>
          <div className="register_half_register_page">
            <input
              type="text"
              name="birthday"
              value={formData.birthday}
              onChange={handleInputChange}
              placeholder="Дата рождения (дд.мм.гггг)"
              className="login_input_login_page"
              autoComplete="off"
            />
          </div>
        </div>
        
        {/* Сообщение об ошибке */}
        {error && (
          <div className="login_error_login_page">
            {error}
          </div>
        )}
        
        {/* Сообщение об успехе */}
        {success && (
          <div className="register_success_register_page">
            {success}
          </div>
        )}
        
        {/* Кнопка Завершить регистрацию */}
        <button 
          type="submit" 
          className="login_button_login_page"
          disabled={loading}
        >
          {loading ? 'Регистрация...' : 'Завершить регистрацию'}
        </button>
        
        {/* Ссылка на вход */}
        <div className="login_links_login_page">
          <span className="login_no_account_login_page">Уже есть аккаунт?</span>
          <Link to="/login" className="login_register_link_login_page">
            Войти
          </Link>
        </div>
      </form>
    </div>
  );
}

export default RegistrationPageEnd;