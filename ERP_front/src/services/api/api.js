const API_CONFIG = {
  BASE_URL: 'https://api.acrelis.ru/',
  CSRF_TOKEN: 'ZvWfFB1bOKo6BawwGWwPwt2GBx1kBzoO'
};

const PROJECT_TYPE_MAP = {
  'website': 'Сайт',
  'bot': 'Бот', 
  'app': 'Приложение',
  'miniapp': 'Мини-приложение',
  'design': 'Дизайн',
  'other': 'Другое',
  
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
  '': 'other'
};

// Аутентификация пользователя
// В ERP_front/src/services/api/api.js обновим функцию login()

// Аутентификация пользователя
export async function login(username, password) {
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


    if (response.status === 403) {
      throw new Error('ACCESS_DENIED: Недостаточно прав для доступа к системе');
    }

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.detail || 'Ошибка авторизации');
      } catch {
        throw new Error(`Ошибка авторизации: ${response.status}`);
      }
    }

    const responseData = await response.json();
    saveTokens(responseData);
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
    throw error;
  }
}

// Регистрация нового пользователя
export async function register(userData) {
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

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        const errorMessage = Object.values(errorData).flat().join(', ') || 'Ошибка регистрации';
        throw new Error(errorMessage);
      } catch {
        throw new Error(`Ошибка регистрации: ${response.status}`);
      }
    }

    const result = await response.json();
    return {
      success: true,
      message: 'Регистрация прошла успешно'
    };
    
  } catch (error) {
    throw error;
  }
}


