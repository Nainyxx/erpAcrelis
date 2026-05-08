/**
 * Хелперы для замены повторяющегося шаблона `if (USE_MOCK_DATA) { ... } else { ... }`.
 */

/** Промис-задержка для имитации сетевого запроса в моках. */
export function mockDelay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Если `enabled` — выполняет `mock()` с задержкой `delay`, иначе — `real()`.
 * Обе функции могут быть синхронными или асинхронными.
 *
 * @template T
 * @param {Object} params
 * @param {boolean} params.enabled
 * @param {() => Promise<T> | T} params.real
 * @param {() => Promise<T> | T} params.mock
 * @param {number} [params.delay]
 * @returns {Promise<T>}
 */
export async function withMock({ enabled, real, mock, delay = 300 }) {
  if (enabled) {
    await mockDelay(delay);
    return mock();
  }
  return real();
}
