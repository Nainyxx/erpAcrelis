/**
 * Единый источник истины по статусам задачи.
 * Используется и UI (TaskCard, KanbanTasks, MyTasks), и API-слоем.
 */

export const TASK_STATUSES = [
  { id: 'new', label: 'Новое', progress: 20 },
  { id: 'active', label: 'В работе', progress: 60 },
  { id: 'paused', label: 'Ожидает', progress: 0 },
  { id: 'completed', label: 'Готова', progress: 100 },
  { id: 'draft', label: 'Черновик', progress: 10 },
  { id: 'failed', label: 'Провалена', progress: 0 }
];

/** Опции для селектов: содержат `value`/`apiValue` для совместимости с TaskCard. */
export const TASK_STATUS_OPTIONS = TASK_STATUSES.map((s) => ({
  value: s.id,
  label: s.label,
  progress: s.progress,
  apiValue: s.id
}));

const STATUS_BY_ID = new Map(TASK_STATUSES.map((s) => [s.id, s]));

/** Лейбл статуса задачи по id (с дефолтом «Новая»). */
export function getTaskStatusLabel(statusId) {
  return STATUS_BY_ID.get(statusId)?.label || 'Новая';
}
