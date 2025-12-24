// ERP_front/src/services/api/api.js
const API_CONFIG = {
  BASE_URL: 'https://api.acrelis.ru/',
  ACCESS_TOKEN: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzY2NjU0NjU3LCJpYXQiOjE3NjU1NjgyNTcsImp0aSI6IjhkZmI1MmI2ZjhlNDRmMzBhZDJlOTdmMTA3N2RkYmY1IiwidXNlcl9pZCI6IjMifQ.FBGdiqMY1jzb7UTkV-urikB5pHbwu6an4zYJ-GQLzAw",
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

// ============================================
// ФУНКЦИИ ДЛЯ ПРОЕКТОВ
// ============================================

export async function getProjects(USE_MOCK_DATA, filters = {}, page = 1) {
  console.log(`🔄 getProjects: USE_MOCK_DATA = ${USE_MOCK_DATA}, page = ${page}, filters:`, filters);
  
  if (USE_MOCK_DATA) {
    const mockModule = await import('../../MockData/projects.js');
    return formatMockProjects(mockModule.projectsData || []);
  }
  
  try {
    // Строим URL с фильтрами
    const url = new URL(`${API_CONFIG.BASE_URL}projects/`);
    
    // 1. Тип проекта
    if (filters.type && filters.type !== 'all') {
      url.searchParams.append('type', filters.type);
    }
    
    // 2. Статус
    if (filters.status && filters.status !== 'all') {
      url.searchParams.append('status', filters.status);
    }
    
    // 3. Поиск по имени
    if (filters.search) {
      url.searchParams.append('search', filters.search);
    }
    
    // 4. Пагинация
    url.searchParams.append('page', page.toString());
    
    console.log('📡 GET проекты:', url.toString());
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.ACCESS_TOKEN}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Ошибка API проектов:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    
    const responseData = await response.json();
    console.log('📊 Ответ API проектов:', responseData);
    
    // Обработка пагинированного ответа
    let projectsData = [];
    let totalCount = 0;
    let totalPages = 1;
    
    if (Array.isArray(responseData)) {
      projectsData = responseData;
      totalCount = projectsData.length;
    } else if (responseData.results && Array.isArray(responseData.results)) {
      projectsData = responseData.results;
      totalCount = responseData.count || projectsData.length;
      totalPages = responseData.total_pages || Math.ceil(totalCount / 10);
    } else if (responseData.data && Array.isArray(responseData.data)) {
      projectsData = responseData.data;
      totalCount = responseData.total || projectsData.length;
      totalPages = responseData.pages || 1;
    } else {
      console.warn('⚠️ Неизвестный формат ответа проектов:', responseData);
      projectsData = responseData;
      totalCount = projectsData.length || 0;
    }
    
    const projects = projectsData.map(project => ({
      id: project.id,
      name: project.name,
      type: project.type || 'other',
      typeLabel: PROJECT_TYPE_MAP[project.type] || 'Другое',
      status: project.status || 'draft',
      price: project.price || "0.00",
      hours: project.hours || 0,
      customer: project.customer || 'Не указан',
      startDate: formatDateForDisplay(project.start_date || project.created),
      deadline: formatDateForDisplay(project.deadline),
      team: project.performers || []
    }));
    
    const projectTypes = generateProjectTypes(projects);
    
    return { 
      projects, 
      projectTypes,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalCount: totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
    
  } catch (error) {
    console.error('❌ Ошибка API проектов:', error);
    throw error;
  }
}

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

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Ошибка загрузки проекта ${projectId}:`, errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    
    const project = await response.json();
    console.log('✅ Проект получен:', project);
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
      formData.append('start_date', apiDate);
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
      console.error('❌ Ошибка API обновления:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    console.log('✅ Ответ API обновления:', responseData);
    
    return formatProjectData(responseData);
    
  } catch (error) {
    console.error(`❌ Ошибка обновления проекта:`, error);
    throw error;
  }
}

export async function createProject(projectData, USE_MOCK_DATA) {
  console.log('🔄 createProject: создаю проект:', projectData);
  
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
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
  
  const formData = new FormData();
  
  // ОБЯЗАТЕЛЬНЫЕ ПОЛЯ (по документации)
  formData.append('name', projectData.name);
  formData.append('type', projectData.type);
  formData.append('status', projectData.status);
  formData.append('customer', projectData.customer);
  formData.append('deadline', projectData.deadline + 'T00:00:00+03:00');
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
      throw new Error(`Ошибка загрузки файла: ${response.status} - ${errorText}`);
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
      throw new Error(`Ошибка: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    console.log('✅ Исполнитель добавлен:', responseData);
    
    return responseData;
    
  } catch (error) {
    console.error('❌ Ошибка добавления:', error);
    throw error;
  }
}

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
      const errorText = await response.text();
      console.error('❌ Ошибка API логов:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const logsData = await response.json();
    console.log('✅ Логи получены:', logsData);
    
    return logsData.map(log => ({
      id: log.id,
      action: log.content,
      date: formatDateTime(log.created)
    }));
    
  } catch (error) {
    console.error('❌ Ошибка загрузки логов:', error);
    return [];
  }
}

