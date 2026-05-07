import React from 'react';
import './CreateEntityModal.css';

const CreateEntityModal = ({
  title,
  isOpen,
  isSubmitting = false,
  error = '',
  submitLabel = 'Создать',
  submittingLabel = 'Создание...',
  onClose,
  onSubmit,
  children
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay123">
      <div className="modal-content123">
        <div className="modal-header123">
          <h2>{title}</h2>
          <button
            type="button"
            className="modal-close123"
            onClick={onClose}
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        <div className="modal-body123">
          {error && (
            <div className="error-message123">{error}</div>
          )}
          {children}
        </div>

        <div className="modal-footer123">
          <button
            type="button"
            className="btn-cancel123"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Отмена
          </button>
          <button
            type="button"
            className="btn-create123"
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? submittingLabel : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateEntityModal;
