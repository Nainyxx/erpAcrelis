import { BASE_WS_URL } from './config';
import { getAccessToken } from './tokenStore';
import { refreshAccessToken } from './httpClient';

function withWsBase(path) {
  return `${BASE_WS_URL}${path.replace(/^\//, '')}`;
}

export function buildWsUrl(path, token = getAccessToken()) {
  const suffix = token ? `?token=${encodeURIComponent(token)}` : '';
  return `${withWsBase(path)}${suffix}`;
}

export function createWebSocket(path, token = getAccessToken()) {
  return new WebSocket(buildWsUrl(path, token));
}

export async function refreshWsToken() {
  return refreshAccessToken();
}