// ============================================
// ФУНКЦИИ ДЛЯ СОТРУДНИКОВ
// ============================================

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
      const errorText = await response.text();
      console.warn('⚠️ Не удалось загрузить отделы:', errorText);
      return [];
    }

    const departmentsData = await response.json();
    console.log('✅ Отделы получены:', departmentsData);
    
    return departmentsData;
    
  } catch (error) {
    console.error('❌ Ошибка загрузки отделов:', error);
    return [];
  }
}

export async function getStaffList(USE_MOCK_DATA, filters = {}, page = 1) {
  console.log(`🔄 getStaffList: USE_MOCK_DATA = ${USE_MOCK_DATA}, filters:`, filters, `page: ${page}`);

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
    return { 
      employees: mockEmployees, 
      departments: mockDepartments,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalCount: mockEmployees.length,
        hasNext: false,
        hasPrev: false
      }
    };
  }
  
  try {
    // Строим URL с фильтрами
    const url = new URL(`${API_CONFIG.BASE_URL}staff/staff/`);
    
    // Фильтр по отделу
    if (filters.department && filters.department !== 'all') {
      url.searchParams.append('department', filters.department);
    }
    
    // Поиск по имени
    if (filters.search) {
      url.searchParams.append('search', filters.search);
    }
    
    // Фильтр по активности
    if (filters.is_active !== undefined) {
      url.searchParams.append('is_active', filters.is_active.toString());
    }
    
    // Пагинация
    url.searchParams.append('page', page.toString());
    
    console.log('📡 GET сотрудники:', url.toString());
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.ACCESS_TOKEN}`,
        'X-CSRFTOKEN': API_CONFIG.CSRF_TOKEN
      }
    });

    console.log('Статус ответа сотрудников:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Ошибка API сотрудников:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    console.log('✅ Ответ API сотрудников:', responseData);
    
    // Обработка пагинированного ответа
    let employeesData = [];
    let totalCount = 0;
    let totalPages = 1;
    
    if (Array.isArray(responseData)) {
      employeesData = responseData;
      totalCount = employeesData.length;
    } else if (responseData.results && Array.isArray(responseData.results)) {
      employeesData = responseData.results;
      totalCount = responseData.count || employeesData.length;
      totalPages = responseData.total_pages || Math.ceil(totalCount / 10);
    } else if (responseData.data && Array.isArray(responseData.data)) {
      employeesData = responseData.data;
      totalCount = responseData.total || employeesData.length;
      totalPages = responseData.pages || 1;
    } else {
      console.warn('⚠️ Неизвестный формат ответа сотрудников:', responseData);
      employeesData = responseData;
      totalCount = employeesData.length || 0;
    }
    
    // Преобразуем данные API в нужный формат
    const employees = employeesData.map(staff => ({
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
    
    // Получаем отделы отдельным запросом
    const departments = await getStaffDepartments(USE_MOCK_DATA);
    const departmentList = [
      { id: 'all', label: 'Все отделы', count: totalCount }
    ];
    
    // Добавляем реальные отделы если они есть
    if (Array.isArray(departments)) {
      departments.forEach(dept => {
        const count = employees.filter(emp => emp.department === dept.id.toString()).length;
        departmentList.push({
          id: dept.id.toString(),
          label: dept.name || `Отдел ${dept.id}`,
          count: count
        });
      });
    }
    
    return { 
      employees: employees, 
      departments: departmentList,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalCount: totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
    
  } catch (error) {
    console.error('❌ Ошибка загрузки сотрудников:', error);
    return { 
      employees: [], 
      departments: [{ id: 'all', label: 'Все отделы', count: 0 }],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        hasNext: false,
        hasPrev: false
      }
    };
  }
}

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
      const errorText = await response.text();
      console.error('❌ Ошибка загрузки сотрудника:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const staffData = await response.json();
    console.log('✅ Сотрудник получен:', staffData);
    
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

// ============================================
// ФУНКЦИИ ДЛЯ ЗАДАЧ
// ============================================

export async function getTasks(USE_MOCK_DATA, filters = {}, page = 1) {
  console.log(`🔄 getTasks: USE_MOCK_DATA = ${USE_MOCK_DATA}, page = ${page}, filters:`, filters);

  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const mockTasks = [
      {
        id: 1,
        name: 'Разработка главной страницы',
        status: 'active',
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
        status: 'completed',
        status_display: 'Завершено',
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
      }
    ];
    
    return {
      tasks: mockTasks,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalCount: mockTasks.length,
        hasNext: false,
        hasPrev: false
      }
    };
  }
  
  try {
    // Строим URL
    const url = new URL(`${API_CONFIG.BASE_URL}tasks/`);
    
    // 1. Статус
    if (filters.status && filters.status !== 'all') {
      url.searchParams.append('status', filters.status);
    }
    
    // 2. Исполнитель
    if (filters.performer && filters.performer !== 'all') {
      url.searchParams.append('performer', filters.performer);
    }
    
    // 3. Проект
    if (filters.project && filters.project !== 'all') {
      url.searchParams.append('project', filters.project);
    }
    
    // 4. Поиск
    if (filters.search) {
      url.searchParams.append('search', filters.search);
    }
    
    // 5. Сортировка
    if (filters.ordering) {
      url.searchParams.append('ordering', filters.ordering);
    }
    
    // 6. Пагинация
    url.searchParams.append('page', page.toString());
    
    console.log('📡 GET задачи:', url.toString());
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.ACCESS_TOKEN}`,
        'X-CSRFTOKEN': API_CONFIG.CSRF_TOKEN
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Ошибка API задач:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    console.log('📊 Ответ API задач:', responseData);
    
    // Обработка пагинированного ответа
    let tasksData = [];
    let totalCount = 0;
    let totalPages = 1;
    
    if (Array.isArray(responseData)) {
      tasksData = responseData;
      totalCount = tasksData.length;
    } else if (responseData.results && Array.isArray(responseData.results)) {
      tasksData = responseData.results;
      totalCount = responseData.count || tasksData.length;
      totalPages = responseData.total_pages || Math.ceil(totalCount / 10);
    } else if (responseData.data && Array.isArray(responseData.data)) {
      tasksData = responseData.data;
      totalCount = responseData.total || tasksData.length;
      totalPages = responseData.pages || 1;
    } else {
      console.warn('⚠️ Неизвестный формат ответа задач:', responseData);
      tasksData = responseData;
      totalCount = tasksData.length || 0;
    }
    
    return {
      tasks: tasksData,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalCount: totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
    
  } catch (error) {
    console.error('❌ Ошибка загрузки задач:', error);
    return {
      tasks: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        hasNext: false,
        hasPrev: false
      }
    };
  }
}

