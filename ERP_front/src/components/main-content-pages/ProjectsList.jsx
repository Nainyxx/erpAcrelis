import React, { useState, useEffect } from 'react';
import './ProjectsList.css';

const ProjectsList = ({ useMockData = true }) => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [projects, setProjects] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      if (useMockData) {
        try {
          const mockModule = await import('../../MockData/projects.js');
          setProjects(mockModule.projectsData || []);
          setProjectTypes(mockModule.projectTypes || []);
        } catch (error) {
          console.error('Ошибка загрузки мок данных:', error);
        }
      } else {
        try {
          const response = await fetch('/api/projects');
          const data = await response.json();
          setProjects(data.projects || []);
          setProjectTypes(data.types || []);
        } catch (error) {
          console.error('Ошибка загрузки с API:', error);
        }
      }
      
      setLoading(false);
    };

    loadData();
  }, [useMockData]);

  const statuses = [
    { id: 'all', label: 'Все статусы' },
    { id: 'В работе', label: 'В работе' },
    { id: 'Готов', label: 'Готов' },
    { id: 'Планирование', label: 'Планирование' }
  ];

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || project.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
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
    const maxVisible = 4;
    const visibleTeam = team.slice(0, maxVisible);
    const extraCount = team.length > maxVisible ? team.length - maxVisible : 0;

    return (
      <div className="team-avatars">
        {visibleTeam.map((member, index) => (
          <div key={member.id} className="avatar-wrapper" style={{ zIndex: maxVisible - index }}>
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
                  {type.label} ({type.count})
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <select 
              className="filter-select" 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {statuses.map(status => (
                <option key={status.id} value={status.id}>
                  {status.label}
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

      <div className="projects-table">
        <div className="table-header">
          <div className="table-cell">Название проекта</div>
          <div className="table-cell">Исполнитель</div>
          <div className="table-cell">Тип</div>
          <div className="table-cell">Статус</div>
          <div className="table-cell">Часы</div>
        </div>

        {filteredProjects.map((project) => (
          <div 
            key={project.id}
            className={`project-row ${selectedProject === project.id ? 'selected' : ''}`}
            onClick={() => setSelectedProject(project.id)}
          >
            <div className="table-cell project-name">
              <div className="project-name-text">{project.name}</div>
            </div>

            <div className="table-cell">
              {renderTeamAvatars(project.team)}
            </div>

            <div className="table-cell">
              <span className={`project-type ${project.type}`}>
                {project.typeLabel}
              </span>
            </div>
            
            <div className="table-cell">
              <span className={`project-status ${project.status === 'Готов' ? 'ready' : project.status === 'В работе' ? 'in-progress' : 'planning'}`}>
                {project.status}
              </span>
            </div>

            <div className="table-cell">
              <div className="project-hours">{project.hours} ч</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsList;