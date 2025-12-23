const API_CONFIG = {
  BASE_URL: 'https://api.acrelis.ru/',
  ACCESS_TOKEN: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzY2NDg1NjM1LCJpYXQiOjE3NjYzOTkyMzUsImp0aSI6IjJmMTM1ZTUwNDA2MjQ5NDU5MGIzMGE5MjI3ODU3MDIyIiwidXNlcl9pZCI6IjMifQ.CeUrAuhiIW7uvRrOCxb3xzzVcvlL3bZb8YtowrRqr6g',
  CSRF_TOKEN: 'ZvWfFB1bOKo6BawwGWwPwt2GBx1kBzoO'
};

// ЕДИНАЯ функция получения проектов
export async function getProjects(USE_MOCK_DATA) {
  console.log(`🔄 getProjects запущен: USE_MOCK_DATA = ${USE_MOCK_DATA}`);
  
  // Если USE_MOCK_DATA = true, используем моковые данные
  if (USE_MOCK_DATA) {
    console.log('📂 Использую моковые данные');
    
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Загружаем моковые данные
    try {
      const mockModule = await import('../../MockData/projects.js');
      const mockProjects = mockModule.projectsData || [];
      
      console.log(`✅ Загружено ${mockProjects.length} моковых проектов`);
      
      // Форматируем проекты
      const projects = mockProjects.map(project => ({
        id: project.id,
        name: project.name,
        type: project.type || 'other',
        typeLabel: getTypeLabel(project.type),
        status: project.status || 'planning',
        status_display: getStatusDisplay(project.status),
        hours: project.hours || 0,
        price: project.price || "0.00",
        team: project.team || []
      }));
      
      // Генерируем типы проектов
      const projectTypes = generateProjectTypes(projects);
      
      return { projects, projectTypes };
    } catch (error) {
      console.error('❌ Ошибка загрузки моковых данных:', error);
      return getFallbackMockData();
    }
  } 
  // Если USE_MOCK_DATA = false, делаем запрос к API
  else {
    console.log('🌐 Делаю запрос к API');
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}projects/`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'X-CSRFTOKEN': API_CONFIG.CSRF_TOKEN,
          'Authorization': `Bearer ${API_CONFIG.ACCESS_TOKEN}`
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const apiProjects = await response.json();
      console.log(`✅ Получено ${apiProjects.length} проектов из API`);
      
      // Форматируем данные API
      const projects = apiProjects.map(project => ({
        id: project.id,
        name: project.name,
        type: project.type || 'other',
        typeLabel: getTypeLabel(project.type),
        status: 'planning',
        status_display: 'Планирование',
        hours: project.hours || 0,
        price: project.price || "0.00",
        team: (project.performers || []).map(performer => ({
          id: performer.id || 0,
          name: performer.name || 'Исполнитель'
        }))
      }));
      
      // Генерируем типы проектов
      const projectTypes = generateProjectTypes(projects);
      
      return { projects, projectTypes };
      
    } catch (error) {
      console.error('❌ Ошибка API запроса:', error);
      // Fallback на моковые данные при ошибке API
      console.log('🔄 Fallback на моковые данные из-за ошибки API');
      
      await new Promise(resolve => setTimeout(resolve, 300));
      return getFallbackMockData();
    }
  }
}

export async function getProjectById(projectId, USE_MOCK_DATA) {
  console.log(`🔄 getProjectById: ID=${projectId}, USE_MOCK_DATA=${USE_MOCK_DATA}`);
  
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    try {
      const mockModule = await import('../../MockData/projects.js');
      const mockProjects = mockModule.projectsData || [];
      const project = mockProjects.find(p => p.id === projectId);
      
      if (!project) {
        console.log('⚠️ Проект не найден в моковых данных, возвращаю первый проект');
        return mockProjects[0] || getFallbackProject();
      }
      
      return {
        ...project,
        typeLabel: getTypeLabel(project.type),
        files: project.files || [],
        startDate: formatDate(project.startDate),
        deadline: formatDate(project.deadline),
        team: project.team || [],
        ganttTasks: project.ganttTasks || []
      };
    } catch (error) {
      console.error('Ошибка загрузки моковых данных:', error);
      return getFallbackProject();
    }
  } else {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}projects/${projectId}/`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'X-CSRFTOKEN': API_CONFIG.CSRF_TOKEN,
          'Authorization': `Bearer ${API_CONFIG.ACCESS_TOKEN}`
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const project = await response.json();
      console.log(`✅ Получен проект ${projectId} из API`);
      
      return {
        ...project,
        typeLabel: getTypeLabel(project.type),
        files: project.files || [],
        startDate: formatDate(project.startDate),
        deadline: formatDate(project.deadline),
        team: project.performers || [],
        ganttTasks: project.ganttTasks || []
      };
    } catch (error) {
      console.error(`Ошибка загрузки проекта ${projectId}:`, error);
      return await getProjectById(projectId, true);
    }
  }
}

// Функция для получения метки типа проекта
function getTypeLabel(type) {
  const typeMap = {
    'website': 'Веб-сайт',
    'mobile': 'Мобильное приложение',
    'dashboard': 'Дашборд',
    'ecommerce': 'Интернет-магазин',
    'system': 'Система',
    'other': 'Другой'
  };
  return typeMap[type] || 'Проект';
}

// Функция для получения отображаемого статуса
function getStatusDisplay(status) {
  const statusMap = {
    'planning': 'Планирование',
    'in-progress': 'В работе',
    'completed': 'Завершено',
    'tests': 'Тестирование'
  };
  return statusMap[status] || 'Планирование';
}

// Функция для генерации типов проектов
function generateProjectTypes(projects) {
  const types = [
    { id: 'all', label: 'Все проекты', count: projects.length }
  ];
  
  const typeCounts = {};
  projects.forEach(project => {
    typeCounts[project.type] = (typeCounts[project.type] || 0) + 1;
  });
  
  Object.entries(typeCounts).forEach(([type, count]) => {
    types.push({
      id: type,
      label: getTypeLabel(type),
      count: count
    });
  });
  
  return types;
}

// Fallback моковые данные
function getFallbackMockData() {
  const projects = [
    {
      id: 1,
      name: "Тестовый проект",
      type: "other",
      price: "100.00",
      hours: 10,
      team: []
    }
  ];
  
  const projectTypes = [
    { id: 'all', label: 'Все проекты', count: 1 },
    { id: 'other', label: 'Другой', count: 1 }
  ];
  
  return { projects, projectTypes };
}

// Функция форматирования даты
function formatDate(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('ru-RU');
  } catch {
    return '';
  }
}

// Форматирование данных проекта
function formatProjectData(project) {
  return {
    id: project.id,
    name: project.name,
    type: project.type || 'other',
    typeLabel: getTypeLabel(project.type),
    status: project.status || 'planning',
    status_display: project.status_display || getStatusDisplay(project.status),
    price: project.price || "0.00",
    hours: project.hours || 0,
    customer: project.customer || 'Не указан',
    description: project.description || 'Описание проекта',
    created: formatDate(project.created),
    updated: formatDate(project.updated),
    startDate: formatDate(project.startDate),
    deadline: formatDate(project.deadline),
    available: project.available || false,
    
    // Команда проекта
    team: (project.team || project.performers || []).map(member => ({
      id: member.id || 0,
      name: member.name || member.staff_name || 'Исполнитель',
      role: member.role || member.staff_post || 'Участник',
      assigned_at: member.assigned_at || new Date().toISOString()
    })),
    
    // Файлы проекта
    files: (project.files || []).map(file => ({
      id: file.id || 0,
      name: file.name || file.file || 'Файл',
      uploaded_at: file.uploaded_at || new Date().toISOString(),
      size: file.size || '0 KB'
    })),
    
    // История изменений
    changes: (project.logs || project.changes || []).map(log => ({
      id: log.id || 0,
      action: log.content || log.action || 'Изменение',
      date: formatDateTime(log.created || new Date().toISOString()),
      user: log.user || 'Система'
    })),
    
    // Задачи для диаграммы Ганта
    ganttTasks: project.ganttTasks || [
      {
        id: 'task-1',
        name: 'Анализ требований',
        start: '2025-01-01',
        end: '2025-01-05',
        progress: 100,
        status: 'completed',
        assignee: 'Иван И.'
      },
      {
        id: 'task-2',
        name: 'Проектирование',
        start: '2025-01-03',
        end: '2025-01-10',
        progress: 80,
        status: 'in-progress',
        assignee: 'Мария П.'
      }
    ]
  };
}

