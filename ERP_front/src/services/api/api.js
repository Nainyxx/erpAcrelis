// ERP_front/src/services/api/api.js
const API_CONFIG = {
  BASE_URL: 'https://api.acrelis.ru/',
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
// ФУНКЦИИ ДЛЯ АУТЕНТИФИКАЦИИ И УПРАВЛЕНИЯ ДАННЫМИ ПОЛЬЗОВАТЕЛЯ
// ============================================

export async function login(username, password) {
  console.log('🔄 login: авторизация пользователя');
  
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}auth/login/`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    });

    console.log('Статус ответа логина:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Ошибка авторизации:', errorText);
      
      // Пробуем получить детали ошибки
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.detail || 'Ошибка авторизации');
      } catch {
        throw new Error(`Ошибка авторизации: ${response.status}`);
      }
    }

    const responseData = await response.json();
    console.log('✅ Успешная авторизация, получены данные:', responseData);
    
    // Сохраняем токены
    saveTokens(responseData);
    
    // СОХРАНЯЕМ ДАННЫЕ ПОЛЬЗОВАТЕЛЯ В localStorage
    saveUserData(responseData);
    
    return {
      success: true,
      user: {
        user_id: responseData.user_id,
        username: responseData.username,
        staff_id: responseData.staff_id,
        name: responseData.name,
        email: responseData.email,
        post: responseData.post,
        department: responseData.department,
        accessToken: responseData.access
      }
    };
    
  } catch (error) {
    console.error('❌ Ошибка входа:', error);
    throw error;
  }
}

export async function register(userData) {
  console.log('🔄 register: регистрация нового пользователя');
  
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}auth/register/`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: userData.username,
        password: userData.password,
        email: userData.email || '',
        first_name: userData.firstName || '',
        last_name: userData.lastName || ''
      })
    });

    console.log('Статус ответа регистрации:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Ошибка регистрации:', errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        const errorMessage = Object.values(errorData).flat().join(', ') || 'Ошибка регистрации';
        throw new Error(errorMessage);
      } catch {
        throw new Error(`Ошибка регистрации: ${response.status}`);
      }
    }

    const result = await response.json();
    console.log('✅ Успешная регистрация');
    
    return {
      success: true,
      message: 'Регистрация прошла успешно'
    };
    
  } catch (error) {
    console.error('❌ Ошибка регистрации:', error);
    throw error;
  }
}

