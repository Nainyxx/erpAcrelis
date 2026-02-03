import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEmployeeById, authFetch } from '../../services/api/api';
import './EmployeeCard.css';

const EmployeeCard = ({ useMockData = false }) => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avatarError, setAvatarError] = useState(false);

  // Функция для форматирования Telegram для отображения
  const formatTelegramForDisplay = (telegram) => {
    if (!telegram) return '';
    
    if (telegram.startsWith('@')) {
      return telegram;
    }
    
    if (telegram.includes('t.me/')) {
      const match = telegram.match(/t\.me\/([a-zA-Z0-9_]+)/);
      if (match && match[1]) {
        return `@${match[1]}`;
      }
    }
    
    if (telegram.match(/^[a-zA-Z0-9_]+$/)) {
      return `@${telegram}`;
    }
    
    return telegram;
  };

  // Функция для получения чистого username без @ и ссылки
  const getTelegramUsername = (telegram) => {
    if (!telegram) return null;
    
    if (telegram.startsWith('@')) {
      return telegram.substring(1);
    }
    
    if (telegram.includes('t.me/')) {
      const match = telegram.match(/t\.me\/([a-zA-Z0-9_]+)/);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    if (telegram.match(/^[a-zA-Z0-9_]+$/)) {
      return telegram;
    }
    
    return null;
  };

  // Функция для создания ссылки на Telegram
  const getTelegramLink = (telegram) => {
    const username = getTelegramUsername(telegram);
    if (username) {
      return `https://t.me/${username}`;
    }
    return null;
  };

  const loadEmployeeData = async () => {
    setLoading(true);
    setError(null);
    setAvatarError(false);
    
    try {
      if (!employeeId) {
        throw new Error('Не указан ID сотрудника');
      }
      
      // Используем прямую аутентифицированную загрузку для получения полных данных
      const response = await authFetch(`https://api.acrelis.ru/staff/staff/${employeeId}/`, {
        method: 'GET'
      });
      
      if (!response.ok) {
        throw new Error(`Ошибка загрузки: ${response.status}`);
      }
      
      const employeeData = await response.json();
      
      if (!employeeData || !employeeData.id) {
        throw new Error('Сотрудник не найден');
      }
      
      // Форматируем телефон для отображения
      const formattedPhone = formatPhoneForDisplay(employeeData.phone);
      
      // Форматируем Telegram для отображения
      const formattedTelegram = formatTelegramForDisplay(employeeData.telegram);
      
      const formattedEmployeeData = {
        id: employeeData.id,
        name: employeeData.name || '',
        position: employeeData.post || '',
        post: employeeData.post || '',
        email: employeeData.email || '',
        phone: formattedPhone,
        telegram: formattedTelegram, // Используем отформатированный Telegram
        telegram_original: employeeData.telegram || '', // Сохраняем оригинал для ссылки
        birthday: employeeData.birthday || '',
        image_url: employeeData.image || employeeData.image_url || null,
        director: employeeData.director || null,
        department: employeeData.department || '',
        department_name: employeeData.department_name || '',
        is_active: employeeData.is_active !== undefined ? employeeData.is_active : true,
        created: employeeData.created || '',
        current_tasks: employeeData.current_tasks || 0,
        closed_late_tasks: employeeData.closed_late_tasks || 0,
        closed_on_time_tasks: employeeData.closed_on_time_tasks || 0,
        failed_tasks: employeeData.failed_tasks || 0
      };
      
      setEmployee(formattedEmployeeData);
      
    } catch (error) {
      setError('Не удалось загрузить данные сотрудника. Проверьте подключение.');
      
      // Fallback на getEmployeeById если API запрос не удался
      try {
        const fallbackData = await getEmployeeById(employeeId, useMockData);
        if (fallbackData && fallbackData.id) {
          // Форматируем Telegram и в fallback данных
          const formattedFallbackData = {
            ...fallbackData,
            telegram: formatTelegramForDisplay(fallbackData.telegram || ''),
            telegram_original: fallbackData.telegram || ''
          };
          setEmployee(formattedFallbackData);
          setError(null);
        }
      } catch (fallbackError) {
        setEmployee(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployeeData();
  }, [employeeId, useMockData]);

  const formatPhoneForDisplay = (phone) => {
    if (!phone) return '';
    
    if (phone.includes('(') || phone.includes(')')) {
      return phone;
    }
    
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 11) {
      return `+7 (${cleaned.substring(1, 4)}) ${cleaned.substring(4, 7)}-${cleaned.substring(7, 9)}-${cleaned.substring(9)}`;
    } else if (cleaned.length === 10) {
      return `+7 (${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 8)}-${cleaned.substring(8)}`;
    }
    
    return phone;
  };

  const generateAvatar = (name, imageUrl) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2', '#EF476F'];
    
    let initials = 'НН';
    if (name && name.trim()) {
      const parts = name.split(' ').filter(part => part.length > 0);
      if (parts.length >= 2) {
        initials = (parts[0][0] + parts[1][0]).toUpperCase();
      } else if (parts.length === 1) {
        initials = parts[0][0].toUpperCase();
      }
    }
    
    const colorIndex = (name || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    
    if (imageUrl && !avatarError) {
      return (
        <div className="avatar-large_employee_card">
          <img 
            src={imageUrl} 
            alt={name || 'Сотрудник'}
            onError={() => {
              setAvatarError(true);
            }}
          />
        </div>
      );
    }
    
    return (
      <div className="avatar-large_employee_card" style={{ backgroundColor: colors[colorIndex] }}>
        {initials}
      </div>
    );
  };

  // Функция для получения инициалов директора
  const getDirectorInitials = (directorName) => {
    if (!directorName || directorName === 'Не указан') return 'НР';
    const parts = directorName.split(' ').filter(part => part.length > 0);
    
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    } else if (parts.length === 1) {
      return parts[0][0].toUpperCase();
    }
    
    return 'НР';
  };

  // Обработчик клика по руководителю
  const handleDirectorClick = (directorId) => {
    if (directorId) {
      navigate(`/staff/${directorId}`);
    }
  };

  // Обработчик клика по Telegram
  const handleTelegramClick = (e, telegram) => {
    e.preventDefault();
    const link = getTelegramLink(telegram);
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  // Обработчик клика по кнопке задач - переход в MyTasks с фильтром
  const handleTasksButtonClick = () => {
    if (employeeId) {
      navigate(`/my-tasks?performer=${employeeId}&performerName=${encodeURIComponent(employee?.name || '')}`);
    }
  };

  if (loading) {
    return (
      <div className="employee-page_employee_card">
        <h1 className="page-title_employee_card">
          <span className="clickable_employee_card" onClick={() => navigate('/staff')}>Сотрудники</span> — Загрузка...
        </h1>
        <div className="gantt-loading_gantt_class">
          <div className="loading-spinner_gantt_class"></div>
          <h3 style={{ color: 'black', margin: '1vh 0', fontSize: '2vh' }}>Загрузка карточки сотрудника...</h3>
          <p style={{ color: 'rgba(0, 0, 0, 0.8)', fontSize: '1.4vh' }}>
            Подготавливаем данные сотрудника
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="employee-page_employee_card">
        <h1 className="page-title_employee_card">
          <span className="clickable_employee_card" onClick={() => navigate('/staff')}>Сотрудники</span> — Карточка сотрудника
        </h1>
        <div className="no-tasks-message_gantt_class">
          <div className="no-tasks-content_gantt_class">
            <span className="no-tasks-icon_gantt_class">⚠️</span>
            <h4>Ошибка загрузки</h4>
            <p>{error}</p>
            <button 
              onClick={loadEmployeeData}
              className="gantt-back-btn_gantt_class"
              style={{ marginTop: '2vh' }}
            >
              Повторить попытку
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="employee-page_employee_card">
        <h1 className="page-title_employee_card">
          <span className="clickable_employee_card" onClick={() => navigate('/staff')}>Сотрудники</span> — Карточка сотрудника
        </h1>
        <div className="no-tasks-message_gantt_class">
          <div className="no-tasks-content_gantt_class">
            <span className="no-tasks-icon_gantt_class">👤</span>
            <h4>Сотрудник не найден</h4>
            <p>Запрошенный сотрудник не существует или был удален</p>
            <button 
              onClick={() => navigate('/staff')}
              className="gantt-back-btn_gantt_class"
              style={{ marginTop: '2vh' }}
            >
              Вернуться к списку сотрудников
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Получаем ссылку на Telegram для текущего сотрудника
  const telegramLink = getTelegramLink(employee.telegram_original || employee.telegram);
  const telegramDisplay = formatTelegramForDisplay(employee.telegram) || '@acrelis';

  // Получаем имя сотрудника для заголовка, обрезаем если слишком длинное
  const employeeName = employee.name || 'Сотрудник';
  const displayName = employeeName.length > 30 ? employeeName.substring(0, 30) + '...' : employeeName;

  return (
    <div className="employee-page_employee_card">
      <h1 className="page-title_employee_card">
        <span className="clickable_employee_card" onClick={() => navigate('/staff')}>Сотрудники</span> — {displayName}
      </h1>

      <div className="main-card_employee_card">
        <div className="top-section_employee_card">
          <div className="employee-info_employee_card">
            {generateAvatar(employee.name, employee.image_url)}
            <div className="name-section_employee_card">
              <h2>{employee.name || 'Имя не указано'}</h2>
              <p>{employee.position || employee.post || 'Должность не указана'}</p>
              {employee.department_name && (
                <p className="department-text_employee_card">
                  Отдел: {employee.department_name}
                </p>
              )}
            </div>
          </div>
          
          {/* Руководитель - данные из апи */}
          {employee.director && employee.director.id ? (
            <div 
              className="manager-box_employee_card clickable-manager"
              onClick={() => handleDirectorClick(employee.director.id)}
              style={{ cursor: 'pointer' }}
            >
              <div className="manager-label_employee_card">Руководитель</div>
              <div className="manager-row_employee_card">
                <div className="small-avatar_employee_card">
                  {getDirectorInitials(employee.director.name)}
                </div>
                <div className="manager-details_employee_card">
                  <div className="manager-name_employee_card">{employee.director.name || 'Не указан'}</div>
                  <div className="manager-role_employee_card">{employee.director.post || 'Должность не указана'}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="manager-box_employee_card">
              <div className="manager-label_employee_card">Руководитель</div>
              <div className="manager-row_employee_card">
                <div className="small-avatar_employee_card">НР</div>
                <div className="manager-details_employee_card">
                  <div className="manager-name_employee_card">Не назначен</div>
                  <div className="manager-role_employee_card">-</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="middle-section_employee_card">
          <div className="contacts-row_employee_card">
            <div className="contact-item_employee_card">
              <span className="contact-label_employee_card">E-mail</span>
              <span className="contact-value_employee_card">{employee.email || 'Не указан'}</span>
            </div>
            <div className="contact-item_employee_card">
              <span className="contact-label_employee_card">Тел.</span>
              <span className="contact-value_employee_card">{employee.phone || 'Не указан'}</span>
            </div>
            <div className="contact-item_employee_card">
              <span className="contact-label_employee_card">Telegram</span>
              <span className="contact-value_employee_card">
                {telegramLink ? (
                  <a 
                    href={telegramLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="telegram-link_employee_card"
                    onClick={(e) => handleTelegramClick(e, employee.telegram_original || employee.telegram)}
                  >
                    {telegramDisplay}
                  </a>
                ) : (
                  telegramDisplay
                )}
              </span>
            </div>
            <div className="contact-item_employee_card">
              <span className="contact-label_employee_card">Дата рождения</span>
              <span className="contact-value_employee_card">
                {employee.birthday ? 
                  new Date(employee.birthday).toLocaleDateString('ru-RU') : 
                  'Не указана'}
              </span>
            </div>
          </div>
          
          <button 
            className="tasks-button_employee_card"
            onClick={handleTasksButtonClick}
          >
            Задачи сотрудника
          </button>
        </div>
      </div>

      <div className="bottom-cards_employee_card">
        <div className="stat-card_employee_card">
          <div className="stat-number_employee_card">{employee.current_tasks || 0}</div>
          <div className="stat-label_employee_card">Текущие задачи</div>
        </div>
        <div className="stat-card_employee_card">
          <div className="stat-number_employee_card">{employee.closed_late_tasks || 0}</div>
          <div className="stat-label_employee_card">Не закрытые в срок</div>
        </div>
        <div className="stat-card_employee_card">
          <div className="stat-number_employee_card">{employee.closed_on_time_tasks || 0}</div>
          <div className="stat-label_employee_card">Закрытые в срок</div>
        </div>
        <div className="stat-card_employee_card">
          <div className="stat-number_employee_card">{employee.failed_tasks || 0}</div>
          <div className="stat-label_employee_card">Проваленные задачи</div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCard;