// Сервис для работы с данными проектов

const CONFIG = {
  API_BASE_URL: '/api',
  MOCK_DELAY: 300
};

// Функция для получения текущего пользователя
export const getCurrentUser = () => {
  // В реальном приложении это должно приходить из контекста/редакса или localStorage
  // Пока используем мокового пользователя для демонстрации
  return {
    id: 1,
    name: 'Иван Иванов',
    email: 'ivan.ivanov@example.com',
    role: 'Разработчик',
    avatar: 'https://via.placeholder.com/40'
  };
};

// Функция для получения ID проекта из URL
export const getProjectIdFromUrl = () => {
  const path = window.location.pathname;
  const match = path.match(/\/project\/(\d+)/);
  return match ? parseInt(match[1]) : null;
};

// Функция для получения типа страницы (gantt, kanban) из URL
export const getPageTypeFromUrl = () => {
  const path = window.location.pathname;
  if (path.includes('/gantt')) return 'gantt';
  if (path.includes('/kanban')) return 'kanban';
  return 'project';
};

// Функция для навигации к проекту
export const navigateToProject = (projectId, pageType = 'project') => {
  let url = `/project/${projectId}`;
  if (pageType === 'gantt') url += '/gantt';
  if (pageType === 'kanban') url += '/kanban';
  window.location.href = url;
};

// Функция для навигации к списку проектов
export const navigateToProjectsList = () => {
  window.location.href = '/projects';
};

