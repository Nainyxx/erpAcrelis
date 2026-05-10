import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Navigate } from 'react-router-dom';
import { OPERATIONS_HUB_ALLOWED_ROLES } from '../../constants/roles';
import { getProjects } from '../../services/api';
import { SelectFilterDropdown } from '../shared/SelectFilterDropdown';
import CreateEntityModal from '../shared/CreateEntityModal';
import refreshIconSrc from '../../assets/refresh-icon.svg';
import yesBtnSrc from '../../assets/yes-btn.svg';
import noBtnSrc from '../../assets/no-btn.svg';
import {
  MOCK_ACCOUNT_OPTIONS,
  OPERATION_TYPE_OPTIONS,
  REQUEST_TYPE_OPTIONS,
} from './operationsPageMocks';
import {
  MOCK_REQUESTS,
  REQUEST_SORT_OPTIONS,
  REQUEST_STAFF_FILTER_OPTIONS,
} from '../../MockData/operationsRequestMock';
import './OperationsPage.css';
import './OperationsRequestPage.css';
import { Breadcrumbs } from '../shared/Breadcrumbs';
import { OperationFilesMenu } from '../shared/OperationFilesMenu';

function formatAmount(n) {
  return Math.round(Number(n))
    .toLocaleString('ru-RU')
    .replace(/\u202f/g, '\u00a0');
}

function formatDateTime(iso) {
  const d = new Date(iso);
  const datePart = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
  }).format(d);
  const timePart = new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
  return `${datePart} • ${timePart}`;
}

function BulkToolbarTrashIcon() {
  return (
    <svg
      className="orq-bulk-btn__icon"
      viewBox="0 0 18 18"
      width={22}
      height={22}
      aria-hidden="true"
    >
      <path
        d="M16.492 3.65474H12.152V2.14716C12.152 0.959369 11.2406 0 10.1122 0H7.1827C6.0977 0 5.208 0.925106 5.208 2.06721C5.208 2.78674 5.208 3.28926 5.208 3.65474H0.868C0.3906 3.65474 0 4.0659 0 4.56842C0 5.07095 0.3906 5.48211 0.868 5.48211H1.81195L2.604 14.6646C2.6257 16.1494 3.78665 17.36 5.208 17.36H12.152C13.5734 17.36 14.7343 16.1494 14.756 14.6646L15.548 5.48211H16.492C16.9694 5.48211 17.36 5.07095 17.36 4.56842C17.36 4.0659 16.9694 3.65474 16.492 3.65474ZM6.944 2.07863C6.944 1.94158 7.0525 1.82737 7.1827 1.82737H10.1122C10.2858 1.82737 10.416 1.97584 10.416 2.14716V3.65474H6.93315C6.93315 3.36921 6.93315 2.88953 6.944 2.07863ZM13.02 14.539C13.02 14.5618 13.02 14.5961 13.02 14.6189C13.02 15.1215 12.6294 15.5326 12.152 15.5326H5.208C4.7306 15.5326 4.34 15.1215 4.34 14.6189C4.34 14.5961 4.34 14.5618 4.34 14.539L3.5588 5.48211H13.812L13.02 14.539Z"
        fill="currentColor"
      />
      <path
        d="M6.94417 13.7054C7.42157 13.7054 7.81217 13.2942 7.81217 12.7917V8.22325C7.81217 7.72073 7.42157 7.30957 6.94417 7.30957C6.46677 7.30957 6.07617 7.72073 6.07617 8.22325V12.7917C6.07617 13.2942 6.46677 13.7054 6.94417 13.7054Z"
        fill="currentColor"
      />
      <path
        d="M10.4159 13.7054C10.8933 13.7054 11.2839 13.2942 11.2839 12.7917V8.22325C11.2839 7.72073 10.8933 7.30957 10.4159 7.30957C9.93845 7.30957 9.54785 7.72073 9.54785 8.22325V12.7917C9.54785 13.2942 9.93845 13.7054 10.4159 13.7054Z"
        fill="currentColor"
      />
    </svg>
  );
}