// Fallback проект
function getFallbackProject() {
  return {
    id: 1,
    name: 'Тестовый проект',
    type: 'other',
    price: '100.00',
    hours: 10,
    customer: 'Тестовый заказчик',
    description: 'Тестовый проект для демонстрации',
    startDate: '2025-01-01',
    deadline: '2025-12-31',
    team: [
      { id: 1, name: 'Иван Иванов', role: 'Разработчик' },
      { id: 2, name: 'Мария Петрова', role: 'Дизайнер' }
    ],
    files: [
      { id: 1, name: 'ТЗ_проекта.pdf', uploaded_at: '2025-01-01T10:00:00Z' },
      { id: 2, name: 'Дизайн_макеты.zip', uploaded_at: '2025-01-02T14:30:00Z' }
    ],
    changes: [
      { id: 1, action: 'Проект создан', date: '01.01.2025 10:00', user: 'Администратор' },
      { id: 2, action: 'Добавлен исполнитель', date: '02.01.2025 09:15', user: 'Менеджер' }
    ]
  };
}

// Функция форматирования даты и времени
function formatDateTime(dateTimeString) {
  if (!dateTimeString) return '';
  try {
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return '';
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  } catch {
    return '';
  }
}

export async function updateProject(projectId, updateData, USE_MOCK_DATA) {
  console.log(`🔄 updateProject: ID=${projectId}, данные:`, updateData);
  
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    console.log('✅ Моковое обновление проекта');
    
    // Получаем текущий проект
    const project = await getProjectById(projectId, true);
    
    // Обновляем данные
    const updatedProject = {
      ...project,
      ...updateData
    };
    
    return updatedProject;
    
  } else {
    console.log(`🌐 Отправка PATCH запроса для проекта ${projectId}`);
    
    try {
      // Создаем FormData
      const formData = new FormData();
      
      // Логируем все что отправляем
      console.log('Данные для отправки:', updateData);
      
      // Добавляем только заполненные поля
      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          // Для числовых полей преобразуем в строку
          if (typeof value === 'number') {
            formData.append(key, value.toString());
          } else {
            formData.append(key, value);
          }
          console.log(`Добавлено поле ${key}: ${value}`);
        }
      });
      
      const response = await fetch(`${API_CONFIG.BASE_URL}projects/${projectId}/`, {
        method: 'PATCH',
        headers: {
          'accept': 'application/json',
          'X-CSRFTOKEN': API_CONFIG.CSRF_TOKEN,
          'Authorization': `Bearer ${API_CONFIG.ACCESS_TOKEN}`
        },
        body: formData
      });

      const responseData = await response.json();
      console.log('Ответ API:', responseData);

      if (!response.ok) {
        console.error('❌ Детали ошибки API:', responseData);
        
        // Проверяем конкретные ошибки
        if (responseData.price) {
          console.error('Ошибка в поле price:', responseData.price);
        }
        if (responseData.deadline) {
          console.error('Ошибка в поле deadline:', responseData.deadline);
        }
        if (responseData.startDate) {
          console.error('Ошибка в поле startDate:', responseData.startDate);
        }
        
        throw new Error(`API Error: ${response.status}`);
      }

      console.log(`✅ Проект ${projectId} обновлен через API`);
      
      return {
        ...responseData,
        typeLabel: getTypeLabel(responseData.type),
        files: responseData.files || [],
        startDate: formatDate(responseData.startDate),
        deadline: formatDate(responseData.deadline),
        team: responseData.performers || [],
        changes: responseData.logs || []
      };
      
    } catch (error) {
      console.error(`❌ Ошибка обновления проекта ${projectId}:`, error);
      throw error;
    }
  }
}

