// ERP_front/src/components/main-comps/InviteRegistrationStart.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import './AuthPages.css';
import AcrelisLogo from '../../assets/acrelis-logo.svg';

function InviteRegistrationStart() {
  const navigate = useNavigate();
  const { token } = useParams();
  
  const safeToken = token ? encodeURIComponent(token) : '';
  
  const [formData, setFormData] = useState(() => {
    if (!safeToken) return {
      username: '',
      email: '',
      password: '',
      password_confirm: ''
    };
    
    const saved = localStorage.getItem(`invite_step1_${safeToken}`);
    return saved ? JSON.parse(saved) : {
      username: '',
      email: '',
      password: '',
      password_confirm: ''
    };
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenError, setTokenError] = useState('');
  const [formError, setFormError] = useState('');
  const [inviteData, setInviteData] = useState(null);
  
  useEffect(() => {
    if (safeToken && (formData.username || formData.email || formData.password || formData.password_confirm)) {
      localStorage.setItem(`invite_step1_${safeToken}`, JSON.stringify(formData));
    }
  }, [formData, safeToken]);
  
  useEffect(() => {
    const checkToken = async () => {
      if (!token) {
        setTokenError('Неверная ссылка приглашения');
        setValidatingToken(false);
        return;
      }
      
      try {
        console.log('🔍 Проверка токена:', token);
        
        const response = await fetch(`https://api.acrelis.ru/staff/register/invite/${token}/`, {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: 'testuser',
            email: 'test@test.com',
            password: 'testpassword123',
            password_confirm: 'testpassword123',
            staff_data: {}
          })
        });

        console.log('📊 Ответ проверки токена:', response.status);
        
        if (response.status === 400) {
          const errorText = await response.text();
          console.log('📄 Текст ошибки:', errorText);
          
          try {
            const errorData = JSON.parse(errorText);
            
            const isTokenError = errorData.detail && (
              errorData.detail.toLowerCase().includes('token') || 
              errorData.detail.toLowerCase().includes('приглаш') ||
              errorData.detail.toLowerCase().includes('invite') ||
              errorData.detail.toLowerCase().includes('не найден') ||
              errorData.detail.toLowerCase().includes('not found')
            );
            
            if (isTokenError) {
              localStorage.removeItem(`invite_step1_${safeToken}`);
              localStorage.removeItem(`invite_step2_${safeToken}`);
              setTokenError('Неверный или просроченный токен приглашения');
            } else {
              setInviteData({ valid: true });
            }
          } catch (parseError) {
            setInviteData({ valid: true });
          }
        } else if (response.ok) {
          localStorage.removeItem(`invite_step1_${safeToken}`);
          localStorage.removeItem(`invite_step2_${safeToken}`);
          setTokenError('Токен уже использован');
        } else {
          setTokenError('Ошибка при проверке приглашения');
        }
      } catch (error) {
        console.error('Ошибка проверки токена:', error);
        setTokenError('Не удалось проверить приглашение. Попробуйте позже.');
      } finally {
        setValidatingToken(false);
      }
    };
    
    checkToken();
  }, [token, safeToken]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value
    };
    
    setFormData(newFormData);
    
    if (safeToken) {
      localStorage.setItem(`invite_step1_${safeToken}`, JSON.stringify(newFormData));
    }
    
    if (formError) setFormError('');
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const validateForm = () => {
    if (!formData.username.trim()) {
      setFormError('Введите имя пользователя');
      return false;
    }
    
    const usernameRegex = /^[\w.@+-]+$/;
    if (!usernameRegex.test(formData.username)) {
      setFormError('Имя пользователя может содержать только буквы, цифры и символы @/./+/-/_');
      return false;
    }
    
    if (formData.username.length > 150) {
      setFormError('Имя пользователя не должно превышать 150 символов');
      return false;
    }
    
    if (formData.username.length < 1) {
      setFormError('Имя пользователя должно содержать хотя бы 1 символ');
      return false;
    }
    
    if (!formData.email) {
      setFormError('Введите email');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormError('Введите корректный email');
      return false;
    }
    
    if (formData.email.length > 254) {
      setFormError('Email не должен превышать 254 символа');
      return false;
    }
    
    if (!formData.password) {
      setFormError('Введите пароль');
      return false;
    }
    
    if (formData.password.length < 6) {
      setFormError('Пароль должен содержать минимум 6 символов');
      return false;
    }
    
    if (!formData.password_confirm) {
      setFormError('Подтвердите пароль');
      return false;
    }
    
    if (formData.password !== formData.password_confirm) {
      setFormError('Пароли не совпадают');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const registrationData = {
      token: token,
      username: formData.username,
      email: formData.email,
      password: formData.password,
      password_confirm: formData.password_confirm
    };
    
    localStorage.setItem('invite_registration_data', JSON.stringify(registrationData));
    
    navigate(`/staff/register/invite/${token}/step2`);
  };
  
  const handleConfirmPasswordPaste = (e) => {
    e.preventDefault();
    return false;
  };
  
  if (validatingToken) {
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
          <p>Проверка приглашения...</p>
        </div>
      </div>
    );
  }
  
  if (tokenError || !inviteData) {
    return (
      <div className="register_container_register_page">
        <img src={AcrelisLogo} alt="Acrelis Logo" className="login_logo_login_page" />
        <h1 className="login_title_login_page">Ошибка приглашения</h1>
        <div className="login_error_login_page" style={{ textAlign: 'center' }}>
          {tokenError || 'Неверная ссылка приглашения'}
        </div>
        <Link to="/login" className="login_button_login_page" style={{ 
          textDecoration: 'none', 
          display: 'block', 
          textAlign: 'center',
          marginTop: '20px'
        }}>
          На страницу входа
        </Link>
      </div>
    );
  }
  
  return (
    <div className="register_container_register_page">
      <img src={AcrelisLogo} alt="Acrelis Logo" className="login_logo_login_page" />
      
      <h1 className="login_title_login_page">Регистрация</h1>
      <p style={{ 
        textAlign: 'center', 
        color: '#666', 
        marginBottom: '20px',
        fontSize: '14px'
      }}>
      </p>
      
      <form onSubmit={handleSubmit} className="login_form_login_page">
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          placeholder="Логин"
          className="login_input_login_page"
          autoComplete="username"
          required
          maxLength={150}
        />
        
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="E-mail"
          className="login_input_login_page"
          autoComplete="email"
          required
          maxLength={254}
        />
        
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
            minLength={6}
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
        
        <input
          type="password"
          name="password_confirm"
          value={formData.password_confirm}
          onChange={handleInputChange}
          onPaste={handleConfirmPasswordPaste}
          placeholder="Повторите пароль"
          className="login_input_login_page"
          autoComplete="new-password"
          required
          minLength={6}
        />
        
        {formError && (
          <div className="login_error_login_page">
            {formError}
          </div>
        )}
        
        <button 
          type="submit" 
          className="login_button_login_page"
        >
          Продолжить
        </button>
        
        
      </form>
    </div>
  );
}

export default InviteRegistrationStart;