function BulkToolbarCheckIcon() {
  return (
    <svg
      className="orq-bulk-btn__icon"
      viewBox="0 0 22 22"
      width={22}
      height={22}
      fill="none"
      aria-hidden="true"
    >
      <circle cx="11.0652" cy="11.1619" r="10.0837" stroke="currentColor" strokeWidth="1.51" />
      <path
        d="M6.15625 10.6201L9.56095 14.7786L15.8457 7.2207"
        stroke="currentColor"
        strokeWidth="1.50934"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BulkToolbarRejectIcon() {
  return (
    <svg
      className="orq-bulk-btn__icon"
      viewBox="0 0 22 22"
      width={22}
      height={22}
      fill="none"
      aria-hidden="true"
    >
      <circle cx="11.0652" cy="11.1619" r="10.0837" stroke="currentColor" strokeWidth="1.51" />
      <path
        d="M7.91211 8.00586L14.2217 14.3155"
        stroke="currentColor"
        strokeWidth="1.51"
        strokeLinecap="round"
      />
      <path
        d="M14.2227 8.00684L7.91305 14.3164"
        stroke="currentColor"
        strokeWidth="1.51"
        strokeLinecap="round"
      />
    </svg>
  );
}

function RequestCard({ req, selected, onToggleSelected }) {
  const files = req.files?.length ? req.files : [];

  const isIncome = req.type === 'income';
  const sign = isIncome ? '+' : '−';
  const amountClass = `orq-card__sum orq-card__sum--${req.type}`;
  const badgeClass = `orq-card__badge orq-card__badge--${req.type}`;

  return (
    <li className="orq-card">
      <div className="orq-card__select">
        <input
          type="checkbox"
          className="orq-card__check"
          checked={selected}
          onChange={() => onToggleSelected(req.id)}
          aria-label={`Выбрать заявку: ${req.title}`}
        />
      </div>

      <div className="orq-card__main">
        <div className="orq-card__head">
          <span className={badgeClass}>{isIncome ? 'Приход' : 'Расход'}</span>
          <div className="orq-card__dates">
            <span className="orq-card__date">{formatDateTime(req.date)}</span>
            <OperationFilesMenu
              files={files}
              itemKeyPrefix={String(req.id)}
              ariaLabel="Документы заявки"
            />
          </div>
        </div>

        <div className="orq-card__body">
          <p className={amountClass}>
            {sign} {formatAmount(req.amount)} ₽
          </p>
          <p className="orq-card__purpose">{req.purpose}</p>
        </div>
      </div>

      <div className="orq-card__meta">
        <span className="orq-card__label">Проект:</span>
        <span className="orq-card__label">Счёт:</span>
        <span className="orq-card__label">Отв. менеджер:</span>
        <span className="orq-card__val" title={req.projectName}>
          {req.projectName}
        </span>
        <span className="orq-card__val" title={req.accountMasked}>
          {req.accountMasked}
        </span>
        <span className="orq-card__val" title={req.managerName}>
          {req.managerName}
        </span>
      </div>

      <div className="orq-card__actions">
        <button
          type="button"
          className="orq-card__btn orq-card__btn--reject"
          aria-label="Отклонить заявку"
        >
          <img
            src={noBtnSrc}
            alt=""
            width={22}
            height={22}
            decoding="async"
            className="orq-card__ico"
          />
        </button>
        <button
          type="button"
          className="orq-card__btn orq-card__btn--approve"
          aria-label="Подтвердить заявку"
        >
          <img
            src={yesBtnSrc}
            alt=""
            width={22}
            height={22}
            decoding="async"
            className="orq-card__ico"
          />
        </button>
      </div>
    </li>
  );
}

function OperationsRequestPage({ useMockData = false }) {
  const userRole = localStorage.getItem('role');
  const canAccessHub = userRole && OPERATIONS_HUB_ALLOWED_ROLES.includes(userRole);

  const [operationType, setOperationType] = useState('all');
  const [projectId, setProjectId] = useState('all');
  const [staffFilterId, setStaffFilterId] = useState('all');
  const [sortBy, setSortBy] = useState('alpha');
  const [projectsLoaded, setProjectsLoaded] = useState([]);
  const [requests, setRequests] = useState(() => [...MOCK_REQUESTS]);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [showCreateRequestModal, setShowCreateRequestModal] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const createRequestFileInputRef = useRef(null);

  useEffect(() => {
    if (!canAccessHub) return undefined;

    let cancelled = false;

    (async () => {
      try {
        const result = await getProjects(useMockData, {});
        const list = result.projects || [];
        if (!cancelled) setProjectsLoaded(list);
      } catch {
        if (!cancelled) setProjectsLoaded([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [useMockData, canAccessHub]);

  useLayoutEffect(() => {
    const input = createRequestFileInputRef.current;
    if (!input) return undefined;

    const onChange = () => {
      const list = input.files;
      if (!list?.length) return;
      const next = Array.from(list);
      flushSync(() => {
        setAttachedFiles((prev) => [...prev, ...next]);
      });
      input.value = '';
    };

    input.addEventListener('change', onChange);
    return () => input.removeEventListener('change', onChange);
  }, []);

  const projectOptions = useMemo(
    () => [
      { id: 'all', label: 'Все проекты' },
      ...projectsLoaded.map((p) => ({ id: String(p.id), label: p.name })),
    ],
    [projectsLoaded]
  );

  const requestTypeFormOptions = useMemo(
    () => REQUEST_TYPE_OPTIONS.filter((o) => o.id !== 'all'),
    []
  );

  const filteredRequests = useMemo(() => {
    let list = requests.filter((r) => {
      if (operationType !== 'all' && r.type !== operationType) return false;
      if (projectId !== 'all' && String(r.projectId) !== projectId) return false;
      if (staffFilterId !== 'all' && r.staffId !== staffFilterId) return false;
      return true;
    });

    if (sortBy === 'alpha') {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title, 'ru'));
    }

    return list;
  }, [requests, operationType, projectId, staffFilterId, sortBy]);

  const handleToggleSelected = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleResetFilters = () => {
    setOperationType('all');
    setProjectId('all');
    setStaffFilterId('all');
    setSortBy('alpha');
  };

  const openCreateRequestModal = () => {
    setAttachedFiles([]);
    setShowCreateRequestModal(true);
  };

  const closeCreateRequestModal = () => {
    setShowCreateRequestModal(false);
    setAttachedFiles([]);
  };

  const handleClearAttachedFiles = () => {
    setAttachedFiles([]);
    if (createRequestFileInputRef.current) createRequestFileInputRef.current.value = '';
  };

  const showBulkToolbar = selectedIds.size > 0;

  const removeSelectedFromList = () => {
    setRequests((prev) => prev.filter((r) => !selectedIds.has(r.id)));
    setSelectedIds(new Set());
  };

  const handleBulkDelete = () => {
    removeSelectedFromList();
  };

  const handleBulkConfirm = () => {
    removeSelectedFromList();
  };

  const handleBulkReject = () => {
    removeSelectedFromList();
  };

  if (!canAccessHub) {
    const staffId = localStorage.getItem('staff_id');
    if (staffId) {
      return <Navigate to={`/operations/finans/${staffId}`} replace />;
    }
    return <Navigate to="/account" replace />;
  }

  const breadcrumbItems = [
    { label: 'Главная', to: '/projects', preserveSearch: true },
    { label: 'Операции', to: '/operations' },
    { label: 'Заявки' },
  ];

  return (
    <div className="operations-page orq-page">
      <input
        ref={createRequestFileInputRef}
        type="file"
        multiple
        className="operations-page__file-input"
        tabIndex={-1}
        aria-hidden={true}
      />
      <Breadcrumbs items={breadcrumbItems} />

      <section
        className="operations-page__panel operations-page__panel--filters operations-page__panel--request-toolbar"
        aria-label="Заявки: создание и фильтры"
      >
        <div className="orq-toolbar">
          <div className="orq-create-wrap">
            <button
              type="button"
              className="orq-create-btn"
              onClick={openCreateRequestModal}
            >
              <span className="orq-create-plus" aria-hidden="true">
                +
              </span>
              <span className="orq-create-label">Заявка</span>
            </button>
          </div>

          <div className="orq-filters-wrap">
            <div className="operations-filters orq-filters">
              <div className="operations-filters__header">
                <h2 className="operations-filters__title">Фильтры и сортировка</h2>
                <button
                  type="button"
                  className="operations-filters__reset"
                  onClick={handleResetFilters}
                >
                  <span className="operations-filters__reset-icon" aria-hidden="true">
                    <img src={refreshIconSrc} alt="" width={22} height={22} decoding="async" />
                  </span>
                  Сбросить фильтры
                </button>
              </div>

              <div className="orq-filters-grid">
                <div className="operations-filters__field">
                  <SelectFilterDropdown
                    label="Тип операции"
                    labelClassName="operations-filters__field-label"
                    options={OPERATION_TYPE_OPTIONS}
                    selectedId={operationType}
                    onSelectOption={(id) => setOperationType(id)}
                    triggerId="operations-request-filter-type"
                    className="operations-filters__dropdown"
                    triggerAriaLabel="Тип операции"
                  />
                </div>

                <div className="operations-filters__field">
                  <SelectFilterDropdown
                    label="Проект"
                    labelClassName="operations-filters__field-label"
                    options={projectOptions}
                    selectedId={projectId}
                    onSelectOption={(id) => setProjectId(String(id))}
                    triggerId="operations-request-filter-project"
                    className="operations-filters__dropdown"
                    triggerAriaLabel="Проект"
                  />
                </div>

                <div className="operations-filters__field">
                  <SelectFilterDropdown
                    label="Сотрудник"
                    labelClassName="operations-filters__field-label"
                    options={REQUEST_STAFF_FILTER_OPTIONS}
                    selectedId={staffFilterId}
                    onSelectOption={(id) => setStaffFilterId(String(id))}
                    triggerId="operations-request-filter-staff"
                    className="operations-filters__dropdown"
                    triggerAriaLabel="Сотрудник"
                  />
                </div>

                <div className="operations-filters__field">
                  <SelectFilterDropdown
                    label="Сортировка"
                    labelClassName="operations-filters__field-label"
                    options={REQUEST_SORT_OPTIONS}
                    selectedId={sortBy}
                    onSelectOption={(id) => setSortBy(id)}
                    triggerId="operations-request-filter-sort"
                    className="operations-filters__dropdown"
                    triggerAriaLabel="Сортировка"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showBulkToolbar ? (
        <div className="orq-bulk-toolbar" role="toolbar" aria-label="Действия с выбранными заявками">
          <button type="button" className="orq-bulk-btn" onClick={handleBulkDelete}>
            <BulkToolbarTrashIcon />
            Удалить выбранные
          </button>
          <div className="orq-bulk-toolbar__end">
            <button type="button" className="orq-bulk-btn orq-bulk-btn--primary" onClick={handleBulkConfirm}>
              <BulkToolbarCheckIcon />
              Подтвердить выбранное
            </button>
            <button type="button" className="orq-bulk-btn" onClick={handleBulkReject}>
              <BulkToolbarRejectIcon />
              Отклонить выбранное
            </button>
          </div>
        </div>
      ) : null}

      <section className="orq-list" aria-label="Список заявок">
        {filteredRequests.length === 0 ? (
          <div className="operations-list__empty">Заявок не найдено</div>
        ) : (
          <ul className="operations-list">
            {filteredRequests.map((req) => (
              <RequestCard
                key={req.id}
                req={req}
                selected={selectedIds.has(req.id)}
                onToggleSelected={handleToggleSelected}
              />
            ))}
          </ul>
        )}
      </section>

      <CreateEntityModal
        title="Создание заявки"
        isOpen={showCreateRequestModal}
        isSubmitting={false}
        submitLabel="Создать заявку"
        submittingLabel="Создание..."
        onClose={closeCreateRequestModal}
        onSubmit={closeCreateRequestModal}
      >
        <div className="form-group123">
          <label htmlFor="operations-request-create-type">
            Тип заявки <span className="orq-req">*</span>
          </label>
          <select id="operations-request-create-type" defaultValue="">
            <option value="" disabled>
              Тип
            </option>
            {requestTypeFormOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row123">
          <div className="form-group123">
            <label htmlFor="operations-request-create-project">
              Проект <span className="orq-req">*</span>
            </label>
            <select id="operations-request-create-project" defaultValue="">
              <option value="">Выберите проект</option>
              {projectsLoaded.map((p) => (
                <option key={p.id} value={String(p.id)}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group123">
            <label htmlFor="operations-request-create-amount">
              Сумма <span className="orq-req">*</span>
            </label>
            <input
              id="operations-request-create-amount"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="Введите сумму"
              defaultValue=""
            />
          </div>
        </div>

        <div className="form-group123">
          <label htmlFor="operations-request-create-approval">
            Тип согласования <span className="orq-req">*</span>
          </label>
          <select id="operations-request-create-approval" defaultValue="">
            <option value="" disabled>
              Выберите счёт
            </option>
            {MOCK_ACCOUNT_OPTIONS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group123">
          <label htmlFor="operations-request-create-comment">Комментарий</label>
          <textarea
            id="operations-request-create-comment"
            className="operations-create-comment"
            rows={4}
            placeholder="Введите комментарий к операции..."
            defaultValue=""
          />
        </div>

        <div className="operations-create-docs">
          <div className="operations-create-docs__head">
            <span className="operations-create-docs__title">Документы</span>
            <div className="operations-create-docs__toolbar">
              <button
                type="button"
                className="operations-create-docs__icon-btn"
                aria-label="Добавить файлы"
                onClick={() => createRequestFileInputRef.current?.click()}
              >
                <img src={refreshIconSrc} alt="" width={20} height={20} decoding="async" />
              </button>
              <button
                type="button"
                className="operations-create-docs__icon-btn"
                aria-label="Удалить все файлы"
                onClick={handleClearAttachedFiles}
                disabled={attachedFiles.length === 0}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1-2h10l1 2M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              </button>
            </div>
          </div>
          <button
            type="button"
            className="operations-create-docs__upload"
            onClick={() => createRequestFileInputRef.current?.click()}
          >
            <span className="operations-create-docs__upload-inner">
              <span className="operations-create-docs__upload-plus" aria-hidden="true">
                +
              </span>
              <span className="operations-create-docs__upload-label">Загрузить</span>
            </span>
          </button>
          {attachedFiles.length > 0 ? (
            <p className="operations-create-docs__names" aria-live="polite">
              {attachedFiles.map((f) => f.name).join(', ')}
            </p>
          ) : null}
        </div>
      </CreateEntityModal>
    </div>
  );
}

export default OperationsRequestPage;
