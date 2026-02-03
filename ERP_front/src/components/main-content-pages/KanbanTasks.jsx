import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  getTasks, 
  getProjectById,
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
  const [projectName, setProjectName] = useState('Проект');

  const columns = [
    { id: 'new', title: 'Новое' },
    { id: 'in_progress', title: 'В работе' },
    { id: 'waiting', title: 'Ожидает' },
    { id: 'done', title: 'Готов' }
  ];

  const apiToKanbanStatus = {
    'draft': 'new',
    'new': 'new',
    'active': 'in_progress',
    'paused': 'waiting',
    'completed': 'done',
    'failed': 'waiting'
  };

  // Функция для форматирования даты в dd.mm.yyyy
  const formatDeadlineToDisplay = (dateString) => {
    if (!dateString) return 'Не указан';
    
    // Если уже в формате dd.mm.yyyy
    if (dateString.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
      return dateString;
    }
    
    // Если в формате YYYY-MM-DD или YYYY-MM-DDTHH:mm:ss
    if (dateString.includes('-')) {
      try {
        // Получаем только дату (без времени)
        const datePart = dateString.split('T')[0];
        const [year, month, day] = datePart.split('-');
        return `${day}.${month}.${year}`;
      } catch (e) {
        return 'Неверная дата';
      }
    }
    
    // Если это строка с другим форматом
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Неверная дата';
      }
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    } catch (e) {
      return 'Неверная дата';
    }
  };

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
  
  const [allStaff, setAllStaff] = useState([]);
  const [performerSuggestions, setPerformerSuggestions] = useState([]);
  const [directorSuggestions, setDirectorSuggestions] = useState([]);
  const [showPerformerSuggestions, setShowPerformerSuggestions] = useState(false);
  const [showDirectorSuggestions, setShowDirectorSuggestions] = useState(false);
  
  const performerInputRef = useRef(null);
  const directorInputRef = useRef(null);

  const generateAvatar = (name, imageUrl = null, size = '3vh') => {
    if (!name || name === 'Не назначен') {
      return (
        <div 
          className="assignee-avatar_kanban_task"
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
    
    const colors = [
      '#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', 
      '#118AB2', '#EF476F', '#9D4EDD', '#F15BB5',
      '#2A9D8F', '#E76F51', '#264653', '#E9C46A'
    ];
    const hash = name.split('').reduce((acc, char) => acc + (char.charCodeAt(0) || 0), 0);
    const backgroundColor = colors[hash % colors.length];
    
    if (imageUrl && imageUrl.trim() !== '') {
      let fullImageUrl;
      
      if (imageUrl.startsWith('http')) {
        fullImageUrl = imageUrl;
      } else if (imageUrl.startsWith('/')) {
        fullImageUrl = `https://api.acrelis.ru/media/${imageUrl}`;
      } else {
        fullImageUrl = `https://api.acrelis.ru/media/${imageUrl}`;
      }
      
      return (
        <div 
          className="assignee-avatar_kanban_task"
          style={{ 
            backgroundColor: backgroundColor,
            position: 'relative',
            width: size,
            height: size,
            borderRadius: '50%',
            overflow: 'hidden'
          }}
        >
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
              e.target.nextSibling.style.display = 'flex';
            }}
            crossOrigin="anonymous"
          />
          
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
    
    return (
      <div 
        className="assignee-avatar_kanban_task"
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
      
      const apiTasks = response.results || [];

      const kanbanTasks = apiTasks.map(task => {
        const kanbanStatus = apiToKanbanStatus[task.status] || 'new';
        
        return {
          id: task.id,
          title: task.name || 'Без названия',
          startDate: formatDateForDisplay(task.created) || 'Не указано',
          deadline: formatDeadlineToDisplay(task.deadline) || 'Не указано',
          assignee: task.performer_name || 'Не назначен',
          assigneeId: task.performer,
          assigneeImage: task.performer_image,
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
      console.error('Ошибка загрузки списка сотрудников:', error);
    }
  };

  useEffect(() => {
    loadProjectTasks();
  }, [projectId, useMockData]);

  const handleNoTasksRedirect = () => {
    navigate(`/projects/${projectId}`);
  };

  const openCreateModal = async () => {
    try {
      await loadStaffList(); // Загружаем список сотрудников перед открытием модалки
    } catch (error) {
      console.error('Не удалось загрузить список сотрудников:', error);
    }
    
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
    
    // Устанавливаем дефолтную дату дедлайна (текущая дата + 7 дней)
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const formattedDate = nextWeek.toISOString().split('T')[0];
    setNewTask(prev => ({ ...prev, deadline: formattedDate }));
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

  const handlePerformerInputChange = (e) => {
    const value = e.target.value;
    setNewTask(prev => ({ ...prev, performerName: value, performer: '' }));
    
    if (value.length > 1) {
      const searchTerm = value.toLowerCase().trim();
      const filtered = allStaff.filter(staff => 
        staff.name && staff.name.toLowerCase().includes(searchTerm)
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

  const handleDirectorInputChange = (e) => {
    const value = e.target.value;
    setNewTask(prev => ({ ...prev, directorName: value, director: '' }));
    
    if (value.length > 1) {
      const searchTerm = value.toLowerCase().trim();
      const filtered = allStaff.filter(staff => 
        staff.name && staff.name.toLowerCase().includes(searchTerm)
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

  const handleCreateTask = async () => {
    if (!newTask.name.trim()) {
      setCreateError('Название задачи обязательно');
      return;
    }

    if (!newTask.deadline) {
      setCreateError('Дата дедлайна обязательна');
      return;
    }

    // Валидация дедлайна (не раньше сегодняшнего дня)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(newTask.deadline);
    if (deadlineDate < today) {
      setCreateError('Дедлайн не может быть раньше сегодняшнего дня');
      return;
    }

    if (newTask.performerName && !newTask.performer) {
      const foundPerformer = allStaff.find(staff => 
        staff.name && (
          staff.name.toLowerCase() === newTask.performerName.toLowerCase() ||
          staff.name.toLowerCase().includes(newTask.performerName.toLowerCase())
        )
      );
      
      if (foundPerformer) {
        setNewTask(prev => ({ ...prev, performer: foundPerformer.id }));
      } else {
        setCreateError(`Исполнитель "${newTask.performerName}" не найден`);
        return;
      }
    }

    if (newTask.directorName && !newTask.director) {
      const foundDirector = allStaff.find(staff => 
        staff.name && (
          staff.name.toLowerCase() === newTask.directorName.toLowerCase() ||
          staff.name.toLowerCase().includes(newTask.directorName.toLowerCase())
        )
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
            // Если не удалось распарсить JSON, используем общее сообщение
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
      <div className="kanban-container_kanban_task">
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

  return (
    <div className="kanban-container_kanban_task">
      <div className="kanban-header_kanban_task">
        <h1 className="kanban-title_kanban_task">
          <span 
            className="breadcrumb-link_kanban_task" 
            onClick={() => navigate('/projects')}
          >
            Проекты
          </span>
          {' — '}
          <span 
            className="breadcrumb-link_kanban_task" 
            onClick={() => navigate(`/projects/${projectId}`)}
          >
            {projectName || 'Проект'}
          </span>
          {' — Канбан задач'}
        </h1>
      </div>

      <div className="create-task-section_kanban_task">
        <button 
          className="create-task-btn_kanban_task" 
          onClick={openCreateModal}
        >
          Создать задачу
        </button>
      </div>

      {error ? (
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
      ) : tasks.length === 0 ? (
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
      ) : (
        <div className="kanban-board_kanban_task">
          {columns.map(column => (
            <div 
              key={column.id} 
              className="kanban-column_kanban_task"
            >
              <div className="column-header_kanban_task">
                <h3>{column.title}</h3>
              </div>
              
              <div className="tasks-list_kanban_task">
                {tasks
                  .filter(task => task.status === column.id)
                  .map(task => (
                    <div 
                      key={task.id} 
                      className={`task-card_kanban_task task-card-${task.status}_kanban_task`}
                      onClick={() => navigate(`/kanban/${projectId}/${task.id}`)}
                    >
                      <div className="task-title_kanban_task">{task.title}</div>
                      
                      <div className="task-dates_kanban_task">
                        <div className="date-row_kanban_task">
                          <span className="date-label_kanban_task">Начало: </span>
                          <span className="date-value_kanban_task">{task.startDate}</span>
                        </div>
                        
                        <div className="date-row_kanban_task">
                          <span className="date-label_kanban_task">Дедлайн: </span>
                          <span className="date-value_kanban_task">{task.deadline}</span>
                        </div>
                      </div>
                      
                      <div className="task-assignee_kanban_task">
                        {generateAvatar(task.assignee, task.assigneeImage, '3vh')}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно создания задачи */}
      {showCreateModal && (
        <div className="modal-overlay_kanban_task">
          <div className="modal-content_kanban_task">
            <div className="modal-header_kanban_task">
              <h2>Создать задачу в проекте</h2>
              <button 
                className="modal-close_kanban_task"
                onClick={closeCreateModal}
                disabled={creating}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body_kanban_task">
              {createError && (
                <div className="error-message_kanban_task">{createError}</div>
              )}
              
              <div className="form-group_kanban_task">
                <label>Название задачи *</label>
                <input
                  type="text"
                  name="name"
                  value={newTask.name}
                  onChange={handleInputChange}
                  placeholder="Введите название задачи"
                  disabled={creating}
                  maxLength={100}
                  autoFocus
                />
              </div>
              
              <div className="form-group_kanban_task">
                <label>Описание *</label>
                <textarea
                  name="description"
                  value={newTask.description}
                  onChange={handleInputChange}
                  className="form-textarea_kanban_task"
                  placeholder="Введите описание задачи"
                  disabled={creating}
                  rows="3"
                />
              </div>
              
              <div className="form-group_kanban_task">
                <label>Дедлайн *</label>
                <input
                  type="date"
                  name="deadline"
                  value={newTask.deadline}
                  onChange={handleInputChange}
                  disabled={creating}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="form-row_kanban_task">
                <div className="form-group_kanban_task" ref={performerInputRef} style={{ position: 'relative' }}>
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
                    <div className="suggestions-dropdown_kanban_task">
                      {performerSuggestions.map((staff, index) => (
                        <div 
                          key={staff.id || index}
                          className="suggestion-item_kanban_task"
                          onClick={() => handlePerformerSuggestionClick(staff)}
                        >
                          <div className="suggestion-name_kanban_task">{staff.name}</div>
                          {staff.position && (
                            <div className="suggestion-details_kanban_task">{staff.position}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="form-group_kanban_task" ref={directorInputRef} style={{ position: 'relative' }}>
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
                    <div className="suggestions-dropdown_kanban_task">
                      {directorSuggestions.map((staff, index) => (
                        <div 
                          key={staff.id || index}
                          className="suggestion-item_kanban_task"
                          onClick={() => handleDirectorSuggestionClick(staff)}
                        >
                          <div className="suggestion-name_kanban_task">{staff.name}</div>
                          {staff.position && (
                            <div className="suggestion-details_kanban_task">{staff.position}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="form-row_kanban_task">
                <div className="form-group_kanban_task">
                  <label>Часы</label>
                  <input
                    type="number"
                    name="hours"
                    value={newTask.hours}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    max="1000"
                    disabled={creating}
                  />
                </div>
              </div>

              <div className="form-group_kanban_task">
                <div className="project-info-note_kanban_task">
                  <strong>*</strong> Задача будет автоматически привязана к текущему проекту
                </div>
              </div>
            </div>
            
            <div className="modal-footer_kanban_task">
              <button 
                className="btn-cancel_kanban_task"
                onClick={closeCreateModal}
                disabled={creating}
              >
                Отмена
              </button>
              <button 
                className="btn-create_kanban_task"
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