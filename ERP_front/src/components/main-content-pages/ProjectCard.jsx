// src/components/main-content-pages/ProjectCard.jsx
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

  return (
    <div className="projectcard-container">
      <div className="projectcard-header">
        <h1 className="projectcard-title">{project.name}</h1>
        <button className="projectcard-close" onClick={onClose}>×</button>
      </div>
      
      <div className="projectcard-content">
        <div className="projectcard-section">
          <h3>Основная информация</h3>
          <div className="projectcard-info">
            <div className="info-item">
              <span className="info-label">Тип:</span>
              <span className={`projectcard-type ${project.type}`}>
                {project.typeLabel}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Статус:</span>
              <span className={`projectcard-status ${project.status === 'Готов' ? 'ready' : project.status === 'В работе' ? 'in-progress' : 'planning'}`}>
                {project.status}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Часы:</span>
              <span className="projectcard-hours">{project.hours} ч</span>
            </div>
            <div className="info-item">
              <span className="info-label">Стоимость:</span>
              <span className="projectcard-price">
                {new Intl.NumberFormat('ru-RU').format(project.price)} ₽
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Дата создания:</span>
              <span className="projectcard-date">
                {new Date(project.createdAt).toLocaleDateString('ru-RU')}
              </span>
            </div>
          </div>
        </div>

        <div className="projectcard-section">
          <h3>Описание</h3>
          <p className="projectcard-description">{project.description}</p>
        </div>

        <div className="projectcard-section">
          <h3>Команда ({project.team?.length || 0} человек)</h3>
          <div className="projectcard-team">
            {project.team?.map(member => (
              <div key={member.id} className="team-member">
                {generateAvatar(member.name)}
                <span className="member-name">{member.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;