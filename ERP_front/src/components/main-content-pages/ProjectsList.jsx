// ERP_front/src/components/main-content-pages/ProjectsList.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getProjects, createProject } from '../../services/api';
import { PROJECTS_NAV_QUERY_STORAGE_KEY } from '../../constants/navigationKeys';
import { PROJECT_ACTIONS_ALLOWED_ROLES, canAccessOperationsHub } from '../../constants/roles';
import {
  PROJECT_STATUS_OPTIONS,
  PROJECT_TYPE_OPTIONS,
  getProjectStatusLabel,
  getProjectTypeLabel
} from '../../constants/projects';
import CreateEntityModal from '../shared/CreateEntityModal';
import { Breadcrumbs } from '../shared/Breadcrumbs';
import { PageLoading } from '../shared/PageLoading';
import { useSyncedUrlSearch } from '../shared/useSyncedUrlSearch';
import { AvatarPhoto } from '../shared/AvatarPhoto';
import './ProjectsList.css';

const PROJECTS_PER_PAGE = 20;

const PROJECT_STATUS = [
  { id: 'all', label: 'Все статусы' },
  ...PROJECT_STATUS_OPTIONS,
];

const buildProjectsQueryString = (selectedType, selectedStatus, searchQuery) => {
  const params = new URLSearchParams();
  if (selectedType && selectedType !== 'all') {
    params.set('type', selectedType);
    const typeName = getProjectTypeLabel(selectedType) || selectedType;
    if (typeName) params.set('typeName', typeName);
  }
  if (selectedStatus && selectedStatus !== 'all') {
    params.set('status', selectedStatus);
    const st = PROJECT_STATUS.find((s) => s.id === selectedStatus);
    if (st?.label) params.set('statusName', st.label);
  }
  const sq = searchQuery != null ? String(searchQuery).trim() : '';
  if (sq) params.set('search', sq);
  return params.toString();
};

/** Читает фильтры из query до первого fetch — тот же контракт, что и sync useEffect ниже */
const parseFiltersFromSearch = (searchStr) => {
  const params = new URLSearchParams(searchStr || '');
  const typeParam = params.get('type');
  const selectedType = typeParam && typeParam !== 'all' ? typeParam : 'all';
  const statusParam = params.get('status');
  const selectedStatus =
    statusParam && PROJECT_STATUS.some((s) => s.id === statusParam) ? statusParam : 'all';
  const searchParam = params.get('search');
  const searchQuery =
    searchParam != null && searchParam !== '' ? searchParam : '';
  return { selectedType, selectedStatus, searchQuery };
};

