// ERP_front/src/services/api/api.js
const API_CONFIG = {
  BASE_URL: 'https://api.acrelis.ru/',
  ACCESS_TOKEN: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzY2NTk0ODUyLCJpYXQiOjE3NjY1MDg0NTIsImp0aSI6IjRmMjIyM2U2ZWM3NzRlNmNhNTQ4MjIzNWJiOWZiZjQxIiwidXNlcl9pZCI6IjMifQ.xcN0erEQCxOANHdW-a5NgLUhbV81K5j-B4z_N5noPQs",
  CSRF_TOKEN: 'ZvWfFB1bOKo6BawwGWwPwt2GBx1kBzoO'
};

// Маппинг типов проектов (русский ↔ английский)
const PROJECT_TYPE_MAP = {
  // Английский → русский (для отображения)
  'website': 'Сайт',
  'bot': 'Бот', 
  'app': 'Приложение',
  'miniapp': 'Мини-приложение',
  'design': 'Дизайн',
  'other': 'Другое',
  
  // Русский → английский (для API)
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
  'прочее': 'other',
  '': 'other'  // Пустое значение
};

// 1. Функция получения списка проектов
export async function getProjects(USE_MOCK_DATA) {
  console.log(`🔄 getProjects: USE_MOCK_DATA = ${USE_MOCK_DATA}`);
  
  if (USE_MOCK_DATA) {
    const mockModule = await import('../../MockData/projects.js');
    return formatMockProjects(mockModule.projectsData || []);
  }
  
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}projects/`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.ACCESS_TOKEN}`
      }
    });

    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    
    const apiProjects = await response.json();
    
    const projects = apiProjects.map(project => ({
      id: project.id,
      name: project.name,
      type: project.type || 'other',
      typeLabel: PROJECT_TYPE_MAP[project.type] || 'Другое',
      status: project.status || 'draft',
      price: project.price || "0.00",
      hours: project.hours || 0,
      customer: project.customer || 'Не указан',
      // Форматируем даты сразу
      startDate: formatDateForDisplay(project.start_date || project.created),
      deadline: formatDateForDisplay(project.deadline),
      team: project.performers || []
    }));
    
    const projectTypes = generateProjectTypes(projects);
    console.log(projects)
    return { projects, projectTypes };
    
  } catch (error) {
    console.error('❌ Ошибка API:', error);
    throw error;
  }
}

// 2. Функция получения проекта по ID
export async function getProjectById(projectId, USE_MOCK_DATA) {
  if (USE_MOCK_DATA) {
    const mockModule = await import('../../MockData/projects.js');
    const mockProjects = mockModule.projectsData || [];
    const project = mockProjects.find(p => p.id === projectId) || getFallbackProject();
    return formatProjectData(project);
  }
  
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}projects/${projectId}/`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.ACCESS_TOKEN}`
      }
    });

    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    
    const project = await response.json();
    return formatProjectData(project);
    
  } catch (error) {
    console.error(`❌ Ошибка загрузки проекта ${projectId}:`, error);
    throw error;
  }
}

