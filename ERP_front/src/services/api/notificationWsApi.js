import { createWebSocket } from './wsClient';

export function createNotificationSocket(token) {
  return createWebSocket('ws/notifications/', token);
}
