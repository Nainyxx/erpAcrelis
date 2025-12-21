import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './KanbanTasks.css';

const KanbanTasks = ({ project }) => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Разработка API', startDate: '15.12.2023', deadline: '20.12.2023', assignee: 'Иван Петров', status: 'new', comment: 'Нужно добавить авторизацию' },
    { id: 2, title: 'Дизайн макетов', startDate: '10.12.2023', deadline: '18.12.2023', assignee: 'Елена Кузнецова', status: 'in_progress', comment: 'Согласовано с заказчиком' },
    { id: 3, title: 'Тестирование модулей', startDate: '18.12.2023', deadline: '22.12.2023', assignee: 'Алексей Иванов', status: 'waiting', comment: '' },
    { id: 4, title: 'Документация', startDate: '05.12.2023', deadline: '12.12.2023', assignee: 'Мария Сидорова', status: 'done', comment: 'Готово к публикации' },
    { id: 5, title: 'Настройка сервера', startDate: '12.12.2023', deadline: '15.12.2023', assignee: 'Дмитрий Смирнов', status: 'new', comment: '' },
    { id: 6, title: 'Интеграция с CRM', startDate: '20.12.2023', deadline: '25.12.2023', assignee: 'Иван Петров', status: 'in_progress', comment: 'API ключ получен' },
  ]);

  const columns = [
    { id: 'new', title: 'Новое' },
    { id: 'in_progress', title: 'В работе' },
    { id: 'waiting', title: 'Ожидает' },
    { id: 'done', title: 'Готов' }
  ];

  const handleCreateTask = () => {
    const newTask = {
      id: tasks.length + 1,
      title: 'Новая задача',
      startDate: new Date().toLocaleDateString('ru-RU'),
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU'),
      assignee: 'Не назначен',
      status: 'new',
      comment: ''
    };
    setTasks([...tasks, newTask]);
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId.toString());
    
    // Добавляем класс для визуальной обратной связи
    e.target.classList.add('task-card-dragging');
  };

  const handleDragEnd = (e) => {
    // Убираем класс после завершения перетаскивания
    e.target.classList.remove('task-card-dragging');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData('taskId'));
    
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  const handleAddComment = (taskId, comment) => {
    if (!comment.trim()) return;
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, comment: comment }
        : task
    ));
  };

  // Функция для получения инициалов
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('');
  };

  // Функция для генерации цвета как в ProjectList
  const getAvatarColor = (name) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2', '#EF476F'];
    const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[colorIndex];
  };

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
            Карточка проекта
          </span>
          {' — Канбан задач'}
        </h1>
      </div>

      {/* Кнопка создания задачи */}
      <div className="create-task-section">
        <button className="create-task-btn" onClick={handleCreateTask}>
          Создать задачу
        </button>
      </div>

      {/* Канбан доска */}
      <div className="kanban-board">
        {columns.map(column => (
          <div 
            key={column.id} 
            className="kanban-column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
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
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
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
                    
                    {/* 4. Исполнитель в виде кружка как в ProjectList */}
                    <div className="task-assignee">
                      <div 
                        className="assignee-avatar"
                        style={{ backgroundColor: getAvatarColor(task.assignee) }}
                      >
                        {getInitials(task.assignee)}
                      </div>
                    </div>
                    
                    {/* 5. Комментарий - прямоугольник белый с закругленными краями */}
                    {task.comment ? (
                      <div className="task-comment">
                        {task.comment}
                      </div>
                    ) : (
                      <button 
                        className="add-comment-btn"
                        onClick={() => {
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
    </div>
  );
};

export default KanbanTasks;