export async function updateProject(projectId, updateData, USE_MOCK_DATA) {
  console.log(`🔄 updateProject: ID=${projectId}, данные:`, updateData);
  
  if (USE_MOCK_DATA) {
    const project = await getProjectById(projectId, true);
    const updated = { ...project, ...updateData };
    return formatProjectData(updated);
  }
  
  const formData = new FormData();
  
  // 1️⃣ СТАРТОВАЯ ДАТА (start_date → created)
  if (updateData.start_date) {
    const apiDate = convertToAPIDate(updateData.start_date);
    if (apiDate) {
      formData.append('start_date', apiDate); // или 'created' если не работает
      console.log(`Дата начала: "${updateData.start_date}" → "${apiDate}"`);
    }
  }
  
  // 2️⃣ ДЕДЛАЙН (дедлайн проекта)
  if (updateData.deadline) {
    const apiDate = convertToAPIDate(updateData.deadline);
    if (apiDate) {
      formData.append('deadline', apiDate);
      console.log(`Дедлайн: "${updateData.deadline}" → "${apiDate}"`);
    }
  }
  
  // 3️⃣ ТИП ПРОЕКТА
  if (updateData.type) {
    const inputType = updateData.type.toLowerCase().trim();
    const apiType = PROJECT_TYPE_MAP[inputType] || inputType;
    formData.append('type', apiType);
    console.log(`Тип: "${updateData.type}" → "${apiType}"`);
  }
  
  // 4️⃣ ЦЕНА
  if (updateData.price !== undefined) {
    const cleanPrice = cleanPriceForAPI(updateData.price);
    formData.append('price', cleanPrice);
  }
  
  // 5️⃣ ЗАКАЗЧИК
  if (updateData.customer !== undefined) {
    formData.append('customer', updateData.customer);
  }
  
  // ❌ НЕ ДОБАВЛЯЙТЕ ЭТИ ПОЛЯ! они перезаписывают текущие значения:
  // - hours (оставьте как есть в БД)
  // - status (оставьте текущий статус)
  // - name (не меняйте если не нужно)
  
  console.log('Отправляемые поля FormData:');
  for (let [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`);
  }
  
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}projects/${projectId}/`, {
      method: 'PATCH',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.ACCESS_TOKEN}`,
        'X-CSRFTOKEN': API_CONFIG.CSRF_TOKEN
      },
      body: formData
    });

    console.log('Статус ответа:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Ошибка API:', errorText);
      throw new Error(`API Error: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('✅ Ответ API:', responseData);
    
    return formatProjectData(responseData);
    
  } catch (error) {
    console.error(`❌ Ошибка обновления:`, error);
    throw error;
  }
}

function formatProjectData(project) {
  return {
    id: project.id,
    name: project.name,
    // Для API: английский ключ
    type: project.type || 'other',
    // Для отображения: русское название
    typeLabel: PROJECT_TYPE_MAP[project.type] || 'Другое',
    type_display: project.type_display || PROJECT_TYPE_MAP[project.type] || 'Другое',
    
    status: project.status || 'draft',
    status_display: project.status_display || getStatusDisplay(project.status),
    price: project.price || "0.00",
    hours: project.hours || 0,
    customer: project.customer || 'Не указан',
    
    // Даты в правильном формате
    startDate: project.start_date || project.created || '',
    deadline: project.deadline || '',
    
    // Для отображения в компоненте
    startDateFormatted: formatDateForDisplay(project.start_date || project.created),
    deadlineFormatted: formatDateForDisplay(project.deadline),
    
    team: (project.performers || []).map(p => ({
      id: p.id,
      name: p.staff_name || 'Исполнитель',
      role: p.staff_post || 'Участник'
    })),
    
    files: (project.files || []).map(file => ({
      id: file.id,
      name: file.file ? file.file.split('/').pop() : 'Файл', // Извлекаем имя из URL
      file: file.file,
      uploaded_at: file.uploaded_at,
      size: file.size || 0
    })),
    
    ganttTasks: []
  };
}

function convertToAPIDate(dateString) {
  if (!dateString) return null;
  
  // Уже в формате API
  if (dateString.includes('T') && dateString.includes('+')) {
    return dateString;
  }
  
  // Из dd.mm.yyyy
  if (dateString.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
    const [day, month, year] = dateString.split('.');
    return `${year}-${month}-${day}T00:00:00+03:00`;
  }
  
  // Из yyyy-mm-dd
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateString + 'T00:00:00+03:00';
  }
  
  console.warn(`Неизвестный формат даты: ${dateString}`);
  return dateString; // Отправляем как есть
}

// Форматирование даты для отображения (любой формат → dd.mm.yyyy)
export function formatDateForDisplay(dateString) {
  if (!dateString) return '';
  
  // Уже в правильном формате
  if (dateString.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
    return dateString;
  }
  
  // Из API формата: 2025-12-11T16:15:07.359176+03:00
  if (dateString.includes('T')) {
    try {
      const datePart = dateString.split('T')[0]; // "2025-12-11"
      const [year, month, day] = datePart.split('-');
      return `${day}.${month}.${year}`;
    } catch (e) {
      return dateString;
    }
  }
  
  return dateString;
}

function formatMockProjects(mockProjects) {
  const projects = mockProjects.map(project => ({
    id: project.id,
    name: project.name,
    type: project.type || 'other',
    typeLabel: PROJECT_TYPE_MAP[project.type] || 'Другое',
    status: project.status || 'draft',
    price: project.price || "0.00",
    hours: project.hours || 0,
    customer: project.customer || 'Не указан',
    deadline: project.deadline || '',
    startDate: project.startDate || project.created || '',
    team: project.team || []
  }));
  
  const projectTypes = generateProjectTypes(projects);
  return { projects, projectTypes };
}

function generateProjectTypes(projects) {
  const types = [{ id: 'all', label: 'Все проекты', count: projects.length }];
  const typeCounts = {};
  
  projects.forEach(project => {
    typeCounts[project.type] = (typeCounts[project.type] || 0) + 1;
  });
  
  Object.entries(typeCounts).forEach(([type, count]) => {
    types.push({
      id: type,
      label: PROJECT_TYPE_MAP[type] || 'Другое',
      count: count
    });
  });
  
  return types;
}

function cleanPriceForAPI(price) {
  if (typeof price === 'number') return price.toFixed(2);
  const clean = price.toString()
    .replace(/[^\d.,]/g, '')
    .replace(',', '.');
  const num = parseFloat(clean);
  return isNaN(num) ? "0.00" : num.toFixed(2);
}

function formatDateTime(dateTimeString) {
  if (!dateTimeString) return '';
  try {
    const date = new Date(dateTimeString);
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

function getStatusDisplay(status) {
  const statusMap = {
    'draft': 'Черновик',
    'active': 'Активный',
    'paused': 'Приостановлен',
    'tests': 'Тестирование',
    'completed': 'Завершен',
    'cancelled': 'Отменен'
  };
  return statusMap[status] || 'Черновик';
}

function getFallbackProject() {
  return {
    id: 1,
    name: 'Тестовый проект',
    type: 'other',
    typeLabel: 'Другое',
    status: 'draft',
    price: '0.00',
    hours: 0,
    customer: 'Тестовый заказчик',
    created: new Date().toISOString(),
    team: [],
    files: [],
    changes: []
  };
}

// В api.js добавьте эту функцию:
export async function createProject(projectData, USE_MOCK_DATA) {
  console.log('🔄 createProject: создаю проект:', projectData);
  
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Генерируем моковый ID
    const mockId = Math.floor(Math.random() * 1000) + 100;
    
    const mockProject = {
      id: mockId,
      name: projectData.name || 'Новый проект',
      type: projectData.type || 'website',
      status: projectData.status || 'draft',
      price: projectData.price || "0.00",
      hours: projectData.hours || 0,
      customer: projectData.customer || 'Не указан',
      deadline: projectData.deadline || new Date().toISOString(),
      created: new Date().toISOString(),
      available: projectData.available || false,
      team: [],
      files: [],
      changes: []
    };
    
    return formatProjectData(mockProject);
  }
  
  // РЕАЛЬНЫЙ API ЗАПРОС
  const formData = new FormData();
  
  // ОБЯЗАТЕЛЬНЫЕ ПОЛЯ (по документации)
  formData.append('name', projectData.name);
  formData.append('type', projectData.type);
  formData.append('status', projectData.status);
  formData.append('customer', projectData.customer);
  formData.append('deadline', projectData.deadline + 'T00:00:00+03:00'); // Формат API
  formData.append('hours', projectData.hours.toString());
  
  // НЕОБЯЗАТЕЛЬНЫЕ ПОЛЯ
  if (projectData.price) {
    formData.append('price', cleanPriceForAPI(projectData.price));
  }
  
  if (projectData.available !== undefined) {
    formData.append('available', projectData.available.toString());
  }
  
  console.log('Отправляемые данные для создания:');
  for (let [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`);
  }
  
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}projects/`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.ACCESS_TOKEN}`,
        'X-CSRFTOKEN': API_CONFIG.CSRF_TOKEN
      },
      body: formData
    });

    console.log('Статус ответа:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Ошибка API при создании:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    console.log('✅ Проект создан через API:', responseData);
    
    return formatProjectData(responseData);
    
  } catch (error) {
    console.error('❌ Ошибка создания проекта:', error);
    throw error;
  }
}

// В api.js добавьте функцию uploadFileToProject:

export async function uploadFileToProject(projectId, file, USE_MOCK_DATA) {
  console.log(`📤 uploadFileToProject: проект ${projectId}, файл ${file.name}`);
  
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockFile = {
      id: Math.floor(Math.random() * 1000),
      name: file.name,
      file: `https://example.com/files/${file.name}`,
      uploaded_at: new Date().toISOString(),
      size: file.size
    };
    
    console.log('✅ Моковая загрузка файла:', mockFile);
    return mockFile;
  }
  
  const formData = new FormData();
  formData.append('file', file);
  
  console.log('Отправляю файл на сервер:', file.name, file.size);
  
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}projects/${projectId}/files/`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.ACCESS_TOKEN}`,
        'X-CSRFTOKEN': API_CONFIG.CSRF_TOKEN
      },
      body: formData
    });

    console.log('Статус ответа загрузки файла:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Ошибка загрузки файла:', errorText);
      throw new Error(`Ошибка загрузки файла: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('✅ Файл загружен:', responseData);
    
    return {
      id: responseData.id,
      name: file.name,
      file: responseData.file,
      uploaded_at: responseData.uploaded_at,
      size: file.size
    };
    
  } catch (error) {
    console.error('❌ Ошибка загрузки:', error);
    throw error;
  }
}

// В api.js добавьте:

export async function addPerformerToProject(projectId, staffId, USE_MOCK_DATA) {
  console.log(`🔄 addPerformerToProject: проект ${projectId}, сотрудник ${staffId}`);
  
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const mockPerformer = {
      id: Math.floor(Math.random() * 1000),
      staff: staffId,
      staff_name: 'Иван Иванов',
      staff_post: 'Разработчик',
      assigned_at: new Date().toISOString()
    };
    
    console.log('✅ Моковый исполнитель добавлен:', mockPerformer);
    return mockPerformer;
  }
  
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}projects/${projectId}/performers/`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.ACCESS_TOKEN}`,
        'X-CSRFTOKEN': API_CONFIG.CSRF_TOKEN
      },
      body: JSON.stringify({
        project: parseInt(projectId),
        staff: parseInt(staffId)
      })
    });

    console.log('Статус ответа:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Ошибка добавления исполнителя:', errorText);
      throw new Error(`Ошибка: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('✅ Исполнитель добавлен:', responseData);
    
    return responseData;
    
  } catch (error) {
    console.error('❌ Ошибка добавления:', error);
    throw error;
  }
}

