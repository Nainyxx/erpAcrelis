// ERP_front/src/components/main-comps/InviteRegistrationEnd.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { registerByInvite } from '../../services/api/api';
import './AuthPages.css';
import AcrelisLogo from '../../assets/acrelis-logo.svg';

function InviteRegistrationEnd() {
  const navigate = useNavigate();
  const { token } = useParams();
  
  const safeToken = token ? encodeURIComponent(token) : '';
  
  const [formData, setFormData] = useState(() => {
    if (!safeToken) return {
      name: '',
      phone: '',
      telegram: '',
      birthday: ''
    };
    
    const saved = localStorage.getItem(`invite_step2_${safeToken}`);
    return saved ? JSON.parse(saved) : {
      name: '',
      phone: '',
      telegram: '',
      birthday: ''
    };
  });
  
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [inviteData, setInviteData] = useState(null);
  
  useEffect(() => {
    if (safeToken && (formData.name || formData.phone || formData.telegram || formData.birthday)) {
      localStorage.setItem(`invite_step2_${safeToken}`, JSON.stringify(formData));
    }
  }, [formData, safeToken]);
  
  useEffect(() => {
    const savedData = localStorage.getItem('invite_registration_data');
    
    if (!savedData) {
      navigate(`/staff/register/invite/${token}`);
      return;
    }
    
    try {
      const parsedData = JSON.parse(savedData);
      
      if (parsedData.token !== token) {
        localStorage.removeItem('invite_registration_data');
        if (safeToken) {
          localStorage.removeItem(`invite_step1_${safeToken}`);
          localStorage.removeItem(`invite_step2_${safeToken}`);
        }
        navigate(`/staff/register/invite/${token}`);
        return;
      }
      
      setInviteData(parsedData);
      
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      localStorage.removeItem('invite_registration_data');
      if (safeToken) {
        localStorage.removeItem(`invite_step1_${safeToken}`);
        localStorage.removeItem(`invite_step2_${safeToken}`);
      }
      navigate(`/staff/register/invite/${token}`);
    }
  }, [token, safeToken, navigate]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value
    };
    
    setFormData(newFormData);
    
    if (safeToken) {
      localStorage.setItem(`invite_step2_${safeToken}`, JSON.stringify(newFormData));
    }
    
    if (formError) setFormError('');
  };
  
  const handlePhoneChange = (e) => {
    const value = e.target.value;
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
    
    const newFormData = {
      ...formData,
      phone: formatted
    };
    
    setFormData(newFormData);
    if (safeToken) {
      localStorage.setItem(`invite_step2_${safeToken}`, JSON.stringify(newFormData));
    }
    
    if (formError) setFormError('');
  };
  
  const handleBirthdayChange = (e) => {
    const value = e.target.value;
    const cleaned = value.replace(/\D/g, '');
    let formatted = cleaned;
    
    if (cleaned.length > 2) {
      formatted = cleaned.substring(0, 2) + '.' + cleaned.substring(2, 4);
    }
    if (cleaned.length > 4) {
      formatted += '.' + cleaned.substring(4, 8);
    }
    
    const newFormData = {
      ...formData,
      birthday: formatted
    };
    
    setFormData(newFormData);
    if (safeToken) {
      localStorage.setItem(`invite_step2_${safeToken}`, JSON.stringify(newFormData));
    }
    
    if (formError) setFormError('');
  };
  
  const validateForm = () => {
    if (!formData.name.trim()) {
      setFormError('Введите ФИО');
      return false;
    }
    
    if (!formData.phone) {
      setFormError('Введите телефон');
      return false;
    }
    
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 11) {
      setFormError('Введите корректный телефон (минимум 11 цифр)');
      return false;
    }
    
    if (formData.birthday) {
      const [day, month, year] = formData.birthday.split('.');
      if (!day || !month || !year || year.length !== 4) {
        setFormError('Введите корректную дату рождения (дд.мм.гггг)');
        return false;
      }
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (!inviteData) {
      setFormError('Данные регистрации не найдены');
      return;
    }
    
    setLoading(true);
    setFormError('');
    
    try {
      let birthdayFormatted = '';
      if (formData.birthday) {
        const [day, month, year] = formData.birthday.split('.');
        if (day && month && year && year.length === 4) {
          birthdayFormatted = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      }
      
      const phoneFormatted = formData.phone.replace(/\D/g, '');
      
      const registrationData = {
        username: inviteData.username,
        email: inviteData.email,
        password: inviteData.password,
        password_confirm: inviteData.password_confirm || inviteData.password,
        staff_data: {
          name: formData.name,
          phone: phoneFormatted,
          telegram: formData.telegram || '',
          birthday: birthdayFormatted || null
        }
      };
      
      console.log('📤 Отправляемые данные:', JSON.stringify(registrationData, null, 2));
      
      await registerByInvite(token, registrationData);
      
      localStorage.removeItem('invite_registration_data');
      if (safeToken) {
        localStorage.removeItem(`invite_step1_${safeToken}`);
        localStorage.removeItem(`invite_step2_${safeToken}`);
      }
      
      setTimeout(() => {
        navigate('/');
      }, 1500);
      
    } catch (err) {
      console.error('❌ Ошибка при регистрации:', err);
      
      // Проверяем тип ошибки
      const errorMessage = err.message.toLowerCase();
      
      // Проверяем все возможные ошибки токена
      const isTokenError = 
        errorMessage.includes('токен') || 
        errorMessage.includes('token') || 
        errorMessage.includes('приглаш') || 
        errorMessage.includes('invite') ||
        errorMessage.includes('не найден') ||
        errorMessage.includes('not found') ||
        errorMessage.includes('истекло') ||
        errorMessage.includes('истек') ||
        errorMessage.includes('использовано') ||
        errorMessage.includes('использован') ||
        errorMessage.includes('несуществующ') ||
        errorMessage.includes('неверное') ||
        errorMessage.includes('недействител') ||
        errorMessage.includes('invalid') ||
        errorMessage.includes('expired') ||
        errorMessage.includes('просрочен') ||
        errorMessage.includes('уже использова');
      
      if (isTokenError) {
        // Очищаем все данные
        localStorage.removeItem('invite_registration_data');
        if (safeToken) {
          localStorage.removeItem(`invite_step1_${safeToken}`);
          localStorage.removeItem(`invite_step2_${safeToken}`);
        }
        // Показываем оригинальное сообщение об ошибке
        setFormError(err.message);
      } else {
        // Ошибки валидации данных
        setFormError(err.message || 'Ошибка регистрации по приглашению. Проверьте введенные данные.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleBack = () => {
    navigate(`/staff/register/invite/${token}`);
  };
  
  if (!inviteData) {
    return (
      <div className="register_container_register_page">
        <img src={AcrelisLogo} alt="Acrelis Logo" className="login_logo_login_page" />
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <div className="loading-spinner" style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e1e1e1',
            borderTopColor: '#667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }}></div>
          <p>Загрузка данных...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="register_container_register_page">
      <img src={AcrelisLogo} alt="Acrelis Logo" className="login_logo_login_page" />
      
      <h1 className="login_title_login_page">Регистрация</h1>
      
      <button 
        onClick={handleBack}
        style={{
          background: 'none',
          border: 'none',
          color: '#667eea',
          cursor: 'pointer',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          marginBottom: '20px',
          padding: '0'
        }}
      >
        <span style={{ marginRight: '5px' }}>←</span>
        <span>Вернуться на предыдущую страницу</span>
      </button>
      
      <p style={{ 
        textAlign: 'center', 
        color: '#666', 
        marginBottom: '20px',
        fontSize: '14px'
      }}>
      </p>
      
      <form onSubmit={handleSubmit} className="register_form_register_page">
        {/* Поле ФИО */}
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="ФИО"
          className="login_input_login_page"
          autoComplete="name"
          required
        />
        
        {/* Строка с Телефоном и Telegram */}
        <div className="register_row_register_page">
          <div className="register_half_register_page">
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handlePhoneChange}
              placeholder="Телефон"
              className="login_input_login_page"
              autoComplete="tel"
              required
            />
          </div>
          <div className="register_half_register_page">
            <input
              type="text"
              name="telegram"
              value={formData.telegram}
              onChange={handleInputChange}
              placeholder="Telegram (необязательно)"
              className="login_input_login_page"
              autoComplete="off"
            />
          </div>
        </div>
        
        {/* Поле Дата рождения */}
        <input
          type="text"
          name="birthday"
          value={formData.birthday}
          onChange={handleBirthdayChange}
          placeholder="Дата рождения (дд.мм.гггг)"
          className="login_input_login_page"
          autoComplete="off"
        />
        
        {/* Сообщение об ошибке формы */}
        {formError && (
          <div className="login_error_login_page">
            {formError}
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
        
      </form>
    </div>
  );
}

export default InviteRegistrationEnd;