export async function refreshAccessToken() {
  let isRefreshing = false;
  let refreshPromise = null;

  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = getRefreshToken();
      const accessToken = getAccessToken();

      if (!refreshToken || !accessToken || accessToken === '') {
        clearTokens();
        window.location.href = '#/login';
        throw new Error('Требуется повторная авторизация');
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}auth/refresh/`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          refresh: refreshToken
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        if (response.status === 401) {
          clearTokens();
          window.location.href = '#/login';
          throw new Error('Сессия истекла');
        }
        
        throw new Error(`Ошибка обновления: ${response.status}`);
      }

      const newTokens = await response.json();
      
      if (!newTokens.access) {
        throw new Error('Не получили новый токен');
      }
      
      localStorage.setItem('access_token', newTokens.access);
      API_CONFIG.ACCESS_TOKEN = newTokens.access;
      
      if (newTokens.refresh) {
        localStorage.setItem('refresh_token', newTokens.refresh);
      }
      
      return newTokens.access;
      
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();
  
  return refreshPromise;
}

// Сохранение токенов в localStorage
export function saveTokens(tokens) {
  try {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
    API_CONFIG.ACCESS_TOKEN = tokens.access;
  } catch (error) {
  }
}

// Сохранение данных пользователя
export function saveUserData(userData) {
  try {
    localStorage.setItem('user_id', userData.user_id?.toString() || '');
    localStorage.setItem('staff_id', userData.staff_id?.toString() || '');
    localStorage.setItem('username', userData.username || '');
    localStorage.setItem('name', userData.name || '');
    localStorage.setItem('email', userData.email || '');
    localStorage.setItem('post', userData.post || '');
    localStorage.setItem('department', userData.department || '');
    localStorage.setItem('role', userData.role || userData.post || '');
  } catch (error) {
  }
}

// Очистка данных пользователя
export function clearUserData() {
  try {
    localStorage.removeItem('user_id');
    localStorage.removeItem('staff_id');
    localStorage.removeItem('username');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    localStorage.removeItem('post');
    localStorage.removeItem('department');
    localStorage.removeItem('role');
  } catch (error) {
  }
}

// Получение access токена
export function getAccessToken() {
  const token = localStorage.getItem('access_token') || API_CONFIG.ACCESS_TOKEN;
  return token;
}

// Получение refresh токена
export function getRefreshToken() {
  return localStorage.getItem('refresh_token');
}

// Очистка токенов и данных пользователя
export function clearTokens() {
  try {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    clearUserData();
    API_CONFIG.ACCESS_TOKEN = '';
  } catch (error) {
  }
}

// Проверка аутентификации пользователя
export function isAuthenticated() {
  const token = getAccessToken();
  return !!token && token !== '';
}

// Получение данных текущего пользователя
export function getCurrentUser() {
  const token = getAccessToken();
  
  if (!token) {
    return {
      user_id: null,
      staff_id: null,
      name: 'Гость'
    };
  }
  
  try {
    const storedUserId = localStorage.getItem('user_id');
    const storedStaffId = localStorage.getItem('staff_id');
    const storedName = localStorage.getItem('name');
    const storedUsername = localStorage.getItem('username');
    
    if (storedUserId || storedStaffId) {
      return {
        user_id: storedUserId || null,
        staff_id: storedStaffId || null,
        id: storedStaffId || storedUserId || null,
        username: storedUsername || '',
        name: storedName || storedUsername || 'Текущий пользователь',
        email: localStorage.getItem('email') || '',
        post: localStorage.getItem('post') || '',
        department: localStorage.getItem('department') || ''
      };
    }
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    return {
      user_id: payload.user_id || null,
      staff_id: payload.staff_id || null,
      id: payload.staff_id || payload.user_id || null,
      username: payload.username || '',
      name: payload.name || payload.username || 'Текущий пользователь',
      exp: payload.exp
    };
  } catch (error) {
    return {
      user_id: null,
      staff_id: null,
      id: null,
      name: 'Текущий пользователь'
    };
  }
}

// Обертка для API запросов с автообновлением токена
export async function authFetch(url, options = {}) {
  const token = getAccessToken();
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'accept': 'application/json',
  };

  if (!url.includes('auth/')) {
    headers['X-CSRFTOKEN'] = API_CONFIG.CSRF_TOKEN;
  }

  const requestOptions = {
    ...options,
    headers: headers
  };

  try {
    const response = await fetch(url, requestOptions);

    // Если получили 401 - пробуем обновить токен
    if (response.status === 401) {
      // НЕ обновляем токен для endpoints аутентификации (это вызовет бесконечный цикл)
      if (url.includes('auth/')) {
        clearTokens();
        window.location.href = '#/login';
        throw new Error('Требуется повторная авторизация');
      }

      try {
        const newAccessToken = await refreshAccessToken();

        // Обновляем заголовок с новым токеном
        requestOptions.headers['Authorization'] = `Bearer ${newAccessToken}`;

        // Повторяем запрос с новым токеном
        const retryResponse = await fetch(url, requestOptions);

        // Если снова 401 - значит токен не обновился или что-то не так
        if (retryResponse.status === 401) {
          clearTokens();
          window.location.href = '#/login';
          throw new Error('Не удалось обновить сессию');
        }

        return retryResponse;
      } catch (refreshError) {
        clearTokens();
        window.location.href = '#/login';
        throw refreshError;
      }
    }

    return response;
  } catch (error) {
    // Если это ошибка сети или другая ошибка - просто пробрасываем дальше
    throw error;
  }
}

/** Полный URL картинки сотрудника/медиа: путь с бэка или уже абсолютный URL. */
export function getStaffMediaUrl(pathOrUrl) {
  if (pathOrUrl == null || pathOrUrl === '') return null;
  const v = String(pathOrUrl).trim();
  if (!v) return null;
  if (v.startsWith('http://') || v.startsWith('https://')) return v;
  const base = API_CONFIG.BASE_URL.replace(/\/?$/, '');
  const path = v.startsWith('/') ? v.slice(1) : v;
  return `${base}/media/${path}`;
}

// Получение списка проектов
export async function getProjects(USE_MOCK_DATA, filters = {}) {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));

    const mockModule = await import('../../MockData/projects.js');
    const mockProjects = mockModule.projectsData || [];

    // Эмуляция пагинации для mock данных
    const page = parseInt(filters.page) || 1;
    const pageSize = 20;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedProjects = mockProjects.slice(startIndex, endIndex).map(project => ({
      id: project.id,
      name: project.name,
      type: project.type || 'other',
      typeLabel: PROJECT_TYPE_MAP[project.type] || 'Другое',
      status: project.status || 'draft',
      price: project.price || "0.00",
      hours: project.hours || 0,
      customer: project.customer || 'Не указан',
      startDate: formatDateForDisplay(project.start_date || project.startDate || project.created),
      deadline: formatDateForDisplay(project.deadline),
      team: project.performers || project.team || []
    }));

    const projectTypes = generateProjectTypes(
      mockProjects.map(project => ({
        id: project.id,
        name: project.name,
        type: project.type || 'other',
        typeLabel: PROJECT_TYPE_MAP[project.type] || 'Другое',
        status: project.status || 'draft',
        price: project.price || "0.00",
        hours: project.hours || 0,
        customer: project.customer || 'Не указан',
        startDate: formatDateForDisplay(project.start_date || project.startDate || project.created),
        deadline: formatDateForDisplay(project.deadline),
        team: project.performers || project.team || []
      }))
    );

    return {
      projects: paginatedProjects,
      projectTypes,
      pagination: {
        count: mockProjects.length,
        next: page * pageSize < mockProjects.length ? page + 1 : null,
        previous: page > 1 ? page - 1 : null,
        current_page: page,
        total_pages: Math.ceil(mockProjects.length / pageSize)
      }
    };
  }
  
  try {
    const url = new URL(`${API_CONFIG.BASE_URL}projects/`);
    
    // Добавляем все фильтры, включая page
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        url.searchParams.append(key, filters[key]);
      }
    });
    
    // Если ordering не указан, добавляем сортировку по умолчанию
    if (!filters.ordering && !url.searchParams.has('ordering')) {
      url.searchParams.append('ordering', '-id');
    }
    
    
    const response = await authFetch(url.toString(), {
      method: 'GET'
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const projectsData = await response.json();
    
    // Получаем текущую страницу из фильтров
    const currentPage = parseInt(filters.page) || 1;
    
    // Форматируем проекты
    const formattedProjects = (projectsData.results || projectsData).map(project => ({
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
    
    // Генерируем типы проектов
    const projectTypes = generateProjectTypes(formattedProjects);
    
    // Извлекаем данные пагинации из ответа API
    const totalCount = projectsData.count || formattedProjects.length;
    const totalPages = Math.ceil(totalCount / 20);
    
    return {
      projects: formattedProjects,
      projectTypes,
      pagination: {
        count: totalCount,
        next: projectsData.next,
        previous: projectsData.previous,
        current_page: currentPage,
        total_pages: totalPages
      }
    };
    
  } catch (error) {
    throw error;
  }
}

// Получение проекта по ID
// Получение проекта по ID
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
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    
    const project = await response.json();
    return formatProjectData(project);
  } catch (error) {
    throw error;
  }
}

// Обновление проекта
export async function updateProject(projectId, updateData, USE_MOCK_DATA) {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    const project = await getProjectById(projectId, true);
    const updated = { ...project, ...updateData };
    
    // Обновляем отображаемый статус
    if (updateData.status) {
      const statusMap = {
        'draft': 'Черновик',
        'active': 'В работе',
        'paused': 'Приостановлен',
        'tests': 'Тестируется',
        'completed': 'Завершен',
        'cancelled': 'Отменен'
      };
      updated.status_display = statusMap[updateData.status] || 'Черновик';
    }
    
    // Обновляем часы
    if (updateData.hours !== undefined) {
      updated.hours = updateData.hours;
    }
    
    return formatProjectData(updated);
  }
  
  const formData = new FormData();
  
  // Добавляем все поля для обновления
  if (updateData.status !== undefined) {
    formData.append('status', updateData.status);
  }
  
  if (updateData.start_date !== undefined) {
    formData.append('start_date', updateData.start_date);
  }
  
  if (updateData.deadline !== undefined) {
    formData.append('deadline', updateData.deadline);
  }
  
  if (updateData.type !== undefined) {
    // Типы проекта должны быть: website, bot, app, miniapp, design, other
    const validTypes = ['website', 'bot', 'app', 'miniapp', 'design', 'other'];
    const inputType = updateData.type.toLowerCase().trim();
    
    // Если тип уже в правильном формате, используем его
    if (validTypes.includes(inputType)) {
      formData.append('type', inputType);
    } else {
      // Иначе преобразуем русское название в английский формат
      const typeMap = {
        'сайт': 'website',
        'бот': 'bot',
        'приложение': 'app',
        'мини-приложение': 'miniapp',
        'миниприложение': 'miniapp',
        'дизайн': 'design',
        'другое': 'other',
        'прочее': 'other'
      };
      
      const mappedType = typeMap[inputType] || 'other';
      formData.append('type', mappedType);
    }
  }
  
  if (updateData.price !== undefined) {
    const cleanPrice = cleanPriceForAPI(updateData.price);
    formData.append('price', cleanPrice);
  }
  
  if (updateData.customer !== undefined) {
    formData.append('customer', updateData.customer);
  }
  
  // Добавляем часы
  if (updateData.hours !== undefined) {
    formData.append('hours', updateData.hours.toString());
  }
  
  try {
    const response = await authFetch(`${API_CONFIG.BASE_URL}projects/${projectId}/`, {
      method: 'PATCH',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    return formatProjectData(responseData);
  } catch (error) {
    throw error;
  }
}

// Создание проекта
export async function createProject(projectData, USE_MOCK_DATA) {
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
  formData.append('deadline', projectData.deadline);
  formData.append('hours', projectData.hours.toString());
  
  if (projectData.price) {
    formData.append('price', cleanPriceForAPI(projectData.price));
  }
  
  if (projectData.available !== undefined) {
    formData.append('available', projectData.available.toString());
  }
  
  try {
    const response = await authFetch(`${API_CONFIG.BASE_URL}projects/`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    return formatProjectData(responseData);
  } catch (error) {
    throw error;
  }
}

// Загрузка файла в проект
export async function uploadFileToProject(projectId, file, USE_MOCK_DATA) {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockFile = {
      id: Math.floor(Math.random() * 1000),
      name: file.name,
      file: `https://example.com/files/${file.name}`,
      uploaded_at: new Date().toISOString(),
      size: file.size
    };
    
    return mockFile;
  }
  
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await authFetch(`${API_CONFIG.BASE_URL}projects/${projectId}/files/`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ошибка загрузки файла: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    return {
      id: responseData.id,
      name: file.name,
      file: responseData.file,
      uploaded_at: responseData.uploaded_at,
      size: file.size
    };
  } catch (error) {
    throw error;
  }
}