// Функция для получения логов проекта
export async function getProjectLogs(projectId, USE_MOCK_DATA) {
  console.log(`🔄 getProjectLogs: проект ${projectId}`);

  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const mockLogs = [
      {
        id: 1,
        content: "Проект создан",
        created: "2025-12-23T10:00:00+03:00"
      },
      {
        id: 2, 
        content: "Добавлен исполнитель",
        created: "2025-12-23T11:30:00+03:00"
      }
    ];
    
    // Форматируем как ожидает ProjectCard
    return mockLogs.map(log => ({
      id: log.id,
      action: log.content,
      date: formatDateTime(log.created)
    }));
  }
  
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}projects/${projectId}/logs/?page=1`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.ACCESS_TOKEN}`,
        'X-CSRFTOKEN': API_CONFIG.CSRF_TOKEN
      }
    });

    console.log('Статус ответа логов:', response.status);
    
    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status}`);
    }

    const logsData = await response.json();
    console.log('✅ Логи получены:', logsData);
    
    // Преобразуем формат API в формат для компонента
    return logsData.map(log => ({
      id: log.id,
      action: log.content,
      date: formatDateTime(log.created)
    }));
    
  } catch (error) {
    console.error('❌ Ошибка загрузки логов:', error);
    return []; // Возвращаем пустой массив при ошибке
  }
}

// Функция для получения отделов сотрудников
// Функция для получения отделов сотрудников (исправленная)
export async function getStaffDepartments(USE_MOCK_DATA) {
  console.log(`🔄 getStaffDepartments: USE_MOCK_DATA = ${USE_MOCK_DATA}`);

  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const mockDepartments = [
      {
        id: 1,
        name: 'Отдел разработки',
        director: 1,
        director_name: 'Иван Иванов',
        employees_count: '15'
      },
      {
        id: 2,
        name: 'Отдел дизайна',
        director: 2,
        director_name: 'Мария Петрова',
        employees_count: '8'
      }
    ];
    
    console.log('✅ Моковые отделы:', mockDepartments);
    return mockDepartments;
  }
  
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}staff/departments/`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.ACCESS_TOKEN}`,
        'X-CSRFTOKEN': API_CONFIG.CSRF_TOKEN
      }
    });

    console.log('Статус ответа отделов:', response.status);
    
    if (!response.ok) {
      console.warn('⚠️ Не удалось загрузить отделы, возвращаю пустой массив');
      return [];
    }

    const departmentsData = await response.json();
    console.log('✅ Отделы получены:', departmentsData);
    
    return departmentsData;
    
  } catch (error) {
    console.error('❌ Ошибка загрузки отделов:', error);
    return []; // Возвращаем пустой массив при ошибке
  }
}

// Функция для получения списка сотрудников
export async function getStaffList(USE_MOCK_DATA) {
  console.log(`🔄 getStaffList: USE_MOCK_DATA = ${USE_MOCK_DATA}`);

  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const mockEmployees = [
      {
        id: 1,
        name: 'Иван Иванов',
        position: 'Руководитель отдела разработки',
        department: 'development',
        departmentLabel: 'Отдел разработки',
        email: 'ivan@company.com',
        phone: '+7 (999) 123-45-67'
      },
      {
        id: 2,
        name: 'Мария Петрова',
        position: 'Дизайнер',
        department: 'design',
        departmentLabel: 'Отдел дизайна',
        email: 'maria@company.com',
        phone: '+7 (999) 234-56-78'
      },
      {
        id: 3,
        name: 'Алексей Сидоров',
        position: 'Маркетолог',
        department: 'marketing',
        departmentLabel: 'Отдел маркетинга',
        email: 'alexey@company.com',
        phone: '+7 (999) 345-67-89'
      }
    ];
    
    const mockDepartments = [
      { id: 'all', label: 'Все отделы', count: mockEmployees.length },
      { id: 'development', label: 'Отдел разработки', count: 1 },
      { id: 'design', label: 'Отдел дизайна', count: 1 },
      { id: 'marketing', label: 'Отдел маркетинга', count: 1 }
    ];
    
    console.log('✅ Моковые сотрудники:', mockEmployees);
    return { employees: mockEmployees, departments: mockDepartments };
  }
  
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}staff/staff/`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.ACCESS_TOKEN}`,
        'X-CSRFTOKEN': API_CONFIG.CSRF_TOKEN
      }
    });

    console.log('Статус ответа сотрудников:', response.status);
    
    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status}`);
    }

    const staffData = await response.json();
    console.log('✅ Сотрудники получены:', staffData);
    
    // Преобразуем данные API в нужный формат
    const employees = staffData.map(staff => ({
      id: staff.id,
      name: staff.name,
      position: staff.post || staff.department_name || 'Сотрудник',
      department: staff.department?.toString() || '0',
      departmentLabel: staff.department_name || 'Не указан',
      email: staff.email,
      phone: staff.phone,
      birthday: staff.birthday,
      is_active: staff.is_active
    }));
    
    // Пока возвращаем только сотрудников, отделы загружаем отдельно
    return { 
      employees: employees, 
      departments: [{ id: 'all', label: 'Все отделы', count: employees.length }] 
    };
    
  } catch (error) {
    console.error('❌ Ошибка загрузки сотрудников:', error);
    return { employees: [], departments: [] };
  }
}

