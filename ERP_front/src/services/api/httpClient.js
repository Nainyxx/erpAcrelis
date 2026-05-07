import { BASE_HTTP_URL, CSRF_TOKEN } from './config';
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from './tokenStore';

let refreshPromise = null;

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

    if (!refresh || !access) {
      clearTokens();
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
      clearTokens();
      throw new Error('Сессия истекла');
    }

    const data = await response.json();
    saveTokens(data);
    return data.access;
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
  const first = await fetch(url, requestOptions);

  if (first.status !== 401 || url.includes('auth/')) {
    return first;
  }

  const newAccess = await refreshAccessToken();
  requestOptions.headers.Authorization = `Bearer ${newAccess}`;
  return fetch(url, requestOptions);
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
