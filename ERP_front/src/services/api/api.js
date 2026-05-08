import { BASE_HTTP_URL } from './config';
import {
  authFetch,
  buildSearchUrl,
  formDataFrom,
  refreshAccessToken,
  requestAuthJson
} from './httpClient';
import {
  clearTokens,
  clearUserData,
  getAccessToken,
  getRefreshToken,
  saveTokens,
  saveUserData
} from './tokenStore';
import {
  getProjectTypeLabel,
  normalizeProjectType
} from '../../constants/projects';
import { getTaskStatusLabel } from '../../constants/tasks';
import {
  cleanPriceForAPI,
  formatDateForApi,
  formatDateForDisplay
} from './formatters';
import {
  formatEmployee,
  formatProjectData,
  formatProjectListItem,
  formatProjectLog,
  formatStaffListItem,
  generateProjectTypes
} from './mappers';
import { mockDelay, withMock } from './mockHelper';

export {
  clearTokens,
  clearUserData,
  getAccessToken,
  getRefreshToken,
  saveTokens,
  saveUserData,
  authFetch,
  refreshAccessToken,
  formatDateForDisplay
};

const PROJECTS_PAGE_SIZE = 20;
const TASKS_PAGE_SIZE = 20;

/* ------------------------------------------------------------------ */
/*                              Auth                                  */
/* ------------------------------------------------------------------ */

export async function login(username, password) {
  const response = await fetch(`${BASE_HTTP_URL}auth/login/`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
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
}

export async function register(userData) {
  const response = await fetch(`${BASE_HTTP_URL}auth/register/`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json'
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
      const errorMessage =
        Object.values(errorData).flat().join(', ') || 'Ошибка регистрации';
      throw new Error(errorMessage);
    } catch {
      throw new Error(`Ошибка регистрации: ${response.status}`);
    }
  }

  await response.json();
  return {
    success: true,
    message: 'Регистрация прошла успешно'
  };
}

export function isAuthenticated() {
  const token = getAccessToken();
  return !!token && token !== '';
}

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
  } catch {
    return {
      user_id: null,
      staff_id: null,
      id: null,
      name: 'Текущий пользователь'
    };
  }
}

/** Полный URL картинки сотрудника/медиа: путь с бэка или уже абсолютный URL. */
export function getStaffMediaUrl(pathOrUrl) {
  if (pathOrUrl == null || pathOrUrl === '') return null;
  const v = String(pathOrUrl).trim();
  if (!v) return null;
  if (v.startsWith('http://') || v.startsWith('https://')) return v;
  const base = BASE_HTTP_URL.replace(/\/?$/, '');
  const path = v.startsWith('/') ? v.slice(1) : v;
  return `${base}/media/${path}`;
}

/* ------------------------------------------------------------------ */
/*                             Projects                                */
/* ------------------------------------------------------------------ */

export function getProjects(USE_MOCK_DATA, filters = {}) {
  return withMock({
    enabled: USE_MOCK_DATA,
    mock: async () => {
      const mockModule = await import('../../MockData/projects.js');
      const mockProjects = mockModule.projectsData || [];

      const page = parseInt(filters.page) || 1;
      const startIndex = (page - 1) * PROJECTS_PAGE_SIZE;
      const endIndex = startIndex + PROJECTS_PAGE_SIZE;
      const paginatedProjects = mockProjects
        .slice(startIndex, endIndex)
        .map(formatProjectListItem);
      const projectTypes = generateProjectTypes(mockProjects.map(formatProjectListItem));

      return {
        projects: paginatedProjects,
        projectTypes,
        pagination: {
          count: mockProjects.length,
          next: page * PROJECTS_PAGE_SIZE < mockProjects.length ? page + 1 : null,
          previous: page > 1 ? page - 1 : null,
          current_page: page,
          total_pages: Math.ceil(mockProjects.length / PROJECTS_PAGE_SIZE)
        }
      };
    },
    real: async () => {
      const url = buildSearchUrl('projects/', filters, { ordering: '-id' });
      const projectsData = await requestAuthJson(url, { method: 'GET' });

      const currentPage = parseInt(filters.page) || 1;
      const formattedProjects = (projectsData.results || projectsData).map(
        formatProjectListItem
      );
      const projectTypes = generateProjectTypes(formattedProjects);
      const totalCount = projectsData.count || formattedProjects.length;
      const totalPages = Math.ceil(totalCount / PROJECTS_PAGE_SIZE);

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
    }
  });
}

export function getProjectById(projectId, USE_MOCK_DATA) {
  return withMock({
    enabled: USE_MOCK_DATA,
    delay: 0,
    mock: async () => {
      const mockModule = await import('../../MockData/projects.js');
      const mockProjects = mockModule.projectsData || [];
      const project = mockProjects.find((p) => p.id === projectId) || getFallbackProject();
      return formatProjectData(project);
    },
    real: async () => {
      const project = await requestAuthJson(`projects/${projectId}/`, { method: 'GET' });
      return formatProjectData(project);
    }
  });
}

export function updateProject(projectId, updateData, USE_MOCK_DATA) {
  return withMock({
    enabled: USE_MOCK_DATA,
    mock: async () => {
      const project = await getProjectById(projectId, true);
      const updated = { ...project, ...updateData };

      if (updateData.hours !== undefined) {
        updated.hours = updateData.hours;
      }

      return formatProjectData(updated);
    },
    real: async () => {
      const fields = {};
      if (updateData.status !== undefined) fields.status = updateData.status;
      if (updateData.start_date !== undefined) fields.start_date = updateData.start_date;
      if (updateData.deadline !== undefined) fields.deadline = updateData.deadline;
      if (updateData.type !== undefined) fields.type = normalizeProjectType(updateData.type);
      if (updateData.price !== undefined) fields.price = cleanPriceForAPI(updateData.price);
      if (updateData.customer !== undefined) fields.customer = updateData.customer;
      if (updateData.hours !== undefined) fields.hours = updateData.hours;

      const responseData = await requestAuthJson(`projects/${projectId}/`, {
        method: 'PATCH',
        body: formDataFrom(fields)
      });
      return formatProjectData(responseData);
    }
  });
}

export function createProject(projectData, USE_MOCK_DATA) {
  return withMock({
    enabled: USE_MOCK_DATA,
    mock: async () => {
      const mockId = Math.floor(Math.random() * 1000) + 100;
      const mockProject = {
        id: mockId,
        name: projectData.name || 'Новый проект',
        type: projectData.type || 'website',
        status: projectData.status || 'draft',
        price: projectData.price || '0.00',
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
    },
    real: async () => {
      const fields = {
        name: projectData.name,
        type: projectData.type,
        status: projectData.status,
        customer: projectData.customer,
        deadline: projectData.deadline,
        hours: projectData.hours
      };
      if (projectData.price) {
        fields.price = cleanPriceForAPI(projectData.price);
      }
      if (projectData.available !== undefined) {
        fields.available = projectData.available;
      }

      const responseData = await requestAuthJson('projects/', {
        method: 'POST',
        body: formDataFrom(fields)
      });
      return formatProjectData(responseData);
    }
  });
}

export function uploadFileToProject(projectId, file, USE_MOCK_DATA) {
  return withMock({
    enabled: USE_MOCK_DATA,
    delay: 500,
    mock: () => ({
      id: Math.floor(Math.random() * 1000),
      name: file.name,
      file: `https://example.com/files/${file.name}`,
      uploaded_at: new Date().toISOString(),
      size: file.size
    }),
    real: async () => {
      const responseData = await requestAuthJson(`projects/${projectId}/files/`, {
        method: 'POST',
        body: formDataFrom({ file })
      });
      return {
        id: responseData.id,
        name: file.name,
        file: responseData.file,
        uploaded_at: responseData.uploaded_at,
        size: file.size
      };
    }
  });
}

export function addPerformerToProject(projectId, staffId, USE_MOCK_DATA) {
  return withMock({
    enabled: USE_MOCK_DATA,
    mock: () => ({
      id: Math.floor(Math.random() * 1000),
      staff: staffId,
      staff_name: 'Иван Иванов',
      staff_post: 'Разработчик',
      assigned_at: new Date().toISOString()
    }),
    real: () =>
      requestAuthJson(`projects/${projectId}/performers/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: parseInt(projectId),
          staff: parseInt(staffId)
        })
      })
  });
}

export async function getProjectLogs(projectId, USE_MOCK_DATA) {
  if (USE_MOCK_DATA) {
    await mockDelay(200);
    const mockLogs = [
      { id: 1, content: 'Проект создан', created: '2025-12-23T10:00:00+03:00' },
      { id: 2, content: 'Добавлен исполнитель', created: '2025-12-23T11:30:00+03:00' }
    ];
    return mockLogs.map(formatProjectLog);
  }

  try {
    const logsData = await requestAuthJson(`projects/${projectId}/logs/?page=1`, {
      method: 'GET'
    });
    return (logsData || []).map(formatProjectLog);
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ */
/*                              Tasks                                  */
/* ------------------------------------------------------------------ */

export async function getTasks(USE_MOCK_DATA, filters = {}) {
  if (USE_MOCK_DATA) {
    await mockDelay();

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
      ...Array.from({ length: 50 }, (_, i) => ({
        id: i + 3,
        name: `Задача ${i + 3}`,
        status: i % 3 === 0 ? 'new' : i % 3 === 1 ? 'active' : 'completed',
        status_display:
          i % 3 === 0 ? 'Новое' : i % 3 === 1 ? 'В работе' : 'Завершено',
        project: (i % 2) + 1,
        project_name: i % 2 === 0 ? 'Веб-сайт компании' : 'Мобильное приложение',
        director: 1,
        director_name: 'Иван Иванов',
        performer: 4,
        performer_name: 'Лутфуллин Амир',
        deadline: `2025-12-${25 + (i % 5)}T10:00:00+03:00`,
        is_overdue: false,
        created: `2025-12-${20 + (i % 3)}T10:00:00+03:00`,
        hours: 8
      }))
    ];

    let list = [...mockTasks];
    if (filters.status) list = list.filter((t) => t.status === filters.status);
    if (filters.performer)
      list = list.filter((t) => String(t.performer) === String(filters.performer));
    if (filters.director)
      list = list.filter((t) => String(t.director) === String(filters.director));
    if (filters.project)
      list = list.filter((t) => String(t.project) === String(filters.project));

    const page = parseInt(filters.page, 10) || 1;
    const count = list.length;
    const startIndex = (page - 1) * TASKS_PAGE_SIZE;
    const endIndex = startIndex + TASKS_PAGE_SIZE;
    const paginatedTasks = list.slice(startIndex, endIndex);
    const totalPages = Math.max(1, Math.ceil(count / TASKS_PAGE_SIZE));

    return {
      results: paginatedTasks,
      count,
      next: page * TASKS_PAGE_SIZE < count ? page + 1 : null,
      previous: page > 1 ? page - 1 : null,
      current_page: page,
      total_pages: totalPages
    };
  }

  try {
    const url = buildSearchUrl('tasks/', filters, { ordering: '-deadline' });
    return await requestAuthJson(url, { method: 'GET' });
  } catch {
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

export async function getTasksByPerformer(performerId, USE_MOCK_DATA) {
  if (USE_MOCK_DATA) {
    return getTasks(true, {});
  }
  try {
    return await getTasks(false, { performer: performerId });
  } catch {
    return [];
  }
}

export function createTask(taskData, USE_MOCK_DATA) {
  return withMock({
    enabled: USE_MOCK_DATA,
    mock: () => ({
      id: Math.floor(Math.random() * 1000) + 100,
      name: taskData.name,
      description: taskData.description || '',
      status: taskData.status || 'new',
      status_display:
        taskData.status === 'completed'
          ? 'Завершено'
          : taskData.status === 'active'
          ? 'В работе'
          : 'Новое',
      project: taskData.project || null,
      project_name: taskData.project_name || null,
      director: taskData.director || null,
      director_name: taskData.director_name || null,
      performer: taskData.performer || null,
      performer_name: taskData.performer_name || null,
      deadline: taskData.deadline,
      hours: taskData.hours || 0,
      is_overdue: false,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      files: [],
      comments: []
    }),
    real: () => {
      const fields = {
        name: taskData.name,
        description: taskData.description || taskData.name,
        status: taskData.status || 'new'
      };
      if (taskData.deadline) fields.deadline = formatDateForApi(taskData.deadline);
      if (taskData.project != null) fields.project = taskData.project;
      if (taskData.performer != null) fields.performer = taskData.performer;
      if (taskData.director != null) fields.director = taskData.director;
      if (taskData.hours !== undefined) fields.hours = taskData.hours;

      return requestAuthJson('tasks/', {
        method: 'POST',
        body: formDataFrom(fields)
      });
    }
  });
}

export function getTaskById(taskId, USE_MOCK_DATA) {
  return withMock({
    enabled: USE_MOCK_DATA,
    mock: () => ({
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
      performer_image: 'staff_photos/1716959483_9fcb82061eb13984e346a7a61fed9400.jpg',
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
    }),
    real: () => requestAuthJson(`tasks/${taskId}/`, { method: 'GET' })
  });
}

/**
 * Запись о начислении зарплаты при закрытии задачи.
 * Пишет напрямую через authFetch — нужно мягкое поведение для 400 ("уже существует") и 404 (вернуть null).
 */
export async function createSalaryRecord(taskId, completionDate, USE_MOCK_DATA) {
  if (USE_MOCK_DATA) {
    await mockDelay();
    return [
      {
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
      }
    ];
  }

  try {
    const formattedDate = formatDateForApi(completionDate);
    const response = await authFetch('salary/create/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task_id: taskId,
        completion_date: formattedDate
      })
    });

    if (!response.ok) {
      const errorText = await response.text();

      if (response.status === 400) {
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.detail && errorData.detail.includes('уже существует')) {
            return null;
          }
        } catch {
          /* парсинг — best effort */
        }
      }

      if (response.status === 404) {
        return null;
      }

      throw new Error(`Ошибка создания записи о зарплате: ${response.status}`);
    }

    return response.json();
  } catch {
    return null;
  }
}

export async function updateTask(taskId, updateData, USE_MOCK_DATA) {
  if (USE_MOCK_DATA) {
    await mockDelay();

    const currentTask = await getTaskById(taskId, true);
    const updated = { ...currentTask, ...updateData };

    if (updateData.status) {
      updated.status_display = getTaskStatusLabel(updateData.status);
    }

    if (updateData.status === 'completed' && currentTask.status !== 'completed') {
      try {
        const today = new Date().toISOString().split('T')[0];
        await createSalaryRecord(taskId, today, USE_MOCK_DATA);
      } catch {
        /* мок-режим — глушим */
      }
    }

    return updated;
  }

  const fields = {};
  if (updateData.name !== undefined) fields.name = updateData.name;
  if (updateData.description !== undefined) fields.description = updateData.description;
  if (updateData.project !== undefined)
    fields.project = updateData.project === null ? '' : updateData.project;
  if (updateData.status !== undefined) fields.status = updateData.status;
  if (updateData.deadline !== undefined) {
    fields.deadline = updateData.deadline ? formatDateForApi(updateData.deadline) : '';
  }
  if (updateData.performer !== undefined)
    fields.performer = updateData.performer === null ? '' : updateData.performer;
  if (updateData.director !== undefined)
    fields.director = updateData.director === null ? '' : updateData.director;
  if (updateData.hours !== undefined) fields.hours = updateData.hours;

  let oldStatus = null;
  try {
    const currentTask = await getTaskById(taskId, USE_MOCK_DATA);
    oldStatus = currentTask.status;
  } catch {
    /* старый статус неизвестен — продолжаем без проверки */
  }

  const responseData = await requestAuthJson(`tasks/${taskId}/`, {
    method: 'PATCH',
    body: formDataFrom(fields)
  });

  if (updateData.status === 'completed' && oldStatus !== 'completed') {
    setTimeout(async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        await createSalaryRecord(taskId, today, USE_MOCK_DATA);
      } catch {
        /* фон-задача — без падений */
      }
    }, 1000);
  }

  return responseData;
}

export async function checkSalaryExists() {
  return false;
}

export function uploadFileToTask(taskId, file, USE_MOCK_DATA) {
  return withMock({
    enabled: USE_MOCK_DATA,
    delay: 500,
    mock: () => ({
      id: Math.floor(Math.random() * 1000),
      file: `https://api.acrelis.ru/media/task_files/${file.name}`,
      uploaded_at: new Date().toISOString()
    }),
    real: () =>
      requestAuthJson(`tasks/${taskId}/files/`, {
        method: 'POST',
        body: formDataFrom({ file })
      })
  });
}

export function addCommentToTask(taskId, commentData, USE_MOCK_DATA) {
  return withMock({
    enabled: USE_MOCK_DATA,
    mock: () => ({
      id: Math.floor(Math.random() * 1000),
      author_name: 'Текущий пользователь',
      content: commentData.content,
      created: new Date().toISOString()
    }),
    real: () =>
      requestAuthJson(`tasks/${taskId}/comments/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentData.content })
      })
  });
}

/* ------------------------------------------------------------------ */
/*                              Staff                                  */
/* ------------------------------------------------------------------ */

export async function getStaffDepartments(USE_MOCK_DATA) {
  if (USE_MOCK_DATA) {
    await mockDelay();
    return [
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
  }

  try {
    return await requestAuthJson('staff/departments/', { method: 'GET' });
  } catch {
    return [];
  }
}

export async function getStaffList(USE_MOCK_DATA, filters = {}) {
  if (USE_MOCK_DATA) {
    await mockDelay();

    const mockEmployees = [
      {
        id: 1,
        name: 'Иван Иванов',
        position: 'Руководитель отдела разработки',
        department: 'development',
        departmentLabel: 'Отдел разработки',
        email: 'ivan@company.com',
        phone: '+7 (999) 123-45-67'
      }
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
    const params = {};
    if (filters.department && filters.department !== 'all') {
      params.department = filters.department;
    }
    if (filters.search) params.search = filters.search;
    if (filters.is_active !== undefined) params.is_active = filters.is_active;

    const url = buildSearchUrl('staff/staff/', params);
    const responseData = await requestAuthJson(url, { method: 'GET' });

    const employees = (responseData || []).map(formatStaffListItem);

    const departments = await getStaffDepartments(USE_MOCK_DATA);
    const departmentList = [{ id: 'all', label: 'Все отделы', count: employees.length }];

    if (Array.isArray(departments)) {
      departments.forEach((dept) => {
        const count = employees.filter(
          (emp) => emp.department === dept.id.toString()
        ).length;
        departmentList.push({
          id: dept.id.toString(),
          label: dept.name || `Отдел ${dept.id}`,
          count
        });
      });
    }

    return { employees, departments: departmentList };
  } catch {
    return {
      employees: [],
      departments: [{ id: 'all', label: 'Все отделы', count: 0 }]
    };
  }
}

export function getEmployeeById(employeeId, USE_MOCK_DATA) {
  return withMock({
    enabled: USE_MOCK_DATA,
    mock: () => ({
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
      director: { id: 1, name: 'Васильев Дмитрий', post: 'Директор' }
    }),
    real: async () => {
      const staffData = await requestAuthJson(`staff/staff/${employeeId}/`, {
        method: 'GET'
      });
      return formatEmployee(staffData);
    }
  });
}

export function updateEmployeeById(employeeId, updateData, USE_MOCK_DATA) {
  return withMock({
    enabled: USE_MOCK_DATA,
    mock: () => ({ id: parseInt(employeeId), ...updateData }),
    real: () =>
      requestAuthJson(`staff/staff/${employeeId}/`, {
        method: 'PATCH',
        body: formDataFrom(updateData)
      })
  });
}

/* ------------------------------------------------------------------ */
/*                            Invitations                              */
/* ------------------------------------------------------------------ */

export async function registerByInvite(token, userData) {
  const response = await fetch(`${BASE_HTTP_URL}staff/register/invite/${token}/`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });

  const responseText = await response.text();

  if (!response.ok) {
    let errorMessage = 'Ошибка регистрации';

    if (responseText) {
      try {
        const errorData = JSON.parse(responseText);

        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.non_field_errors) {
          errorMessage = Array.isArray(errorData.non_field_errors)
            ? errorData.non_field_errors.join(', ')
            : errorData.non_field_errors;
        } else if (typeof errorData === 'object') {
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
      } catch {
        if (
          responseText.includes('Приглашение истекло') ||
          responseText.includes('Неверное или несуществующее приглашение')
        ) {
          errorMessage = responseText;
        }
      }
    }

    if (response.status === 404) {
      errorMessage = 'Ссылка приглашения не найдена';
    }

    throw new Error(errorMessage);
  }

  let result;
  try {
    result = JSON.parse(responseText);
  } catch {
    throw new Error('Ошибка обработки ответа от сервера');
  }

  if (result.access && result.refresh) {
    saveTokens(result);
    if (result.user_id || result.username) {
      saveUserData(result);
    }
  }

  return {
    success: true,
    message: 'Регистрация по приглашению прошла успешно!',
    data: result
  };
}

export async function validateInviteToken(token) {
  try {
    const response = await fetch(
      `${BASE_HTTP_URL}staff/register/invite/${token}/validate/`,
      {
        method: 'GET',
        headers: { accept: 'application/json' }
      }
    );

    if (!response.ok) {
      throw new Error('Невалидный или просроченный инвайт');
    }

    const data = await response.json();
    return { valid: true, data };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

/* ------------------------------------------------------------------ */
/*                          Internal helpers                           */
/* ------------------------------------------------------------------ */

function getFallbackProject() {
  return {
    id: 1,
    name: 'Тестовый проект',
    type: 'other',
    typeLabel: getProjectTypeLabel('other'),
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
