import { Fragment } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Breadcrumbs.css';

/**
 * @typedef {Object} BreadcrumbItem
 * @property {string} label
 * @property {string} [to] — path для navigate()
 * @property {boolean} [preserveSearch] — добавить location.search к `to`
 * @property {() => void} [onClick] — альтернатива `to`
 */

/**
 * @param {Object} props
 * @param {BreadcrumbItem[]} props.items — последний элемент всегда текущая страница (current)
 * @param {string} [props.className]
 */
export function Breadcrumbs({ items = [], className = '' }) {
  const navigate = useNavigate();
  const location = useLocation();

  if (!items.length) return null;

  const rootClass = ['app-breadcrumbs', className].filter(Boolean).join(' ');

  return (
    <nav className={rootClass} aria-label="Навигация по разделам">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        let inner;
        if (isLast) {
          inner = <span className="app-breadcrumbs__current">{item.label}</span>;
        } else {
          const hasAction = item.to != null || typeof item.onClick === 'function';
          if (hasAction) {
            const handleClick = () => {
              if (typeof item.onClick === 'function') {
                item.onClick();
              } else if (item.to != null) {
                const path = item.preserveSearch ? `${item.to}${location.search || ''}` : item.to;
                navigate(path);
              }
            };
            inner = (
              <button type="button" className="app-breadcrumbs__link" onClick={handleClick}>
                {item.label}
              </button>
            );
          } else {
            inner = <span className="app-breadcrumbs__segment">{item.label}</span>;
          }
        }

        return (
          <Fragment key={`crumb-${index}-${item.label}`}>
            {index > 0 ? (
              <span className="app-breadcrumbs__sep" aria-hidden="true">
                {' '}
                /{' '}
              </span>
            ) : null}
            {inner}
          </Fragment>
        );
      })}
    </nav>
  );
}
