import React, { useState, useEffect } from 'react';
import { getProjectsList } from '../../services/projectsService';
import './ProjectsList.css';

const ProjectsList = ({ useMockData = true, onProjectSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [projects, setProjects] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { projects: loadedProjects, projectTypes: loadedTypes } = await getProjectsList(useMockData);
        
        setProjects(loadedProjects);
        setProjectTypes(loadedTypes);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        setError('Не удалось загрузить данные проектов');
        setProjects([]);
        setProjectTypes([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [useMockData]);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || project.type === selectedType;
    return matchesSearch && matchesType;
  });

  const generateAvatar = (name) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2', '#EF476F'];
    const initials = name.split(' ').map(n => n[0]).join('');
    const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    
    return (
      <div className="avatar" style={{ backgroundColor: colors[colorIndex] }}>
        {initials}
      </div>
    );
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

  if (loading) {
    return (
      <div className="projects-container">
        <div className="loading">Загрузка проектов...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="projects-container">
        <div className="error-message">
          {error}
          <button onClick={() => window.location.reload()} className="retry-btn">
            Повторить попытку
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="projects-container">
      <h1 className="projects-title">Проекты</h1>

      <div className="filters-container">
        <div className="filters">
          <div className="filter-group">
            <select 
              className="filter-select" 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              {projectTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.label} ({type.count || 0})
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group search-group">
            <input
              type="text"
              placeholder="Поиск проектов..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <button className="create-project-btn">
          Создать проект
        </button>
      </div>

      {/* ЕДИНЫЙ ГРИД */}
      <div className="projects-table">
        {/* ЗАГОЛОВКИ - первые 5 элементов в гриде */}
        <div className="header-cell" id="123name">Название</div>
        <div className="header-cell">Исполнитель</div>
        <div className="header-cell">Тип</div>
        <div className="header-cell">Статус</div>
        <div className="header-cell">Часы</div>

        {filteredProjects.length === 0 ? (
          <div className="no-projects">
            {searchQuery || selectedType !== 'all' 
              ? 'Проекты не найдены по заданным фильтрам' 
              : 'Нет доступных проектов'}
          </div>
        ) : (
          filteredProjects.map((project) => (
            // КАЖДАЯ СТРОКА - 5 элементов в гриде
            <div className="project-row" key={project.id}>
              <div onClick={() => onProjectSelect(project)}>
                <div className="project-name-text">{project.name}</div>
              </div>
              
              <div onClick={() => onProjectSelect(project)}>
                {renderTeamAvatars(project.team)}
              </div>
              
              <div onClick={() => onProjectSelect(project)}>
                <span className={`project-type ${project.type}`}>
                  {project.typeLabel}
                </span>
              </div>
              
              <div onClick={() => onProjectSelect(project)}>
                <span className={`project-status ${project.status === 'completed' ? 'ready' : project.status === 'in_progress' || project.status === 'tests' ? 'in-progress' : 'planning'}`}>
                  {project.status_display || 'Не указан'}
                </span>
              </div>
              
              <div onClick={() => onProjectSelect(project)}>
                <div className="project-hours">{project.hours} ч</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProjectsList;