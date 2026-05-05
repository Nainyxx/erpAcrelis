import React, { useId } from 'react';
import './SelectFilterDropdown.css';

/**
 * Универсальный выпадающий список вариантов (listbox).
 * id для trigger/listbox генерируются через useId(), при необходимости задайте triggerId / listboxId.
 */
export function SelectFilterDropdown({
  labelId,
  menuRef,
  isOpen,
  onToggle,
  showPlaceholder,
  triggerText,
  options,
  selectedId,
  onSelectOption,
  triggerId: triggerIdProp,
  listboxId: listboxIdProp,
  triggerAriaLabel = 'Открыть список',
  className = ''
}) {
  const uid = useId().replace(/:/g, '');
  const triggerId = triggerIdProp ?? `select-filter-${uid}-trigger`;
  const listboxId = listboxIdProp ?? `select-filter-${uid}-listbox`;

  return (
    <div
      className={`select-filter-dropdown${isOpen ? ' is-menu-open' : ''}${className ? ` ${className}` : ''}`}
    >
      <div className="select-filter-dropdown__inner" ref={menuRef}>
        <button
          type="button"
          id={triggerId}
          className={`select-filter-dropdown__trigger${isOpen ? ' is-open' : ''}`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-label={triggerAriaLabel}
          onClick={onToggle}
        >
          <span
            className={`select-filter-dropdown__value${showPlaceholder ? ' is-placeholder' : ''}`}
          >
            {triggerText}
          </span>
          <span className="select-filter-dropdown__chevron" aria-hidden="true">
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.75 4.5 6 7.75l3.25-3.25"
                stroke="#6b6f78"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
        {isOpen ? (
          <div
            id={listboxId}
            className="select-filter-dropdown__panel"
            role="listbox"
            aria-labelledby={labelId}
          >
            {options.map((opt) => {
              const selected =
                selectedId != null && String(opt.id) === String(selectedId);
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`select-filter-dropdown__option${selected ? ' is-selected' : ''}`}
                  onClick={() => onSelectOption(opt.id)}
                >
                  <span className="select-filter-dropdown__option-text">
                    {opt.label}
                  </span>
                  {selected ? (
                    <span
                      className="select-filter-dropdown__check"
                      aria-hidden="true"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M11.083 4 6.125 8.958 2.917 5.75"
                          stroke="#3d6fd8"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  ) : (
                    <span className="select-filter-dropdown__check-placeholder" />
                  )}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
