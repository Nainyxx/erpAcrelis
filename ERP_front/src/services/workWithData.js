// Сервис для работы с данными проектов
// Централизованная загрузка данных из API или моковых данных

const CONFIG = {
  API_BASE_URL: '/api',
  MOCK_DELAY: 300
};

// Функция для получения списка проектов
export const getProjectsList = async (useMockData = true) => {
  try {
    if (useMockData) {
      // Загружаем моковые данные
      const mockModule = await import('../MockData/projects.js');
      const projects = mockModule.projectsData || [];
      const types = mockModule.projectTypes || [];
      
      await new Promise(resolve => setTimeout(resolve, CONFIG.MOCK_DELAY));
      
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
          createdAt: project.createdAt || new Date().toISOString()
        })),
        projectTypes: [
          { id: 'all', label: 'Все типы', count: projects.length },
          ...types.map(type => ({
            id: type.id,
            label: type.label,
            count: type.count || 0
          }))
        ]
      };
    } else {
      // Загружаем данные с сервера
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
          createdAt: project.createdAt || new Date().toISOString()
        })) || [],
        projectTypes: data.types?.map(type => ({
          id: type.id,
          label: type.label,
          count: type.count || 0
        })) || []
      };
    }
  } catch (error) {
    console.error('Ошибка в getProjectsList:', error);
    
    // Fallback на моковые данные при ошибке
    try {
      const mockModule = await import('../MockData/projects.js');
      const projects = mockModule.projectsData || [];
      const types = mockModule.projectTypes || [];
      
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
          createdAt: project.createdAt || new Date().toISOString()
        })),
        projectTypes: [
          { id: 'all', label: 'Все типы', count: projects.length },
          ...types.map(type => ({
            id: type.id,
            label: type.label,
            count: type.count || 0
          }))
        ]
      };
    } catch (mockError) {
      console.error('Ошибка загрузки моковых данных:', mockError);
      return { projects: [], projectTypes: [] };
    }
  }
};

// Функция для получения данных конкретного проекта (для ProjectCard)
export const getProjectById = async (projectId, useMockData = true) => {
  console.log('getProjectById called for:', projectId);
  return null;
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