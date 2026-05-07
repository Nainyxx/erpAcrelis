import { useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { OPERATIONS_HUB_ALLOWED_ROLES } from '../../constants/roles';
import { downloadProjectFile, getProjects } from '../../services/api';
import { SelectFilterDropdown } from '../shared/SelectFilterDropdown';
import refreshIconSrc from '../../assets/refresh-icon.svg';
import docIconSrc from '../../assets/doc-icon.svg';
import {
  MOCK_OPERATION_FILE_DOWNLOAD_URL,
  MOCK_OPERATIONS,
  OPERATION_TYPE_OPTIONS,
  PERIOD_OPTIONS,
  REQUEST_TYPE_OPTIONS,
} from './operationsPageMocks';
import './OperationsPage.css';

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
    <svg className="operations-card__folder-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 8a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function OperationCard({ op }) {
  const isIncome = op.type === 'income';
  const sign = isIncome ? '+' : '−';
  const amountClass = `operations-card__amount operations-card__amount--${op.type}`;
  const badgeClass = `operations-card__badge operations-card__badge--${op.type}`;

  return (
    <li className="operations-card">
      <div className="operations-card__head">
        <span className={badgeClass}>{isIncome ? 'Приход' : 'Расход'}</span>
        <span className="operations-card__date">{formatDateTime(op.date)}</span>
        <button type="button" className="operations-card__folder" aria-label="Папка операции">
          <FolderIcon />
        </button>
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

      {op.files && op.files.length > 0 ? (
        <div className="operations-card__files">
          {op.files.map((f, fileIndex) => (
            <button
              key={`${op.id}-file-${fileIndex}-${f.name}`}
              type="button"
              className="operations-card__file"
              aria-label={`Скачать ${f.name}`}
              onClick={() => downloadOperationAttachment(f.name)}
            >
              <img
                src={docIconSrc}
                alt=""
                className="operations-card__file-icon"
                width={16}
                height={20}
                decoding="async"
              />
              <span className="operations-card__file-name">{f.name}</span>
            </button>
          ))}
        </div>
      ) : null}
    </li>
  );
}

function OperationsPage({ useMockData = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = localStorage.getItem('role');
  const canAccessHub = userRole && OPERATIONS_HUB_ALLOWED_ROLES.includes(userRole);

  const [operationType, setOperationType] = useState('all');
  const [projectId, setProjectId] = useState('all');
  const [period, setPeriod] = useState('all');
  const [requestType, setRequestType] = useState('all');
  const [projectsLoaded, setProjectsLoaded] = useState([]);

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

  // period — только для UI; при запросе списка операций передавать на бэкенд, мок не фильтруем по дате
  const filteredOperations = useMemo(() => {
    return MOCK_OPERATIONS.filter((op) => {
      if (operationType !== 'all' && op.type !== operationType) return false;
      if (projectId !== 'all' && String(op.projectId) !== projectId) return false;
      if (requestType !== 'all' && op.requestType !== requestType) return false;
      return true;
    });
  }, [operationType, projectId, requestType]);

  const handleResetFilters = () => {
    setOperationType('all');
    setProjectId('all');
    setPeriod('all');
    setRequestType('all');
  };

  if (!canAccessHub) {
    const staffId = localStorage.getItem('staff_id');
    if (staffId) {
      return <Navigate to={`/operations/finans/${staffId}`} replace />;
    }
    return <Navigate to="/account" replace />;
  }

  const breadcrumb = (
    <nav className="projects-breadcrumb" aria-label="Навигация по разделам">
      <button
        type="button"
        className="projects-breadcrumb__home"
        onClick={() => navigate(`/projects${location.search || ''}`)}
      >
        Главная
      </button>
      <span className="projects-breadcrumb__sep" aria-hidden="true">
        {' '}
        /{' '}
      </span>
      <span className="projects-breadcrumb__current">Операции</span>
    </nav>
  );

  return (
    <div className="operations-page">
      {breadcrumb}

      <section
        className="operations-page__panel operations-page__panel--filters operations-page__panel--quick-actions"
        aria-label="Быстрые операции"
      >
        <div className="operations-quick-actions">
          <button type="button" className="operations-quick-btn operations-quick-btn--income">
            +   Приход
          </button>
          <button type="button" className="operations-quick-btn operations-quick-btn--expense">
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

            <div className="operations-filters__field operations-filters__field--request">
              <SelectFilterDropdown
                label="Заявка"
                labelClassName="operations-filters__field-label"
                options={REQUEST_TYPE_OPTIONS}
                selectedId={requestType}
                onSelectOption={(id) => setRequestType(id)}
                triggerId="operations-filter-request"
                className="operations-filters__dropdown"
                triggerAriaLabel="Заявка"
              />
            </div>

            <div className="operations-filters__field operations-filters__field--salary">
              <span
                className="operations-filters__field-label operations-filters__field-label--spacer"
                aria-hidden="true"
              >
                {'\u00a0'}
              </span>
              <button
                type="button"
                className="operations-filters__chip"
                aria-label="Перейти к заявке: заработная плата"
                onClick={() => navigate('/operations/request')}
              >
                Заработная плата
              </button>
            </div>

            <div className="operations-filters__grid-spacer" aria-hidden="true" />
          </div>
        </div>
      </section>

      <section
        className="operations-page__panel operations-page__panel--table"
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
    </div>
  );
}

export default OperationsPage;
