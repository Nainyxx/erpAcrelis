import React from 'react';
import './ProjectCard.css';

const ProjectCard = ({ project, onClose }) => {
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
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const renderTeamAvatars = (team) => {
    if (!team || team.length === 0) {
      return <div className="team-avatars">Нет исполнителей</div>;
    }
    
    const maxVisible = 4;
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

  return (
    <div className="projectcard-container">
      <h1 className="projectcard-title">Проекты — Карточка проекта</h1>

      <div className="projectcard-main-content">
        {/* Сетка 2x2 и файлы рядом */}
        <div className="projectcard-grid-section">
          <div className="projectcard-grid">
            {/* Левый верхний: Даты */}
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

            {/* Правый верхний: Исполнители */}
            <div className="projectcard-tile">
              <div className="tile-header">
                <span>Исполнители</span>
                <button className="add-btn">+ Добавить</button>
              </div>
              <div className="team-container">
                {renderTeamAvatars(project.team)}
              </div>
            </div>

            {/* Левый нижний: Тип и Счет */}
            <div className="projectcard-tile">
              <div className="info-item">
                <span className="info-label">Тип проекта</span>
                <span className={`project-type ${project.type}`}>
                  {project.typeLabel}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Счет</span>
                <span className="project-price">
                  {new Intl.NumberFormat('ru-RU').format(parseFloat(project.price))} ₽
                </span>
              </div>
            </div>

            {/* Правый нижний: Заказчик */}
            <div className="projectcard-tile">
              <div className="info-item">
                <span className="info-label">Заказчик</span>
                <div className="customer-info">
                  <div className="customer-icon">🏢</div>
                  <span className="customer-name">{project.customer || 'ООО Рога и Копыта'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Правый прямоугольник с файлами */}
          <div className="files-panel">
            <div className="files-header">
              <span>Файлы</span>
              <button className="add-btn">+ Загрузить</button>
            </div>
            <div className="files-list">
              {project.files?.map(file => (
                <div key={file.id} className="file-item">
                  <div className="file-icon">
                    {file.name.endsWith('.pdf') ? '📄' : 
                     file.name.endsWith('.docx') ? '📝' : 
                     file.name.endsWith('.xlsx') ? '📊' : '📁'}
                  </div>
                  <div className="file-details">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{file.size}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Нижний прямоугольник с кнопками */}
        <div className="actions-panel">
          <button className="action-btn kanban-btn">Открыть канбан</button>
          <button className="action-btn gantt-btn">Диаграмма ганта</button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;