// Вспомогательная функция для форматирования даты в формат dd.mm.yyyy
const formatDate = (dateString) => {
  if (!dateString || dateString.trim() === '') return '';
  
  try {
    let date;
    
    // Пытаемся разобрать дату
    if (dateString.includes('-')) {
      // Формат yyyy-mm-dd
      date = new Date(dateString);
    } else if (dateString.includes('.')) {
      // Формат dd.mm.yyyy
      const parts = dateString.split('.');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        if (!isNaN(day) && !isNaN(month) && !isNaN(year) && year.toString().length === 4) {
          date = new Date(year, month, day);
        }
      }
    }
    
    // Если не удалось разобрать, пробуем стандартный парсинг
    if (!date || isNaN(date.getTime())) {
      date = new Date(dateString);
    }
    
    if (isNaN(date.getTime())) return '';
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}.${month}.${year}`;
  } catch (error) {
    console.error('Ошибка форматирования даты:', error, dateString);
    return '';
  }
};

// Вспомогательная функция для получения названия типа проекта
const getTypeLabel = (type) => {
  const typeMap = {
    'website': 'Веб-сайт',
    'mobile': 'Мобильное приложение',
    'dashboard': 'Дашборд',
    'ecommerce': 'Интернет-магазин',
    'system': 'Система'
  };
  return typeMap[type] || 'Проект';
};

// Загружаем моковые данные один раз
let cachedProjectsData = null;

const loadMockData = async () => {
  if (cachedProjectsData) return cachedProjectsData;
  
  try {
    const mockModule = await import('../MockData/projects.js');
    cachedProjectsData = mockModule.projectsData || [];
    return cachedProjectsData;
  } catch (error) {
    console.error('Ошибка загрузки моковых данных:', error);
    return [];
  }
};

// Функция для получения списка проектов
export const getProjectsList = async (useMockData = true) => {
  console.log('🔄 getProjectsList запущен, useMockData:', useMockData);
  
  try {
    if (useMockData) {
      const projects = await loadMockData();
      const types = [
        { id: 'all', label: 'Все проекты', count: projects.length },
        { id: 'website', label: 'Веб-сайт', count: projects.filter(p => p.type === 'website').length },
        { id: 'mobile', label: 'Мобильное приложение', count: projects.filter(p => p.type === 'mobile').length },
        { id: 'dashboard', label: 'Дашборд', count: projects.filter(p => p.type === 'dashboard').length },
        { id: 'ecommerce', label: 'Интернет-магазин', count: projects.filter(p => p.type === 'ecommerce').length },
        { id: 'system', label: 'Система', count: projects.filter(p => p.type === 'system').length }
      ];
      
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, CONFIG.MOCK_DELAY));
      
      // Форматирование данных для ProjectsList
      const formattedProjects = projects.map(project => ({
        id: project.id,
        name: project.name,
        type: project.type || 'website',
        typeLabel: getTypeLabel(project.type),
        status: project.status || 'Планирование',
        hours: project.hours || 0,
        price: project.price || "0.00",
        teamSize: project.team?.length || 0,
        team: project.team?.map(member => ({
          id: member.id,
          name: member.name
        })) || [],
        description: project.description || '',
        createdAt: formatDate(project.createdAt) || formatDate(new Date().toISOString()),
        startDate: formatDate(project.startDate),
        deadline: formatDate(project.deadline),
        customer: project.customer,
        files: project.files,
        progress: project.progress,
        priority: project.priority,
        ganttTasks: project.ganttTasks || []
      }));
      
      return {
        projects: formattedProjects,
        projectTypes: types
      };
      
    } else {
      // Загрузка данных с сервера
      const response = await fetch(`${CONFIG.API_BASE_URL}/projects`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        projects: data.projects?.map(project => ({
          id: project.id,
          name: project.name,
          type: project.type || 'website',
          typeLabel: getTypeLabel(project.type),
          status: project.status || 'Планирование',
          hours: project.hours || 0,
          price: project.price || "0.00",
          teamSize: project.team?.length || 0,
          team: project.team?.map(member => ({
            id: member.id,
            name: member.name
          })) || [],
          description: project.description || '',
          createdAt: formatDate(project.createdAt) || formatDate(new Date().toISOString()),
          startDate: formatDate(project.startDate),
          deadline: formatDate(project.deadline),
          customer: project.customer,
          files: project.files,
          progress: project.progress,
          priority: project.priority,
          ganttTasks: project.ganttTasks || []
        })) || [],
        projectTypes: data.types?.map(type => ({
          id: type.id,
          label: type.label,
          count: type.count || 0
        })) || []
      };
    }
  } catch (error) {
    console.error('❌ Ошибка в getProjectsList:', error);
    
    // Fallback на моковые данные
    try {
      const projects = await loadMockData();
      const types = [
        { id: 'all', label: 'Все проекты', count: projects.length },
        { id: 'website', label: 'Веб-сайт', count: projects.filter(p => p.type === 'website').length },
        { id: 'mobile', label: 'Мобильное приложение', count: projects.filter(p => p.type === 'mobile').length },
        { id: 'dashboard', label: 'Дашборд', count: projects.filter(p => p.type === 'dashboard').length },
        { id: 'ecommerce', label: 'Интернет-магазин', count: projects.filter(p => p.type === 'ecommerce').length },
        { id: 'system', label: 'Система', count: projects.filter(p => p.type === 'system').length }
      ];
      
      return {
        projects: projects.map(project => ({
          id: project.id,
          name: project.name,
          type: project.type || 'website',
          typeLabel: getTypeLabel(project.type),
          status: project.status || 'Планирование',
          hours: project.hours || 0,
          price: project.price || "0.00",
          teamSize: project.team?.length || 0,
          team: project.team?.map(member => ({
            id: member.id,
            name: member.name
          })) || [],
          description: project.description || '',
          createdAt: formatDate(project.createdAt) || formatDate(new Date().toISOString()),
          startDate: formatDate(project.startDate),
          deadline: formatDate(project.deadline),
          customer: project.customer,
          files: project.files,
          progress: project.progress,
          priority: project.priority,
          ganttTasks: project.ganttTasks || []
        })),
        projectTypes: types
      };
    } catch (mockError) {
      console.error('❌ Ошибка загрузки моковых данных:', mockError);
      return { projects: [], projectTypes: [] };
    }
  }
};

// Функция для получения данных конкретного проекта (для ProjectCard, GanttChart, KanbanTasks)
export const getProjectById = async (projectId, useMockData = true) => {
  console.log('🔄 getProjectById запущен, ID:', projectId);
  
  try {
    if (useMockData) {
      const projects = await loadMockData();
      const project = projects.find(p => p.id === projectId);
      
      if (!project) {
        throw new Error(`Проект с ID ${projectId} не найден`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return {
        ...project,
        typeLabel: getTypeLabel(project.type),
        files: project.files || [],
        startDate: formatDate(project.startDate),
        deadline: formatDate(project.deadline),
        createdAt: formatDate(project.createdAt),
        ganttTasks: project.ganttTasks || []
      };
      
    } else {
      const response = await fetch(`${CONFIG.API_BASE_URL}/projects/${projectId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        ...data,
        typeLabel: getTypeLabel(data.type),
        startDate: formatDate(data.startDate),
        deadline: formatDate(data.deadline),
        createdAt: formatDate(data.createdAt),
        ganttTasks: data.ganttTasks || []
      };
    }
  } catch (error) {
    console.error('❌ Ошибка в getProjectById:', error);
    
    // Fallback
    try {
      const projects = await loadMockData();
      const project = projects.find(p => p.id === projectId) || projects[0];
      
      if (!project) {
        return null;
      }
      
      return {
        ...project,
        typeLabel: getTypeLabel(project.type),
        files: project.files || [],
        startDate: formatDate(project.startDate),
        deadline: formatDate(project.deadline),
        createdAt: formatDate(project.createdAt),
        ganttTasks: project.ganttTasks || []
      };
      
    } catch (mockError) {
      console.error('❌ Ошибка загрузки моковых данных:', mockError);
      return null;
    }
  }
};