// Добавь в api.js функцию для форматирования даты в ISO
function formatToISO(dateString) {
  if (!dateString) return null;
  
  try {
    // Если дата уже в формате dd.mm.yyyy
    if (dateString.includes('.')) {
      const parts = dateString.split('.');
      if (parts.length === 3) {
        const day = parts[0];
        const month = parts[1];
        const year = parts[2];
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00Z`;
      }
    }
    
    // Пробуем стандартное преобразование
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date.toISOString();
  } catch {
    return null;
  }
}

const handleSaveChanges = async () => {
  if (!project) return;
  
  setIsSaving(true);
  try {
    // СОБИРАЕМ ВСЕ ОБЯЗАТЕЛЬНЫЕ ПОЛЯ
    const updateData = {
      // Обязательные поля по API
      name: project.name || 'Без названия',
      status: project.status || 'draft',
      type: projectType || project.type || 'other',
      customer: customer || project.customer || 'Заказчик не указан',
      deadline: formatDateForAPI(deadline) || formatDateForAPI(project.deadline) || new Date().toISOString().split('T')[0],
      hours: project.hours || 0,
      startDate: formatDateForAPI(startDate) || formatDateForAPI(project.startDate) || new Date().toISOString().split('T')[0],
      
      // Опциональные поля
      price: project.price || "0.00",
      available: project.available !== false
    };
    
    // Обновляем price если он изменился
    if (price !== undefined && price !== project.price) {
      const cleanPrice = price.toString().replace(/[^\d.,]/g, '').replace(',', '.');
      const numPrice = parseFloat(cleanPrice);
      if (!isNaN(numPrice)) {
        updateData.price = numPrice.toFixed(2);
      }
    }
    
    console.log('Отправляемые данные:', updateData);
    
    const updatedProject = await updateProject(project.id, updateData, useMockData);
    setProject(updatedProject);
    
    // Обновляем локальные состояния
    setStartDate(formatDate(updatedProject.startDate) || '');
    setDeadline(formatDate(updatedProject.deadline) || '');
    setProjectType(updatedProject.type || '');
    setPrice(updatedProject.price || '');
    setCustomer(updatedProject.customer || '');
    
    const newChange = {
      id: changes.length + 1,
      action: 'Сохранил изменения проекта',
      date: new Date().toLocaleString('ru-RU', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
    };
    
    setChanges([newChange, ...changes]);
    alert('Изменения сохранены!');
    
  } catch (error) {
    console.error('Ошибка сохранения:', error);
    alert('Ошибка при сохранении изменений');
  } finally {
    setIsSaving(false);
  }
};

// Вспомогательные функции (добавь их в компонент):
const validateProjectType = (type) => {
  const validTypes = ['website', 'bot', 'app', 'miniapp', 'design', 'other'];
  const typeMapping = {
    'веб-сайт': 'website',
    'сайт': 'website',
    'вебсайт': 'website',
    'бот': 'bot',
    'приложение': 'app',
    'мобильное приложение': 'app',
    'мини-приложение': 'miniapp',
    'миниприложение': 'miniapp',
    'дизайн': 'design',
    'другое': 'other',
    'прочее': 'other'
  };
  
  const lowerType = type.toLowerCase();
  
  if (typeMapping[lowerType]) {
    return typeMapping[lowerType];
  }
  
  if (validTypes.includes(lowerType)) {
    return lowerType;
  }
  
  console.warn(`Недопустимый тип проекта: "${type}". Использую "other"`);
  return 'other';
};

const formatDateForAPI = (dateString) => {
  if (!dateString) return new Date().toISOString().split('T')[0];
  
  // Если дата в формате dd.mm.yyyy
  if (dateString.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
    const [day, month, year] = dateString.split('.');
    return `${year}-${month}-${day}`;
  }
  
  // Если дата в формате yyyy-mm-dd
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateString;
  }
  
  // Пробуем преобразовать любую другую дату
  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch (e) {
    console.error('Ошибка форматирования даты:', e);
  }
  
  // Если не удалось преобразовать, возвращаем текущую дату
  return new Date().toISOString().split('T')[0];
};