const ProjectsList = ({ useMockData = false, showNotification }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = localStorage.getItem('role');
  const canCreateProject = PROJECT_ACTIONS_ALLOWED_ROLES.includes(userRole);
  const canAccessOperations = canAccessOperationsHub(userRole);

  const initialFromQuery = parseFiltersFromSearch(location.search);

  const [searchInput, setSearchInput] = useState(initialFromQuery.searchQuery);
  const [searchQuery, setSearchQuery] = useState(initialFromQuery.searchQuery);
  const [selectedType, setSelectedType] = useState(initialFromQuery.selectedType);
  const [selectedStatus, setSelectedStatus] = useState(initialFromQuery.selectedStatus);
  const [projects, setProjects] = useState([]);
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

  useEffect(() => {
    const next = parseFiltersFromSearch(location.search);
    setSelectedType(next.selectedType);
    setSelectedStatus(next.selectedStatus);
    setSearchQuery(next.searchQuery);
    setSearchInput(next.searchQuery);
  }, [location.search]);

  useSyncedUrlSearch({
    pathname: '/projects',
    sessionStorageKey: PROJECTS_NAV_QUERY_STORAGE_KEY,
    getQueryString: () =>
      buildProjectsQueryString(selectedType, selectedStatus, searchQuery),
    syncDeps: [selectedType, selectedStatus, searchQuery]
  });

  // Загрузка проектов
  const loadProjects = async () => {
    setLoading(true);
    setError(null);

    try {
      const filters = {};

      if (selectedType !== 'all') {
        filters.type = selectedType;
      }

      // Добавляем фильтр по статусу для передачи на бэкенд
      if (selectedStatus !== 'all') {
        filters.status = selectedStatus;
      }

      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }

      const result = await getProjects(useMockData, filters);

      setProjects(result.projects || []);

    } catch (error) {
      setError('Не удалось загрузить проекты. Проверьте подключение.');
      setProjects([]);
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
  }, [useMockData, selectedType, selectedStatus, searchQuery]);

  const getTypeLabel = (type) => getProjectTypeLabel(type);

  const getStatusLabel = (status) => {
    if (status === 'all') return 'Все статусы';
    return getProjectStatusLabel(status);
  };

  // ОБРАБОТЧИК СОЗДАНИЯ ПРОЕКТА
  const handleCreateProject = async () => {
    if (!PROJECT_ACTIONS_ALLOWED_ROLES.includes(localStorage.getItem('role'))) {
      return;
    }
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
    navigate({ pathname: `/projects/${project.id}`, search: location.search });
  };

  // Функция для генерации аватарки
  const generateAvatar = (member) => {
    const name = member?.staff_name || member?.name || 'Исполнитель';
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
          <AvatarPhoto
            src={imageUrl}
            alt={name}
            imgClassName="avatar-image"
            onError={(e) => {
              const root = e.target.closest('.avatar');
              const span = root?.querySelector('.avatar-initials');
              if (span) span.style.display = 'block';
            }}
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

  // Компонент ошибки
  const ErrorMessage = ({ message }) => (
    <div className="error-container">
      <div className="error-icon">⚠️</div>
      <h3 className="error-title">Ошибка загрузки</h3>
      <p className="error-message">{message}</p>
    </div>
  );

  const breadcrumbItems = [
    { label: 'Главная', to: '/projects', preserveSearch: true },
    { label: 'Проекты' },
  ];

  // Если идет загрузка
  if (loading) {
    return (
      <div className="projects-container projects-container--loading">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="projects-loading-area">
          <PageLoading title="Загрузка проектов..." />
        </div>
      </div>
    );
  }

  // Если произошла ошибка
  if (error) {
    return (
      <div className="projects-container">
        <Breadcrumbs items={breadcrumbItems} />
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="projects-container">
      <Breadcrumbs items={breadcrumbItems} />

      {/* ФИЛЬТРЫ И КНОПКА СОЗДАНИЯ */}
      <div className="projects-toolbar">
        <div className="projects-toolbar__left">
          <div className="filter-group">
            <label htmlFor="projects-filter-type" className="pl-visually-hidden">
              Тип
            </label>
            <select
              id="projects-filter-type"
              className="filter-select projects-toolbar-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">Все проекты</option>
              {PROJECT_TYPE_OPTIONS.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="projects-filter-status" className="pl-visually-hidden">
              Статус
            </label>
            <select
              id="projects-filter-status"
              className="filter-select projects-toolbar-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {PROJECT_STATUS.map(status => (
                <option key={status.id} value={status.id}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group projects-toolbar-search-wrap">
            <span className="projects-toolbar-search-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="#6b6f78" strokeWidth="1.75" /><path d="M16.5 16.5 21 21" stroke="#6b6f78" strokeWidth="1.75" strokeLinecap="round" /></svg>
            </span>
            <input
              id="projects-search"
              type="text"
              placeholder="Поиск по названию"
              className="search-input projects-toolbar-search"
              value={searchInput}
              onChange={handleSearchChange}
              onBlur={handleSearchBlur}
              aria-label="Поиск по названию"
            />
          </div>
        </div>

        <div className="btn-create-project">
          {canCreateProject && (
            <button
              type="button"
              className="projects-toolbar-btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              Создать проект
            </button>
          )}
          {canAccessOperations && (
            <button type="button" className="btn-operations" onClick={() => navigate('/operations')}>
              Операции
            </button>
          )}
        </div>
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
            {searchQuery || selectedType !== 'all' || selectedStatus !== 'all'
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
                  {project.status_display || getStatusLabel(project.status)}
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
      {canCreateProject && (
        <CreateEntityModal
          title="Создать новый проект"
          isOpen={showCreateModal}
          isSubmitting={creating}
          error={createError}
          submitLabel="Создать проект"
          submittingLabel="Создание..."
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateProject}
        >
          <div className="form-group123">
            <label>Название проекта *</label>
            <input
              type="text"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              placeholder="Введите название проекта"
              disabled={creating}
            />
          </div>

          <div className="form-group123">
            <label>Тип проекта *</label>
            <select
              value={newProject.type}
              onChange={(e) => setNewProject({ ...newProject, type: e.target.value })}
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
              onChange={(e) => setNewProject({ ...newProject, customer: e.target.value })}
              placeholder="Введите имя заказчика"
              disabled={creating}
            />
          </div>

          <div className="form-group123">
            <label>Дедлайн *</label>
            <input
              type="date"
              value={newProject.deadline}
              onChange={(e) => setNewProject({ ...newProject, deadline: `${(e.target.value).split('T')[0]}` })}
              disabled={creating}
            />
          </div>

          <div className="form-row123">
            <div className="form-group123">
              <label>Часы *</label>
              <input
                type="number"
                value={newProject.hours}
                onChange={(e) => setNewProject({ ...newProject, hours: parseInt(e.target.value) || 0 })}
                disabled={creating}
                min="0"
              />
            </div>

            <div className="form-group123">
              <label>Бюджет</label>
              <input
                type="text"
                value={newProject.price}
                onChange={(e) => setNewProject({ ...newProject, price: e.target.value })}
                placeholder="0.00"
                disabled={creating}
              />
            </div>
          </div>

          <div className="form-group123">
            <label>Статус *</label>
            <select
              value={newProject.status}
              onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
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
        </CreateEntityModal>
      )}
    </div>
  );
};

export default ProjectsList;