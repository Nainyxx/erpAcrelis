import React, { useState, useEffect, useRef } from 'react';
import { getProjects, createProject } from '../../services/api/api';
import './ProjectsList.css';

const ProjectsList = ({ useMockData = true, onProjectSelect }) => {
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [projects, setProjects] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    type: 'website',
    customer: '',
    deadline: '',
    hours: 10,
    price: '',
    status: 'draft',
    available: false
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const searchTimeoutRef = useRef(null);

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`🔄 Загружаю проекты: useMockData = ${useMockData}, тип = ${selectedType}, поиск = ${searchQuery}`);
      
      const filters = {};
      
      if (selectedType !== 'all') {
        filters.type = selectedType;
      }
      
      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }
      
      const { projects: loadedProjects, projectTypes: loadedTypes } = await getProjects(useMockData, filters);
      
      console.log(`✅ Получено ${loadedProjects.length} проектов с фильтрами`);
      
      setProjects(loadedProjects);
      setProjectTypes(loadedTypes);
      
    } catch (error) {
      console.error('❌ Ошибка загрузки проектов:', error);
      setError('Не удалось загрузить проекты. Проверьте подключение.');
      setProjects([]);
      setProjectTypes([]);
    } finally {
      setLoading(false);
    }
  };

  // Обработчик изменения поиска с дебаунсом
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      if (value !== searchQuery) {
        setSearchQuery(value);
      }
    }, 1500);
  };

  // При потере фокуса - сразу делаем поиск (если текст изменился)
  const handleSearchBlur = () => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (searchInput !== searchQuery) {
      setSearchQuery(searchInput);
    }
  };

  const getTypeLabel = (type) => {
    const typeMap = {
      'website': 'Веб-сайт',
      'mobile': 'Мобильное приложение',
      'dashboard': 'Дашборд',
      'ecommerce': 'Интернет-магазин',
      'system': 'Система',
      'other': 'Другой'
    };
    return typeMap[type] || 'Проект';
  };

  const handleCreateProject = async () => {
    if (!newProject.name.trim() || !newProject.customer.trim() || !newProject.deadline) {
      setCreateError('Заполните обязательные поля: Название, Заказчик, Дедлайн');
      return;
    }

    setCreating(true);
    setCreateError('');

    try {
      console.log('Создаю проект:', newProject);
      
      const createdProject = await createProject(newProject, useMockData);
      
      console.log('✅ Проект создан:', createdProject);
      
      setShowCreateModal(false);
      setNewProject({
        name: '',
        type: 'website',
        customer: '',
        deadline: '',
        hours: 10,
        price: '',
        status: 'draft',
        available: false
      });
      
      await loadProjects();
      
      alert(`Проект "${createdProject.name}" успешно создан!`);
      
    } catch (error) {
      console.error('❌ Ошибка создания проекта:', error);
      setCreateError(error.message || 'Ошибка при создании проекта');
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [useMockData, selectedType, searchQuery]);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

const generateAvatar = (name) => {
  // Обработка для поля staff_name
  let safeName = '';
  
  if (!name) {
    safeName = 'Исполнитель';
  } else if (typeof name === 'string') {
    safeName = name.trim();
    if (safeName === '') safeName = 'Исполнитель';
  } else {
    safeName = String(name);
  }
  
  const colors = ['#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2', '#EF476F'];
  
  // Получаем инициалы из staff_name
  const words = safeName.split(' ').filter(word => word.length > 0);
  let initials = '';
  
  if (words.length >= 2) {
    // Для "Лутфуллин Амир Айратович" берем "ЛА" (Лутфуллин Амир)
    initials = words[0][0] + words[1][0];
  } else if (words.length === 1) {
    // Для "Азат" берем "А"
    initials = words[0][0];
  } else {
    initials = 'И';
  }
  
  const colorIndex = safeName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  
  return (
    <div className="avatar" style={{ backgroundColor: colors[colorIndex] }}>
      {initials.toUpperCase()}
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
      {visibleTeam.map((member, index) => {
        // Используем staff_name из данных API
        const memberName = member?.staff_name || 
                          member?.name || 
                          `Исполнитель ${index + 1}`;
        
        return (
          <div key={member?.id || index} className="avatar-wrapper" style={{ zIndex: maxVisible - index }}>
            {generateAvatar(memberName)}
          </div>
        );
      })}
      {extraCount > 0 && (
        <div className="avatar extra-avatar">
          +{extraCount}
        </div>
      )}
    </div>
  );
};

  // Универсальный компонент загрузки
  const LoadingSpinner = ({ message = "Загрузка проектов..." }) => (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <h3 className="loading-title">{message}</h3>
      <p className="loading-subtitle">
        Подготавливаем список проектов...
      </p>
    </div>
  );

  // Универсальный компонент ошибки
  const ErrorMessage = ({ message, onRetry }) => (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <h3 className="error-title">Ошибка загрузки</h3>
      <p className="error-message">{message}</p>
      <button 
        onClick={onRetry}
        className="error-retry-btn"
      >
        Повторить попытку
      </button>
    </div>
  );

  // Если идет загрузка
  if (loading) {
    return (
      <div className="projects-container">
        <div className="projects-header">
          <h1 className="projects-title">Проекты</h1>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  // Если произошла ошибка
  if (error) {
    return (
      <div className="projects-container">
        <div className="projects-header">
          <h1 className="projects-title">Проекты</h1>
        </div>
        <ErrorMessage 
          message={error}
          onRetry={loadProjects}
        />
      </div>
    );
  }

  // Если проектов нет
  if (projects.length === 0 && !searchQuery && selectedType === 'all') {
    return (
      <div className="projects-container">
        <div className="projects-header">
          <h1 className="projects-title">Проекты</h1>
        </div>
        
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
                value={searchInput}
                onChange={handleSearchChange}
                onBlur={handleSearchBlur}
              />
            </div>
          </div>
          
          <button 
            className="create-project-btn"
            onClick={() => setShowCreateModal(true)}
          >
            Создать проект
          </button>
        </div>

        <div className="no-data-container">
          <div className="no-data-icon">📋</div>
          <h4>Проектов пока нет</h4>
          <p>Создайте первый проект, чтобы начать работу</p>
          <button 
            className="create-first-project-btn"
            onClick={() => setShowCreateModal(true)}
          >
            Создать проект
          </button>
        </div>

        {/* Модальное окно создания проекта */}
        {showCreateModal && (
          <div className="modal-overlay123">
            <div className="modal-content123">
              
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="projects-container">
      <div className="projects-header">
        <h1 className="projects-title">Проекты</h1>
      </div>

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
              value={searchInput}
              onChange={handleSearchChange}
              onBlur={handleSearchBlur}
            />
          </div>
        </div>
        
        <button 
          className="create-project-btn"
          onClick={() => setShowCreateModal(true)}
        >
          Создать проект
        </button>
      </div>

      <div className="projects-table">
        <div className="header-cell" id="123name">Название</div>
        <div className="header-cell">Исполнитель</div>
        <div className="header-cell">Тип</div>
        <div className="header-cell">Статус</div>
        <div className="header-cell">Часы</div>

        {projects.length === 0 ? (
          <div className="no-projects">
            {searchQuery || selectedType !== 'all' 
              ? 'Проекты не найдены по заданным фильтрам' 
              : 'Нет доступных проектов'}
          </div>
        ) : (
          projects.map((project) => (
            <div className="project-row" key={project.id}>
              <div onClick={() => onProjectSelect(project)}>
                <div className="project-name-text">{project.name}</div>
              </div>
              
              <div onClick={() => onProjectSelect(project)}>
                {renderTeamAvatars(project.team)}
              </div>
              
              <div onClick={() => onProjectSelect(project)}>
                <span className={`project-type ${project.type}`}>
                  {project.typeLabel || getTypeLabel(project.type)}
                </span>
              </div>
              
              <div onClick={() => onProjectSelect(project)}>
                <span className={`project-status ${project.status}`}>
                  {project.status_display || 'Планирование'}
                </span>
              </div>
              
              <div onClick={() => onProjectSelect(project)}>
                <div className="project-hours">{project.hours} ч</div>
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay123">
          <div className="modal-content123">
            <div className="modal-header123">
              <h2>Создать новый проект</h2>
              <button 
                className="modal-close123"
                onClick={() => setShowCreateModal(false)}
                disabled={creating}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body123">
              {createError && (
                <div className="error-message123">{createError}</div>
              )}
              
              <div className="form-group123">
                <label>Название проекта *</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  placeholder="Введите название проекта"
                  disabled={creating}
                />
              </div>
              
              <div className="form-group123">
                <label>Тип проекта *</label>
                <select
                  value={newProject.type}
                  onChange={(e) => setNewProject({...newProject, type: e.target.value})}
                  disabled={creating}
                >
                  <option value="website">Веб-сайт</option>
                  <option value="bot">Бот</option>
                  <option value="app">Приложение</option>
                  <option value="miniapp">Мини-приложение</option>
                  <option value="design">Дизайн</option>
                  <option value="other">Другое</option>
                </select>
              </div>
              
              <div className="form-group123">
                <label>Заказчик *</label>
                <input
                  type="text"
                  value={newProject.customer}
                  onChange={(e) => setNewProject({...newProject, customer: e.target.value})}
                  placeholder="Введите имя заказчика"
                  disabled={creating}
                />
              </div>
              
              <div className="form-group123">
                <label>Дедлайн *</label>
                <input
                  type="date"
                  value={newProject.deadline}
                  onChange={(e) => setNewProject({...newProject, deadline: e.target.value})}
                  disabled={creating}
                />
              </div>
              
              <div className="form-row123">
                <div className="form-group123">
                  <label>Часы *</label>
                  <input
                    type="number"
                    value={newProject.hours}
                    onChange={(e) => setNewProject({...newProject, hours: parseInt(e.target.value) || 0})}
                    disabled={creating}
                    min="0"
                  />
                </div>
                
                <div className="form-group123">
                  <label>Бюджет</label>
                  <input
                    type="text"
                    value={newProject.price}
                    onChange={(e) => setNewProject({...newProject, price: e.target.value})}
                    placeholder="0.00"
                    disabled={creating}
                  />
                </div>
              </div>
              
              <div className="form-group123">
                <label>Статус *</label>
                <select
                  value={newProject.status}
                  onChange={(e) => setNewProject({...newProject, status: e.target.value})}
                  disabled={creating}
                >
                  <option value="draft">Черновик</option>
                  <option value="active">Активный</option>
                  <option value="paused">Приостановлен</option>
                  <option value="tests">Тестирование</option>
                  <option value="completed">Завершен</option>
                  <option value="cancelled">Отменен</option>
                </select>
              </div>
            </div>
            
            <div className="modal-footer123">
              <button 
                className="btn-cancel123"
                onClick={() => setShowCreateModal(false)}
                disabled={creating}
              >
                Отмена
              </button>
              <button 
                className="btn-create123"
                onClick={handleCreateProject}
                disabled={creating}
              >
                {creating ? 'Создание...' : 'Создать проект'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectsList;