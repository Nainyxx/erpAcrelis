// ERP_front/src/components/main-content-pages/ProjectsList.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // Добавляем useNavigate
import { getProjects, createProject } from '../../services/api/api';
import './ProjectsList.css';

const PROJECTS_PER_PAGE = 20;

const ProjectsList = ({ useMockData = true, showNotification }) => {
  const navigate = useNavigate(); // Добавляем navigate
  
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [projects, setProjects] = useState([]);
  const [projectTypes, setProjectTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Создание проекта
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

  // Загрузка проектов
  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const filters = {};
      
      if (selectedType !== 'all') {
        filters.type = selectedType;
      }
      
      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }
      
      const result = await getProjects(useMockData, filters);
      
      setProjects(result.projects || []);
      setProjectTypes(result.projectTypes || []);
      
    } catch (error) {
      setError('Не удалось загрузить проекты. Проверьте подключение.');
      setProjects([]);
      setProjectTypes([]);
    } finally {
      setLoading(false);
    }
  };

  // Обработчик изменения поиска
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

  // При потере фокуса - сразу делаем поиск
  const handleSearchBlur = () => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (searchInput !== searchQuery) {
      setSearchQuery(searchInput);
    }
  };

  // Загрузка проектов при изменении фильтров
  useEffect(() => {
    loadProjects();
  }, [useMockData, selectedType, searchQuery]);

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

  // ОБРАБОТЧИК СОЗДАНИЯ ПРОЕКТА
  const handleCreateProject = async () => {
    if (!newProject.name.trim() || !newProject.customer.trim() || !newProject.deadline) {
      setCreateError('Заполните обязательные поля: Название, Заказчик, Дедлайн');
      return;
    }

    setCreating(true);
    setCreateError('');

    try {
      
      const createdProject = await createProject(newProject, useMockData);
      
      
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
      
      // Перезагружаем список проектов
      await loadProjects();
      
      // Показываем уведомление
      if (showNotification) {
        showNotification({
          type: 'success',
          message: `Проект "${createdProject.name}" успешно создан`
        });
      }
      
    } catch (error) {
      setCreateError(error.message || 'Ошибка при создании проекта');
    } finally {
      setCreating(false);
    }
  };

  // Обработчик клика по проекту - переход на его карточку
  const handleProjectSelect = (project) => {
    navigate(`/projects/${project.id}`);
  };

  // Функция для генерации аватарки
  const generateAvatar = (member) => {
    const name = member?.staff_name || member?.name || 'Исполнитель';
    // Формируем правильный URL для изображения
    const imageUrl = member?.staff_image ? 
      `https://api.acrelis.ru/media/${member.staff_image}` : 
      member?.image_url || null;
    
    const colors = ['#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2', '#EF476F'];
    
    const words = name.split(' ').filter(word => word.length > 0);
    let initials = '';
    
    if (words.length >= 2) {
      initials = words[0][0] + words[1][0];
    } else if (words.length === 1) {
      initials = words[0][0];
    } else {
      initials = 'И';
    }
    
    const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    
    if (imageUrl) {
      return (
        <div className="avatar" style={{ backgroundColor: colors[colorIndex] }}>
          <img 
            src={imageUrl} 
            alt={name}
            onError={(e) => {
              e.target.style.display = 'none';
              const span = e.target.parentElement.querySelector('.avatar-initials');
              if (span) span.style.display = 'block';
            }}
            className="avatar-image"
          />
          <span className="avatar-initials" style={{ display: 'none' }}>
            {initials.toUpperCase()}
          </span>
        </div>
      );
    }
    
    return (
      <div className="avatar" style={{ backgroundColor: colors[colorIndex] }}>
        {initials.toUpperCase()}
      </div>
    );
  };

  // Функция для отображения аватарок команды
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
          <div key={member?.id || index} className="avatar-wrapper" style={{ zIndex: maxVisible - index }}>
            {generateAvatar(member)}
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

  // Компонент загрузки
  const LoadingSpinner = () => (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <h3 className="loading-title">Загрузка проектов...</h3>
    </div>
  );

  // Компонент ошибки
  const ErrorMessage = ({ message }) => (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <h3 className="error-title">Ошибка загрузки</h3>
      <p className="error-message">{message}</p>
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
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="projects-container">
      <div className="projects-header">
        <h1 className="projects-title">Проекты</h1>
      </div>

      {/* ФИЛЬТРЫ И КНОПКА СОЗДАНИЯ */}
      <div className="filters-container">
        <div className="filters">
          <div className="filter-group">
            <select 
              className="filter-select" 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">Все проекты</option>
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
        
        {/* КНОПКА СОЗДАНИЯ ПРОЕКТА */}
        <button 
          className="create-project-btn"
          onClick={() => setShowCreateModal(true)}
        >
          Создать проект
        </button>
      </div>

      {/* ТАБЛИЦА ПРОЕКТОВ */}
      <div className="projects-table">
        <div className="header-cell">Название</div>
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
            <div className="project-row" key={project.id} onClick={() => handleProjectSelect(project)}>
              <div>
                <div className="project-name-text">{project.name}</div>
              </div>
              
              <div>
                {renderTeamAvatars(project.team || project.performers || [])}
              </div>
              
              <div>
                <span className={`project-type ${project.type}`}>
                  {project.typeLabel || getTypeLabel(project.type)}
                </span>
              </div>
              
              <div>
                <span className={`project-status ${project.status}`}>
                  {project.status_display || 'Планирование'}
                </span>
              </div>
              
              <div>
                <div className="project-hours">{project.hours} ч</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* МОДАЛЬНОЕ ОКНО СОЗДАНИЯ ПРОЕКТА */}
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