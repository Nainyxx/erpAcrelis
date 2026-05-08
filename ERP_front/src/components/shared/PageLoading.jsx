import './PageLoading.css';

/**
 * Универсальный блок загрузки: спиннер и опциональные подписи.
 *
 * @param {Object} props
 * @param {string} [props.title]
 * @param {string} [props.subtitle]
 * @param {string} [props.className]
 */
export function PageLoading({ title, subtitle, className = '' }) {
  const rootClass = ['page-loading', className].filter(Boolean).join(' ');

  const label = title || subtitle || 'Загрузка';

  return (
    <div
      className={rootClass}
      role="status"
      aria-busy="true"
      aria-label={label}
    >
      <div className="page-loading__spinner" aria-hidden />
      {title ? <h3 className="page-loading__title">{title}</h3> : null}
      {subtitle ? (
        <p className="page-loading__subtitle">{subtitle}</p>
      ) : null}
    </div>
  );
}
