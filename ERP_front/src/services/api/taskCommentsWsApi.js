import { createWebSocket } from './wsClient';

export function createTaskCommentsSocket(taskId, token) {
  return createWebSocket(`ws/task/${taskId}/comments/`, token);
}
