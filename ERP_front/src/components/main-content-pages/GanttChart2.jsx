import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './GanttChart2.css';
import { getProjectById, getTasks } from '../../services/api/api';

const GanttChart = ({ useMockData = false }) => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  // Цвета для задач
  const taskColors = [
    '#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2', 
    '#EF476F', '#073B4C', '#7209B7', '#F3722C', '#43AA8B'
  ];

  // Загрузка проекта и его задач
  useEffect(() => {
    const loadProjectData = async () => {
      if (!projectId) {
        navigate('/projects');
        return;
      }

      setIsLoading(true);
      
      try {
        const projectData = await getProjectById(parseInt(projectId), useMockData);
        setProject(projectData);

        const tasksData = await getTasks(useMockData, { project: projectId });
        
        const { ganttTasks, team } = transformTasksToGantt(tasksData, projectData);
        setTasks(ganttTasks);
        setTeamMembers(team);
        
        if (ganttTasks.length > 0) {
          const startDates = ganttTasks.map(t => t.startDate);
          const endDates = ganttTasks.map(t => t.deadline);
          const minDate = new Date(Math.min(...startDates.map(d => new Date(d).getTime())));
          const maxDate = new Date(Math.max(...endDates.map(d => new Date(d).getTime())));
          
          minDate.setDate(minDate.getDate() - 7);
          maxDate.setDate(maxDate.getDate() + 7);
          
          setDateRange({ start: minDate, end: maxDate });
        }

      } catch (error) {
        console.error('❌ Ошибка загрузки данных:', error);
        setTeamMembers([
          { id: 1, name: 'Не назначен', color: taskColors[0] }
        ]);
        setTasks([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjectData();
  }, [projectId, useMockData]);

  // Преобразование задач API в формат Ганта
  const transformTasksToGantt = (apiTasks, projectData) => {
    if (!apiTasks || !Array.isArray(apiTasks) || apiTasks.length === 0) {
      return { ganttTasks: [], team: [] };
    }

    let team = [];
    if (projectData.team && Array.isArray(projectData.team)) {
      team = projectData.team.map((member, index) => ({
        id: member.id || index + 1,
        name: member.name || `Исполнитель ${index + 1}`,
        color: taskColors[index % taskColors.length]
      }));
    } else {
      const uniquePerformers = [];
      apiTasks.forEach(task => {
        if (task.performer_name && !uniquePerformers.some(p => p.name === task.performer_name)) {
          uniquePerformers.push({
            id: task.performer || uniquePerformers.length + 1,
            name: task.performer_name,
            color: taskColors[uniquePerformers.length % taskColors.length]
          });
        }
      });
      
      if (uniquePerformers.length > 0) {
        team = uniquePerformers;
      } else {
        team = [{ id: 1, name: 'Не назначен', color: taskColors[0] }];
      }
    }

    const teamMap = new Map();
    team.forEach(member => {
      if (member && member.id) {
        teamMap.set(member.id, member);
      }
    });

    const nameTeamMap = new Map();
    team.forEach(member => {
      if (member && member.name) {
        nameTeamMap.set(member.name.toLowerCase(), member);
      }
    });

    const ganttTasks = [];

    apiTasks.forEach((task, index) => {
      if (!task) return;

      let memberId = 1;
      let teamMember = null;

      if (task.performer && teamMap.has(task.performer)) {
        memberId = task.performer;
        teamMember = teamMap.get(memberId);
      }
      else if (task.performer_name && nameTeamMap.has(task.performer_name.toLowerCase())) {
        teamMember = nameTeamMap.get(task.performer_name.toLowerCase());
        memberId = teamMember.id;
      }
      else if (team && team.length > 0) {
        memberId = team[0].id;
        teamMember = team[0];
      }

      let startDate = new Date();
      let deadline = new Date();
      
      try {
        if (task.created) {
          startDate = new Date(task.created);
        }
        
        if (task.deadline) {
          deadline = new Date(task.deadline);
        } else {
          deadline = new Date(startDate);
          deadline.setDate(deadline.getDate() + 7);
        }
      } catch (e) {
        console.warn('Ошибка парсинга дат:', e);
        startDate = new Date();
        deadline = new Date();
        deadline.setDate(deadline.getDate() + 7);
      }
      
      const color = teamMember ? teamMember.color : taskColors[index % taskColors.length];

      ganttTasks.push({
        id: task.id,
        title: task.name || `Задача ${task.id}`,
        memberId: memberId,
        startDate: startDate,
        deadline: deadline,
        color: color,
        originalTask: task
      });
    });

    return { ganttTasks, team };
  };

  // Генерируем дни на основе дат задач
  const generateDays = () => {
    if (!dateRange.start || !dateRange.end) {
      const defaultDays = Array.from({ length: 60 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i - 30);
        return date;
      });
      
      return defaultDays.map(date => ({
        date: date,
        day: date.getDate(),
        month: date.toLocaleString('ru-RU', { month: 'long' }),
        year: date.getFullYear(),
        weekday: date.toLocaleString('ru-RU', { weekday: 'short' }),
        isToday: date.toDateString() === new Date().toDateString()
      }));
    }

    const days = [];
    const current = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    
    while (current <= end) {
      days.push({
        date: new Date(current),
        day: current.getDate(),
        month: current.toLocaleString('ru-RU', { month: 'long' }),
        year: current.getFullYear(),
        weekday: current.toLocaleString('ru-RU', { weekday: 'short' }),
        isToday: current.toDateString() === new Date().toDateString()
      });
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const days = generateDays();

  // Группируем дни по месяцам
  const monthGroups = [];
  let currentMonth = null;
  let monthStart = 0;
  
  days.forEach((day, index) => {
    const monthKey = `${day.month} ${day.year}`;
    if (currentMonth !== monthKey) {
      if (currentMonth !== null) {
        monthGroups.push({
          month: days[monthStart].month,
          year: days[monthStart].year,
          start: monthStart,
          end: index - 1,
          daysCount: index - monthStart
        });
      }
      currentMonth = monthKey;
      monthStart = index;
    }
  });
  
  if (currentMonth !== null) {
    monthGroups.push({
      month: days[monthStart].month,
      year: days[monthStart].year,
      start: monthStart,
      end: days.length - 1,
      daysCount: days.length - monthStart
    });
  }

  // Найти задачу для конкретного участника и дня
  const getTaskForMemberAndDay = (memberId, date) => {
    return tasks.find(task => {
      if (task.memberId !== memberId) return false;
      
      const taskStart = new Date(task.startDate);
      const taskEnd = new Date(task.deadline);
      const currentDate = new Date(date);
      
      taskStart.setHours(0, 0, 0, 0);
      taskEnd.setHours(0, 0, 0, 0);
      currentDate.setHours(0, 0, 0, 0);
      
      return currentDate >= taskStart && currentDate <= taskEnd;
    });
  };

  // Получить позицию и ширину задачи
  const getTaskPositionAndWidth = (task, days) => {
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.deadline);
    
    let startIndex = 0;
    let endIndex = days.length - 1;
    
    for (let i = 0; i < days.length; i++) {
      const dayDate = new Date(days[i].date);
      dayDate.setHours(0, 0, 0, 0);
      
      if (dayDate.getTime() === taskStart.setHours(0, 0, 0, 0)) {
        startIndex = i;
      }
      if (dayDate.getTime() === taskEnd.setHours(0, 0, 0, 0)) {
        endIndex = i;
        break;
      }
    }
    
    const left = startIndex * 40;
    const width = (endIndex - startIndex + 1) * 40;
    
    return { left, width, startIndex, endIndex };
  };

  if (isLoading) {
    return (
      <div className="gantt-container_gantt_class">
        <div style={{ padding: '5vh', textAlign: 'center' }}>
          Загрузка диаграммы Ганта...
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="gantt-container_gantt_class">
        <div style={{ padding: '5vh', textAlign: 'center' }}>
          <h2>Проект не найден</h2>
          <button 
            onClick={() => navigate('/projects')}
            className="gantt-back-btn_gantt_class"
          >
            Вернуться к списку проектов
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="gantt-container_gantt_class">
      {/* Заголовок */}
      <div className="gantt-header_gantt_class">
        <h1 className="gantt-title_gantt_class">
          <span 
            className="gantt-link_gantt_class" 
            onClick={() => navigate('/projects')}
          >
            Проекты
          </span>
          {' — '}
          <span 
            className="gantt-link_gantt_class"
            onClick={() => navigate(`/projects/${project.id}`)}
          >
            {project.name}
          </span>
          {' — Диаграмма Ганта'}
        </h1>
      </div>

      {/* Основной контейнер */}
      <div className="gantt-main-container_gantt_class">
        <div className="gantt-diagram-wrapper_gantt_class">
          {/* Имена участников слева */}
          <div className="members-column_gantt_class">
            <div className="members-header_gantt_class"></div>
            <div className="members-list_gantt_class">
              {teamMembers.map(member => (
                <div key={member.id} className="member-name-item_gantt_class">
                  {member.name}
                </div>
              ))}
            </div>
          </div>

          {/* Диаграмма справа */}
          <div className="diagram-column_gantt_class">
            {/* Заголовки месяцев */}
            <div className="month-headers_gantt_class">
              {monthGroups.map((monthGroup, index) => (
                <div 
                  key={index}
                  className="month-header_gantt_class"
                  style={{ 
                    width: `${monthGroup.daysCount * 40}px`
                  }}
                >
                  <div className="month-name_gantt_class">
                    {monthGroup.month} {monthGroup.year}
                  </div>
                </div>
              ))}
            </div>

            {/* Заголовки дней */}
            <div className="day-headers_gantt_class">
              {days.map((day, index) => (
                <div 
                  key={index}
                  className={`day-header_gantt_class ${day.isToday ? 'today_gantt_class' : ''}`}
                  style={{ 
                    width: `40px`,
                  }}
                >
                  <div className="day-number_gantt_class">{day.day}</div>
                  <div className="day-weekday_gantt_class">{day.weekday}</div>
                </div>
              ))}
            </div>

            {/* Сетка дней */}
            <div className="day-grid_gantt_class">
              {days.map((day, dayIndex) => (
                <div 
                  key={`grid-${dayIndex}`}
                  className={`day-grid-cell_gantt_class ${day.isToday ? 'today-cell_gantt_class' : ''} ${dayIndex % 2 === 0 ? 'even_gantt_class' : 'odd_gantt_class'}`}
                  style={{ width: `40px` }}
                />
              ))}
            </div>

            {/* Участники и задачи */}
            <div className="gantt-timeline_gantt_class">
              {teamMembers.map(member => {
                const memberTasks = tasks.filter(task => task.memberId === member.id);
                
                return (
                  <div key={member.id} className="member-row_gantt_class">
                    {/* Фон строки */}
                    <div className="member-row-background_gantt_class">
                      {days.map((day, dayIndex) => {
                        const task = getTaskForMemberAndDay(member.id, day.date);
                        return (
                          <div 
                            key={`cell-${member.id}-${dayIndex}`}
                            className={`day-cell_gantt_class ${day.isToday ? 'today-cell_gantt_class' : ''}`}
                            style={{ 
                              width: `40px`,
                              backgroundColor: task ? `${task.color}20` : 'transparent'
                            }}
                          />
                        );
                      })}
                    </div>
                    
                    {/* Задачи участника */}
                    {memberTasks.map(task => {
                      const { left, width } = getTaskPositionAndWidth(task, days);
                      
                      return (
                        <div 
                          key={task.id}
                          className="gantt-task_gantt_class"
                          style={{
                            left: `${left}px`,
                            width: `${width}px`,
                            backgroundColor: task.color,
                          }}
                        >
                          <div className="task-content_gantt_class">
                            {task.title}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Линия сегодняшнего дня */}
            {days.some(day => day.isToday) && (
              <div 
                className="today-line_gantt_class"
                style={{ 
                  left: `${days.findIndex(d => d.isToday) * 40}px`
                }}
              />
            )}
          </div>
        </div>

        {/* Сообщение, если задач нет */}
        {tasks.length === 0 && (
          <div className="no-tasks-message_gantt_class">
            <div className="no-tasks-content_gantt_class">
              <span className="no-tasks-icon_gantt_class">📋</span>
              <h4>В проекте пока нет задач</h4>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GanttChart;