// Функция для получения детальной информации о сотруднике
export async function getEmployeeById(employeeId, USE_MOCK_DATA) {
  console.log(`🔄 getEmployeeById: ID=${employeeId}, USE_MOCK_DATA=${USE_MOCK_DATA}`);

  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const mockEmployee = {
      id: parseInt(employeeId),
      name: 'Иван Иванов',
      position: 'Руководитель отдела разработки',
      department: 'development',
      departmentLabel: 'Отдел разработки',
      email: 'ivan@company.com',
      phone: '+7 (999) 123-45-67',
      birthday: '1990-01-01',
      is_active: true,
      created: '2024-01-01T10:00:00+03:00',
      telegram: '@ivanov'
    };
    
    console.log('✅ Моковый сотрудник:', mockEmployee);
    return mockEmployee;
  }
  
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}staff/staff/${employeeId}/`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.ACCESS_TOKEN}`,
        'X-CSRFTOKEN': API_CONFIG.CSRF_TOKEN
      }
    });

    console.log('Статус ответа сотрудника:', response.status);
    
    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status}`);
    }

    const staffData = await response.json();
    console.log('✅ Сотрудник получен:', staffData);
    
    // Преобразуем в формат, который ожидает EmployeeCard
    console.log(staffData)
    return {
      id: staffData.id,
      name: staffData.name,
      position: staffData.post,
      department: staffData.department?.toString() || '0',
      departmentLabel: staffData.department_name || 'Не указан',
      email: staffData.email,
      phone: staffData.phone,
      birthday: staffData.birthday,
      is_active: staffData.is_active,
      created: staffData.created,
      telegram: staffData.telegram || '@acrelis'
    };
    
  } catch (error) {
    console.error('❌ Ошибка загрузки сотрудника:', error);
    throw error;
  }
}

// Добавьте в ваш api.js файл
export async function getTasks(USE_MOCK_DATA, page = 1) {
  console.log(`🔄 getTasks: USE_MOCK_DATA = ${USE_MOCK_DATA}, page = ${page}`);

  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const mockTasks = [
      {
        id: 1,
        name: 'Разработка главной страницы',
        status: 'in-progress',
        status_display: 'В работе',
        project: 1,
        project_name: 'Веб-сайт компании',
        director: 1,
        director_name: 'Иван Иванов',
        performer: 4,
        performer_name: 'Лутфуллин Амир',
        deadline: '2025-12-25T23:59:59+03:00',
        is_overdue: false,
        created: '2025-12-20T10:00:00+03:00',
        hours: 8
      },
      {
        id: 2,
        name: 'Дизайн мобильного приложения',
        status: 'planned',
        status_display: 'Запланировано',
        project: 2,
        project_name: 'Мобильное приложение',
        director: 2,
        director_name: 'Мария Петрова',
        performer: 4,
        performer_name: 'Лутфуллин Амир',
        deadline: '2025-12-28T18:00:00+03:00',
        is_overdue: false,
        created: '2025-12-22T14:30:00+03:00',
        hours: 16
      },
      {
        id: 3,
        name: 'Тестирование API',
        status: 'completed',
        status_display: 'Завершено',
        project: 1,
        project_name: 'Веб-сайт компании',
        director: 1,
        director_name: 'Иван Иванов',
        performer: 4,
        performer_name: 'Лутфуллин Амир',
        deadline: '2025-12-20T17:00:00+03:00',
        is_overdue: false,
        created: '2025-12-18T09:15:00+03:00',
        hours: 4
      }
    ];
    
    console.log('✅ Моковые задачи:', mockTasks);
    return mockTasks;
  }
  
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}tasks/?page=${page}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.ACCESS_TOKEN}`,
        'X-CSRFTOKEN': API_CONFIG.CSRF_TOKEN
      }
    });

    console.log('Статус ответа задач:', response.status);
    
    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status}`);
    }

    const tasksData = await response.json();
    console.log('✅ Задачи получены:', tasksData);
    
    return tasksData;
    
  } catch (error) {
    console.error('❌ Ошибка загрузки задач:', error);
    return []; // Возвращаем пустой массив при ошибке
  }
}

// Функция для получения текущего пользователя
export function getCurrentUser() {
  // Из ваших логов видно, что пользователь с ID=4 - это Лутфуллин Амир
  // Можно получить из токена или хранить в localStorage
  const token = API_CONFIG.ACCESS_TOKEN;
  if (token) {
    try {
      // Декодируем JWT токен, чтобы получить user_id
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.user_id || 4, // Из токена: "user_id": "3"
        name: 'Текущий пользователь'
      };
    } catch (error) {
      console.error('Ошибка декодирования токена:', error);
      return {
        id: 4, // Запасной вариант - ID Лутфуллина Амира
        name: 'Лутфуллин Амир Айратович'
      };
    }
  }
  
  // Если токена нет, возвращаем запасной вариант
  return {
    id: 4,
    name: 'Лутфуллин Амир Айратович'
  };
}

// Функция для получения задач конкретного исполнителя
export async function getTasksByPerformer(performerId, USE_MOCK_DATA, page = 1) {
  console.log(`🔄 getTasksByPerformer: performerId = ${performerId}, USE_MOCK_DATA = ${USE_MOCK_DATA}`);

  if (USE_MOCK_DATA) {
    const allTasks = await getTasks(true, page);
    return allTasks; // Возвращаем ВСЕ задачи для моков
  }
  
  try {
    // Получаем ВСЕ задачи, игнорируем performerId
    const allTasks = await getTasks(false, page);
    console.log('✅ Все задачи (без фильтрации):', allTasks);
    return allTasks;
    
  } catch (error) {
    console.error('❌ Ошибка загрузки задач:', error);
    return [];
  }
}

export async function createTask(taskData, USE_MOCK_DATA) {
  console.log('🔄 createTask: создаю задачу:', taskData);
  
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const mockTask = {
      id: Math.floor(Math.random() * 1000) + 100,
      name: taskData.name,
      description: taskData.description || '',
      status: taskData.status || 'new',
      status_display: taskData.status === 'completed' ? 'Завершено' : 
                     taskData.status === 'active' ? 'В работе' : 'Новое',
      project: taskData.project || null,
      project_name: taskData.project_name || null,
      director: taskData.director || null,
      director_name: taskData.director_name || null,
      performer: taskData.performer || null,
      performer_name: taskData.performer_name || null,
      deadline: taskData.deadline + 'T00:00:00+03:00',
      hours: taskData.hours || 0,
      is_overdue: false,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      files: [],
      comments: []
    };
    
    console.log('✅ Моковая задача создана:', mockTask);
    return mockTask;
  }
  
  const formData = new FormData();
  
  // ОБЯЗАТЕЛЬНЫЕ ПОЛЯ
  formData.append('name', taskData.name);
  formData.append('description', taskData.description || taskData.name);
  
  // Преобразуем дату в правильный формат для API
  let deadlineFormatted = taskData.deadline;
  
  // Если дата в формате dd.mm.yyyy - преобразуем
  if (taskData.deadline && taskData.deadline.includes('.')) {
    const [day, month, year] = taskData.deadline.split('.');
    deadlineFormatted = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00+03:00`;
  } else if (taskData.deadline && !taskData.deadline.includes('T')) {
    // Если дата в формате yyyy-mm-dd - добавляем время
    deadlineFormatted = taskData.deadline + 'T00:00:00+03:00';
  }
  
  formData.append('deadline', deadlineFormatted);
  console.log('📅 Дедлайн для API:', deadlineFormatted);
  
  // НЕОБЯЗАТЕЛЬНЫЕ ПОЛЯ
  if (taskData.project) {
    formData.append('project', taskData.project.toString());
  }
  
  if (taskData.status) {
    formData.append('status', taskData.status);
  }
  
  if (taskData.performer) {
    formData.append('performer', taskData.performer.toString());
  }
  
  if (taskData.director) {
    formData.append('director', taskData.director.toString());
  }
  
  if (taskData.hours !== undefined) {
    formData.append('hours', taskData.hours.toString());
  }
  
  console.log('Отправляемые данные для создания задачи:');
  for (let [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`);
  }
  
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}tasks/`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.ACCESS_TOKEN}`,
        'X-CSRFTOKEN': API_CONFIG.CSRF_TOKEN
      },
      body: formData
    });

    console.log('Статус ответа создания задачи:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Ошибка API при создании задачи:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    console.log('✅ Задача создана через API:', responseData);
    
    return responseData;
    
  } catch (error) {
    console.error('❌ Ошибка создания задачи:', error);
    throw error;
  }
}

export async function getTaskById(taskId, USE_MOCK_DATA) {
  console.log(`🔄 getTaskById: ID=${taskId}, USE_MOCK_DATA=${USE_MOCK_DATA}`);
  
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const mockTask = {
      id: parseInt(taskId),
      name: 'Тестовая задача',
      description: 'Разработать тесты для нового функционала',
      status: 'active',
      status_display: 'В работе',
      project: 1,
      project_name: 'Веб-сайт компании',
      director: 4,
      director_name: 'Лутфуллин Амир Айратович',
      performer: 5,
      performer_name: 'Азат',
      deadline: '2025-12-25T00:00:00+03:00',
      hours: 10,
      is_overdue: false,
      created: '2025-12-20T10:00:00+03:00',
      updated: '2025-12-21T14:30:00+03:00',
      files: [
        {
          id: 1,
          file: 'https://api.acrelis.ru/media/task_files/file1.docx',
          uploaded_at: '2025-12-20T11:00:00+03:00'
        }
      ],
      comments: [
        {
          id: 1,
          author_name: 'Иван Петров',
          content: 'Вчера согласовали API с заказчиком',
          created: '2025-12-20T14:30:00+03:00'
        }
      ]
    };
    
    console.log('✅ Моковая задача получена:', mockTask);
    return mockTask;
  }
  
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}tasks/${taskId}/`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.ACCESS_TOKEN}`,
        'X-CSRFTOKEN': API_CONFIG.CSRF_TOKEN
      }
    });

    console.log('Статус ответа задачи:', response.status);
    
    if (!response.ok) {
      throw new Error(`Ошибка: ${response.status}`);
    }

    const taskData = await response.json();
    console.log('✅ Задача получена через API:', taskData);
    
    return taskData;
    
  } catch (error) {
    console.error(`❌ Ошибка загрузки задачи ${taskId}:`, error);
    throw error;
  }
}

// В api.js добавьте эти функции:

export async function updateTask(taskId, updateData, USE_MOCK_DATA) {
  console.log(`🔄 updateTask: ID=${taskId}, данные:`, updateData);
  
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Получаем текущую задачу для мока
    const currentTask = await getTaskById(taskId, true);
    const updated = { ...currentTask, ...updateData };
    
    // Обновляем отображаемые поля
    if (updateData.status) {
      const statusMap = {
        'draft': 'Черновик',
        'new': 'Новая',
        'active': 'В работе',
        'paused': 'Приостановлена',
        'completed': 'Завершена'
      };
      updated.status_display = statusMap[updateData.status] || 'Новая';
    }
    
    console.log('✅ Моковое обновление задачи:', updated);
    return updated;
  }
  
  const formData = new FormData();
  
  // Добавляем поля для обновления
  if (updateData.name !== undefined) {
    formData.append('name', updateData.name);
  }
  
  if (updateData.description !== undefined) {
    formData.append('description', updateData.description);
  }
  
  if (updateData.project !== undefined) {
    formData.append('project', updateData.project === null ? '' : updateData.project.toString());
  }
  
  if (updateData.status !== undefined) {
    formData.append('status', updateData.status);
  }
  
  if (updateData.deadline !== undefined) {
    formData.append('deadline', updateData.deadline || '');
  }
  
  if (updateData.performer !== undefined) {
    formData.append('performer', updateData.performer === null ? '' : updateData.performer.toString());
  }
  
  if (updateData.director !== undefined) {
    formData.append('director', updateData.director === null ? '' : updateData.director.toString());
  }
  
  if (updateData.hours !== undefined) {
    formData.append('hours', updateData.hours.toString());
  }
  
  console.log('Отправляемые поля FormData для задачи:');
  for (let [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`);
  }
  
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}tasks/${taskId}/`, {
      method: 'PATCH',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.ACCESS_TOKEN}`,
        'X-CSRFTOKEN': API_CONFIG.CSRF_TOKEN
      },
      body: formData
    });

    console.log('Статус ответа обновления задачи:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Ошибка API:', errorText);
      throw new Error(`API Error: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('✅ Ответ API обновления задачи:', responseData);
    
    return responseData;
    
  } catch (error) {
    console.error(`❌ Ошибка обновления задачи:`, error);
    throw error;
  }
}

export async function uploadFileToTask(taskId, file, USE_MOCK_DATA) {
  console.log(`📤 uploadFileToTask: задача ${taskId}, файл ${file.name}`);
  
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockFile = {
      id: Math.floor(Math.random() * 1000),
      file: `https://api.acrelis.ru/media/task_files/${file.name}`,
      uploaded_at: new Date().toISOString()
    };
    
    console.log('✅ Моковая загрузка файла задачи:', mockFile);
    return mockFile;
  }
  
  const formData = new FormData();
  formData.append('file', file);
  
  console.log('Отправляю файл задачи на сервер:', file.name);
  
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}tasks/${taskId}/files/`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.ACCESS_TOKEN}`,
        'X-CSRFTOKEN': API_CONFIG.CSRF_TOKEN
      },
      body: formData
    });

    console.log('Статус ответа загрузки файла задачи:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Ошибка загрузки файла задачи:', errorText);
      throw new Error(`Ошибка загрузки файла задачи: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('✅ Файл задачи загружен:', responseData);
    
    return responseData;
    
  } catch (error) {
    console.error('❌ Ошибка загрузки файла задачи:', error);
    throw error;
  }
}

export async function addCommentToTask(taskId, commentData, USE_MOCK_DATA) {
  console.log(`💬 addCommentToTask: задача ${taskId}, комментарий:`, commentData);
  
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const mockComment = {
      id: Math.floor(Math.random() * 1000),
      author_name: 'Текущий пользователь',
      content: commentData.content,
      created: new Date().toISOString()
    };
    
    console.log('✅ Моковый комментарий добавлен:', mockComment);
    return mockComment;
  }
  
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}tasks/${taskId}/comments/`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.ACCESS_TOKEN}`,
        'X-CSRFTOKEN': API_CONFIG.CSRF_TOKEN
      },
      body: JSON.stringify({
        content: commentData.content
      })
    });

    console.log('Статус ответа добавления комментария:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Ошибка добавления комментария:', errorText);
      throw new Error(`Ошибка: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('✅ Комментарий добавлен:', responseData);
    
    return responseData;
    
  } catch (error) {
    console.error('❌ Ошибка добавления комментария:', error);
    throw error;
  }
}