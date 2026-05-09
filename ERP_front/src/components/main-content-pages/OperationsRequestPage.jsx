import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { OPERATIONS_HUB_ALLOWED_ROLES } from '../../constants/roles';
import { getProjects } from '../../services/api';
import { SelectFilterDropdown } from '../shared/SelectFilterDropdown';
import refreshIconSrc from '../../assets/refresh-icon.svg';
import { OPERATION_TYPE_OPTIONS } from './operationsPageMocks';
import {
  MOCK_REQUESTS,
  REQUEST_SORT_OPTIONS,
  REQUEST_STAFF_FILTER_OPTIONS,
} from '../../MockData/operationsRequestMock';
import './OperationsPage.css';
import './OperationsRequestPage.css';
import { Breadcrumbs } from '../shared/Breadcrumbs';

function RequestCard() {
  return (
    <li className="operations-request-card">
      <div className="operations-request-card__inner" />
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

  const projectOptions = useMemo(
    () => [
      { id: 'all', label: 'Все проекты' },
      ...projectsLoaded.map((p) => ({ id: String(p.id), label: p.name })),
    ],
    [projectsLoaded]
  );

  const filteredRequests = useMemo(() => {
    let list = MOCK_REQUESTS.filter((r) => {
      if (operationType !== 'all' && r.type !== operationType) return false;
      if (projectId !== 'all' && String(r.projectId) !== projectId) return false;
      if (staffFilterId !== 'all' && r.staffId !== staffFilterId) return false;
      return true;
    });

    if (sortBy === 'alpha') {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title, 'ru'));
    }

    return list;
  }, [operationType, projectId, staffFilterId, sortBy]);

  const handleResetFilters = () => {
    setOperationType('all');
    setProjectId('all');
    setStaffFilterId('all');
    setSortBy('alpha');
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
    <div className="operations-page operations-request-page">
      <Breadcrumbs items={breadcrumbItems} />

      <section
        className="operations-page__panel operations-page__panel--filters operations-page__panel--request-toolbar"
        aria-label="Заявки: создание и фильтры"
      >
        <div className="operations-request-page__toolbar">
          <div className="operations-request-page__create-wrap">
            <button type="button" className="operations-request-page__create-btn">
              <span className="operations-request-page__create-plus" aria-hidden="true">
                +
              </span>
              <span className="operations-request-page__create-label">Заявка</span>
            </button>
          </div>

          <div className="operations-request-page__filters-wrap">
            <div className="operations-filters operations-request-page__filters">
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

              <div className="operations-request-page__filters-grid">
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

      <section className="operations-request-page__list-section" aria-label="Список заявок">
        <div className="operations-request-page__list-scroll">
          {filteredRequests.length === 0 ? (
            <div className="operations-list__empty">Заявок не найдено</div>
          ) : (
            <ul className="operations-list">
              {filteredRequests.map((req) => (
                <RequestCard key={req.id} />
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

export default OperationsRequestPage;
