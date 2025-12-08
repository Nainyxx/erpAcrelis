import React, { useState } from 'react';
import './GanttChart.css';

const GanttChart = ({ project }) => {
  const [viewMode, setViewMode] = useState('month'); // day, week, month, year
  
  // Данные для диаграммы (можно получать из project.ganttTasks)
  const ganttTasks = project.ganttTasks || [
    {
      id: 'task-1',
      name: 'Анализ требований',
      start: '2025-10-25',
      end: '2025-10-28',
      progress: 100,
      status: 'completed',
      assignee: 'Иван И.'
    },
    {
      id: 'task-2',
      name: 'Проектирование архитектуры',
      start: '2025-10-27',
      end: '2025-11-02',
      progress: 80,
      status: 'in-progress',
      assignee: 'Мария П.'
    },
    {
      id: 'task-3',
      name: 'Разработка фронтенда',
      start: '2025-10-30',
      end: '2025-11-07',
      progress: 60,
      status: 'in-progress',
      assignee: 'Алексей К.'
    },
    {
      id: 'task-4',
      name: 'Разработка бэкенда',
      start: '2025-11-01',
      end: '2025-11-05',
      progress: 40,
      status: 'in-progress',
      assignee: 'Екатерина С.'
    },
    {
      id: 'task-5',
      name: 'Тестирование',
      start: '2025-11-04',
      end: '2025-11-07',
      progress: 20,
      status: 'planned',
      assignee: 'Дмитрий И.'
    }
  ];

  // Генерация заголовка с датами
  const generateDateHeaders = () => {
    const headers = [];
    const months = ['Окт', 'Нояб', 'Дек', 'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен'];
    
    // Для примера: октябрь-ноябрь 2025
    if (viewMode === 'month') {
      return (
        <>
          <div className="month-header">
            <div className="month-name">Окт 2025</div>
            <div className="days-row">
              {Array.from({ length: 31 }, (_, i) => i + 1)
                .filter(day => day >= 25) // Показываем с 25 октября
                .map(day => (
                  <div key={`oct-${day}`} className="day-cell">{day}</div>
                ))}
            </div>
          </div>
          <div className="month-header">
            <div className="month-name">Нояб 2025</div>
            <div className="days-row">
              {Array.from({ length: 7 }, (_, i) => i + 1).map(day => (
                <div key={`nov-${day}`} className="day-cell">{day}</div>
              ))}
            </div>
          </div>
        </>
      );
    }
    
    return headers;
  };

  // Рендер задачи
  const renderTask = (task) => {
    // Для простоты - статическое позиционирование
    const taskPositions = {
      'task-1': { left: 0, width: 120 },
      'task-2': { left: 80, width: 200 },
      'task-3': { left: 160, width: 240 },
      'task-4': { left: 200, width: 160 },
      'task-5': { left: 280, width: 120 }
    };
    
    const position = taskPositions[task.id] || { left: 0, width: 100 };
    
    return (
      <div className="gantt-task" key={task.id}>
        <div className="task-info">
          <div className="task-assignee">{task.assignee}</div>
          <div className="task-name">{task.name}</div>
        </div>
        
        <div className="task-timeline">
          <div 
            className={`task-bar ${task.status}`}
            style={{
              left: `${position.left}px`,
              width: `${position.width}px`
            }}
          >
            <div 
              className="task-progress"
              style={{ width: `${task.progress}%` }}
            ></div>
            <div className="task-bar-label">{task.name}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="gantt-chart-container">
      {/* Панель управления */}
      <div className="gantt-controls">
        <div className="view-controls">
          <button 
            className={viewMode === 'day' ? 'active' : ''}
            onClick={() => setViewMode('day')}
          >
            День
          </button>
          <button 
            className={viewMode === 'week' ? 'active' : ''}
            onClick={() => setViewMode('week')}
          >
            Неделя
          </button>
          <button 
            className={viewMode === 'month' ? 'active' : ''}
            onClick={() => setViewMode('month')}
          >
            Месяц
          </button>
          <button 
            className={viewMode === 'year' ? 'active' : ''}
            onClick={() => setViewMode('year')}
          >
            Год
          </button>
        </div>
        
        <div className="chart-actions">
          <button className="action-btn">
            <span>📥</span> Экспорт
          </button>
          <button className="action-btn">
            <span>➕</span> Добавить задачу
          </button>
        </div>
      </div>
      
      {/* Заголовок с датами */}
      <div className="gantt-header">
        <div className="tasks-column">
          <div className="column-header">Задачи</div>
        </div>
        <div className="timeline-column">
          {generateDateHeaders()}
        </div>
      </div>
      
      {/* Тело диаграммы */}
      <div className="gantt-body">
        <div className="tasks-list">
          {ganttTasks.map(task => (
            <div className="task-row" key={task.id}>
              <div className="task-cell">
                <div className="assignee-avatar">
                  <div className="avatar-small">
                    {task.assignee.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
                <div className="task-cell-content">
                  <div className="task-title">{task.name}</div>
                  <div className="task-assignee-name">{task.assignee}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="timeline-view">
          <div className="timeline-grid">
            {/* Сетка дней */}
            <div className="timeline-days">
              {Array.from({ length: 14 }, (_, i) => (
                <div key={`day-${i}`} className="day-cell"></div>
              ))}
            </div>
            
            {/* Задачи */}
            {ganttTasks.map(task => {
              const positions = {
                'task-1': { left: '0%', width: '20%' },
                'task-2': { left: '15%', width: '30%' },
                'task-3': { left: '35%', width: '40%' },
                'task-4': { left: '45%', width: '25%' },
                'task-5': { left: '60%', width: '25%' }
              };
              
              const pos = positions[task.id] || { left: '0%', width: '100%' };
              
              return (
                <div 
                  key={`bar-${task.id}`}
                  className={`timeline-task ${task.status}`}
                  style={{
                    left: pos.left,
                    width: pos.width
                  }}
                >
                  <div 
                    className="task-progress-bar"
                    style={{ width: `${task.progress}%` }}
                  ></div>
                  <div className="task-label">{task.name}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Легенда */}
      <div className="gantt-legend">
        <div className="legend-item">
          <div className="legend-color completed"></div>
          <span>Завершено</span>
        </div>
        <div className="legend-item">
          <div className="legend-color in-progress"></div>
          <span>В работе</span>
        </div>
        <div className="legend-item">
          <div className="legend-color planned"></div>
          <span>Запланировано</span>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;