export async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    console.error('❌ Нет refresh токена');
    throw new Error('Требуется повторная авторизация');
  }
  
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}auth/refresh/`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh: refreshToken
      })
    });

    console.log('Статус ответа refresh:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Ошибка обновления токена:', errorText);
      
      // Удаляем токены если refresh истёк
      clearTokens();
      throw new Error('Сессия истекла. Требуется повторная авторизация');
    }

    const newTokens = await response.json();
    console.log('✅ Токен обновлён');
    
    // Обновляем токены
    saveTokens(newTokens);
    
    return newTokens.access;
    
  } catch (error) {
    console.error('❌ Ошибка обновления токена:', error);
    throw error;
  }
}

// ============================================
// ФУНКЦИИ ДЛЯ РАБОТЫ С ТОКЕНАМИ И ДАННЫМИ ПОЛЬЗОВАТЕЛЯ
// ============================================

export function saveTokens(tokens) {
  try {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    
    // Также обновляем токен в API_CONFIG для текущей сессии
    API_CONFIG.ACCESS_TOKEN = tokens.access;
    
    console.log('✅ Токены сохранены');
  } catch (error) {
    console.error('❌ Ошибка сохранения токенов:', error);
  }
}

// Функция сохранения данных пользователя в localStorage
export function saveUserData(userData) {
  try {
    localStorage.setItem('user_id', userData.user_id?.toString() || '');
    localStorage.setItem('staff_id', userData.staff_id?.toString() || '');
    localStorage.setItem('username', userData.username || '');
    localStorage.setItem('name', userData.name || '');
    localStorage.setItem('email', userData.email || '');
    localStorage.setItem('post', userData.post || '');
    localStorage.setItem('department', userData.department || '');
    
    console.log('✅ Данные пользователя сохранены в localStorage:', {
      user_id: userData.user_id,
      staff_id: userData.staff_id,
      username: userData.username,
      name: userData.name
    });
  } catch (error) {
    console.error('❌ Ошибка сохранения данных пользователя:', error);
  }
}

// Функция очистки данных пользователя
export function clearUserData() {
  try {
    localStorage.removeItem('user_id');
    localStorage.removeItem('staff_id');
    localStorage.removeItem('username');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    localStorage.removeItem('post');
    localStorage.removeItem('department');
    
    console.log('✅ Данные пользователя удалены из localStorage');
  } catch (error) {
    console.error('❌ Ошибка удаления данных пользователя:', error);
  }
}

export function getAccessToken() {
  const token = localStorage.getItem('access_token') || API_CONFIG.ACCESS_TOKEN;
  return token;
}

export function getRefreshToken() {
  return localStorage.getItem('refresh_token');
}

export function clearTokens() {
  try {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    // Очищаем и данные пользователя
    clearUserData();
    
    // Сбрасываем токен в конфиге
    API_CONFIG.ACCESS_TOKEN = '';
    
    console.log('✅ Токены и данные пользователя удалены');
  } catch (error) {
    console.error('❌ Ошибка удаления токенов:', error);
  }
}

export function isAuthenticated() {
  const token = getAccessToken();
  return !!token && token !== '';
}

// Обновленная функция получения данных текущего пользователя
export function getCurrentUser() {
  const token = getAccessToken();
  
  if (!token) {
    console.log('⚠️ Токен не найден, пользователь не авторизован');
    return {
      user_id: null,
      staff_id: null,
      name: 'Гость'
    };
  }
  
  try {
    // Сначала пытаемся получить данные из localStorage (самый надежный способ)
    const storedUserId = localStorage.getItem('user_id');
    const storedStaffId = localStorage.getItem('staff_id');
    const storedName = localStorage.getItem('name');
    const storedUsername = localStorage.getItem('username');
    
    // Если данные есть в localStorage, используем их
    if (storedUserId || storedStaffId) {
      console.log('📋 Данные пользователя из localStorage:', {
        user_id: storedUserId,
        staff_id: storedStaffId,
        name: storedName,
        username: storedUsername
      });
      
      return {
        user_id: storedUserId || null,
        staff_id: storedStaffId || null,
        id: storedStaffId || storedUserId || null, // для обратной совместимости
        username: storedUsername || '',
        name: storedName || storedUsername || 'Текущий пользователь',
        email: localStorage.getItem('email') || '',
        post: localStorage.getItem('post') || '',
        department: localStorage.getItem('department') || ''
      };
    }
    
    // Если в localStorage нет данных, пробуем декодировать токен (fallback)
    console.log('⚠️ Данных нет в localStorage, декодируем токен');
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    console.log('📋 Данные пользователя из токена:', {
      user_id: payload.user_id,
      staff_id: payload.staff_id,
      username: payload.username,
      name: payload.name || payload.username
    });
    
    return {
      user_id: payload.user_id || null,
      staff_id: payload.staff_id || null,
      id: payload.staff_id || payload.user_id || null, // для обратной совместимости
      username: payload.username || '',
      name: payload.name || payload.username || 'Текущий пользователь',
      exp: payload.exp
    };
  } catch (error) {
    console.error('❌ Ошибка получения данных пользователя:', error);
    // Возвращаем fallback данные если токен не валидный
    return {
      user_id: null,
      staff_id: null,
      id: null,
      name: 'Текущий пользователь'
    };
  }
}

// ============================================
// ОБЕРТКА ДЛЯ API ЗАПРОСОВ С АВТООБНОВЛЕНИЕМ ТОКЕНА
// ============================================

export async function authFetch(url, options = {}) {
  // Добавляем заголовок авторизации
  const token = getAccessToken();
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'accept': 'application/json',
  };
  
  // Если это не логин/регистрация/refresh, добавляем CSRF токен
  if (!url.includes('auth/')) {
    headers['X-CSRFTOKEN'] = API_CONFIG.CSRF_TOKEN;
  }
  
  const requestOptions = {
    ...options,
    headers: headers
  };
  
  try {
    const response = await fetch(url, requestOptions);
    
    // Если 401 - пробуем обновить токен и повторить запрос
    if (response.status === 401) {
      console.log('🔄 401 ошибка, пробуем обновить токен');
      
      try {
        const newAccessToken = await refreshAccessToken();
        
        // Обновляем заголовок с новым токеном
        requestOptions.headers['Authorization'] = `Bearer ${newAccessToken}`;
        
        // Повторяем запрос с новым токеном
        const retryResponse = await fetch(url, requestOptions);
        
        if (!retryResponse.ok) {
          // Если всё равно ошибка - возможно refresh токен тоже истёк
          if (retryResponse.status === 401) {
            clearTokens();
            window.location.href = '/login';
          }
        }
        
        return retryResponse;
        
      } catch (refreshError) {
        console.error('❌ Не удалось обновить токен:', refreshError);
        clearTokens();
        window.location.href = '/login';
        throw refreshError;
      }
    }
    
    return response;
    
  } catch (error) {
    console.error('❌ Ошибка authFetch:', error);
    throw error;
  }
}

// ============================================
// ФУНКЦИИ ДЛЯ ПРОЕКТОВ
// ============================================

export async function getProjects(USE_MOCK_DATA, filters = {}) {
  console.log(`🔄 getProjects: USE_MOCK_DATA = ${USE_MOCK_DATA}, filters:`, filters);
  
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
    
    console.log('📡 GET проекты:', url.toString());
    
    const response = await authFetch(url.toString(), {
      method: 'GET'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Ошибка API проектов:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    
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

export async function getProjectById(projectId, USE_MOCK_DATA) {
  if (USE_MOCK_DATA) {
    const mockModule = await import('../../MockData/projects.js');
    const mockProjects = mockModule.projectsData || [];
    const project = mockProjects.find(p => p.id === projectId) || getFallbackProject();
    return formatProjectData(project);
  }
  
  try {
    const response = await authFetch(`${API_CONFIG.BASE_URL}projects/${projectId}/`, {
      method: 'GET'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Ошибка загрузки проекта ${projectId}:`, errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    
    const project = await response.json();
    console.log(project)
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
    const response = await authFetch(`${API_CONFIG.BASE_URL}projects/${projectId}/`, {
      method: 'PATCH',
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
  
  formData.append('name', projectData.name);
  formData.append('type', projectData.type);
  formData.append('status', projectData.status);
  formData.append('customer', projectData.customer);
  formData.append('deadline', projectData.deadline + 'T00:00:00+03:00');
  formData.append('hours', projectData.hours.toString());
  
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
    const response = await authFetch(`${API_CONFIG.BASE_URL}projects/`, {
      method: 'POST',
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
    const response = await authFetch(`${API_CONFIG.BASE_URL}projects/${projectId}/files/`, {
      method: 'POST',
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
    const response = await authFetch(`${API_CONFIG.BASE_URL}projects/${projectId}/performers/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
    const response = await authFetch(`${API_CONFIG.BASE_URL}projects/${projectId}/logs/?page=1`, {
      method: 'GET'
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
// ФУНКЦИИ ДЛЯ ЗАДАЧ
// ============================================

export async function getTasks(USE_MOCK_DATA, filters = {}) {
  console.log(`🔄 getTasks: USE_MOCK_DATA = ${USE_MOCK_DATA}, filters:`, filters);

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
    
    return mockTasks;
  }
  
  try {
    // Строим URL
    const url = new URL(`${API_CONFIG.BASE_URL}tasks/`);
    
    // ПРОСТЫЕ ФИЛЬТРЫ:
    
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
    
    // 4. Поиск (name или search)
    if (filters.search) {
      url.searchParams.append('search', filters.search);
    }
    
    // 5. Сортировка (по умолчанию -deadline)
    if (filters.ordering) {
      url.searchParams.append('ordering', filters.ordering);
    } else {
      url.searchParams.append('ordering', '-deadline'); // по умолчанию
    }
    
    console.log('📡 Отправляю GET задачи:', url.toString());
    
    const response = await authFetch(url.toString(), {
      method: 'GET'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Ошибка API задач:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const tasksData = await response.json();
    console.log('📊 Ответ API задач:', tasksData);
    
    // Возвращаем просто массив задач (для обратной совместимости с MyTasks.jsx)
    return tasksData;
    
  } catch (error) {
    console.error('❌ Ошибка загрузки задач:', error);
    return [];
  }
}

export async function getTasksByPerformer(performerId, USE_MOCK_DATA) {
  console.log(`🔄 getTasksByPerformer: performerId = ${performerId}, USE_MOCK_DATA = ${USE_MOCK_DATA}`);

  if (USE_MOCK_DATA) {
    const allTasks = await getTasks(true, {});
    return allTasks;
  }
  
  try {
    // Используем стандартный getTasks с фильтром по исполнителю
    const tasks = await getTasks(false, { performer: performerId });
    console.log('✅ Задачи для исполнителя:', tasks);
    return tasks;
    
  } catch (error) {
    console.error('❌ Ошибка загрузки задач исполнителя:', error);
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
    const response = await authFetch(`${API_CONFIG.BASE_URL}tasks/`, {
      method: 'POST',
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
    const response = await authFetch(`${API_CONFIG.BASE_URL}tasks/${taskId}/`, {
      method: 'GET'
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
    const response = await authFetch(`${API_CONFIG.BASE_URL}tasks/${taskId}/`, {
      method: 'PATCH',
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
    const response = await authFetch(`${API_CONFIG.BASE_URL}tasks/${taskId}/files/`, {
      method: 'POST',
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
    const response = await authFetch(`${API_CONFIG.BASE_URL}tasks/${taskId}/comments/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
    const response = await authFetch(`${API_CONFIG.BASE_URL}staff/departments/`, {
      method: 'GET'
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

export async function getStaffList(USE_MOCK_DATA, filters = {}) {
  console.log(`🔄 getStaffList: USE_MOCK_DATA = ${USE_MOCK_DATA}, filters:`, filters);

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
    
    console.log('📡 GET сотрудники:', url.toString());
    
    const response = await authFetch(url.toString(), {
      method: 'GET'
    });

    console.log('Статус ответа сотрудников:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Ошибка API сотрудников:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    console.log('✅ Ответ API сотрудников:', responseData);
    
    // Преобразуем данные API в нужный формат
    const employees = responseData.map(staff => ({
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
      { id: 'all', label: 'Все отделы', count: employees.length }
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
      departments: departmentList
    };
    
  } catch (error) {
    console.error('❌ Ошибка загрузки сотрудников:', error);
    return { 
      employees: [], 
      departments: [{ id: 'all', label: 'Все отделы', count: 0 }]
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
      post: 'Руководитель отдела разработки',
      department: 'development',
      departmentLabel: 'Отдел разработки',
      email: 'ivan@company.com',
      phone: '+7 (999) 123-45-67',
      birthday: '1990-01-01',
      is_active: true,
      created: '2024-01-01T10:00:00+03:00',
      telegram: '@ivanov',
      // Данные статистики задач
      current_tasks: 5,
      closed_on_time_tasks: 15,
      closed_late_tasks: 2,
      failed_tasks: 1,
      // Данные директора
      director: {
        id: 1,
        name: 'Васильев Дмитрий',
        post: 'Директор'
      }
    };
    
    console.log('✅ Моковый сотрудник:', mockEmployee);
    return mockEmployee;
  }
  
  try {
    const response = await authFetch(`${API_CONFIG.BASE_URL}staff/staff/${employeeId}/`, {
      method: 'GET'
    });

    console.log('Статус ответа сотрудника:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Ошибка загрузки сотрудника:', errorText);
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const staffData = await response.json();
    console.log('✅ Сотрудник получен через API:', staffData);
    
    // Преобразуем в формат, который ожидает EmployeeCard
    const employee = {
      id: staffData.id,
      name: staffData.name,
      position: staffData.post,
      post: staffData.post,
      department: staffData.department?.toString() || '0',
      departmentLabel: staffData.department_name || 'Не указан',
      email: staffData.email,
      phone: staffData.phone,
      birthday: staffData.birthday,
      is_active: staffData.is_active,
      created: staffData.created,
      telegram: staffData.telegram || '@acrelis',
      // Данные статистики задач из API
      current_tasks: staffData.current_tasks || 0,
      closed_on_time_tasks: staffData.closed_on_time_tasks || 0,
      closed_late_tasks: staffData.closed_late_tasks || 0,
      failed_tasks: staffData.failed_tasks || 0,
      // Данные директора из API
      director: staffData.director || null
    };
    
    console.log('✅ Преобразованный сотрудник:', employee);
    return employee;
    
  } catch (error) {
    console.error('❌ Ошибка загрузки сотрудника:', error);
    throw error;
  }
}

// ============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================

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
  
  if (dateString.includes('T') && dateString.includes('+')) {
    return dateString;
  }
  
  if (dateString.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
    const [day, month, year] = dateString.split('.');
    return `${year}-${month}-${day}T00:00:00+03:00`;
  }
  
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