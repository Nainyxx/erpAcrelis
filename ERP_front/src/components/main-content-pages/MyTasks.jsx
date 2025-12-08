import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Добавляем useNavigate
import { getMyTasks, getCurrentUser } from '../../services/projectsService';
import './MyTasks.css';

const MyTasks = ({ useMockData = true }) => {
  const navigate = useNavigate(); // Используем useNavigate вместо window.location
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const currentUser = getCurrentUser();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const userTasks = await getMyTasks(currentUser.id, useMockData);
        setTasks(userTasks);
      } catch (error) {
        console.error('Ошибка загрузки задач:', error);
        setError('Не удалось загрузить ваши задачи');
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser.id, useMockData]);


  const getProjectManager = (projectId) => {
    const project = tasks.find(t => t.projectId === projectId)?.projectData;
    if (project?.team) {
      const manager = project.team.find(member => member.role === 'Team Lead' || member.role === 'Project Manager');
      return manager?.name || 'Не назначен';
    }
    return 'Не назначен';
  };

  const statuses = [
    { id: 'all', label: 'Все статусы' },
    { id: 'completed', label: 'Завершено' },
    { id: 'in-progress', label: 'В работе' },
    { id: 'planned', label: 'Запланировано' }
  ];

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.taskName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.projectName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusText = (status) => {
    switch(status) {
      case 'completed': return 'Завершено';
      case 'in-progress': return 'В работе';
      case 'planned': return 'Запланировано';
      default: return status;
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'completed': return 'ready';
      case 'in-progress': return 'in-progress';
      case 'planned': return 'planning';
      default: return '';
    }
  };

  const handleTaskClick = (task) => {
    // Используем navigate вместо window.location
    navigate(`/projects/${task.projectId}`);
  };

  const handleRefresh = () => {
    window.location.reload();
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
        
        <button className="create-task-btn">
          Создать задачу
        </button>
      </div>

      <div className="tasks-table">
        {filteredTasks.length === 0 ? (
          <div className="no-tasks">
            {searchQuery || selectedStatus !== 'all' 
              ? 'Задачи не найдены по заданным фильтрам' 
              : 'У вас нет назначенных задач'}
          </div>
        ) : (
          <>
            <div className="table-header">
              <div className="table-cell">Название задачи</div>
              <div className="table-cell">Дедлайн</div>
              <div className="table-cell">Проект</div>
              <div className="table-cell">Руководитель</div>
            </div>

            {filteredTasks.map((task) => (
              <div 
                key={`${task.projectId}-${task.id}`}
                className="task-row"
                onClick={() => handleTaskClick(task)}
                style={{ cursor: 'pointer' }}
              >
                <div className="table-cell task-name">
                  <div className="task-name-text">{task.taskName}</div>
                </div>

                <div className="table-cell">
                  <div className={`deadline ${task.status === 'completed' ? 'completed' : ''}`}>
                    {task.deadline}
                  </div>
                </div>

                <div className="table-cell">
                  <div className="project-info">
                    <div className="project-name">{task.projectName}</div>
                  </div>
                </div>

                <div className="table-cell">
                  <div className="manager-info">
                    <div className="manager-name">{getProjectManager(task.projectId)}</div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default MyTasks;