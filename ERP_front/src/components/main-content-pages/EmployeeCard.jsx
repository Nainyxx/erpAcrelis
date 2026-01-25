import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEmployeeById } from '../../services/api/api';
import './EmployeeCard.css';

const EmployeeCard = ({ useMockData = true }) => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avatarError, setAvatarError] = useState(false);

  const loadEmployeeData = async () => {
    setLoading(true);
    setError(null);
    setAvatarError(false);
    
    try {
      if (!employeeId) {
        throw new Error('Не указан ID сотрудника');
      }
      
      const employeeData = await getEmployeeById(employeeId, useMockData);
      console.log('✅ Данные сотрудника получены:', employeeData);
      
      if (!employeeData || !employeeData.id) {
        throw new Error('Сотрудник не найден');
      }
      
      setEmployee(employeeData);
      
    } catch (error) {
      console.error('❌ Ошибка загрузки данных сотрудника:', error);
      setError('Не удалось загрузить данные сотрудника. Проверьте подключение.');
      setEmployee(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployeeData();
  }, [employeeId, useMockData]);

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
            onError={() => setAvatarError(true)}
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
          <span className="clickable_employee_card" onClick={() => navigate('/staff')}>Сотрудники</span> — Карточка сотрудника
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

  return (
    <div className="employee-page_employee_card">
      <h1 className="page-title_employee_card">
        <span className="clickable_employee_card" onClick={() => navigate('/staff')}>Сотрудники</span> — Карточка сотрудника
      </h1>

      <div className="main-card_employee_card">
        <div className="top-section_employee_card">
          <div className="employee-info_employee_card">
            {generateAvatar(employee.name, employee.image_url)}
            <div className="name-section_employee_card">
              <h2>{employee.name}</h2>
              <p>{employee.position || employee.post || 'Должность не указана'}</p>
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
              <span className="contact-value_employee_card">{employee.telegram || '@acrelis'}</span>
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