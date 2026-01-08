import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  getTasks, 
  getCurrentUser, 
  formatDateForDisplay, 
  createTask, 
  getProjects, 
  getStaffList 
} from '../../services/api/api';
import './MyTasks.css';

// Константы статусов задач
const TASK_STATUS_MAP = {
  'draft': 'Черновик',
  'new': 'Новое', 
  'active': 'В работе',
  'paused': 'Ожидает',
  'completed': 'Готово',
  'failed': 'Провалено'
};

const MyTasks = ({ useMockData = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Получаем параметры из URL для фильтрации
  const queryParams = new URLSearchParams(location.search);
  const performerFromUrl = queryParams.get('performer');
  const performerNameFromUrl = queryParams.get('performerName');
  
  // Поиск с дебаунсом
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimeoutRef = useRef(null);
  
  // Фильтры
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPerformer, setSelectedPerformer] = useState(performerFromUrl || 'all');
  
  // Данные
  const [tasks, setTasks] = useState([]);
  const [performers, setPerformers] = useState([{ id: 'all', label: 'Все исполнители' }]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Создание задачи
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [newTask, setNewTask] = useState({
    name: '', 
    description: '', 
    project: '', 
    projectName: '',
    deadline: '', 
    performer: '', 
    performerName: '', 
    director: '', 
    directorName: '', 
    hours: 0
  });
  
  // Данные для автодополнения
  const [allProjects, setAllProjects] = useState([]);
  const [allStaff, setAllStaff] = useState([]);
  const [projectSuggestions, setProjectSuggestions] = useState([]);
  const [performerSuggestions, setPerformerSuggestions] = useState([]);
  const [directorSuggestions, setDirectorSuggestions] = useState([]);
  const [showProjectSuggestions, setShowProjectSuggestions] = useState(false);
  const [showPerformerSuggestions, setShowPerformerSuggestions] = useState(false);
  const [showDirectorSuggestions, setShowDirectorSuggestions] = useState(false);
  
  const projectInputRef = useRef(null);
  const performerInputRef = useRef(null);
  const directorInputRef = useRef(null);

  // Статусы для фильтров
  const statuses = [
    { id: 'all', label: 'Все статусы' },
    ...Object.entries(TASK_STATUS_MAP).map(([id, label]) => ({ id, label }))
  ];

  // Загрузка исполнителей
  useEffect(() => {
    loadStaffList();
  }, [useMockData]);

  // Загрузка задач при изменении фильтров
  useEffect(() => {
    loadTasks();
  }, [useMockData, selectedStatus, selectedPerformer, searchQuery]);

  // Очищаем таймер при размонтировании
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Загрузка списка сотрудников
  const loadStaffList = async () => {
    try {
      const staffResult = await getStaffList(useMockData);
      const staffData = staffResult.employees || [];
      
      // Создаем список исполнителей
      let performersList = [
        { id: 'all', label: 'Все исполнители' },
        ...staffData.map(staff => ({
          id: staff.id.toString(),
          label: staff.name
        }))
      ];
      
      // Если есть фильтр из URL, добавляем его в список если нет
      if (performerFromUrl && performerFromUrl !== 'all' && performerNameFromUrl) {
        const exists = performersList.find(p => p.id === performerFromUrl);
        if (!exists) {
          performersList = [
            { id: 'all', label: 'Все исполнители' },
            { id: performerFromUrl, label: performerNameFromUrl },
            ...staffData.map(staff => ({
              id: staff.id.toString(),
              label: staff.name
            }))
          ];
        }
      }
      
      setPerformers(performersList);
      setAllStaff(staffData);
      
    } catch (error) {
      console.error('Ошибка загрузки сотрудников:', error);
    }
  };

  // Обработчик изменения поиска с дебаунсом
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    
    // Очищаем предыдущий таймер
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Устанавливаем новый таймер на 1.5 секунды
    searchTimeoutRef.current = setTimeout(() => {
      if (value !== searchQuery) {
        setSearchQuery(value);
      }
    }, 1500);
  };

  // При потере фокуса - сразу делаем поиск (если текст изменился)
  const handleSearchBlur = () => {
    // Очищаем таймер дебаунса
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Если текст изменился - делаем поиск сразу
    if (searchInput !== searchQuery) {
      setSearchQuery(searchInput);
    }
  };

  // Загрузка задач с фильтрацией на бэкенде
  const loadTasks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Собираем фильтры для API
      const filters = {};
      
      if (selectedStatus !== 'all') {
        filters.status = selectedStatus;
      }
      
      if (selectedPerformer !== 'all') {
        filters.performer = selectedPerformer;
      }
      
      if (searchQuery) {
        filters.search = searchQuery;
      }
      
      // Всегда добавляем сортировку по дедлайну
      filters.ordering = '-deadline';
      
      // Отправляем запрос с фильтрами
      const apiTasks = await getTasks(useMockData, filters);
      
      // Форматируем задачи
      const formattedTasks = apiTasks.map(task => {
        const status_display = task.status_display || TASK_STATUS_MAP[task.status] || 'Новая';
        
        return {
          id: task.id,
          taskName: task.name,
          status: task.status || 'new',
          status_display: status_display,
          deadline: formatDateForDisplay(task.deadline),
          projectId: task.project,
          projectName: task.project_name || 'Не указан',
          directorId: task.director,
          directorName: task.director_name,
          performerId: task.performer,
          performerName: task.performer_name,
          hours: task.hours || 0,
          created: task.created,
          is_overdue: task.is_overdue || false,
          originalDeadline: task.deadline
        };
      });
      
      setTasks(formattedTasks);
      
    } catch (error) {
      console.error('❌ Ошибка загрузки задач:', error);
      setError('Не удалось загрузить ваши задачи');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка проектов для автодополнения
  const loadProjectsAndStaff = async () => {
    try {
      const projectsResult = await getProjects(useMockData);
      const projectsList = projectsResult.projects || [];
      setAllProjects(projectsList);
    } catch (error) {
      console.error('Ошибка загрузки проектов:', error);
    }
  };

  // Обновление задач
  const handleRefresh = () => {
    loadTasks();
  };

  const getProjectManager = (task) => {
    return task.directorName || 'Не назначен';
  };

  const handleTaskClick = (task) => {
    navigate(`/tasks/${task.id}`);
  };

  // Функции для работы с модальным окном
  const openCreateModal = () => {
    setShowCreateModal(true);
    setCreateError('');
    setNewTask({
      name: '', 
      description: '', 
      project: '', 
      projectName: '',
      deadline: '', 
      performer: '', 
      performerName: '', 
      director: '', 
      directorName: '', 
      hours: 0
    });
    
    loadProjectsAndStaff();
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setCreateError('');
    setShowProjectSuggestions(false);
    setShowPerformerSuggestions(false);
    setShowDirectorSuggestions(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
  };

  // Обработчики для автодополнения проектов
  const handleProjectInputChange = (e) => {
    const value = e.target.value;
    setNewTask(prev => ({ ...prev, projectName: value, project: '' }));
    
    if (value.length > 1) {
      const searchTerm = value.toLowerCase().trim();
      const filtered = allProjects.filter(project => 
        project.name.toLowerCase().includes(searchTerm)
      ).slice(0, 5);
      
      setProjectSuggestions(filtered);
      setShowProjectSuggestions(filtered.length > 0);
    } else {
      setProjectSuggestions([]);
      setShowProjectSuggestions(false);
    }
  };

  const handleProjectSuggestionClick = (project) => {
    setNewTask(prev => ({ ...prev, project: project.id, projectName: project.name }));
    setShowProjectSuggestions(false);
  };

  // Обработчики для автодополнения исполнителей
  const handlePerformerInputChange = (e) => {
    const value = e.target.value;
    setNewTask(prev => ({ ...prev, performerName: value, performer: '' }));
    
    if (value.length > 1) {
      const searchTerm = value.toLowerCase().trim();
      const filtered = allStaff.filter(staff => 
        staff.name.toLowerCase().includes(searchTerm)
      ).slice(0, 5);
      
      setPerformerSuggestions(filtered);
      setShowPerformerSuggestions(filtered.length > 0);
    } else {
      setPerformerSuggestions([]);
      setShowPerformerSuggestions(false);
    }
  };

  const handlePerformerSuggestionClick = (staff) => {
    setNewTask(prev => ({ ...prev, performer: staff.id, performerName: staff.name }));
    setShowPerformerSuggestions(false);
  };

  // Обработчики для автодополнения руководителей
  const handleDirectorInputChange = (e) => {
    const value = e.target.value;
    setNewTask(prev => ({ ...prev, directorName: value, director: '' }));
    
    if (value.length > 1) {
      const searchTerm = value.toLowerCase().trim();
      const filtered = allStaff.filter(staff => 
        staff.name.toLowerCase().includes(searchTerm)
      ).slice(0, 5);
      
      setDirectorSuggestions(filtered);
      setShowDirectorSuggestions(filtered.length > 0);
    } else {
      setDirectorSuggestions([]);
      setShowDirectorSuggestions(false);
    }
  };

  const handleDirectorSuggestionClick = (staff) => {
    setNewTask(prev => ({ ...prev, director: staff.id, directorName: staff.name }));
    setShowDirectorSuggestions(false);
  };

  // Закрытие выпадающих списков при клике вне
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProjectSuggestions && projectInputRef.current && !projectInputRef.current.contains(event.target)) {
        setShowProjectSuggestions(false);
      }
      if (showPerformerSuggestions && performerInputRef.current && !performerInputRef.current.contains(event.target)) {
        setShowPerformerSuggestions(false);
      }
      if (showDirectorSuggestions && directorInputRef.current && !directorInputRef.current.contains(event.target)) {
        setShowDirectorSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProjectSuggestions, showPerformerSuggestions, showDirectorSuggestions]);

  const handleCreateTask = async () => {
    // Валидация
    if (!newTask.name.trim()) {
      setCreateError('Название задачи обязательно');
      return;
    }

    if (!newTask.deadline) {
      setCreateError('Дата дедлайна обязательна');
      return;
    }

    // Проверяем проект
    if (newTask.projectName && !newTask.project) {
      const foundProject = allProjects.find(project => 
        project.name.toLowerCase() === newTask.projectName.toLowerCase() ||
        project.name.toLowerCase().includes(newTask.projectName.toLowerCase())
      );
      
      if (foundProject) {
        setNewTask(prev => ({ ...prev, project: foundProject.id }));
      } else {
        setCreateError(`Проект "${newTask.projectName}" не найден`);
        return;
      }
    }

    // Проверяем исполнителя
    if (newTask.performerName && !newTask.performer) {
      const foundPerformer = allStaff.find(staff => 
        staff.name.toLowerCase() === newTask.performerName.toLowerCase() ||
        staff.name.toLowerCase().includes(newTask.performerName.toLowerCase())
      );
      
      if (foundPerformer) {
        setNewTask(prev => ({ ...prev, performer: foundPerformer.id }));
      } else {
        setCreateError(`Исполнитель "${newTask.performerName}" не найден`);
        return;
      }
    }

    // Проверяем руководителя
    if (newTask.directorName && !newTask.director) {
      const foundDirector = allStaff.find(staff => 
        staff.name.toLowerCase() === newTask.directorName.toLowerCase() ||
        staff.name.toLowerCase().includes(newTask.directorName.toLowerCase())
      );
      
      if (foundDirector) {
        setNewTask(prev => ({ ...prev, director: foundDirector.id }));
      } else {
        setCreateError(`Руководитель "${newTask.directorName}" не найден`);
        return;
      }
    }

    setCreating(true);
    setCreateError('');

    try {
      const taskData = {
        name: newTask.name,
        description: newTask.description || newTask.name,
        status: 'new',
        project: newTask.project || null,
        deadline: newTask.deadline + 'T00:00:00+03:00',
        performer: newTask.performer || null,
        director: newTask.director || null,
        hours: newTask.hours || 0
      };

      await createTask(taskData, useMockData);
      
      setShowCreateModal(false);
      setNewTask({
        name: '', 
        description: '', 
        project: '', 
        projectName: '',
        deadline: '', 
        performer: '', 
        performerName: '', 
        director: '', 
        directorName: '', 
        hours: 0
      });
      
      await loadTasks();
      
      alert('Задача успешно создана!');
      
    } catch (error) {
      console.error('❌ Ошибка создания задачи:', error);
      
      let userFriendlyError = 'Не удалось создать задачу';
      
      if (error.message.includes('API Error: 400')) {
        const errorMatch = error.message.match(/\{.*\}/);
        if (errorMatch) {
          try {
            const errorJson = JSON.parse(errorMatch[0]);
            
            if (errorJson.hours && Array.isArray(errorJson.hours)) {
              userFriendlyError = 'Превышено общее количество часов проекта. Уменьшите количество часов для этой задачи.';
            } else if (errorJson.non_field_errors && Array.isArray(errorJson.non_field_errors)) {
              userFriendlyError = errorJson.non_field_errors[0];
            } else if (errorJson.name && Array.isArray(errorJson.name)) {
              userFriendlyError = `Название задачи: ${errorJson.name[0]}`;
            } else if (errorJson.deadline && Array.isArray(errorJson.deadline)) {
              userFriendlyError = `Дата дедлайна: ${errorJson.deadline[0]}`;
            }
          } catch {
            // Оставляем общее сообщение
          }
        }
      } else if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
        userFriendlyError = 'Ошибка сети. Проверьте подключение к интернету.';
      } else if (error.message.includes('401') || error.message.includes('403')) {
        userFriendlyError = 'Ошибка авторизации. Войдите в систему заново.';
      } else if (error.message.includes('404')) {
        userFriendlyError = 'Проект или сотрудник не найден. Проверьте введенные данные.';
      } else if (error.message.includes('500')) {
        userFriendlyError = 'Внутренняя ошибка сервера. Попробуйте позже.';
      }
      
      setCreateError(userFriendlyError);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="mytasks-container">
        <div className="loading">Загрузка задач...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mytasks-container">
        <div className="error-message">
          {error}
          <button onClick={handleRefresh} className="retry-btn">
            Повторить попытку
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mytasks-container">
      <h1 className="mytasks-title">Мои задачи</h1>

      <div className="filters-container">
        <div className="filters">
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

          <div className="filter-group">
            <select 
              className="filter-select" 
              value={selectedPerformer}
              onChange={(e) => setSelectedPerformer(e.target.value)}
            >
              {performers.map(performer => (
                <option key={performer.id} value={performer.id}>
                  {performer.label}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group search-group">
            <input
              type="text"
              placeholder="Поиск задач..."
              className="search-input"
              value={searchInput}
              onChange={handleSearchChange}
              onBlur={handleSearchBlur}
            />
          </div>
        </div>
        
        <button className="create-task-btn" onClick={openCreateModal}>
          Создать задачу
        </button>
      </div>

      <div className="tasks-table">
        <div className="header-cell">Название задачи</div>
        <div className="header-cell">Дедлайн</div>
        <div className="header-cell">Проект</div>
        <div className="header-cell">Руководитель</div>

        {tasks.length === 0 ? (
          <div className="no-tasks">
            {searchQuery || selectedStatus !== 'all' || selectedPerformer !== 'all'
              ? 'Задачи не найдены по заданным фильтрам' 
              : 'У вас нет назначенных задач'}
          </div>
        ) : (
          tasks.map((task) => (
            <React.Fragment key={task.id}>
              <div 
                className="task-cell task-name"
                onClick={() => handleTaskClick(task)}
              >
                <div className="task-name-text">{task.taskName}</div>
              </div>

              <div 
                className="task-cell"
                onClick={() => handleTaskClick(task)}
              >
                <div className={`deadline ${task.status === 'completed' ? 'completed' : ''}`}>
                  {task.deadline}
                </div>
              </div>

              <div 
                className="task-cell"
                onClick={() => handleTaskClick(task)}
              >
                <div className="project-info">
                  <div className="project-name">{task.projectName}</div>
                </div>
              </div>

              <div 
                className="task-cell"
                onClick={() => handleTaskClick(task)}
              >
                <div className="manager-info">
                  <div className="manager-name">{getProjectManager(task)}</div>
                </div>
              </div>
            </React.Fragment>
          ))
        )}
      </div>

      {/* Модальное окно создания задачи */}
      {showCreateModal && (
        <div className="modal-overlay123">
          <div className="modal-content123">
            <div className="modal-header123">
              <h2>Создать новую задачу</h2>
              <button 
                className="modal-close123"
                onClick={closeCreateModal}
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
                <label>Название задачи *</label>
                <input
                  type="text"
                  name="name"
                  value={newTask.name}
                  onChange={handleInputChange}
                  placeholder="Введите название задачи"
                  disabled={creating}
                  maxLength={100}
                />
              </div>
              
              <div className="form-group123">
                <label>Описание *</label>
                <textarea
                  name="description"
                  value={newTask.description}
                  onChange={handleInputChange}
                  className="form-textarea123"
                  placeholder="Введите описание задачи"
                  disabled={creating}
                  rows="3"
                />
              </div>
              
              <div className="form-group123" ref={projectInputRef} style={{ position: 'relative' }}>
                <label>Проект (опционально)</label>
                <input
                  type="text"
                  name="projectName"
                  value={newTask.projectName}
                  onChange={handleProjectInputChange}
                  placeholder="Начните вводить название проекта"
                  disabled={creating}
                  autoComplete="off"
                />
                <small>Введите название проекта, чтобы выбрать его из списка</small>
                
                {showProjectSuggestions && projectSuggestions.length > 0 && (
                  <div className="suggestions-dropdown">
                    {projectSuggestions.map((project, index) => (
                      <div 
                        key={project.id || index}
                        className="suggestion-item"
                        onClick={() => handleProjectSuggestionClick(project)}
                      >
                        <div className="suggestion-name">{project.name}</div>
                        {project.typeLabel && (
                          <div className="suggestion-details">{project.typeLabel}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="form-group123">
                <label>Дедлайн *</label>
                <input
                  type="date"
                  name="deadline"
                  value={newTask.deadline}
                  onChange={handleInputChange}
                  disabled={creating}
                />
              </div>
              
              <div className="form-row123">
                <div className="form-group123" ref={performerInputRef} style={{ position: 'relative' }}>
                  <label>Исполнитель (опционально)</label>
                  <input
                    type="text"
                    name="performerName"
                    value={newTask.performerName}
                    onChange={handlePerformerInputChange}
                    placeholder="Начните вводить ФИО исполнителя"
                    disabled={creating}
                    autoComplete="off"
                  />
                  
                  {showPerformerSuggestions && performerSuggestions.length > 0 && (
                    <div className="suggestions-dropdown">
                      {performerSuggestions.map((staff, index) => (
                        <div 
                          key={staff.id || index}
                          className="suggestion-item"
                          onClick={() => handlePerformerSuggestionClick(staff)}
                        >
                          <div className="suggestion-name">{staff.name}</div>
                          {staff.position && (
                            <div className="suggestion-details">{staff.position}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="form-group123" ref={directorInputRef} style={{ position: 'relative' }}>
                  <label>Руководитель (опционально)</label>
                  <input
                    type="text"
                    name="directorName"
                    value={newTask.directorName}
                    onChange={handleDirectorInputChange}
                    placeholder="Начните вводить ФИО руководителя"
                    disabled={creating}
                    autoComplete="off"
                  />
                  
                  {showDirectorSuggestions && directorSuggestions.length > 0 && (
                    <div className="suggestions-dropdown">
                      {directorSuggestions.map((staff, index) => (
                        <div 
                          key={staff.id || index}
                          className="suggestion-item"
                          onClick={() => handleDirectorSuggestionClick(staff)}
                        >
                          <div className="suggestion-name">{staff.name}</div>
                          {staff.position && (
                            <div className="suggestion-details">{staff.position}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="form-row123">
                <div className="form-group123">
                  <label>Часы</label>
                  <input
                    type="number"
                    name="hours"
                    value={newTask.hours}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    max="2147483647"
                    disabled={creating}
                  />
                </div>
              </div>
            </div>
            
            <div className="modal-footer123">
              <button 
                className="btn-cancel123"
                onClick={closeCreateModal}
                disabled={creating}
              >
                Отмена
              </button>
              <button 
                className="btn-create123"
                onClick={handleCreateTask}
                disabled={creating}
              >
                {creating ? 'Создание...' : 'Создать задачу'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTasks;