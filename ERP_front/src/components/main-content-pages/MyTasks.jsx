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

const TASKS_PER_PAGE = 20;

// Функции для работы с localStorage
const getStoredPage = () => {
  const stored = localStorage.getItem('my-tasks-page');
  return stored ? parseInt(stored) : 1;
};

const savePageToStorage = (page) => {
  localStorage.setItem('my-tasks-page', page.toString());
};

const MyTasks = ({ useMockData = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Получаем текущего пользователя
  const [currentUser, setCurrentUser] = useState(null);
  
  // Поиск с дебаунсом
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const searchTimeoutRef = useRef(null);
  
  // Фильтры
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPerformer, setSelectedPerformer] = useState('');
  
  // Пагинация через localStorage
  const [currentPage, setCurrentPage] = useState(getStoredPage());
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  
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

  // Инициализация - получаем текущего пользователя
  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    
    // Сразу устанавливаем фильтр по staff_id текущего пользователя
    if (user && user.staff_id) {
      setSelectedPerformer(user.staff_id.toString());
    } else if (user && user.user_id) {
      setSelectedPerformer(user.user_id.toString());
    } else {
      setSelectedPerformer('all');
    }
    
    // Загружаем список сотрудников
    loadStaffList();
  }, [useMockData]);

  // Загрузка задач при изменении фильтров или страницы
  useEffect(() => {
    if (selectedPerformer !== '') {
      loadTasks();
    }
  }, [useMockData, selectedStatus, selectedPerformer, searchQuery, currentPage]);

  // Сохраняем страницу в localStorage при изменении
  useEffect(() => {
    savePageToStorage(currentPage);
  }, [currentPage]);

  // Сброс страницы при изменении фильтров
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, selectedPerformer, searchQuery]);

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
      const performersList = [
        { id: 'all', label: 'Все исполнители' },
        ...staffData.map(staff => ({
          id: staff.id.toString(),
          label: staff.name
        }))
      ];
      
      setPerformers(performersList);
      setAllStaff(staffData);
      
      // Проверяем, есть ли текущий пользователь в списке
      if (currentUser && currentUser.staff_id) {
        const userExists = performersList.find(p => p.id === currentUser.staff_id.toString());

      }
      
    } catch (error) {
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
      
      // Фильтр по исполнителю
      if (selectedPerformer && selectedPerformer !== 'all') {
        filters.performer = selectedPerformer;
        
        // Добавляем информацию о текущем пользователе
        if (currentUser && currentUser.staff_id && selectedPerformer === currentUser.staff_id.toString()) {
        }
      }
      
      if (searchQuery) {
        filters.search = searchQuery;
      }
      
      // Добавляем пагинацию в фильтры
      if (currentPage > 1) {
        filters.page = currentPage;
      }
      
      // Всегда добавляем сортировку по дедлайну
      filters.ordering = '-deadline';
      
      
      // Отправляем запрос с фильтрами
      const apiResponse = await getTasks(useMockData, filters);
      
      // Извлекаем данные из ответа
      const apiTasks = apiResponse.results || apiResponse || [];
      const totalCount = apiResponse.count || 0;
      
      // Рассчитываем общее количество страниц
      const calculatedTotalPages = Math.ceil(totalCount / TASKS_PER_PAGE);
      
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
      setTotalTasks(totalCount);
      setTotalPages(calculatedTotalPages);
      
    } catch (error) {
      setError('Не удалось загрузить задачи. Проверьте подключение.');
      setTasks([]);
      setTotalTasks(0);
      setTotalPages(1);
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

  // Пагинация - простой вариант через localStorage
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Генерация номеров страниц для отображения
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Если страниц мало, показываем все
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Если страниц много, показываем с многоточиями
      if (currentPage <= 3) {
        // В начале
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        // В конце
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        // В середине
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    
    return pages;
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
      
      // Сбрасываем на первую страницу при создании новой задачи
      setCurrentPage(1);
      await loadTasks();
      
      
    } catch (error) {      
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

  // ЗАГРУЗКА
  if (loading || selectedPerformer === '') {
    return (
      <div className="mytasks-container">
        <div className="gantt-loading_gantt_class">
          <div className="loading-spinner_gantt_class"></div>
          <h3 style={{ color: 'black', margin: '1vh 0', fontSize: '2vh' }}>Загрузка ваших задач...</h3>
          <p style={{ color: 'rgba(0, 0, 0, 0.8)', fontSize: '1.4vh' }}>
            Подготавливаем список задач
          </p>
        </div>
      </div>
    );
  }

  // ОШИБКА ЗАГРУЗКИ
  if (error) {
    return (
      <div className="mytasks-container">
        <h1 className="mytasks-title">Мои задачи</h1>
        <div className="no-tasks-message_gantt_class">
          <div className="no-tasks-content_gantt_class">
            <span className="no-tasks-icon_gantt_class">⚠️</span>
            <h4>Ошибка загрузки</h4>
            <p>{error}</p>
            <button 
              onClick={handleRefresh}
              className="gantt-back-btn_gantt_class"
              style={{ marginTop: '2vh' }}
            >
              Повторить попытку
            </button>
          </div>
        </div>
      </div>
    );
  }

  // НЕТ ЗАДАЧ
  if (tasks.length === 0 && !searchQuery && selectedStatus === 'all' && selectedPerformer === 'all') {
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
                {performers.map(performer => {
                  const isCurrentUser = currentUser && 
                    ((currentUser.staff_id && performer.id === currentUser.staff_id.toString()) ||
                     (currentUser.user_id && performer.id === currentUser.user_id.toString()));
                  
                  return (
                    <option key={performer.id} value={performer.id}>
                      {performer.label} {isCurrentUser && '(Вы)'}
                    </option>
                  );
                })}
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

        <div className="no-tasks-message_gantt_class">
          <div className="no-tasks-content_gantt_class">
            <span className="no-tasks-icon_gantt_class">📋</span>
            <h4>Задач пока нет</h4>
            <p>Создайте первую задачу или выберите другого исполнителя</p>
            <button 
              onClick={openCreateModal}
              className="gantt-back-btn_gantt_class"
              style={{ marginTop: '2vh' }}
            >
              Создать задачу
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Рассчитываем отображаемый диапазон задач
  const startTask = (currentPage - 1) * TASKS_PER_PAGE + 1;
  const endTask = Math.min(currentPage * TASKS_PER_PAGE, totalTasks);

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
              {performers.map(performer => {
                // Добавляем отметку для текущего пользователя
                const isCurrentUser = currentUser && 
                  ((currentUser.staff_id && performer.id === currentUser.staff_id.toString()) ||
                   (currentUser.user_id && performer.id === currentUser.user_id.toString()));
                
                return (
                  <option key={performer.id} value={performer.id}>
                    {performer.label} {isCurrentUser && '(Вы)'}
                  </option>
                );
              })}
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
              : 'Задачи не найдены'}
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

      {/* Пагинация - расположена снизу */}
      {totalPages > 1 && (
        <div className="tasks-pagination">
          <div className="pagination-info">
            <span style={{ marginLeft: '10px', color: '#666', fontSize: '14px' }}>
            </span>
          </div>
          
          <div className="pagination-controls">
            <button 
              className={`pagination-btn prev-btn ${currentPage === 1 ? 'disabled' : ''}`}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ← Назад
            </button>
            
            <div className="pagination-pages">
              {getPageNumbers().map((page, index) => (
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
                ) : (
                  <button
                    key={page}
                    className={`pagination-page ${currentPage === page ? 'active' : ''}`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                )
              ))}
            </div>
            
            <button 
              className={`pagination-btn next-btn ${currentPage === totalPages ? 'disabled' : ''}`}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Вперед →
            </button>
          </div>
        </div>
      )}

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