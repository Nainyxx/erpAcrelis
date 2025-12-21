import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProjectCard.css';

const ProjectCard = ({ project, onShowGantt, navigate }) => {
  const [startDate, setStartDate] = useState(project.startDate || '');
  const [deadline, setDeadline] = useState(project.deadline || '');
  const [projectType, setProjectType] = useState(project.type || '');
  const [price, setPrice] = useState(project.price || '');
  const [customer, setCustomer] = useState(project.customer || 'ООО Рога и Копыта');
  const [changes, setChanges] = useState([]);
  const [isUserInProject, setIsUserInProject] = useState(false);
  const [currentUser] = useState('Иван Петров');
  
  useEffect(() => {
    const mockChanges = [
      { id: 1, action: 'Изменил сроки проекта', date: '15.12.2023 14:30' },
      { id: 2, action: 'Добавил файл "ТЗ_финальное.docx"', date: '15.12.2023 11:15' },
      { id: 3, action: 'Обновил бюджет проекта', date: '13.12.2023 09:45' },
      { id: 4, action: 'Добавил исполнителя: Елена Кузнецова', date: '12.12.2023 16:20' },
      { id: 5, action: 'Проект создан', date: '10.12.2023 10:00' },
      { id: 6, action: 'Изменила тип проекта', date: '09.12.2023 15:30' },
    ];
    setChanges(mockChanges);
  }, []);
  
  useEffect(() => {
    if (project.team) {
      const userInTeam = project.team.some(member => 
        member.name === currentUser
      );
      setIsUserInProject(userInTeam);
    }
  }, [project.team, currentUser]);
  
  if (!project) return null;

  const generateAvatar = (name) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2', '#EF476F'];
    const initials = name.split(' ').map(n => n[0]).join('');
    const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    
    return (
      <div className="projectcard-avatar" style={{ backgroundColor: colors[colorIndex] }}>
        {initials}
      </div>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Не указана';
    
    if (typeof dateString === 'string' && dateString.includes('.')) {
      return dateString;
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Неверная дата';
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}.${month}.${year}`;
  };

  const handleSaveChanges = () => {
    console.log('Сохранение изменений:', {
      startDate,
      deadline,
      projectType,
      price,
      customer
    });
    
    const newChange = {
      id: changes.length + 1,
      action: 'Сохранил изменения проекта',
      date: new Date().toLocaleString('ru-RU', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
    };
    
    setChanges([newChange, ...changes]);
    alert('Изменения сохранены!');
  };

  const handleJoinProject = () => {
    if (!isUserInProject) {
      console.log('Пользователь добавлен в проект:', currentUser);
      setIsUserInProject(true);
      
      const newChange = {
        id: changes.length + 1,
        action: `${currentUser} присоединился к проекту`,
        date: new Date().toLocaleString('ru-RU', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
      };
      setChanges([newChange, ...changes]);
      
      alert(`Вы присоединились к проекту "${project.name}"`);
    } else {
      console.log('Пользователь удален из проекта:', currentUser);
      setIsUserInProject(false);
      
      const newChange = {
        id: changes.length + 1,
        action: `${currentUser} покинул проект`,
        date: new Date().toLocaleString('ru-RU', { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
      };
      setChanges([newChange, ...changes]);
      
      alert(`Вы покинули проект "${project.name}"`);
    }
  };

  const handleAddTeamMember = () => {
    console.log('Добавить исполнителя');
  };

  const handleAddFile = () => {
    console.log('Добавить файл');
  };

  const handleDownloadFile = (file) => {
    console.log('Скачать файл:', file.name);
  };

  const renderTeamAvatars = (team) => {
    if (!team || team.length === 0) {
      return <div className="team-avatars">Нет исполнителей</div>;
    }
    
    const maxVisible = 6;
    const visibleTeam = team.slice(0, maxVisible);
    const extraCount = team.length > maxVisible ? team.length - maxVisible : 0;

    return (
      <div className="team-avatars">
        {visibleTeam.map((member, index) => (
          <div key={member.id || index} className="avatar-wrapper" style={{ zIndex: maxVisible - index }}>
            {generateAvatar(member.name)}
          </div>
        ))}
        {extraCount > 0 && (
          <div className="avatar extra-avatar">
            +{extraCount}
          </div>
        )}
      </div>
    );
  };
  
  const formatPrice = (price) => {
    const num = parseFloat(price);
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num) + ' ₽';
  };

  const groupChangesByDate = () => {
    const grouped = {};
    changes.forEach(change => {
      const date = change.date.split(' ')[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(change);
    });
    return grouped;
  };

  const groupedChanges = groupChangesByDate();
  const sortedDates = Object.keys(groupedChanges).sort((a, b) => {
    const dateA = a.split('.').reverse().join('-');
    const dateB = b.split('.').reverse().join('-');
    return new Date(dateB) - new Date(dateA);
  });

  return (
    <div className="projectcard-container">
      {/* Контейнер для кнопок */}
      <div className="projectcard-buttons">
        
        <button className="save-changes-btn" onClick={handleSaveChanges}>
          Сохранить изменения
        </button>
      </div>

      <div className="projectcard-header">
        <h1 className="projectcard-title">
          <span 
            className="projects-link" 
            onClick={() => navigate('/projects')}
          >
            Проекты
          </span>
          {' — Карточка проекта'}
        </h1>
      </div>

      <div className="projectcard-main-content">
        <div className="projectcard-layout">
          <div className="main-cards-section">
            <div className="top-row">
              <div className="projectcard-tile">
                <div className="date-item">
                  <span className="date-label">Начало проекта</span>
                  <span 
                    className="date-value1 editable" 
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => setStartDate(e.target.textContent)}
                  >
                    {formatDate(startDate)}
                  </span>
                </div>
                <div className="date-item">
                  <span className="date-label">Дедлайн</span>
                  <span 
                    className="date-value deadline editable" 
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => setDeadline(e.target.textContent)}
                  >
                    {formatDate(deadline)}
                  </span>
                </div>
              </div>

              <div className="projectcard-tile">
                <div className="tile-header">
                  <h3>Исполнители</h3>
                  <button className="add-btn" onClick={handleAddTeamMember}>
                    + Добавить исполнителя
                  </button>
                </div>
                <div className="team-container">
                  {renderTeamAvatars(project.team)}
                </div>
              </div>
            </div>

            <div className="middle-row">
              <div className="projectcard-tile">
                <div className="info-item">
                  <span className="info-label">Тип проекта</span>
                  <span 
                      className="project-type1 editable" 
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => setProjectType(e.target.textContent)}
                    >
                  {projectType || project.type || 'Не указан'}
                </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Бюджет проекта</span>
                  <span 
                    className="project-price editable" 
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => setPrice(e.target.textContent)}
                  >
                    {formatPrice(price)}
                  </span>
                </div>
              </div>

              <div className="projectcard-tile">
                <h3>Заказчик</h3>
                <div className="customer-info">
                  <div className="customer-details">
                    <span 
                      className="customer-name editable" 
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => setCustomer(e.target.textContent)}
                    >
                      {customer}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bottom-row">
              <div className="projectcard-tile">
                <h3>Изменения</h3>
                <div className="changes-container">
                  {changes.length === 0 ? (
                    <div className="empty-state">
                      <span className="empty-icon">📋</span>
                      <span className="empty-text">История изменений будет отображаться здесь</span>
                    </div>
                  ) : (
                    <div className="changes-chat">
                      {sortedDates.map(date => (
                        <React.Fragment key={date}>
                          <div className="change-date-header">{date}</div>
                          {groupedChanges[date].map(change => {
                            const time = change.date.split(' ')[1];
                            return (
                              <div key={change.id} className="change-message">
                                <div className="change-content">{change.action}</div>
                                <div className="change-time">{time}</div>
                              </div>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="projectcard-tile">
                <button 
                  className="action-btn kanban-btn" 
                  onClick={() => navigate(`/projects/${project.id}/kanban`)}
                >
                  Открыть канбан
                </button>
                <button className="action-btn gantt-btn" onClick={onShowGantt}>
                  Диаграмма ганта
                </button>
              </div>
            </div>
          </div>

          <div className="files-panel">
            <div className="files-header">
              <h3>Файлы проекта</h3>
              <button className="add-btn" onClick={handleAddFile}>
                + Загрузить файлы
              </button>
            </div>
            <div className="files-list">
              {project.files?.map(file => (
                <div key={file.id} className="file-item">
                  <div className="file-details">
                    <span className="file-name">{file.name}</span>
                  </div>
                  <button 
                    className="file-download" 
                    onClick={() => handleDownloadFile(file)}
                  >
                    ↓
                  </button>
                </div>
              ))}
            </div>
            <div className="files-count">
              Всего файлов: {project.files?.length || 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;