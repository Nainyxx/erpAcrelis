import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Navigate, useNavigate } from 'react-router-dom';
import { OPERATIONS_HUB_ALLOWED_ROLES } from '../../constants/roles';
import { downloadProjectFile, getProjects } from '../../services/api';
import { SelectFilterDropdown } from '../shared/SelectFilterDropdown';
import CreateEntityModal from '../shared/CreateEntityModal';
import refreshIconSrc from '../../assets/refresh-icon.svg';
import {
  CREATE_OPERATION_TYPE_OPTIONS,
  MOCK_ACCOUNT_OPTIONS,
  MOCK_OPERATION_FILE_DOWNLOAD_URL,
  MOCK_OPERATIONS,
  OPERATION_TYPE_OPTIONS,
  PERIOD_OPTIONS,
} from './operationsPageMocks';
import './OperationsPage.css';
import { Breadcrumbs } from '../shared/Breadcrumbs';

async function downloadOperationAttachment(displayFileName) {
  const fileUrl = MOCK_OPERATION_FILE_DOWNLOAD_URL;
  const safeName =
    displayFileName?.trim() ||
    decodeURIComponent(fileUrl.split('/').pop() || '').split('?')[0] ||
    'file';

  try {
    const blob = await downloadProjectFile(fileUrl);
    const blobUrl = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = safeName;
    a.style.display = 'none';

    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    }, 100);
  } catch {
    try {
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = safeName;
      a.rel = 'noopener noreferrer';
      a.style.display = 'none';

      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        document.body.removeChild(a);
      }, 100);
    } catch {
      alert('Не удалось скачать файл. Попробуйте позже или обратитесь к администратору.');
    }
  }
}

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

function FolderIcon() {
  return (
    <svg className="operations-card__folder-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 8a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
  );
}

