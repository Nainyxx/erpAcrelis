import React, { useState, useEffect, useMemo } from 'react';
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


  const DAY_WIDTH_VH = 3; 
  const TASK_MIN_WIDTH_VH = DAY_WIDTH_VH;
  const MEMBER_ROW_HEIGHT_VH = 7;
  const TASK_ROW_HEIGHT_VH = 5;
  const TASK_MARGIN_TOP_VH = 1;
  const TASK_BORDER_WIDTH_VH = 0.2;
  
  // Цвета для задач
  const taskColors = [
    '#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2', 
    '#EF476F', '#073B4C', '#7209B7', '#F3722C', '#43AA8B'
  ];

  // Функция для сокращения названия месяца до 3 букв
  const getShortMonthName = (fullMonthName) => {
    const monthMap = {
      'январь': 'янв',
      'февраль': 'фев',
      'март': 'мар',
      'апрель': 'апр',
      'май': 'май',
      'июнь': 'июн',
      'июль': 'июл',
      'август': 'авг',
      'сентябрь': 'сен',
      'октябрь': 'окт',
      'ноябрь': 'ноя',
      'декабрь': 'дек',
      'january': 'jan',
      'february': 'feb',
      'march': 'mar',
      'april': 'apr',
      'may': 'may',
      'june': 'jun',
      'july': 'jul',
      'august': 'aug',
      'september': 'sep',
      'october': 'oct',
      'november': 'nov',
      'december': 'dec'
    };
    
    const lowerMonth = fullMonthName.toLowerCase();
    return monthMap[lowerMonth] || fullMonthName.slice(0, 3);
  };

  // Функция для сокращения дня недели до 3 букв
  const getShortWeekdayName = (fullWeekdayName) => {
    const weekdayMap = {
      'понедельник': 'пн',
      'вторник': 'вт',
      'среда': 'ср',
      'четверг': 'чт',
      'пятница': 'пт',
      'суббота': 'сб',
      'воскресенье': 'вс',
      'monday': 'mon',
      'tuesday': 'tue',
      'wednesday': 'wed',
      'thursday': 'thu',
      'friday': 'fri',
      'saturday': 'sat',
      'sunday': 'sun'
    };
    
    const lowerWeekday = fullWeekdayName.toLowerCase();
    return weekdayMap[lowerWeekday] || fullWeekdayName.slice(0, 3);
  };

  // Функция для загрузки всех задач проекта (с обработкой пагинации)
  const loadAllProjectTasks = async (useMockData, projectId) => {
    let allTasks = [];
    let currentPage = 1;
    let hasMorePages = true;
    
    while (hasMorePages) {
      try {
        // Используем фильтр по проекту и текущую страницу
        const filters = {
          project: projectId,
          page: currentPage
        };
        
        const response = await getTasks(useMockData, filters);
        
        if (response.results && Array.isArray(response.results)) {
          allTasks = [...allTasks, ...response.results];
        }
        
        // Проверяем, есть ли следующая страница
        if (response.next && currentPage < (response.total_pages || 100)) {
          currentPage++;
        } else {
          hasMorePages = false;
        }
        
        // Для мок данных ограничиваем количество страниц
        if (useMockData && currentPage > 5) {
          hasMorePages = false;
        }
        
      } catch (error) {
        hasMorePages = false;
      }
    }
    
    return allTasks;
  };

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

        // Загружаем все задачи проекта с обработкой пагинации
        const allTasksData = await loadAllProjectTasks(useMockData, projectId);
        
        const { ganttTasks, team } = transformTasksToGantt(allTasksData, projectData);
        setTasks(ganttTasks);
        setTeamMembers(team);
        
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



      } catch (error) {
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
        startDate = new Date();
        deadline = new Date();
        deadline.setDate(deadline.getDate() + 7);
      }
      
      const color = teamMember ? teamMember.color : taskColors[index % taskColors.length];
      const isCompleted = task.status === 'completed';

      ganttTasks.push({
        id: task.id,
        title: task.name || `Задача ${task.id}`,
        memberId: memberId,
        startDate: startDate,
        deadline: deadline,
        color: color,
        isCompleted: isCompleted,
        originalTask: task
      });
    });

    return { ganttTasks, team };
  };

  // Функция для определения пересечений задач и распределения по строкам
  const distributeTasksToRows = useMemo(() => {
    if (!tasks.length) return {};

    const tasksByMember = {};
    
    // Группируем задачи по участникам
    tasks.forEach(task => {
      if (!tasksByMember[task.memberId]) {
        tasksByMember[task.memberId] = [];
      }
      tasksByMember[task.memberId].push({
        ...task,
        startDate: new Date(task.startDate),
        deadline: new Date(task.deadline)
      });
    });

    const result = {};
    
    // Для каждого участника распределяем задачи по строкам
    Object.keys(tasksByMember).forEach((memberId) => {
      const memberTasks = [...tasksByMember[memberId]];
      
      // Сортируем задачи по дате начала
      memberTasks.sort((a, b) => a.startDate - b.startDate);
      
      const rows = [];
      
      // Алгоритм распределения задач по строкам (поиск минимального количества строк)
      memberTasks.forEach(task => {
        let placed = false;
        
        // Пробуем разместить задачу в существующих строках
        for (let i = 0; i < rows.length; i++) {
          const rowTasks = rows[i];
          const canPlace = rowTasks.every(existingTask => {
            // Проверяем пересечение задач
            return (
              task.deadline < existingTask.startDate || 
              task.startDate > existingTask.deadline
            );
          });
          
          if (canPlace) {
            rowTasks.push(task);
            task.row = i; // Сохраняем номер строки для задачи
            placed = true;
            break;
          }
        }
        
        // Если не удалось разместить, создаем новую строку
        if (!placed) {
          const newRow = [task];
          rows.push(newRow);
          task.row = rows.length - 1;
        }
      });
      
      result[memberId] = {
        tasks: memberTasks,
        rowsCount: rows.length
      };
    });
    
    return result;
  }, [tasks]);

  // Рассчитываем общую высоту для участника с учетом всех строк
  const getMemberTotalHeight = (memberId) => {
    if (!distributeTasksToRows[memberId]) return MEMBER_ROW_HEIGHT_VH;
    return distributeTasksToRows[memberId].rowsCount * MEMBER_ROW_HEIGHT_VH;
  };

  // Рассчитываем общую высоту всех участников
  const totalHeight = teamMembers.reduce((sum, member) => {
    return sum + getMemberTotalHeight(member.id);
  }, 0);

  // Генерируем дни на основе дат ПРОЕКТА (БЕЗ ОГРАНИЧЕНИЙ)
  const generateDays = () => {
    if (!dateRange.start || !dateRange.end) {
      // Если нет дат проекта, показываем весь текущий год
      const today = new Date();
      const year = today.getFullYear();
      const isLeapYear = (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0));
      const daysInYear = isLeapYear ? 366 : 365;
      
      
      const days = [];
      for (let i = 0; i < daysInYear; i++) {
        const date = new Date(year, 0, 1);
        date.setDate(date.getDate() + i);
        
        const fullMonth = date.toLocaleString('ru-RU', { month: 'long' });
        const fullWeekday = date.toLocaleString('ru-RU', { weekday: 'long' });
        
        days.push({
          date: date,
          day: date.getDate(),
          month: fullMonth,
          shortMonth: getShortMonthName(fullMonth),
          year: date.getFullYear(),
          weekday: fullWeekday,
          shortWeekday: getShortWeekdayName(fullWeekday),
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
    

    
    for (let i = 0; i < dayDiff; i++) {
      const dayCopy = new Date(current);
      dayCopy.setDate(current.getDate() + i);
      
      const fullMonth = dayCopy.toLocaleString('ru-RU', { month: 'long' });
      const fullWeekday = dayCopy.toLocaleString('ru-RU', { weekday: 'long' });
      
      days.push({
        date: dayCopy,
        day: dayCopy.getDate(),
        month: fullMonth,
        shortMonth: getShortMonthName(fullMonth),
        year: dayCopy.getFullYear(),
        weekday: fullWeekday,
        shortWeekday: getShortWeekdayName(fullWeekday),
        isToday: dayCopy.toDateString() === new Date().toDateString()
      });
    }
    
    return days;
  };

  const days = generateDays();
  const totalWidth = days.length * DAY_WIDTH_VH; // Общая ширина всех дней в vh

  // Группируем дни по месяцам с учетом коротких названий
  const monthGroups = [];
  let currentMonth = null;
  let monthStart = 0;
  
  days.forEach((day, index) => {
    const monthKey = `${day.month} ${day.year}`;
    if (currentMonth !== monthKey) {
      if (currentMonth !== null) {
        monthGroups.push({
          month: days[monthStart].month,
          shortMonth: days[monthStart].shortMonth,
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
      shortMonth: days[monthStart].shortMonth,
      year: days[monthStart].year,
      start: monthStart,
      end: days.length - 1,
      daysCount: days.length - monthStart
    });
  }

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

  // Рассчитать позицию Y для задачи с учетом строки
  const getTaskTopPosition = (memberId, rowIndex) => {
    // Найти индекс участника в массиве
    const memberIndex = teamMembers.findIndex(member => member.id === memberId);
    if (memberIndex === -1) return TASK_MARGIN_TOP_VH;
    
    // Рассчитать позицию Y для участника (сумма высот предыдущих участников)
    let memberTop = 0;
    for (let i = 0; i < memberIndex; i++) {
      memberTop += getMemberTotalHeight(teamMembers[i].id);
    }
    
    // Добавить отступ для строки внутри участника
    return memberTop + (rowIndex * MEMBER_ROW_HEIGHT_VH) + TASK_MARGIN_TOP_VH;
  };

  if (isLoading) {
    return (
      <div className="gantt-container_gantt_class">
        <div className="gantt-loading_gantt_class">
          <div className="loading-spinner_gantt_class"></div>
          <h3 style={{ color: 'black', margin: '1vh 0', fontSize: '2vh' }}>Загрузка диаграммы Ганта...</h3>
          <p style={{ color: 'rgba(0, 0, 0, 0.8)', fontSize: '1.4vh' }}>
            Подготавливаем визуализацию проекта
          </p>
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
              {teamMembers.map((member, memberIndex) => {
                const memberTasks = distributeTasksToRows[member.id];
                const rowsCount = memberTasks ? memberTasks.rowsCount : 1;
                
                // Вычисляем высоту для этого участника
                const memberHeight = rowsCount * MEMBER_ROW_HEIGHT_VH;
                
                return (
                  <div 
                    key={member.id} 
                    className="member-name-item_gantt_class"
                    style={{ 
                      height: `${memberHeight}vh`,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: rowsCount > 1 ? 'space-between' : 'center'
                    }}
                  >
                    <div className='member-name123'>{member.name}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Диаграмма справа с горизонтальным скроллом */}
          <div className="diagram-column_gantt_class">
            {/* Внутренний контейнер с фиксированной шириной для скролла */}
            <div style={{
              position: 'relative',
              minWidth: `${totalWidth}vh`,
              width: `${totalWidth}vh`,
              height: `${totalHeight}vh`
            }}>
              {/* Заголовки месяцев - теперь показываем сокращенные названия */}
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
                      {monthGroup.shortMonth} {monthGroup.year}
                    </div>
                  </div>
                ))}
              </div>

              {/* Заголовки дней - теперь показываем сокращенные названия дней недели */}
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
                    <div className="day-weekday_gantt_class">{day.shortWeekday}</div>
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
                {/* Рендерим задачи для каждого участника */}
                {teamMembers.map((member) => {
                  const memberTasks = distributeTasksToRows[member.id];
                  if (!memberTasks || !memberTasks.tasks) return null;
                  
                  return memberTasks.tasks.map((task) => {
                    const { left, width } = getTaskPositionAndWidth(task, days);
                    const top = getTaskTopPosition(member.id, task.row || 0);
                    
                    return (
                      <div 
                        key={task.id}
                        className="gantt-task_gantt_class"
                        style={{
                          left: `${left}vh`,
                          width: `${width}vh`,
                          backgroundColor: task.color,
                          height: `${TASK_ROW_HEIGHT_VH}vh`,
                          top: `${top}vh`,
                          minWidth: `${TASK_MIN_WIDTH_VH}vh`,
                          display: 'flex',
                          alignItems: 'center',
                          borderWidth: `${TASK_BORDER_WIDTH_VH}vh`,
                          borderStyle: 'solid',
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                          boxSizing: 'border-box'
                        }}
                        onClick={() => navigate(`/tasks/${task.id}`)}
                        title={`${task.title}\nСтатус: ${task.isCompleted ? 'Завершено' : 'В работе'}`}
                      >
                        {/* Кружок слева - УВЕЛИЧЕННЫЙ с галочкой при статусе completed */}
                        <div className="task-status-circle_gantt_class">
                          {task.isCompleted && (
                            <svg 
                              width="16" 
                              height="16" 
                              viewBox="0 0 24 24" 
                              fill="none"
                              style={{ display: 'block' }}
                            >
                              <path 
                                d="M20 6L9 17L4 12" 
                                stroke="#4ECDC4" 
                                strokeWidth="3" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>
                        
                        <div className="task-content_gantt_class">
                          {width > 10 ? task.title : '●'}
                        </div>
                      </div>
                    );
                  });
                })}

                {/* Рендерим границы строк для каждого участника */}
                {teamMembers.map((member, memberIndex) => {
                  const memberTasks = distributeTasksToRows[member.id];
                  const rowsCount = memberTasks ? memberTasks.rowsCount : 1;
                  
                  // Рассчитать позицию Y для участника
                  let memberTop = 0;
                  for (let i = 0; i < memberIndex; i++) {
                    memberTop += getMemberTotalHeight(teamMembers[i].id);
                  }
                  
                  // Создать строки для участника
                  return Array.from({ length: rowsCount }).map((_, rowIndex) => (
                    <div 
                      key={`member-${member.id}-row-${rowIndex}`}
                      className="member-row_gantt_class"
                      style={{ 
                        top: `${memberTop + (rowIndex * MEMBER_ROW_HEIGHT_VH)}vh`,
                        height: `${MEMBER_ROW_HEIGHT_VH}vh`,
                        minWidth: `${totalWidth}vh`,
                        width: `${totalWidth}vh`
                      }}
                    >
                      {/* Фон строки */}
                      <div className="member-row-background_gantt_class" style={{ 
                        minWidth: `${totalWidth}vh`,
                        width: `${totalWidth}vh`
                      }}>
                        {days.map((day, dayIndex) => (
                          <div 
                            key={`cell-${member.id}-${rowIndex}-${dayIndex}`}
                            className={`day-cell_gantt_class ${day.isToday ? 'today-cell_gantt_class' : ''}`}
                            style={{ 
                              width: `${DAY_WIDTH_VH}vh`,
                              minWidth: `${DAY_WIDTH_VH}vh`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ));
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
              <p>Создайте задачи в проекте, чтобы увидеть их на диаграмме Ганта</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GanttChart;