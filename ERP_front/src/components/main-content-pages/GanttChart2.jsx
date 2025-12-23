import React, { useState, useRef, useEffect } from 'react';
import './GanttChart2.css';

const GanttChart2 = ({ project }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [zoom, setZoom] = useState(1);
  const [selectedTask, setSelectedTask] = useState(null);
  const timelineRef = useRef(null);
  const [scrollLeft, setScrollLeft] = useState(0);

  if (!project) return <div className="gantt-error2">Проект не найден</div>;

  // Участники проекта
  const teamMembers = project.team || [
    { id: 1, name: 'Иван Иванов', role: 'Frontend', color: '#4CAF50' },
    { id: 2, name: 'Мария Петрова', role: 'Backend', color: '#2196F3' },
    { id: 3, name: 'Алексей Сидоров', role: 'Тестировщик', color: '#FF9800' },
    { id: 4, name: 'Елена Кузнецова', role: 'Дизайнер', color: '#9C27B0' },
    { id: 5, name: 'Дмитрий Попов', role: 'Аналитик', color: '#F44336' },
  ];

  // Задачи проекта
  const tasks = [
    { 
      id: 1, 
      title: 'Анализ требований', 
      memberId: 5, 
      startDay: 1, 
      endDay: 3, 
      progress: 100,
      color: '#4CAF50'
    },
    { 
      id: 2, 
      title: 'Проектирование', 
      memberId: 2, 
      startDay: 2, 
      endDay: 5, 
      progress: 80,
      color: '#2196F3'
    },
    { 
      id: 3, 
      title: 'Разработка UI', 
      memberId: 1, 
      startDay: 4, 
      endDay: 8, 
      progress: 60,
      color: '#FF9800'
    },
    { 
      id: 4, 
      title: 'Разработка API', 
      memberId: 2, 
      startDay: 6, 
      endDay: 10, 
      progress: 40,
      color: '#9C27B0'
    },
    { 
      id: 5, 
      title: 'Тестирование', 
      memberId: 3, 
      startDay: 9, 
      endDay: 12, 
      progress: 20,
      color: '#F44336'
    },
    { 
      id: 6, 
      title: 'Документация', 
      memberId: 5, 
      startDay: 11, 
      endDay: 14, 
      progress: 10,
      color: '#607D8B'
    },
  ];

  // Генерируем дни для заголовка (30 дней)
  const days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      day: date.getDate(),
      month: date.toLocaleString('ru-RU', { month: 'short' }),
      year: date.getFullYear(),
      weekday: date.toLocaleString('ru-RU', { weekday: 'short' }),
      fullDate: date
    };
  });

  // Группируем дни по месяцам для заголовков
  const monthGroups = [];
  let currentMonth = null;
  let monthStart = 0;
  
  days.forEach((day, index) => {
    if (currentMonth !== day.month) {
      if (currentMonth !== null) {
        monthGroups.push({
          month: currentMonth,
          year: days[index-1].year,
          start: monthStart,
          end: index - 1,
          daysCount: index - monthStart
        });
      }
      currentMonth = day.month;
      monthStart = index;
    }
  });
  
  // Добавляем последний месяц
  if (currentMonth !== null) {
    monthGroups.push({
      month: currentMonth,
      year: days[days.length-1].year,
      start: monthStart,
      end: days.length - 1,
      daysCount: days.length - monthStart
    });
  }

  // Найти задачу для конкретного участника и дня
  const getTaskForMemberAndDay = (memberId, dayIndex) => {
    return tasks.find(task => 
      task.memberId === memberId && 
      dayIndex >= task.startDay && 
      dayIndex <= task.endDay
    );
  };

  // Получить ширину задачи в днях
  const getTaskWidth = (task) => {
    return (task.endDay - task.startDay + 1) * 40 * zoom;
  };

  // Получить позицию задачи
  const getTaskPosition = (task) => {
    return task.startDay * 40 * zoom;
  };

  // Обработчик клика по задаче
  const handleTaskClick = (task, e) => {
    e.stopPropagation();
    setSelectedTask(task);
  };

  // Обработчик скролла
  const handleScroll = (e) => {
    setScrollLeft(e.target.scrollLeft);
  };

  // Обработчик изменения зума
  const handleZoomChange = (newZoom) => {
    setZoom(newZoom);
  };

  // Перемотка к сегодняшнему дню
  const scrollToToday = () => {
    const todayIndex = days.findIndex(day => 
      day.fullDate.toDateString() === new Date().toDateString()
    );
    
    if (todayIndex !== -1 && timelineRef.current) {
      const scrollPosition = todayIndex * 40 * zoom - 200;
      timelineRef.current.scrollLeft = Math.max(0, scrollPosition);
    }
  };

  // Инициализация скролла
  useEffect(() => {
    scrollToToday();
  }, [zoom]);

  return (
    <div className="gantt-container2">
      {/* Заголовок */}
      <div className="gantt-header2">
        <h1 className="gantt-title2">
          <span 
            className="gantt-link2"
            onClick={() => window.location.href = '/projects'}
          >
            Проекты
          </span>
          {' — '}
          <span 
            className="gantt-link2"
            onClick={() => window.location.href = `/projects/${project.id}`}
          >
            {project.name}
          </span>
          {' — Диаграмма Ганта'}
        </h1>
        
        <div className="gantt-header-controls2">
          <div className="zoom-controls2">
            <button 
              className="zoom-btn2"
              onClick={() => handleZoomChange(Math.max(0.5, zoom - 0.2))}
              disabled={zoom <= 0.5}
            >
              -
            </button>
            <span className="zoom-level2">{Math.round(zoom * 100)}%</span>
            <button 
              className="zoom-btn2"
              onClick={() => handleZoomChange(Math.min(2, zoom + 0.2))}
              disabled={zoom >= 2}
            >
              +
            </button>
          </div>
          
          <button 
            className="today-btn2"
            onClick={scrollToToday}
          >
            Сегодня
          </button>
          
          <button 
            className="gantt-back-btn2"
            onClick={() => window.location.href = `/projects/${project.id}`}
          >
            ← Назад к проекту
          </button>
        </div>
      </div>

      <div className="gantt-content2">
        {/* Левая панель с участниками */}
        <div className="gantt-sidebar2">
          <h3 className="sidebar-title2">Участники проекта</h3>
          <div className="team-members2">
            {teamMembers.map(member => (
              <div key={member.id} className="team-member2">
                <div 
                  className="member-avatar2"
                  style={{ backgroundColor: member.color }}
                >
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="member-info2">
                  <div className="member-name2">{member.name}</div>
                  <div className="member-role2">{member.role}</div>
                  <div className="member-tasks2">
                    {tasks.filter(t => t.memberId === member.id).length} задач
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Статистика */}
          <div className="gantt-stats2">
            <div className="stat-item2">
              <div className="stat-label2">Всего задач</div>
              <div className="stat-value2">{tasks.length}</div>
            </div>
            <div className="stat-item2">
              <div className="stat-label2">Выполнено</div>
              <div className="stat-value2">
                {Math.round(tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length)}%
              </div>
            </div>
            <div className="stat-item2">
              <div className="stat-label2">Срок</div>
              <div className="stat-value2">
                {Math.max(...tasks.map(t => t.endDay))} дн.
              </div>
            </div>
          </div>
        </div>

        {/* Основная диаграмма */}
        <div className="gantt-main2">
          {/* Панель управления */}
          <div className="gantt-controls2">
            <div className="time-period2">
              <span className="period-label2">Период:</span>
              <span className="period-value2">
                {days[0]?.fullDate.toLocaleDateString('ru-RU')} - {days[days.length-1]?.fullDate.toLocaleDateString('ru-RU')}
              </span>
            </div>
          </div>

          {/* Контейнер для диаграммы с скроллом */}
          <div 
            className="timeline-container2"
            ref={timelineRef}
            onScroll={handleScroll}
          >
            {/* Заголовки месяцев */}
            <div className="month-headers2">
              {monthGroups.map((monthGroup, index) => (
                <div 
                  key={index}
                  className="month-header2"
                  style={{ 
                    width: `${monthGroup.daysCount * 40 * zoom}px`
                  }}
                >
                  <div className="month-name2">
                    {monthGroup.month} {monthGroup.year}
                  </div>
                  <div className="month-days-count2">
                    {monthGroup.daysCount} дней
                  </div>
                </div>
              ))}
            </div>

            {/* Заголовки дней */}
            <div className="day-headers2">
              {days.map((day, index) => (
                <div 
                  key={index}
                  className="day-header2"
                  style={{ 
                    width: `${40 * zoom}px`,
                    backgroundColor: day.fullDate.toDateString() === new Date().toDateString() ? '#FFF3CD' : 'white'
                  }}
                >
                  <div className="day-number2">{day.day}</div>
                  <div className="day-weekday2">{day.weekday}</div>
                  <div className="day-month2">{day.month}</div>
                </div>
              ))}
            </div>

            {/* Сетка дней */}
            <div className="day-grid2">
              {days.map((day, dayIndex) => (
                <div 
                  key={`grid-${dayIndex}`}
                  className="day-grid-cell2"
                  style={{ width: `${40 * zoom}px` }}
                />
              ))}
            </div>

            {/* Линии участников и задачи */}
            <div className="timeline-content2">
              {teamMembers.map(member => (
                <div key={member.id} className="member-row2">
                  {/* Фон строки участника */}
                  <div className="member-row-background2">
                    {days.map((day, dayIndex) => {
                      const task = getTaskForMemberAndDay(member.id, dayIndex);
                      return (
                        <div 
                          key={`cell-${member.id}-${dayIndex}`}
                          className="day-cell2"
                          style={{ 
                            width: `${40 * zoom}px`,
                            backgroundColor: task ? `${task.color}20` : 'transparent'
                          }}
                        />
                      );
                    })}
                  </div>
                  
                  {/* Задачи участника */}
                  {tasks
                    .filter(task => task.memberId === member.id)
                    .map(task => {
                      const width = getTaskWidth(task);
                      const left = getTaskPosition(task);
                      
                      return (
                        <div 
                          key={task.id}
                          className="gantt-task2"
                          style={{
                            left: `${left}px`,
                            width: `${width}px`,
                            backgroundColor: task.color,
                          }}
                          onClick={(e) => handleTaskClick(task, e)}
                        >
                          <div className="task-content2">
                            <div className="task-title2">{task.title}</div>
                            <div className="task-progress2">
                              <div 
                                className="progress-fill2"
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                            <div className="task-dates2">
                              День {task.startDay + 1} - {task.endDay + 1}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ))}
            </div>

            {/* Вертикальная линия сегодняшнего дня */}
            <div 
              className="today-line2"
              style={{ 
                left: `${days.findIndex(day => 
                  day.fullDate.toDateString() === new Date().toDateString()
                ) * 40 * zoom || 0}px` 
              }}
            />
          </div>

          {/* Легенда */}
          <div className="gantt-legend2">
            <div className="legend-item2">
              <div className="legend-color2 completed2"></div>
              <span>Завершено</span>
            </div>
            <div className="legend-item2">
              <div className="legend-color2 in-progress2"></div>
              <span>В работе</span>
            </div>
            <div className="legend-item2">
              <div className="legend-color2 planned2"></div>
              <span>Запланировано</span>
            </div>
            <div className="legend-item2">
              <div className="legend-line2 today2"></div>
              <span>Сегодня</span>
            </div>
          </div>

          {/* Информация о выбранной задаче */}
          {selectedTask && (
            <div className="task-details2">
              <button 
                className="close-details-btn2"
                onClick={() => setSelectedTask(null)}
              >
                ×
              </button>
              
              <h4 className="task-details-title2">{selectedTask.title}</h4>
              
              <div className="task-details-content2">
                <div className="detail-row2">
                  <span className="detail-label2">Исполнитель:</span>
                  <span className="detail-value2">
                    {teamMembers.find(m => m.id === selectedTask.memberId)?.name}
                  </span>
                </div>
                
                <div className="detail-row2">
                  <span className="detail-label2">Сроки:</span>
                  <span className="detail-value2">
                    День {selectedTask.startDay + 1} - {selectedTask.endDay + 1} 
                    ({selectedTask.endDay - selectedTask.startDay + 1} дней)
                  </span>
                </div>
                
                <div className="detail-row2">
                  <span className="detail-label2">Прогресс:</span>
                  <div className="progress-container2">
                    <div className="progress-bar-bg2">
                      <div 
                        className="progress-bar-fill2"
                        style={{ width: `${selectedTask.progress}%`, backgroundColor: selectedTask.color }}
                      />
                    </div>
                    <span className="progress-value2">{selectedTask.progress}%</span>
                  </div>
                </div>
                
                <div className="detail-row2">
                  <span className="detail-label2">Статус:</span>
                  <span className={`status-badge2 status-${selectedTask.progress === 100 ? 'completed' : selectedTask.progress > 50 ? 'in-progress' : 'planned'}2`}>
                    {selectedTask.progress === 100 ? 'Завершено' : 
                     selectedTask.progress > 50 ? 'В работе' : 'Запланировано'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GanttChart2;