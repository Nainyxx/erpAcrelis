import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  getTasks, 
  getProjectById, // Получаем название проекта
  formatDateForDisplay, 
  createTask, 
  getStaffList 
} from '../../services/api/api';
import './KanbanTasks.css';

const KanbanTasks = ({ useMockData = true }) => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projectName, setProjectName] = useState('Проект'); // Инициализируем

  const columns = [
    { id: 'new', title: 'Новое' },
    { id: 'in_progress', title: 'В работе' },
    { id: 'waiting', title: 'Ожидает' },
    { id: 'done', title: 'Готов' }
  ];

  // Маппинг статусов API → канбан
  const apiToKanbanStatus = {
    'draft': 'new',
    'new': 'new',
    'active': 'in_progress',
    'paused': 'waiting',
    'completed': 'done',
    'failed': 'waiting'
  };

  // Для создания задачи
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [newTask, setNewTask] = useState({
    name: '', 
    description: '', 
    deadline: '', 
    performer: '', 
    performerName: '', 
    director: '', 
    directorName: '', 
    hours: 0
  });
  
  // Данные для автодополнения
  const [allStaff, setAllStaff] = useState([]);
  const [performerSuggestions, setPerformerSuggestions] = useState([]);
  const [directorSuggestions, setDirectorSuggestions] = useState([]);
  const [showPerformerSuggestions, setShowPerformerSuggestions] = useState(false);
  const [showDirectorSuggestions, setShowDirectorSuggestions] = useState(false);
  
  const performerInputRef = useRef(null);
  const directorInputRef = useRef(null);

  // Функция для генерации аватарки как в ProjectCard
  const generateAvatar = (name, imageUrl = null, size = '3vh') => {
    if (!name || name === 'Не назначен') {
      return (
        <div 
          className="assignee-avatar"
          style={{ 
            backgroundColor: '#e0e0e0',
            width: size,
            height: size,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666',
            fontWeight: 600,
            fontSize: 'calc(' + size + ' * 0.4)'
          }}
        >
          ?
        </div>
      );
    }
    
    // Получаем инициалы
    let initials = '';
    try {
      const words = name.split(' ').filter(word => word && word.length > 0);
      if (words.length >= 2) {
        initials = words[0][0] + words[words.length - 1][0];
      } else if (words.length === 1) {
        initials = words[0][0];
      } else {
        initials = 'И';
      }
    } catch (error) {
      initials = 'И';
    }
    
    // Цвет для фона
    const colors = [
      '#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', 
      '#118AB2', '#EF476F', '#9D4EDD', '#F15BB5',
      '#2A9D8F', '#E76F51', '#264653', '#E9C46A'
    ];
    const hash = name.split('').reduce((acc, char) => acc + (char.charCodeAt(0) || 0), 0);
    const backgroundColor = colors[hash % colors.length];
    
    // Если есть изображение
    if (imageUrl && imageUrl.trim() !== '') {
      let fullImageUrl;
      
      // Формируем полный URL
      if (imageUrl.startsWith('http')) {
        fullImageUrl = imageUrl;
      } else if (imageUrl.startsWith('/')) {
        fullImageUrl = `https://api.acrelis.ru/media/${imageUrl}`;
      } else {
        fullImageUrl = `https://api.acrelis.ru/media/${imageUrl}`;
      }
      
      return (
        <div 
          className="assignee-avatar"
          style={{ 
            backgroundColor: backgroundColor,
            position: 'relative',
            width: size,
            height: size,
            borderRadius: '50%',
            overflow: 'hidden'
          }}
        >
          {/* Изображение */}
          <img 
            src={fullImageUrl} 
            alt={name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              top: 0,
              left: 0
            }}
            onError={(e) => {
              e.target.style.display = 'none';
              // Показываем инициалы
              e.target.nextSibling.style.display = 'flex';
            }}
            crossOrigin="anonymous"
          />
          
          {/* Fallback с инициалами (скрыт по умолчанию) */}
          <div 
            style={{
              display: 'none',
              width: '100%',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 600,
              fontSize: 'calc(' + size + ' * 0.4)',
              position: 'absolute',
              top: 0,
              left: 0,
              backgroundColor: backgroundColor
            }}
          >
            {initials}
          </div>
        </div>
      );
    }
    
    // Если нет изображения, показываем только инициалы
    return (
      <div 
        className="assignee-avatar"
        style={{ 
          backgroundColor: backgroundColor,
          width: size,
          height: size,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 600,
          fontSize: 'calc(' + size + ' * 0.4)'
        }}
      >
        {initials}
      </div>
    );
  };

  // Загрузка задач проекта и названия проекта
  const loadProjectTasks = async () => {
    if (!projectId) {
      navigate('/projects');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      
      // Сначала загружаем данные проекта
      try {
        const projectData = await getProjectById(projectId, useMockData);
        setProjectName(projectData.name || 'Проект');
      } catch (projectError) {
        setProjectName('Проект');
      }
      
      // Фильтр по проекту
      const filters = { 
        project: projectId,
        page: 1
      };
      
      // Запрашиваем задачи для конкретного проекта
      const response = await getTasks(useMockData, filters);
      
      // API возвращает {results: [], count: X}
      const apiTasks = response.results || [];

      
      // Конвертируем задачи API в формат канбана
      const kanbanTasks = apiTasks.map(task => {
        const kanbanStatus = apiToKanbanStatus[task.status] || 'new';
        
        return {
          id: task.id,
          title: task.name || 'Без названия',
          startDate: formatDateForDisplay(task.created) || 'Не указано',
          deadline: formatDateForDisplay(task.deadline) || 'Не указано',
          assignee: task.performer_name || 'Не назначен',
          assigneeId: task.performer,
          assigneeImage: task.performer_image, // Используем performer_image из API
          status: kanbanStatus,
          comment: task.description || '',
          originalTask: task
        };
      });
      
      setTasks(kanbanTasks);
      
    } catch (error) {

      setError('Не удалось загрузить задачи. Проверьте подключение.');
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStaffList = async () => {
    try {
      const staffResult = await getStaffList(useMockData);
      const staffData = staffResult.employees || [];
      setAllStaff(staffData);
    } catch (error) {
    }
  };

  useEffect(() => {
    loadProjectTasks();
  }, [projectId, useMockData]);

  // Обработчик для случая, когда у проекта нет задач
  const handleNoTasksRedirect = () => {
    navigate(`/projects/${projectId}`);
  };

  const openCreateModal = () => {
    setShowCreateModal(true);
    setCreateError('');
    setNewTask({
      name: '', 
      description: '', 
      deadline: '', 
      performer: '', 
      performerName: '', 
      director: '', 
      directorName: '', 
      hours: 0
    });
    
    loadStaffList();
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setCreateError('');
    setShowPerformerSuggestions(false);
    setShowDirectorSuggestions(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
  };

  // Автодополнение исполнителя
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

  // Автодополнение руководителя
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
  }, [showPerformerSuggestions, showDirectorSuggestions]);

  // СОЗДАНИЕ ЗАДАЧИ
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
        project: projectId,
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
        deadline: '', 
        performer: '', 
        performerName: '', 
        director: '', 
        directorName: '', 
        hours: 0
      });
      
      // Обновляем список задач
      await loadProjectTasks();
      
      
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

  const handleAddComment = (taskId, comment) => {
    if (!comment.trim()) return;
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, comment: comment }
        : task
    ));
  };

  if (isLoading) {
    return (
      <div className="kanban-container">
        <div className="gantt-loading_gantt_class">
          <div className="loading-spinner_gantt_class"></div>
          <h3 style={{ color: 'black', margin: '1vh 0', fontSize: '2vh' }}>Загрузка канбана задач...</h3>
          <p style={{ color: 'rgba(0, 0, 0, 0.8)', fontSize: '1.4vh' }}>
            Подготавливаем список задач проекта
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="kanban-container">
        <div className="kanban-header">
          <h1 className="kanban-title">
            <span 
              className="breadcrumb-link" 
              onClick={() => navigate('/projects')}
            >
              Проекты
            </span>
            {' — '}
            <span 
              className="breadcrumb-link" 
              onClick={() => navigate(`/projects/${projectId}`)}
            >
              {projectName || 'Проект'}
            </span>
            {' — Канбан задач'}
          </h1>
        </div>
        
        <div className="no-tasks-message_gantt_class">
          <div className="no-tasks-content_gantt_class">
            <span className="no-tasks-icon_gantt_class">⚠️</span>
            <h4>Ошибка загрузки</h4>
            <p>{error}</p>
            <button 
              onClick={loadProjectTasks}
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

  if (tasks.length === 0) {
    return (
      <div className="kanban-container">
        <div className="kanban-header">
          <h1 className="kanban-title">
            <span 
              className="breadcrumb-link" 
              onClick={() => navigate('/projects')}
            >
              Проекты
            </span>
            {' — '}
            <span 
              className="breadcrumb-link" 
              onClick={() => navigate(`/projects/${projectId}`)}
            >
              {projectName || 'Проект'}
            </span>
            {' — Канбан задач'}
          </h1>
        </div>

        <div className="create-task-section">
          <button className="create-task-btn" onClick={openCreateModal}>
            Создать задачу
          </button>
        </div>

        <div className="no-tasks-message_gantt_class">
          <div className="no-tasks-content_gantt_class">
            <span className="no-tasks-icon_gantt_class">📋</span>
            <h4>В проекте пока нет задач</h4>
            <p>Создайте первую задачу для проекта</p>
            <button 
              onClick={openCreateModal}
              className="gantt-back-btn_gantt_class"
              style={{ marginTop: '2vh' }}
            >
              Создать задачу
            </button>
            <button 
              onClick={handleNoTasksRedirect}
              className="gantt-back-btn_gantt_class"
              style={{ 
                marginTop: '1vh',
                backgroundColor: 'transparent',
                color: '#666',
                border: '1px solid #ddd'
              }}
            >
              Вернуться к проекту
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="kanban-container">
      {/* Хлебные крошки */}
      <div className="kanban-header">
        <h1 className="kanban-title">
          <span 
            className="breadcrumb-link" 
            onClick={() => navigate('/projects')}
          >
            Проекты
          </span>
          {' — '}
          <span 
            className="breadcrumb-link" 
            onClick={() => navigate(`/projects/${projectId}`)}
          >
            {projectName || 'Проект'}
          </span>
          {' — Канбан задач'}
        </h1>
      </div>

      {/* Кнопка создания задачи */}
      <div className="create-task-section">
        <button className="create-task-btn" onClick={openCreateModal}>
          Создать задачу
        </button>
      </div>

      {/* Канбан доска */}
      <div className="kanban-board">
        {columns.map(column => (
          <div 
            key={column.id} 
            className="kanban-column"
          >
            <div className="column-header">
              <h3>{column.title}</h3>
            </div>
            
            <div className="tasks-list">
              {tasks
                .filter(task => task.status === column.id)
                .map(task => (
                  <div 
                    key={task.id} 
                    className={`task-card task-card-${task.status}`}
                    onClick={() => navigate(`/tasks/${task.id}`)}
                  >
                    {/* 1. Название задачи по центру */}
                    <div className="task-title">{task.title}</div>
                    
                    {/* 2. Начало: и дата начала В ОДНОЙ СТРОКЕ */}
                    <div className="task-dates">
                      <div className="date-row">
                        <span className="date-label">Начало:</span>
                        <span className="date-value">{task.startDate}</span>
                      </div>
                      
                      {/* 3. Дедлайн: и дедлайн В ОДНОЙ СТРОКЕ */}
                      <div className="date-row">
                        <span className="date-label">Дедлайн:</span>
                        <span className="date-value">{task.deadline}</span>
                      </div>
                    </div>
                    
                    {/* 4. Исполнитель в виде кружка как в ProjectCard */}
                    <div className="task-assignee">
                      {generateAvatar(task.assignee, task.assigneeImage, '3vh')}
                    </div>
                    
                    {/* 5. Комментарий - прямоугольник белый с закругленными краями */}
                    {task.comment ? (
                      <div className="task-comment">
                        {task.comment}
                      </div>
                    ) : (
                      <button 
                        className="add-comment-btn"
                        onClick={(e) => {
                          e.stopPropagation(); // предотвращаем переход по клику
                          const comment = prompt('Введите комментарий:');
                          if (comment) handleAddComment(task.id, comment);
                        }}
                      >
                        + Добавить комментарий
                      </button>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Модальное окно создания задачи */}
      {showCreateModal && (
        <div className="modal-overlay123">
          <div className="modal-content123">
            <div className="modal-header123">
              <h2>Создать задачу в проекте</h2>
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

              <div className="form-group123">
                <div className="project-info-note">
                  <strong>*</strong>Задача будет автоматически привязана к текущему проекту
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

export default KanbanTasks;