// Добавление исполнителя к проекту
export async function addPerformerToProject(projectId, staffId, USE_MOCK_DATA) {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const mockPerformer = {
      id: Math.floor(Math.random() * 1000),
      staff: staffId,
      staff_name: 'Иван Иванов',
      staff_post: 'Разработчик',
      assigned_at: new Date().toISOString()
    };
    
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

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ошибка: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    throw error;
  }
}

// Получение логов проекта
export async function getProjectLogs(projectId, USE_MOCK_DATA) {
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

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const logsData = await response.json();
    return logsData.map(log => ({
      id: log.id,
      action: log.content,
      date: formatDateTime(log.created)
    }));
  } catch (error) {
    return [];
  }
}

// Получение списка задач
export async function getTasks(USE_MOCK_DATA, filters = {}) {
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
      },
      // Добавляем больше задач для пагинации
      ...Array.from({ length: 50 }, (_, i) => ({
        id: i + 3,
        name: `Задача ${i + 3}`,
        status: i % 3 === 0 ? 'new' : i % 3 === 1 ? 'active' : 'completed',
        status_display: i % 3 === 0 ? 'Новое' : i % 3 === 1 ? 'В работе' : 'Завершено',
        project: i % 2 + 1,
        project_name: i % 2 === 0 ? 'Веб-сайт компании' : 'Мобильное приложение',
        director: 1,
        director_name: 'Иван Иванов',
        performer: 4,
        performer_name: 'Лутфуллин Амир',
        deadline: `2025-12-${25 + i % 5}T10:00:00+03:00`,
        is_overdue: false,
        created: `2025-12-${20 + i % 3}T10:00:00+03:00`,
        hours: 8
      }))
    ];

    let list = [...mockTasks];
    if (filters.status) {
      list = list.filter((t) => t.status === filters.status);
    }
    if (filters.performer) {
      list = list.filter((t) => String(t.performer) === String(filters.performer));
    }
    if (filters.director) {
      list = list.filter((t) => String(t.director) === String(filters.director));
    }
    if (filters.project) {
      list = list.filter((t) => String(t.project) === String(filters.project));
    }

    const page = parseInt(filters.page, 10) || 1;
    const pageSize = 20;
    const count = list.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedTasks = list.slice(startIndex, endIndex);
    const totalPages = Math.max(1, Math.ceil(count / pageSize));

    return {
      results: paginatedTasks,
      count,
      next: page * pageSize < count ? page + 1 : null,
      previous: page > 1 ? page - 1 : null,
      current_page: page,
      total_pages: totalPages
    };
  }
  
  try {
    const url = new URL(`${API_CONFIG.BASE_URL}tasks/`);
    
    // Добавляем все фильтры, включая page
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        url.searchParams.append(key, filters[key]);
      }
    });
    
    // Если ordering не указан, добавляем сортировку по deadline по умолчанию
    if (!filters.ordering && !url.searchParams.has('ordering')) {
      url.searchParams.append('ordering', '-deadline');
    }
    
    
    const response = await authFetch(url.toString(), {
      method: 'GET'
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const tasksData = await response.json();
    
    // API возвращает пагинированный ответ с count
    return tasksData;
    
  } catch (error) {
    return {
      results: [],
      count: 0,
      next: null,
      previous: null,
      current_page: parseInt(filters.page) || 1,
      total_pages: 0
    };
  }
}
// Получение задач по исполнителю
export async function getTasksByPerformer(performerId, USE_MOCK_DATA) {
  if (USE_MOCK_DATA) {
    const allTasks = await getTasks(true, {});
    return allTasks;
  }
  
  try {
    const tasks = await getTasks(false, { performer: performerId });
    return tasks;
  } catch (error) {
    return [];
  }
}