function OperationCard({ op }) {
  const [filesOpen, setFilesOpen] = useState(false);
  const folderWrapRef = useRef(null);

  const files = op.files?.length ? op.files : [];

  useEffect(() => {
    if (!filesOpen) return undefined;

    const onDocMouseDown = (e) => {
      if (folderWrapRef.current && !folderWrapRef.current.contains(e.target)) {
        setFilesOpen(false);
      }
    };

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setFilesOpen(false);
    };

    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [filesOpen]);

  const isIncome = op.type === 'income';
  const sign = isIncome ? '+' : '−';
  const amountClass = `operations-card__amount operations-card__amount--${op.type}`;
  const badgeClass = `operations-card__badge operations-card__badge--${op.type}`;

  return (
    <li className="operations-card">
      <div className="operations-card__head">
        <span className={badgeClass}>{isIncome ? 'Приход' : 'Расход'}</span>
        <div className="operations-card__date-row">
          <span className="operations-card__date">{formatDateTime(op.date)}</span>
          {files.length > 0 ? (
            <div className="operations-card__folder-wrap" ref={folderWrapRef}>
              <button
                type="button"
                className="operations-card__folder"
                aria-label="Документы операции"
                aria-expanded={filesOpen}
                aria-haspopup="menu"
                onClick={(e) => {
                  e.stopPropagation();
                  setFilesOpen((v) => !v);
                }}
              >
                <FolderIcon />
              </button>
              {filesOpen ? (
                <div className="operations-card__files-popover" role="menu">
                  {files.map((f, fileIndex) => (
                    <button
                      key={`${op.id}-file-${fileIndex}-${f.name}`}
                      type="button"
                      role="menuitem"
                      className="operations-card__files-popover-item"
                      onClick={() => {
                        downloadOperationAttachment(f.name);
                        setFilesOpen(false);
                      }}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="operations-card__body">
        <p className={amountClass}>
          {sign} {formatAmount(op.amount)}{' '}₽
        </p>
        <p className="operations-card__purpose">{op.purpose}</p>
      </div>

      <div className="operations-card__meta">
        <div className="operations-card__meta-cell">
          <span className="operations-card__meta-label">Проект</span>
          <span className="operations-card__meta-value">{op.projectName}</span>
        </div>
        <div className="operations-card__meta-cell">
          <span className="operations-card__meta-label">Тип оплаты</span>
          <span className="operations-card__meta-value">{op.paymentMethod}</span>
        </div>
        <div className="operations-card__meta-cell">
          <span className="operations-card__meta-label">Ответственный менеджер</span>
          <span className="operations-card__meta-value">{op.managerName}</span>
        </div>
        <div className="operations-card__meta-cell">
          <span className="operations-card__meta-label">Счет</span>
          <span className="operations-card__meta-value">{op.accountMasked}</span>
        </div>
      </div>
    </li>
  );
}

const emptyCreateForm = () => ({
  type: 'income',
  projectId: '',
  amount: '',
  accountId: '',
  comment: '',
});

function OperationsPage({ useMockData = false }) {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('role');
  const canAccessHub = userRole && OPERATIONS_HUB_ALLOWED_ROLES.includes(userRole);

  const [operationType, setOperationType] = useState('all');
  const [projectId, setProjectId] = useState('all');
  const [period, setPeriod] = useState('all');
  const [projectsLoaded, setProjectsLoaded] = useState([]);

  const [showCreateOperationModal, setShowCreateOperationModal] = useState(false);
  const [newOperation, setNewOperation] = useState(emptyCreateForm);
  const [createError, setCreateError] = useState('');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [extraOperations, setExtraOperations] = useState([]);
  const createFileInputRef = useRef(null);

  const projectOptions = useMemo(
    () => [
      { id: 'all', label: 'Все проекты' },
      ...projectsLoaded.map((p) => ({ id: String(p.id), label: p.name }))
    ],
    [projectsLoaded]
  );

  useEffect(() => {
    if (!canAccessHub) return;

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

  const operationsSource = useMemo(
    () => [...extraOperations, ...MOCK_OPERATIONS],
    [extraOperations]
  );

  // period — только для UI; при запросе списка операций передавать на бэкенд, мок не фильтруем по дате
  const filteredOperations = useMemo(() => {
    return operationsSource.filter((op) => {
      if (operationType !== 'all' && op.type !== operationType) return false;
      if (projectId !== 'all' && String(op.projectId) !== projectId) return false;
      return true;
    });
  }, [operationType, projectId, operationsSource]);

  const openCreateOperationModal = (type) => {
    setCreateError('');
    setAttachedFiles([]);
    setNewOperation({ ...emptyCreateForm(), type });
    setShowCreateOperationModal(true);
  };

  const closeCreateOperationModal = () => {
    setShowCreateOperationModal(false);
    setCreateError('');
    setAttachedFiles([]);
    setNewOperation(emptyCreateForm());
  };

  useLayoutEffect(() => {
    const input = createFileInputRef.current;
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

  const handleClearAttachedFiles = () => {
    setAttachedFiles([]);
    if (createFileInputRef.current) createFileInputRef.current.value = '';
  };

  const handleCreateOperationSubmit = () => {
    const { type, projectId: pid, amount, accountId, comment } = newOperation;
    setCreateError('');

    if (type !== 'income' && type !== 'expense') {
      setCreateError('Выберите тип операции.');
      return;
    }
    if (!pid) {
      setCreateError('Выберите проект.');
      return;
    }
    const normalizedAmount = String(amount).replace(/\s/g, '').replace(',', '.');
    const amountNum = parseFloat(normalizedAmount);
    if (!amount || Number.isNaN(amountNum) || amountNum <= 0) {
      setCreateError('Введите корректную сумму.');
      return;
    }
    if (!accountId) {
      setCreateError('Выберите счёт.');
      return;
    }

    const project = projectsLoaded.find((p) => String(p.id) === String(pid));
    const account = MOCK_ACCOUNT_OPTIONS.find((a) => a.id === accountId);
    const managerName = localStorage.getItem('name')?.trim() || '—';

    const newOp = {
      id: `op-new-${Date.now()}`,
      type,
      amount: amountNum,
      purpose: comment.trim() || 'Без комментария',
      date: new Date().toISOString(),
      projectId: Number(pid),
      projectName: project?.name || 'Проект',
      paymentMethod: 'Безналичный',
      managerName,
      accountMasked: account?.label || '—',
      files:
        attachedFiles.length > 0 ? attachedFiles.map((f) => ({ name: f.name })) : undefined
    };

    setExtraOperations((prev) => [newOp, ...prev]);
    closeCreateOperationModal();
  };

  const handleResetFilters = () => {
    setOperationType('all');
    setProjectId('all');
    setPeriod('all');
  };

  if (!canAccessHub) {
    return <Navigate to="/account" replace />;
  }

  const breadcrumbItems = [
    { label: 'Главная', to: '/projects', preserveSearch: true },
    { label: 'Операции' },
  ];

  return (
    <div className="operations-page">
      {/* Вложения формы: скрытый file на странице (не в модалке), off-screen вместо display:none */}
      <input
        ref={createFileInputRef}
        type="file"
        multiple
        className="operations-page__file-input"
        tabIndex={-1}
        aria-hidden={true}
      />
      <Breadcrumbs items={breadcrumbItems} />

      <section
        className="operations-page__panel operations-page__panel--filters operations-page__panel--quick-actions"
        aria-label="Быстрые операции"
      >
        <div className="operations-quick-actions">
          <button
            type="button"
            className="operations-quick-btn operations-quick-btn--income"
            onClick={() => openCreateOperationModal('income')}
          >
            +   Приход
          </button>
          <button
            type="button"
            className="operations-quick-btn operations-quick-btn--expense"
            onClick={() => openCreateOperationModal('expense')}
          >
            −   Расход
          </button>
          <button
            type="button"
            className="operations-quick-btn operations-quick-btn--request"
            onClick={() => navigate('/operations/request')}
          >
            +   Заявка
          </button>
        </div>
      </section>

      <section
        className="operations-page__panel operations-page__panel--filters"
        aria-label="Фильтры и сортировка"
      >
        <div className="operations-filters">
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

          <div className="operations-filters__grid">
            <div className="operations-filters__field operations-filters__field--type">
              <SelectFilterDropdown
                label="Тип операции"
                labelClassName="operations-filters__field-label"
                options={OPERATION_TYPE_OPTIONS}
                selectedId={operationType}
                onSelectOption={(id) => setOperationType(id)}
                triggerId="operations-filter-type"
                className="operations-filters__dropdown"
                triggerAriaLabel="Тип операции"
              />
            </div>

            <div className="operations-filters__field operations-filters__field--project">
              <SelectFilterDropdown
                label="Проект"
                labelClassName="operations-filters__field-label"
                options={projectOptions}
                selectedId={projectId}
                onSelectOption={(id) => setProjectId(String(id))}
                triggerId="operations-filter-project"
                className="operations-filters__dropdown"
                triggerAriaLabel="Проект"
              />
            </div>

            <div className="operations-filters__field operations-filters__field--period">
              <SelectFilterDropdown
                label="Период"
                labelClassName="operations-filters__field-label"
                options={PERIOD_OPTIONS}
                selectedId={period}
                onSelectOption={(id) => setPeriod(id)}
                triggerId="operations-filter-period"
                className="operations-filters__dropdown"
                triggerAriaLabel="Период"
              />
            </div>
          </div>
        </div>
      </section>

      <section
        aria-label="Список операций"
      >
        {filteredOperations.length === 0 ? (
          <div className="operations-list__empty">Операций не найдено</div>
        ) : (
          <ul className="operations-list">
            {filteredOperations.map((op) => (
              <OperationCard key={op.id} op={op} />
            ))}
          </ul>
        )}
      </section>

      <CreateEntityModal
        title="Создание операции"
        isOpen={showCreateOperationModal}
        isSubmitting={false}
        error={createError}
        submitLabel="Создать операцию"
        submittingLabel="Создание..."
        onClose={closeCreateOperationModal}
        onSubmit={handleCreateOperationSubmit}
      >
        <div className="form-group123">
          <label htmlFor="operations-create-type">Тип операции *</label>
          <select
            id="operations-create-type"
            value={newOperation.type}
            onChange={(e) =>
              setNewOperation({ ...newOperation, type: e.target.value })
            }
          >
            {CREATE_OPERATION_TYPE_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row123">
          <div className="form-group123">
            <label htmlFor="operations-create-project">Проект *</label>
            <select
              id="operations-create-project"
              value={newOperation.projectId}
              onChange={(e) =>
                setNewOperation({ ...newOperation, projectId: e.target.value })
              }
            >
              <option value="">Выберите проект</option>
              {projectsLoaded.map((p) => (
                <option key={p.id} value={String(p.id)}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group123">
            <label htmlFor="operations-create-amount">Сумма *</label>
            <input
              id="operations-create-amount"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="Введите сумму"
              value={newOperation.amount}
              onChange={(e) =>
                setNewOperation({ ...newOperation, amount: e.target.value })
              }
            />
          </div>
        </div>

        <div className="form-group123">
          <label htmlFor="operations-create-account">Счёт *</label>
          <select
            id="operations-create-account"
            value={newOperation.accountId}
            onChange={(e) =>
              setNewOperation({ ...newOperation, accountId: e.target.value })
            }
          >
            <option value="">Выберите счёт</option>
            {MOCK_ACCOUNT_OPTIONS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group123">
          <label htmlFor="operations-create-comment">Комментарий</label>
          <textarea
            id="operations-create-comment"
            className="operations-create-comment"
            rows={4}
            placeholder="Введите комментарий к операции..."
            value={newOperation.comment}
            onChange={(e) =>
              setNewOperation({ ...newOperation, comment: e.target.value })
            }
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
                onClick={() => createFileInputRef.current?.click()}
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
            onClick={() => createFileInputRef.current?.click()}
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

export default OperationsPage;