export async function getTasksByPerformer(performerId, USE_MOCK_DATA, page = 1) {
  console.log(`🔄 getTasksByPerformer: performerId = ${performerId}, USE_MOCK_DATA = ${USE_MOCK_DATA}, page = ${page}`);

  if (USE_MOCK_DATA) {
    const allTasks = await getTasks(true, {}, page);
    return allTasks;
  }
  
  try {
    const result = await getTasks(false, { performer: performerId }, page);
    console.log('✅ Задачи для исполнителя:', result);
    return result;
    
  } catch (error) {
    console.error('❌ Ошибка загрузки задач исполнителя:', error);
    return {
      tasks: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        hasNext: false,
        hasPrev: false
      }
    };
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
  
  if (taskData.deadline && taskData.deadline.includes('.')) {
    const [day, month, year] = taskData.deadline.split('.');
    deadlineFormatted = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00+03:00`;
  } else if (taskData.deadline && !taskData.deadline.includes('T')) {
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
      const errorText = await response.text();
      console.error('❌ Ошибка загрузки задачи:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const taskData = await response.json();
    console.log('✅ Задача получена через API:', taskData);
    
    return taskData;
    
  } catch (error) {
    console.error(`❌ Ошибка загрузки задачи ${taskId}:`, error);
    throw error;
  }
}

export async function updateTask(taskId, updateData, USE_MOCK_DATA) {
  console.log(`🔄 updateTask: ID=${taskId}, данные:`, updateData);
  
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const currentTask = await getTaskById(taskId, true);
    const updated = { ...currentTask, ...updateData };
    
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
      console.error('❌ Ошибка API обновления задачи:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
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
      throw new Error(`Ошибка загрузки файла задачи: ${response.status} - ${errorText}`);
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
      throw new Error(`Ошибка: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    console.log('✅ Комментарий добавлен:', responseData);
    
    return responseData;
    
  } catch (error) {
    console.error('❌ Ошибка добавления комментария:', error);
    throw error;
  }
}

