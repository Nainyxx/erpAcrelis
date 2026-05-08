/**
 * Единый источник истины по типам и статусам проекта.
 * Используется и UI-компонентами (фильтры, селекты), и API-слоем (нормализация, мапперы).
 */

export const PROJECT_TYPES = [
  { id: 'website', label: 'Веб-сайт', aliases: ['сайт', 'вебсайт', 'веб-сайт'] },
  { id: 'bot', label: 'Бот', aliases: ['бот'] },
  { id: 'app', label: 'Приложение', aliases: ['приложение', 'мобильное приложение'] },
  { id: 'miniapp', label: 'Мини-приложение', aliases: ['мини-приложение', 'миниприложение'] },
  { id: 'design', label: 'Дизайн', aliases: ['дизайн'] },
  { id: 'other', label: 'Другое', aliases: ['другое', 'прочее', ''] }
];

export const PROJECT_TYPE_OPTIONS = PROJECT_TYPES.map(({ id, label }) => ({ id, label }));

/** Старые ключи типа, которые могут прилетать из БД/инвайтов. */
export const LEGACY_PROJECT_TYPE_LABELS = {
  mobile: 'Мобильное приложение',
  dashboard: 'Дашборд',
  ecommerce: 'Интернет-магазин',
  system: 'Система'
};

export const PROJECT_STATUSES = [
  { id: 'draft', label: 'Черновик' },
  { id: 'active', label: 'В работе' },
  { id: 'paused', label: 'Приостановлен' },
  { id: 'tests', label: 'Тестируется' },
  { id: 'completed', label: 'Завершен' },
  { id: 'cancelled', label: 'Отменен' }
];

export const PROJECT_STATUS_OPTIONS = PROJECT_STATUSES.map(({ id, label }) => ({ id, label }));

const TYPE_BY_ID = new Map(PROJECT_TYPES.map((t) => [t.id, t]));
const STATUS_BY_ID = new Map(PROJECT_STATUSES.map((s) => [s.id, s]));

const ALIAS_TO_ID = (() => {
  const map = new Map();
  PROJECT_TYPES.forEach((t) => {
    map.set(t.id.toLowerCase(), t.id);
    map.set(t.label.toLowerCase(), t.id);
    (t.aliases || []).forEach((alias) => map.set(alias.toLowerCase(), t.id));
  });
  return map;
})();

/** Лейбл типа проекта по id (включая legacy-ключи). */
export function getProjectTypeLabel(typeId) {
  if (typeId == null) return 'Другое';
  const direct = TYPE_BY_ID.get(typeId);
  if (direct) return direct.label;
  return LEGACY_PROJECT_TYPE_LABELS[typeId] || 'Другое';
}

/** Лейбл статуса проекта по id (с дефолтом «Черновик»). */
export function getProjectStatusLabel(statusId) {
  return STATUS_BY_ID.get(statusId)?.label || 'Черновик';
}

/**
 * Привести произвольный ввод типа (id, русскоязычное название, алиас) к каноническому id.
 * Если ничего не подошло — 'other'.
 */
export function normalizeProjectType(input) {
  if (input == null) return 'other';
  const key = String(input).toLowerCase().trim();
  return ALIAS_TO_ID.get(key) || 'other';
}
