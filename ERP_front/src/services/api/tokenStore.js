import { TOKEN_KEYS } from './config';

let inMemoryAccessToken = '';

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEYS.access) || inMemoryAccessToken || '';
}

export function getRefreshToken() {
  return localStorage.getItem(TOKEN_KEYS.refresh) || '';
}

export function saveTokens(tokens) {
  if (tokens?.access) {
    localStorage.setItem(TOKEN_KEYS.access, tokens.access);
    inMemoryAccessToken = tokens.access;
  }
  if (tokens?.refresh) {
    localStorage.setItem(TOKEN_KEYS.refresh, tokens.refresh);
  }
}

export function saveUserData(userData) {
  localStorage.setItem('user_id', userData.user_id?.toString() || '');
  localStorage.setItem('staff_id', userData.staff_id?.toString() || '');
  localStorage.setItem('username', userData.username || '');
  localStorage.setItem('name', userData.name || '');
  localStorage.setItem('email', userData.email || '');
  localStorage.setItem('post', userData.post || '');
  localStorage.setItem('department', userData.department || '');
  localStorage.setItem('role', userData.role || userData.post || '');
}

export function clearUserData() {
  localStorage.removeItem('user_id');
  localStorage.removeItem('staff_id');
  localStorage.removeItem('username');
  localStorage.removeItem('name');
  localStorage.removeItem('email');
  localStorage.removeItem('post');
  localStorage.removeItem('department');
  localStorage.removeItem('role');
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEYS.access);
  localStorage.removeItem(TOKEN_KEYS.refresh);
  inMemoryAccessToken = '';
  clearUserData();
}
