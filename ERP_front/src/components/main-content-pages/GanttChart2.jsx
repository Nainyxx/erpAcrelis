import React, { useState, useEffect } from 'react';
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

  // Константы для отображения (в vh, где 1vh = 10px)
  const DAY_WIDTH_VH = 3; // 3vh = 30px (уменьшили для больших проектов)
  const TASK_MIN_WIDTH_VH = DAY_WIDTH_VH; // Минимальная ширина задачи
  
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
        
        // ВСЕГДА используем сроки проекта для отображения диаграммы
        let minDate, maxDate;
        
        if (projectData.created && projectData.deadline) {
          minDate = new Date(projectData.created);
          maxDate = new Date(projectData.deadline);
          
          // Проверяем, чтобы начальная дата была не позже конечной
          if (minDate > maxDate) {
            // Если начальная дата позже конечной, меняем их местами
            [minDate, maxDate] = [maxDate, minDate];
          }
        } else {
          // Если нет дат проекта, показываем весь текущий год
          const today = new Date();
          const year = today.getFullYear();
          minDate = new Date(year, 0, 1); // 1 января текущего года
          maxDate = new Date(year, 11, 31); // 31 декабря текущего года
        }
        
        // Нормализуем даты до начала дня
        minDate.setHours(0, 0, 0, 0);
        maxDate.setHours(0, 0, 0, 0);
        
        // Минимальные отступы
        const paddingDays = 1;
        minDate.setDate(minDate.getDate() - paddingDays);
        maxDate.setDate(maxDate.getDate() + paddingDays);
        
        setDateRange({ start: minDate, end: maxDate });

        console.log('📅 Диапазон проекта:');
        console.log('Начало:', minDate.toLocaleDateString());
        console.log('Конец:', maxDate.toLocaleDateString());

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
  }, [projectId, useMockData, navigate]);

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
        // Используем created задачи как дату начала
        if (task.created) {
          startDate = new Date(task.created);
          startDate.setHours(0, 0, 0, 0);
        }
        
        if (task.deadline) {
          deadline = new Date(task.deadline);
          deadline.setHours(0, 0, 0, 0);
        } else {
          // Если нет дедлайна, добавляем 7 дней к дате начала
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

  // Генерируем дни на основе дат ПРОЕКТА (БЕЗ ОГРАНИЧЕНИЙ)
  const generateDays = () => {
    if (!dateRange.start || !dateRange.end) {
      // Если нет дат проекта, показываем весь текущий год
      const today = new Date();
      const year = today.getFullYear();
      const isLeapYear = (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0));
      const daysInYear = isLeapYear ? 366 : 365;
      
      console.log(`📅 Генерируем год (${daysInYear} дней)`);
      
      const days = [];
      for (let i = 0; i < daysInYear; i++) {
        const date = new Date(year, 0, 1);
        date.setDate(date.getDate() + i);
        
        days.push({
          date: date,
          day: date.getDate(),
          month: date.toLocaleString('ru-RU', { month: 'long' }),
          year: date.getFullYear(),
          weekday: date.toLocaleString('ru-RU', { weekday: 'short' }),
          isToday: date.toDateString() === new Date().toDateString()
        });
      }
      
      return days;
    }

    const days = [];
    const current = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    
    // Сбрасываем время для чистоты
    current.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    // Считаем сколько дней между датами
    const timeDiff = end.getTime() - current.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    
    console.log(`📅 Диапазон: ${current.toLocaleDateString()} - ${end.toLocaleDateString()}`);
    console.log(`📅 Всего дней: ${dayDiff}`);
    
    for (let i = 0; i < dayDiff; i++) {
      const dayCopy = new Date(current);
      dayCopy.setDate(current.getDate() + i);
      
      days.push({
        date: dayCopy,
        day: dayCopy.getDate(),
        month: dayCopy.toLocaleString('ru-RU', { month: 'long' }),
        year: dayCopy.getFullYear(),
        weekday: dayCopy.toLocaleString('ru-RU', { weekday: 'short' }),
        isToday: dayCopy.toDateString() === new Date().toDateString()
      });
    }
    
    return days;
  };

  const days = generateDays();
  const totalWidth = days.length * DAY_WIDTH_VH; // Общая ширина всех дней в vh
  const totalHeight = teamMembers.length * 7; // Общая высота всех строк участников в vh

  console.log(`📊 Итоговая статистика:`);
  console.log(`   Дней в проекте: ${days.length}`);
  console.log(`   Общая ширина: ${totalWidth}vh (${totalWidth * 10}px)`);
  console.log(`   Участников: ${teamMembers.length}`);
  console.log(`   Общая высота: ${totalHeight}vh`);

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

  console.log(`📅 Месяцев: ${monthGroups.length}`);

  // Найти задачу для конкретного участника и дня
  const getTaskForMemberAndDay = (memberId, date) => {
    return tasks.find(task => {
      if (task.memberId !== memberId) return false;
      
      const taskStart = new Date(task.startDate);
      const taskEnd = new Date(task.deadline);
      const currentDate = new Date(date);
      
      // Нормализуем все даты до начала дня
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
    
    // Нормализуем даты задачи
    taskStart.setHours(0, 0, 0, 0);
    taskEnd.setHours(0, 0, 0, 0);
    
    let startIndex = -1;
    let endIndex = -1;
    
    // Ищем индексы дней в диапазоне диаграммы
    for (let i = 0; i < days.length; i++) {
      const dayDate = new Date(days[i].date);
      dayDate.setHours(0, 0, 0, 0);
      
      // Если день входит в диапазон задачи
      if (dayDate >= taskStart && dayDate <= taskEnd) {
        if (startIndex === -1) {
          startIndex = i;
        }
        endIndex = i;
      }
    }
    
    // Если задача не попадает в диапазон диаграммы
    if (startIndex === -1) {
      // Проверяем, начинается ли задача до диапазона диаграммы
      if (taskStart < new Date(days[0].date)) {
        startIndex = 0;
      }
      // Проверяем, заканчивается ли задача после диапазона диаграммы  
      else if (taskEnd > new Date(days[days.length - 1].date)) {
        startIndex = days.length - 1;
      }
    }
    
    // Если endIndex не найден, используем startIndex
    if (endIndex === -1 && startIndex !== -1) {
      endIndex = startIndex;
    }
    
    // Если задача вообще не попадает в диапазон
    if (startIndex === -1) {
      startIndex = 0;
      endIndex = 0;
    }
    
    const left = startIndex * DAY_WIDTH_VH;
    const width = Math.max(TASK_MIN_WIDTH_VH, (endIndex - startIndex + 1) * DAY_WIDTH_VH);
    
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
        <div className="project-dates-info_gantt_class">
          <span className="date-label_gantt_class">Сроки проекта: </span>
          <span className="date-value_gantt_class">
            {project.created ? new Date(project.created).toLocaleDateString('ru-RU') : '-'}
          </span>
          <span className="date-separator_gantt_class"> — </span>
          <span className="date-value_gantt_class">
            {project.deadline ? new Date(project.deadline).toLocaleDateString('ru-RU') : '-'}
          </span>
          <span className="date-label_gantt_class" style={{ marginLeft: '2vh' }}>
            (Всего дней: {days.length})
          </span>
        </div>
      </div>

      {/* Основной контейнер */}
      <div className="gantt-main-container_gantt_class">
        <div className="gantt-diagram-wrapper_gantt_class">
          {/* Имена участников слева */}
          <div className="members-column_gantt_class">
            {/* Пустой хедер высотой как месяцы и дни */}
            <div className="members-header_gantt_class"></div>
            <div className="members-list_gantt_class">
              {teamMembers.map((member, index) => (
                <div 
                  key={member.id} 
                  className="member-name-item_gantt_class"
                  style={{ height: '7vh' }}
                >
                  {member.name}
                </div>
              ))}
            </div>
          </div>

          {/* Диаграмма справа с горизонтальным скроллом */}
          <div className="diagram-column_gantt_class">
            {/* Внутренний контейнер с фиксированной шириной для скролла */}
            <div style={{
              position: 'relative',
              minWidth: `${totalWidth}vh`,
              width: `${totalWidth}vh`,
              height: '100%'
            }}>
              {/* Заголовки месяцев */}
              <div className="month-headers_gantt_class" style={{ 
                minWidth: `${totalWidth}vh`,
                width: `${totalWidth}vh`
              }}>
                {monthGroups.map((monthGroup, index) => (
                  <div 
                    key={index}
                    className="month-header_gantt_class"
                    style={{ 
                      width: `${monthGroup.daysCount * DAY_WIDTH_VH}vh`,
                      minWidth: `${monthGroup.daysCount * DAY_WIDTH_VH}vh`
                    }}
                  >
                    <div className="month-name_gantt_class">
                      {monthGroup.month} {monthGroup.year}
                    </div>
                  </div>
                ))}
              </div>

              {/* Заголовки дней */}
              <div className="day-headers_gantt_class" style={{ 
                minWidth: `${totalWidth}vh`,
                width: `${totalWidth}vh`
              }}>
                {days.map((day, index) => (
                  <div 
                    key={index}
                    className={`day-header_gantt_class ${day.isToday ? 'today_gantt_class' : ''}`}
                    style={{ 
                      width: `${DAY_WIDTH_VH}vh`,
                      minWidth: `${DAY_WIDTH_VH}vh`
                    }}
                  >
                    <div className="day-number_gantt_class">{day.day}</div>
                    <div className="day-weekday_gantt_class">{day.weekday}</div>
                  </div>
                ))}
              </div>

              {/* Сетка дней */}
              <div 
                className="day-grid_gantt_class" 
                style={{ 
                  minWidth: `${totalWidth}vh`,
                  width: `${totalWidth}vh`,
                  height: `${totalHeight}vh`
                }}
              >
                {days.map((day, dayIndex) => (
                  <div 
                    key={`grid-${dayIndex}`}
                    className={`day-grid-cell_gantt_class ${day.isToday ? 'today-cell_gantt_class' : ''} ${dayIndex % 2 === 0 ? 'even_gantt_class' : 'odd_gantt_class'}`}
                    style={{ 
                      width: `${DAY_WIDTH_VH}vh`,
                      minWidth: `${DAY_WIDTH_VH}vh`,
                      height: '100%'
                    }}
                  />
                ))}
              </div>

              {/* Участники и задачи */}
              <div 
                className="gantt-timeline_gantt_class" 
                style={{ 
                  minWidth: `${totalWidth}vh`,
                  width: `${totalWidth}vh`,
                  height: `${totalHeight}vh`
                }}
              >
                {teamMembers.map((member, memberIndex) => {
                  const memberTasks = tasks.filter(task => task.memberId === member.id);
                  
                  return (
                    <div 
                      key={member.id} 
                      className="member-row_gantt_class"
                      style={{ 
                        top: `${memberIndex * 7}vh`,
                        height: '7vh',
                        minWidth: `${totalWidth}vh`,
                        width: `${totalWidth}vh`
                      }}
                    >
                      {/* Фон строки */}
                      <div className="member-row-background_gantt_class" style={{ 
                        minWidth: `${totalWidth}vh`,
                        width: `${totalWidth}vh`
                      }}>
                        {days.map((day, dayIndex) => {
                          const task = getTaskForMemberAndDay(member.id, day.date);
                          return (
                            <div 
                              key={`cell-${member.id}-${dayIndex}`}
                              className={`day-cell_gantt_class ${day.isToday ? 'today-cell_gantt_class' : ''}`}
                              style={{ 
                                width: `${DAY_WIDTH_VH}vh`,
                                minWidth: `${DAY_WIDTH_VH}vh`,
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
                              left: `${left}vh`,
                              width: `${width}vh`,
                              backgroundColor: task.color,
                              height: '5vh',
                              top: '1vh',
                              minWidth: `${TASK_MIN_WIDTH_VH}vh`
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
                    left: `${days.findIndex(d => d.isToday) * DAY_WIDTH_VH}vh`,
                    height: `${totalHeight}vh`
                  }}
                />
              )}
            </div>
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