// ============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================

export function getCurrentUser() {
  const token = API_CONFIG.ACCESS_TOKEN;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.user_id || 4,
        name: 'Текущий пользователь'
      };
    } catch (error) {
      console.error('Ошибка декодирования токена:', error);
      return {
        id: 4,
        name: 'Лутфуллин Амир Айратович'
      };
    }
  }
  
  return {
    id: 4,
    name: 'Лутфуллин Амир Айратович'
  };
}

function formatProjectData(project) {
  return {
    id: project.id,
    name: project.name,
    type: project.type || 'other',
    typeLabel: PROJECT_TYPE_MAP[project.type] || 'Другое',
    type_display: project.type_display || PROJECT_TYPE_MAP[project.type] || 'Другое',
    
    status: project.status || 'draft',
    status_display: project.status_display || getStatusDisplay(project.status),
    price: project.price || "0.00",
    hours: project.hours || 0,
    customer: project.customer || 'Не указан',
    
    startDate: project.start_date || project.created || '',
    deadline: project.deadline || '',
    
    startDateFormatted: formatDateForDisplay(project.start_date || project.created),
    deadlineFormatted: formatDateForDisplay(project.deadline),
    
    team: (project.performers || []).map(p => ({
      id: p.id,
      name: p.staff_name || 'Исполнитель',
      role: p.staff_post || 'Участник'
    })),
    
    files: (project.files || []).map(file => ({
      id: file.id,
      name: file.original_filename || file.file.split('/').pop(),
      originalName: file.original_filename || file.file.split('/').pop(),
      file: file.file || file.file_url,
      uploaded_at: file.uploaded_at,
      size: file.size || file.file_size || 0
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
  return dateString;
}

export function formatDateForDisplay(dateString) {
  if (!dateString) return '';
  
  if (dateString.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
    return dateString;
  }
  
  if (dateString.includes('T')) {
    try {
      const datePart = dateString.split('T')[0];
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