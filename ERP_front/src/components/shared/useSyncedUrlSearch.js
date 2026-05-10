import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/** Сравнение query без учёта порядка ключей */
export function normalizeQueryForCompare(searchStr) {
  const raw = (searchStr || '').replace(/^\?/, '');
  const p = new URLSearchParams(raw);
  return [...p.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
}

/**
 * Держит `pathname` + search в соответствии со строкой из getQueryString().
 * При совпадении (после нормализации) только пишет sessionStorage, без navigate.
 *
 * `location.search` намеренно не входит в зависимости эффекта: иначе при переходе
 * на тот же pathname без query первый проход синхронизации видит старый state
 * (см. комментарий в ProjectsList).
 *
 * @param {object} options
 * @param {string} options.pathname
 * @param {string|null|undefined} options.sessionStorageKey — ключ для sessionStorage или пусто
 * @param {() => string} options.getQueryString — строка query без ведущего «?», может быть ''
 * @param {boolean} [options.skip=false] — не вызывать navigate / запись (например пока state не готов)
 * @param {unknown[]} options.syncDeps — зависимости, при изменении которых пересобирается URL
 */
export function useSyncedUrlSearch({
  pathname,
  sessionStorageKey,
  getQueryString,
  skip = false,
  syncDeps = []
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const getQueryStringRef = useRef(getQueryString);
  getQueryStringRef.current = getQueryString;

  useEffect(() => {
    if (skip) return;
    const built = getQueryStringRef.current();
    const nextSearch = built ? `?${built}` : '';
    if (normalizeQueryForCompare(location.search) === normalizeQueryForCompare(nextSearch)) {
      if (sessionStorageKey) {
        try {
          sessionStorage.setItem(sessionStorageKey, nextSearch);
        } catch (_) { }
      }
      return;
    }
    if (sessionStorageKey) {
      try {
        sessionStorage.setItem(sessionStorageKey, nextSearch);
      } catch (_) { }
    }
    navigate({ pathname, search: nextSearch }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- см. JSDoc: не добавлять location.search
  }, [pathname, navigate, skip, sessionStorageKey, ...syncDeps]);
}