// Создание задачи
export async function createTask(taskData, USE_MOCK_DATA) {
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
      deadline: taskData.deadline, // Просто дата
      hours: taskData.hours || 0,
      is_overdue: false,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      files: [],
      comments: []
    };
    
    return mockTask;
  }
  
  const formData = new FormData();
  
  formData.append('name', taskData.name);
  formData.append('description', taskData.description || taskData.name);
  
  // ФОРМАТИРОВАНИЕ ДАТЫ - только YYYY-MM-DD без времени
  if (taskData.deadline) {
    let deadlineFormatted = taskData.deadline;
    
    // Если есть время (T), обрезаем его
    if (taskData.deadline.includes('T')) {
      deadlineFormatted = taskData.deadline.split('T')[0];
    }
    // Если формат DD.MM.YYYY, конвертируем
    else if (taskData.deadline.includes('.')) {
      const parts = taskData.deadline.split('.');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        deadlineFormatted = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
    
    // Проверяем, что осталась только дата
    formData.append('deadline', deadlineFormatted);
  }
  
  if (taskData.project) {
    formData.append('project', taskData.project.toString());
  }
  
  if (taskData.status) {
    formData.append('status', taskData.status);
  } else {
    formData.append('status', 'new');
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
  
  try {
    const response = await authFetch(`${API_CONFIG.BASE_URL}tasks/`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    throw error;
  }
}

// Получение задачи по ID
// Получение задачи по ID
export async function getTaskById(taskId, USE_MOCK_DATA) {
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
      performer_image: 'staff_photos/1716959483_9fcb82061eb13984e346a7a61fed9400.jpg', // Добавьте это поле
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
    
    return mockTask;
  }
  
  try {
    const response = await authFetch(`${API_CONFIG.BASE_URL}tasks/${taskId}/`, {
      method: 'GET'
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const taskData = await response.json();
    
    return taskData;
  } catch (error) {
    throw error;
  }
}

// Обновление задачи
// Функция для создания записи о начислении зарплаты при закрытии задачи
export async function createSalaryRecord(taskId, completionDate, USE_MOCK_DATA) {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const mockSalaryRecord = {
      id: Math.floor(Math.random() * 1000),
      user: 1,
      user_name: 'Иван Иванов',
      task: taskId,
      task_name: 'Тестовая задача',
      hours: 8,
      hourly_rate: 1000,
      salary: 8000,
      status: 'pending',
      status_display: 'Ожидает выплаты',
      completion_date: completionDate,
      deadline_date: '2025-12-25',
      created: new Date().toISOString()
    };
    
    return [mockSalaryRecord];
  }
  
  try {
    // Форматируем дату в YYYY-MM-DD
    let formattedDate = completionDate;
    
    // Если дата содержит время, обрезаем его
    if (formattedDate.includes('T')) {
      formattedDate = formattedDate.split('T')[0];
    }
    
    // Если дата в формате DD.MM.YYYY, конвертируем
    if (formattedDate.includes('.')) {
      const parts = formattedDate.split('.');
      if (parts.length === 3) {
        const [day, month, year] = parts;
        formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
    

    
    const response = await authFetch(`${API_CONFIG.BASE_URL}salary/create/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task_id: taskId,
        completion_date: formattedDate
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      // Проверяем, может запись уже существует
      if (response.status === 400) {
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.detail && errorData.detail.includes('уже существует')) {
            return null;
          }
        } catch {
          // Игнорируем ошибки парсинга
        }
      }
      
      if (response.status === 404) {
        return null;
      }
      
      throw new Error(`Ошибка создания записи о зарплате: ${response.status}`);
    }

    const responseData = await response.json();
    return responseData;
    
  } catch (error) {
    return null; // Возвращаем null вместо throw, чтобы не ломать основной flow
  }
}

// Обновленная функция updateTask с интеграцией начисления зарплаты
export async function updateTask(taskId, updateData, USE_MOCK_DATA) {
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
        'completed': 'Завершена',
        'failed': 'Провалена'
      };
      updated.status_display = statusMap[updateData.status] || 'Новая';
    }
    
    // Если статус изменился на "completed", создаем запись о зарплате
    if (updateData.status === 'completed' && currentTask.status !== 'completed') {
      try {
        // Для мок данных используем текущую дату в формате YYYY-MM-DD
        const today = new Date().toISOString().split('T')[0];
        await createSalaryRecord(taskId, today, USE_MOCK_DATA);
      } catch (error) {
      }
    }
    
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
    // Убеждаемся, что дата отправляется без времени
    let deadlineToSend = updateData.deadline;
    if (deadlineToSend && deadlineToSend.includes('T')) {
      deadlineToSend = deadlineToSend.split('T')[0];
    }
    formData.append('deadline', deadlineToSend || '');
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
  
  try {
    // Сначала получаем текущую задачу, чтобы проверить статус
    let oldStatus = null;
    try {
      const currentTask = await getTaskById(taskId, USE_MOCK_DATA);
      oldStatus = currentTask.status;
    } catch {
      // Если не удалось получить задачу, продолжаем без проверки старого статуса
    }
    
    const response = await authFetch(`${API_CONFIG.BASE_URL}tasks/${taskId}/`, {
      method: 'PATCH',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    
    // Если статус изменился на "completed" (был не completed, стал completed)
    if (updateData.status === 'completed' && oldStatus !== 'completed') {
      // Создаем запись о зарплате асинхронно (не ждем завершения)
      setTimeout(async () => {
        try {
          // Используем текущую дату в формате YYYY-MM-DD
          const today = new Date().toISOString().split('T')[0];
          const salaryResult = await createSalaryRecord(taskId, today, USE_MOCK_DATA);
          
          if (salaryResult) {
          }
        } catch (salaryError) {
        }
      }, 1000); // Задержка 1 секунда, чтобы дать время на сохранение задачи
    }
    
    return responseData;
  } catch (error) {
    throw error;
  }
}

// Вспомогательная функция для проверки существования записи о зарплате
export async function checkSalaryExists(taskId, USE_MOCK_DATA) {
  try {
    // Эта функция зависит от того, есть ли у вас endpoint для проверки
    // Если нет, можно просто вернуть false или сделать проверку по-другому
    return false;
  } catch {
    return false;
  }
}

// Загрузка файла в задачу
export async function uploadFileToTask(taskId, file, USE_MOCK_DATA) {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockFile = {
      id: Math.floor(Math.random() * 1000),
      file: `https://api.acrelis.ru/media/task_files/${file.name}`,
      uploaded_at: new Date().toISOString()
    };
    
    return mockFile;
  }
  
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await authFetch(`${API_CONFIG.BASE_URL}tasks/${taskId}/files/`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ошибка загрузки файла задачи: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    throw error;
  }
}

// Добавление комментария к задаче
// В api.js - убедитесь, что этот метод использует правильный endpoint
export async function addCommentToTask(taskId, commentData, USE_MOCK_DATA) {
    if (USE_MOCK_DATA) {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const mockComment = {
            id: Math.floor(Math.random() * 1000),
            author_name: 'Текущий пользователь',
            content: commentData.content,
            created: new Date().toISOString()
        };
        
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

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Ошибка: ${response.status} - ${errorText}`);
        }

        const responseData = await response.json();
        return responseData;
    } catch (error) {
        throw error;
    }
}

// Получение отделов сотрудников
export async function getStaffDepartments(USE_MOCK_DATA) {
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
    
    return mockDepartments;
  }
  
  try {
    const response = await authFetch(`${API_CONFIG.BASE_URL}staff/departments/`, {
      method: 'GET'
    });

    if (!response.ok) {
      const errorText = await response.text();
      return [];
    }

    const departmentsData = await response.json();
    return departmentsData;
  } catch (error) {
    return [];
  }
}

// Получение списка сотрудников
// В файле ERP_front/src/services/api/api.js
// Находим функцию getStaffList и исправляем ее:

export async function getStaffList(USE_MOCK_DATA, filters = {}) {
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
      // ... остальные мок данные
    ];
    
    const mockDepartments = [
      { id: 'all', label: 'Все отделы', count: mockEmployees.length },
      { id: 'development', label: 'Отдел разработки', count: 1 },
      { id: 'design', label: 'Отдел дизайна', count: 1 },
      { id: 'marketing', label: 'Отдел маркетинга', count: 1 }
    ];
    
    return { employees: mockEmployees, departments: mockDepartments };
  }
  
  try {
    const url = new URL(`${API_CONFIG.BASE_URL}staff/staff/`);
    
    if (filters.department && filters.department !== 'all') {
      url.searchParams.append('department', filters.department);
    }
    
    if (filters.search) {
      url.searchParams.append('search', filters.search);
    }
    
    if (filters.is_active !== undefined) {
      url.searchParams.append('is_active', filters.is_active.toString());
    }
    
    const response = await authFetch(url.toString(), {
      method: 'GET'
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    
    // ИСПРАВЛЕННАЯ ЧАСТЬ: правильно форматируем данные
    const employees = responseData.map(staff => ({
      id: staff.id,
      name: staff.name,
      position: staff.post || staff.position || 'Сотрудник',
      post: staff.post || 'Сотрудник',
      department: staff.department?.toString() || '0',
      departmentLabel: staff.department_name || 'Не указан',
      email: staff.email,
      phone: staff.phone,
      birthday: staff.birthday,
      telegram: staff.telegram,
      is_active: staff.is_active,
      // ВАЖНО: добавляем поля image и image_url
      image: staff.image || null,
      image_url: staff.image_url || staff.image || null
    }));
    
    const departments = await getStaffDepartments(USE_MOCK_DATA);
    const departmentList = [
      { id: 'all', label: 'Все отделы', count: employees.length }
    ];
    
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
    return { 
      employees: [], 
      departments: [{ id: 'all', label: 'Все отделы', count: 0 }]
    };
  }
}

// Получение сотрудника по ID
export async function getEmployeeById(employeeId, USE_MOCK_DATA) {
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
      current_tasks: 5,
      closed_on_time_tasks: 15,
      closed_late_tasks: 2,
      failed_tasks: 1,
      statistic_percent: 74,
      statistic_label: 'Отлично',
      director: {
        id: 1,
        name: 'Васильев Дмитрий',
        post: 'Директор'
      }
    };
    
    return mockEmployee;
  }
  
  try {
    const response = await authFetch(`${API_CONFIG.BASE_URL}staff/staff/${employeeId}/`, {
      method: 'GET'
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const staffData = await response.json();

    const employee = {
      id: staffData.id,
      name: staffData.name,
      position: staffData.post,
      post: staffData.post,
      image: staffData.image || null,
      image_url: staffData.image_url || staffData.image || null,
      department: staffData.department?.toString() || '0',
      departmentLabel: staffData.department_name || 'Не указан',
      email: staffData.email,
      phone: staffData.phone,
      birthday: staffData.birthday,
      dream: staffData.dream || '',
      is_active: staffData.is_active,
      created: staffData.created,
      telegram: staffData.telegram || '@acrelis',
      current_tasks: staffData.current_tasks || 0,
      closed_on_time_tasks: staffData.closed_on_time_tasks || 0,
      closed_late_tasks: staffData.closed_late_tasks || 0,
      failed_tasks: staffData.failed_tasks || 0,
      director: staffData.director || null,
      statistic_percent: staffData.statistic_percent ?? null,
      statistic_label: staffData.statistic_label ?? '',
      shared_project_team: staffData.shared_project_team,
      joint_project_collaborators: staffData.joint_project_collaborators,
      coworkers_shared_projects: staffData.coworkers_shared_projects,
      shared_project_members: staffData.shared_project_members
    };
    
    return employee;
  } catch (error) {
    throw error;
  }
}

// Обновление сотрудника по ID
export async function updateEmployeeById(employeeId, updateData, USE_MOCK_DATA) {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { id: parseInt(employeeId), ...updateData };
  }

  const formData = new FormData();
  Object.entries(updateData).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (typeof Blob !== 'undefined' && value instanceof Blob) {
      formData.append(key, value);
      return;
    }
    formData.append(key, typeof value === 'string' ? value : String(value));
  });

  const response = await authFetch(`${API_CONFIG.BASE_URL}staff/staff/${employeeId}/`, {
    method: 'PATCH',
    body: formData
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

// Форматирование данных проекта
// Форматирование данных проекта
// Форматирование данных проекта
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
    hours: project.hours || 0, // Добавляем часы
    customer: project.customer || 'Не указан',
    
    startDate: project.start_date || project.created || '',
    deadline: project.deadline || '',
    
    startDateFormatted: formatDateForDisplay(project.start_date || project.created),
    deadlineFormatted: formatDateForDisplay(project.deadline),
    
    performers: project.performers || [],
    
    team: (project.performers || []).map(p => ({
      id: p.id,
      name: p.staff_name || 'Исполнитель',
      staff_name: p.staff_name || 'Исполнитель',
      staff_image: p.staff_image,
      role: p.staff_post || 'Участник',
      assigned_at: p.assigned_at
    })),
    
    files: (project.files || []).map(file => ({
      id: file.id,
      name: file.original_filename || file.file.split('/').pop(),
      originalName: file.original_filename || file.file.split('/').pop(),
      file: file.file || file.file_url,
      uploaded_at: file.uploaded_at,
      size: file.size || file.file_size || 0
    })),
    
    logs: project.logs || [],
    ganttTasks: []
  };
}

// Конвертация даты в формат API
function convertToAPIDate(dateString) {
  if (!dateString) return null;
  
  if (dateString.includes('T') && dateString.includes('+')) {
    return dateString;
  }
  
  if (dateString.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
    const [day, month, year] = dateString.split('.');
    return `${year}-${month}-${day}`;
  }
  
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateString;
  }
  
  return dateString;
}

// Форматирование даты для отображения
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

// Форматирование моковых проектов
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

// Генерация типов проектов (без пункта «all» — его рисует UI ProjectsList)
function generateProjectTypes(projects) {
  const typeCounts = {};

  projects.forEach((project) => {
    typeCounts[project.type] = (typeCounts[project.type] || 0) + 1;
  });

  return Object.entries(typeCounts).map(([type, count]) => ({
    id: type,
    label: PROJECT_TYPE_MAP[type] || 'Другое',
    count,
  }));
}

// Очистка цены для API
function cleanPriceForAPI(price) {
  if (typeof price === 'number') return price.toFixed(2);
  const clean = price.toString()
    .replace(/[^\d.,]/g, '')
    .replace(',', '.');
  const num = parseFloat(clean);
  return isNaN(num) ? "0.00" : num.toFixed(2);
}

// Форматирование даты и времени
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

// Получение отображаемого статуса
function getStatusDisplay(status) {
  const statusMap = {
    'draft': 'Черновик',
    'active': 'В работе',
    'paused': 'Приостановлен',
    'tests': 'Тестируется',
    'completed': 'Завершен',
    'cancelled': 'Отменен'
  };
  return statusMap[status] || 'Черновик';
}

// Получение fallback проекта
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

// В ERP_front/src/services/api/api.js
// Регистрация по инвайт-ссылке
// ERP_front/src/services/api/api.js - обновленная функция registerByInvite

// Регистрация по инвайт-ссылке
// ERP_front/src/services/api/api.js - исправленная функция registerByInvite

// Регистрация по инвайт-ссылке
// ERP_front/src/services/api/api.js - полностью исправленная функция registerByInvite

// Регистрация по инвайт-ссылке
export async function registerByInvite(token, userData) {
  try {
    

    const response = await fetch(`${API_CONFIG.BASE_URL}staff/register/invite/${token}/`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });



    const responseText = await response.text();

    if (!response.ok) {
      let errorMessage = 'Ошибка регистрации';
      
      // Пытаемся распарсить JSON ошибки
      if (responseText) {
        try {
          const errorData = JSON.parse(responseText);
          
          // Извлекаем сообщение об ошибке
          if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.non_field_errors) {
            errorMessage = Array.isArray(errorData.non_field_errors) 
              ? errorData.non_field_errors.join(', ')
              : errorData.non_field_errors;
          } else if (typeof errorData === 'object') {
            // Собираем все ошибки полей
            const fieldErrors = [];
            for (const [field, errors] of Object.entries(errorData)) {
              if (Array.isArray(errors)) {
                fieldErrors.push(`${field}: ${errors.join(', ')}`);
              } else if (typeof errors === 'string') {
                fieldErrors.push(`${field}: ${errors}`);
              }
            }
            if (fieldErrors.length > 0) {
              errorMessage = fieldErrors.join('; ');
            }
          }
        } catch (parseError) {
          // Если не удалось распарсить, но есть текст
          if (responseText.includes('Приглашение истекло') || 
              responseText.includes('Неверное или несуществующее приглашение')) {
            errorMessage = responseText;
          }
        }
      }
      
      // Дополнительные проверки на основе статуса
      if (response.status === 404) {
        errorMessage = 'Ссылка приглашения не найдена';
      }
      
      throw new Error(errorMessage);
    }

    // Если ответ успешный
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      throw new Error('Ошибка обработки ответа от сервера');
    }
    
    
    // Если в ответе есть токены - сохраняем их
    if (result.access && result.refresh) {
      saveTokens(result);
      
      // Сохраняем данные пользователя если они есть
      if (result.user_id || result.username) {
        saveUserData(result);
      }
    }
    
    return {
      success: true,
      message: 'Регистрация по приглашению прошла успешно!',
      data: result
    };
    
  } catch (error) {
    throw error;
  }
}
export async function validateInviteToken(token) {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}staff/register/invite/${token}/validate/`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Невалидный или просроченный инвайт');
    }

    const data = await response.json();
    return {
      valid: true,
      data: data
    };
    
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
}