// Функция для получения данных проекта по URL
export const getProjectFromUrl = async (useMockData = true) => {
  const projectId = getProjectIdFromUrl();
  if (!projectId) return null;
  
  return await getProjectById(projectId, useMockData);
};

// Функция для получения задач текущего пользователя
export const getMyTasks = async (userId, useMockData = true) => {
  console.log('🔄 getMyTasks запущен, userId:', userId);
  
  try {
    const projects = await loadMockData();
    
    await new Promise(resolve => setTimeout(resolve, CONFIG.MOCK_DELAY));
    
    const userTasks = [];
    
    projects.forEach(project => {
      if (project.ganttTasks) {
        project.ganttTasks.forEach(task => {
          if (task.assignedTo?.includes(userId)) {
            userTasks.push({
              id: task.id,
              projectId: project.id,
              projectName: project.name,
              projectType: project.type,
              projectTypeLabel: getTypeLabel(project.type),
              projectData: project, // Добавляем полные данные проекта
              taskName: task.name,
              description: task.description || '',
              status: task.status,
              progress: task.progress || 0,
              startDate: formatDate(task.start),
              deadline: formatDate(task.end),
              priority: project.priority,
              assignees: project.team?.filter(member => 
                task.assignedTo?.includes(member.id)
              ).map(member => member.name) || []
            });
          }
        });
      }
    });
    
    console.log(`✅ Найдено ${userTasks.length} задач для пользователя ${userId}`);
    return userTasks;
    
  } catch (error) {
    console.error('❌ Ошибка в getMyTasks:', error);
    return [];
  }
};

// Опционально: функция для получения всех пользователей (для выпадающих списков и т.д.)
export const getAllUsers = () => {
  // Моковые данные пользователей
  return [
    { id: 1, name: 'Иван Иванов', email: 'ivan.ivanov@example.com', role: 'Разработчик' },
    { id: 2, name: 'Мария Петрова', email: 'maria.petrova@example.com', role: 'Дизайнер' },
    { id: 3, name: 'Алексей Сидоров', email: 'alexey.sidorov@example.com', role: 'Project Manager' },
    { id: 4, name: 'Елена Кузнецова', email: 'elena.kuznetsova@example.com', role: 'Тестировщик' },
    { id: 5, name: 'Дмитрий Васильев', email: 'dmitry.vasilyev@example.com', role: 'Аналитик' }
  ];
};