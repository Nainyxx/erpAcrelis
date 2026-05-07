import { BASE_HTTP_URL, CSRF_TOKEN } from './config';
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from './tokenStore';

let refreshPromise = null;

function redirectToLogin() {
  if (typeof window !== 'undefined') {
    window.location.href = '#/login';
  }
}

function withBase(pathOrUrl) {
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }
  return `${BASE_HTTP_URL}${pathOrUrl.replace(/^\//, '')}`;
}

export async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refresh = getRefreshToken();
    const access = getAccessToken();

    if (!refresh || !access || access === '') {
      clearTokens();
      redirectToLogin();
      throw new Error('Требуется повторная авторизация');
    }

    const response = await fetch(withBase('auth/refresh/'), {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access}`
      },
      body: JSON.stringify({ refresh })
    });

    if (!response.ok) {
      if (response.status === 401) {
        clearTokens();
        redirectToLogin();
        throw new Error('Сессия истекла');
      }
      const errorText = await response.text();
      throw new Error(errorText || `Ошибка обновления: ${response.status}`);
    }

    const newTokens = await response.json();

    if (!newTokens.access) {
      throw new Error('Не получили новый токен');
    }

    saveTokens(newTokens);
    return newTokens.access;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

export async function authFetch(pathOrUrl, options = {}) {
  const url = withBase(pathOrUrl);
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${getAccessToken()}`,
    accept: 'application/json'
  };

  if (!url.includes('auth/')) {
    headers['X-CSRFTOKEN'] = CSRF_TOKEN;
  }

  const requestOptions = { ...options, headers };
  const response = await fetch(url, requestOptions);

  if (response.status !== 401) {
    return response;
  }

  if (url.includes('auth/')) {
    clearTokens();
    redirectToLogin();
    throw new Error('Требуется повторная авторизация');
  }

  try {
    const newAccess = await refreshAccessToken();
    requestOptions.headers.Authorization = `Bearer ${newAccess}`;
    const retryResponse = await fetch(url, requestOptions);

    if (retryResponse.status === 401) {
      clearTokens();
      redirectToLogin();
      throw new Error('Не удалось обновить сессию');
    }

    return retryResponse;
  } catch (refreshError) {
    clearTokens();
    redirectToLogin();
    throw refreshError;
  }
}

export async function requestAuth(pathOrUrl, options = {}) {
  const response = await authFetch(pathOrUrl, options);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `API Error: ${response.status}`);
  }
  return response;
}

export async function requestPublic(pathOrUrl, options = {}) {
  const response = await fetch(withBase(pathOrUrl), options);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || `API Error: ${response.status}`);
  }
  return response;
}
