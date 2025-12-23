import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTasksByPerformer, getCurrentUser, formatDateForDisplay, createTask } from '../../services/api/api';
import './MyTasks.css';

const MyTasks = ({ useMockData = true }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPerformer, setSelectedPerformer] = useState('all');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Состояния для модального окна
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  
  // Данные формы
  const [newTask, setNewTask] = useState({
    name: '',
    description: '',
    status: 'new',
    project: '',
    deadline: '',
    performer: '',
    director: '',
    hours: 0
  });
  
  const currentUser = getCurrentUser();

  useEffect(() => {
    loadTasks();
  }, [currentUser.id, useMockData]);

  const loadTasks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const apiTasks = await getTasksByPerformer(currentUser.id, useMockData);
      
      const formattedTasks = apiTasks.map(task => {
        // Маппинг статусов как в TaskCard
        let status_display = task.status_display;
        if (!status_display && task.status) {
          const statusMap = {
            'draft': 'Черновик',
            'new': 'Новая',
            'active': 'В работе',
            'paused': 'Приостановлена',
            'completed': 'Завершена'
          };
          status_display = statusMap[task.status] || task.status;
        }
        
        return {
          id: task.id,
          taskName: task.name,
          status: task.status || 'new', // API статус для фильтрации
          status_display: status_display || 'Новая', // Для отображения и фильтрации
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

  // Получаем уникальных исполнителей из задач
  const performers = useMemo(() => {
    const performerSet = new Set();
    tasks.forEach(task => {
      if (task.performerName) {
        performerSet.add(task.performerName);
      }
    });
    
    const performerList = Array.from(performerSet).sort();
    
    return [
      { id: 'all', label: 'Все исполнители' },
      ...performerList.map(name => ({ id: name, label: name }))
    ];
  }, [tasks]);

  // Получаем все уникальные статусы из задач (используем status_display)
  const statuses = useMemo(() => {
    const statusSet = new Set();
    
    // Добавляем "Все статусы" первым
    const statusList = [{ id: 'all', label: 'Все статусы' }];
    
    // Добавляем все статусы из задач (status_display)
    tasks.forEach(task => {
      if (task.status_display) {
        statusSet.add(task.status_display);
      }
    });
    
    // Преобразуем в массив и добавляем в список
    Array.from(statusSet).sort().forEach(statusName => {
      statusList.push({ id: statusName, label: statusName });
    });
    
    return statusList;
  }, [tasks]);

  const statusOptions = [
    { value: 'draft', label: 'Черновик' },
    { value: 'new', label: 'Новая' },
    { value: 'active', label: 'В работе' },
    { value: 'paused', label: 'Приостановлена' },
    { value: 'completed', label: 'Завершена' }
  ];

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.taskName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (task.projectName && task.projectName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Фильтр по статусу (используем status_display - русские названия)
    const matchesStatus = selectedStatus === 'all' || task.status_display === selectedStatus;
    
    const matchesPerformer = selectedPerformer === 'all' || task.performerName === selectedPerformer;
    
    return matchesSearch && matchesStatus && matchesPerformer;
  });

  const getProjectManager = (task) => {
    return task.directorName || 'Не назначен';
  };

  const handleTaskClick = (task) => {
    navigate(`/tasks/${task.id}`);
  };

  const handleRefresh = () => {
    loadTasks();
  };

  // Функции для работы с модальным окном
  const openCreateModal = () => {
    setShowCreateModal(true);
    setCreateError('');
    setNewTask({
      name: '',
      description: '',
      status: 'new',
      project: '',
      deadline: '',
      performer: '',
      director: '',
      hours: 0
    });
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setCreateError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({
      ...prev,
      [name]: value
    }));
  };

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

    setCreating(true);
    setCreateError('');

    try {
      const taskData = {
        name: newTask.name,
        description: newTask.description || newTask.name,
        status: newTask.status,
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
        status: 'new',
        project: '',
        deadline: '',
        performer: '',
        director: '',
        hours: 0
      });
      
      await loadTasks();
      
      alert('Задача успешно создана!');
      
    } catch (error) {
      console.error('❌ Ошибка создания задачи:', error);
      setCreateError(error.message || 'Не удалось создать задачу');
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

        {filteredTasks.length === 0 ? (
          <div className="no-tasks">
            {searchQuery || selectedStatus !== 'all' || selectedPerformer !== 'all'
              ? 'Задачи не найдены по заданным фильтрам' 
              : 'У вас нет назначенных задач'}
          </div>
        ) : (
          filteredTasks.map((task) => (
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
              
              <div className="form-group123">
                <label>Статус</label>
                <select
                  name="status"
                  value={newTask.status}
                  onChange={handleInputChange}
                  disabled={creating}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
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
                
                <div className="form-group123">
                  <label>ID проекта (опционально)</label>
                  <input
                    type="number"
                    name="project"
                    value={newTask.project}
                    onChange={handleInputChange}
                    placeholder="Введите ID проекта"
                    min="0"
                    disabled={creating}
                  />
                </div>
              </div>
              
              <div className="form-row123">
                <div className="form-group123">
                  <label>ID исполнителя (опционально)</label>
                  <input
                    type="number"
                    name="performer"
                    value={newTask.performer}
                    onChange={handleInputChange}
                    placeholder="Введите ID исполнителя"
                    min="0"
                    disabled={creating}
                  />
                </div>
                
                <div className="form-group123">
                  <label>ID руководителя (опционально)</label>
                  <input
                    type="number"
                    name="director"
                    value={newTask.director}
                    onChange={handleInputChange}
                    placeholder="Введите ID руководителя"
                    min="0"
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