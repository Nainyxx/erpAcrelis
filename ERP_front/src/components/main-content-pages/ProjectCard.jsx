import React from 'react';
import './ProjectCard.css';

const ProjectCard = ({ project, onClose, onShowGantt }) => {
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
    
    // Пытаемся разобрать дату в разных форматах
    let date;
    
    // Если дата уже в формате dd.mm.yyyy
    if (typeof dateString === 'string' && dateString.includes('.')) {
      const parts = dateString.split('.');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        date = new Date(year, month, day);
      }
    }
    
    // Если не удалось разобрать как dd.mm.yyyy, пробуем стандартный парсинг
    if (!date || isNaN(date.getTime())) {
      date = new Date(dateString);
    }
    
    if (isNaN(date.getTime())) return 'Неверная дата';
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}.${month}.${year}`;
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

  return (
    <div className="projectcard-container">
      {/* Добавляем крестик справа сверху */}
      <div className="projectcard-header">
        <h1 className="projectcard-title">Проекты — Карточка проекта</h1>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>

      <div className="projectcard-main-content">
        <div className="projectcard-layout">
          {/* Левая часть - 2 колонки по 2 строки */}
          <div className="main-cards-section">
            {/* Верхний ряд */}
            <div className="top-row">
              {/* Даты */}
              <div className="projectcard-tile">
                <div className="date-item">
                  <span className="date-label">Начало проекта</span>
                  <span className="date-value">{formatDate(project.startDate || project.createdAt)}</span>
                </div>
                <div className="date-item">
                  <span className="date-label">Дедлайн</span>
                  <span className="date-value deadline">{formatDate(project.deadline || project.createdAt)}</span>
                </div>
              </div>

              {/* Исполнители */}
              <div className="projectcard-tile">
                <div className="tile-header">
                  <h3>Исполнители</h3>
                  <button className="add-btn">+ Добавить исполнителя</button>
                </div>
                <div className="team-container">
                  {renderTeamAvatars(project.team)}
                </div>
                <div className="team-count">
                  Всего: {project.team?.length || 0} человек
                </div>
              </div>
            </div>

            {/* Средний ряд */}
            <div className="middle-row">
              {/* Тип проекта */}
              <div className="projectcard-tile">
                <div className="info-item">
                  <span className="info-label">Тип проекта</span>
                  <span className={`project-type ${project.type}`}>
                    {project.typeLabel}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Бюджет проекта</span>
                  <span className="project-price">
                    {formatPrice(project.price)}
                  </span>
                </div>
              </div>

              {/* Заказчик */}
              <div className="projectcard-tile">
                <h3>Заказчик</h3>
                <div className="customer-info">
                  <div className="customer-avatar">
                    <div className="customer-icon">🏢</div>
                  </div>
                  <div className="customer-details">
                    <span className="customer-name">{project.customer || 'ООО Рога и Копыта'}</span>
                    <span className="customer-contact">Контактное лицо: Иван Иванов</span>
                    <span className="customer-email">ivanov@company.ru</span>
                    <span className="customer-phone">+7 (999) 123-45-67</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Нижний ряд - Изменения и Кнопки */}
            <div className="bottom-row">
              {/* Изменения */}
              <div className="projectcard-tile">
                <h3>Изменения</h3>
                <div className="empty-state">
                  <span className="empty-icon">📋</span>
                  <span className="empty-text">История изменений будет отображаться здесь</span>
                </div>
              </div>

              {/* Управление проектом - МЕНЯЕМ ТОЛЬКО КНОПКУ */}
              <div className="projectcard-tile">
                <h3>Управление проектом</h3>
                <button className="action-btn kanban-btn">Открыть канбан</button>
                {/* Делаем кнопку нажимаемой */}
                <button className="action-btn gantt-btn" onClick={onShowGantt}>
                  Диаграмма ганта
                </button>
              </div>
            </div>
          </div>

          {/* Правая часть - Файлы */}
          <div className="files-panel">
            <div className="files-header">
              <h3>Файлы проекта</h3>
              <button className="add-btn">+ Загрузить файлы</button>
            </div>
            <div className="files-list">
              {project.files?.map(file => (
                <div key={file.id} className="file-item">
                  <div className="file-icon">
                    {file.name.endsWith('.pdf') ? '📄' : 
                     file.name.endsWith('.docx') ? '📝' : 
                     file.name.endsWith('.xlsx') ? '📊' : 
                     file.name.endsWith('.fig') || file.name.endsWith('.sketch') ? '🎨' : '📁'}
                  </div>
                  <div className="file-details">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{file.size} • {file.date || 'Без даты'}</span>
                  </div>
                  <button className="file-download">↓</button>
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