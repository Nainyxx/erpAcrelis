import React, { useId, useEffect, useRef, useState, useMemo } from 'react';
import './MultiSelectFilterDropdown.css';

/**
 * Выпадающий список с мульти-выбором (чекбоксы).
 */
export function MultiSelectFilterDropdown({
  placeholder = 'Отдел',
  options = [],
  selectedIds = [],
  onToggleOption,
  onClear,
  triggerAriaLabel,
  className = ''
}) {
  const uid = useId().replace(/:/g, '');
  const triggerId = `multi-select-${uid}-trigger`;
  const listboxId = `multi-select-${uid}-listbox`;
  const menuRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const selectedSet = useMemo(
    () => new Set(selectedIds.map((id) => String(id))),
    [selectedIds]
  );

  const triggerText = useMemo(() => {
    if (selectedIds.length === 0) return placeholder;
    if (selectedIds.length === 1) {
      const id = String(selectedIds[0]);
      const opt = options.find((o) => String(o.id) === id);
      return opt?.label ?? placeholder;
    }
    return `${placeholder} (${selectedIds.length})`;
  }, [placeholder, selectedIds, options]);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isOpen]);

  const toggleOpen = () => setIsOpen((o) => !o);

  return (
    <div
      ref={menuRef}
      className={`multi-select-filter-dropdown${isOpen ? ' is-menu-open' : ''}${className ? ` ${className}` : ''
        }`}
    >
      <div className="multi-select-filter-dropdown__inner">
        <button
          type="button"
          id={triggerId}
          className={`multi-select-filter-dropdown__trigger${isOpen ? ' is-open' : ''}`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-label={triggerAriaLabel ?? placeholder}
          onClick={toggleOpen}
        >
          <span
            className={`multi-select-filter-dropdown__value${selectedIds.length === 0 ? ' is-placeholder' : ''
              }`}
          >
            {triggerText}
          </span>
          <span className="multi-select-filter-dropdown__chevron" aria-hidden="true">
            <svg
              width="24"
              height="24"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.75 4.5 6 7.75l3.25-3.25"
                stroke="#4a6b6b"
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
            className="multi-select-filter-dropdown__panel"
            role="listbox"
            aria-multiselectable="true"
          >
            {options.length === 0 ? (
              <div className="multi-select-filter-dropdown__empty">Нет отделов</div>
            ) : (
              options.map((opt) => {
                const selected = selectedSet.has(String(opt.id));
                return (
                  <button
                    key={String(opt.id)}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={`multi-select-filter-dropdown__option${selected ? ' is-selected' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleOption(opt.id);
                    }}
                  >
                    <span
                      className={`multi-select-filter-dropdown__checkbox${selected ? ' is-checked' : ''
                        }`}
                      aria-hidden="true"
                    />
                    <span className="multi-select-filter-dropdown__option-text">{opt.label}</span>
                  </button>
                );
              })
            )}
            {onClear && selectedIds.length > 0 ? (
              <button
                type="button"
                className="multi-select-filter-dropdown__clear"
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
              >
                Сбросить
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
