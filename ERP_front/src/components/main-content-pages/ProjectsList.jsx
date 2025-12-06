import React, { useState, useEffect } from 'react';
import './ProjectsList.css';

const ProjectsList = ({ useMockData = true, onProjectSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [projects, setProjects] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (useMockData) {
          const mockModule = await import('../../MockData/projects.js');
          const mockData = mockModule.projectsData || [];
          const mockTypes = mockModule.projectTypes || [];
          
          await new Promise(resolve => setTimeout(resolve, 300));
          
          setProjects(mockData);
          setProjectTypes(mockTypes);
        } else {
          const response = await fetch('/api/projects');
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
          
          const formattedProjects = data.projects?.map(project => ({
            id: project.id,
            name: project.name,
            type: project.type || 'website',
            typeLabel: project.typeLabel || getTypeLabel(project.type),
            status: project.status || 'Планирование',
            hours: project.hours || 0,
            price: project.price || "0.00",
            teamSize: project.team?.length || 0,
            team: project.team?.map(member => ({
              id: member.id,
              name: member.name
            })) || [],
            description: project.description || '',
            createdAt: project.createdAt || new Date().toISOString()
          })) || [];
          
          const formattedTypes = data.types?.map(type => ({
            id: type.id,
            label: type.label,
            count: type.count || 0
          })) || [];
          
          setProjects(formattedProjects);
          setProjectTypes(formattedTypes);
        }
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        setError('Не удалось загрузить данные проектов');
        
        try {
          const mockModule = await import('../../MockData/projects.js');
          setProjects(mockModule.projectsData || []);
          setProjectTypes(mockModule.projectTypes || []);
        } catch (mockError) {
          setProjects([]);
          setProjectTypes([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [useMockData]);

  const getTypeLabel = (type) => {
    const typeMap = {
      'website': 'Веб-сайт',
      'mobile': 'Мобильное приложение',
      'dashboard': 'Дашборд',
      'ecommerce': 'Интернет-магазин',
      'system': 'Система'
    };
    return typeMap[type] || 'Проект';
  };

  const statuses = [
    { id: 'all', label: 'Все статусы' },
    { id: 'В работе', label: 'В работе' },
    { id: 'Готов', label: 'Готов' },
    { id: 'Планирование', label: 'Планирование' }
  ];

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()));
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
        {filteredProjects.length === 0 ? (
          <div className="no-projects">
            {searchQuery || selectedType !== 'all' || selectedStatus !== 'all' 
              ? 'Проекты не найдены по заданным фильтрам' 
              : 'Нет доступных проектов'}
          </div>
        ) : (
          <>
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
                className="project-row"
                onClick={() => onProjectSelect(project)}
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
          </>
        )}
      </div>
    </div>
  );
};

export default ProjectsList;