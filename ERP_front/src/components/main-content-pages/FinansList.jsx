import { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { OPERATIONS_HUB_ALLOWED_ROLES } from '../../constants/roles';
import {
  finansListDepartmentOptions,
  finansListInitialSelectedPeriodIds,
  finansListPeriodOptions,
  finansListSalaryRows
} from '../../MockData/finansListMock';
import { MultiSelectFilterDropdown } from '../shared/MultiSelectFilterDropdown';
import { Breadcrumbs } from '../shared/Breadcrumbs';
import './StaffFinancesPage.css';
import './FinansList.css';

function toggleIdInList(id, setSelectedIds) {
  setSelectedIds((prev) => {
    const idStr = String(id);
    const has = prev.some((x) => String(x) === idStr);
    if (has) return prev.filter((x) => String(x) !== idStr);
    return [...prev, id];
  });
}

const moneyFmt = new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: 0
});

function FinansList() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('role');
  const canAccessHub = userRole && OPERATIONS_HUB_ALLOWED_ROLES.includes(userRole);

  const [selectedPeriodIds, setSelectedPeriodIds] = useState(() => [
    ...finansListInitialSelectedPeriodIds
  ]);
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

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
    { label: 'Заработная плата' }
  ];

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return finansListSalaryRows.filter((row) => {
      const matchesName = !q || row.name.toLowerCase().includes(q);
      const matchesDept =
        selectedDepartmentIds.length === 0 ||
        selectedDepartmentIds.some((id) => String(row.departmentId) === String(id));
      return matchesName && matchesDept;
    });
  }, [searchQuery, selectedDepartmentIds]);

  const totals = useMemo(() => {
    return filteredRows.reduce(
      (acc, row) => ({
        devBonus: acc.devBonus + row.devBonus,
        tlBonus: acc.tlBonus + row.tlBonus,
        mgrBonus: acc.mgrBonus + row.mgrBonus,
        salary: acc.salary + row.salary
      }),
      { devBonus: 0, tlBonus: 0, mgrBonus: 0, salary: 0 }
    );
  }, [filteredRows]);

  return (
    <div className="staff-finances-page finans-list-page">
      <Breadcrumbs items={breadcrumbItems} />
      <div className="staff-finances-toolbar finans-list-page__toolbar">
        <div className="finans-list-page__toolbar-filters">
          <MultiSelectFilterDropdown
            placeholder="Период"
            options={finansListPeriodOptions}
            selectedIds={selectedPeriodIds}
            onToggleOption={(id) => toggleIdInList(id, setSelectedPeriodIds)}
            triggerAriaLabel="Выбор периода"
          />
          <MultiSelectFilterDropdown
            placeholder="Отдел"
            options={finansListDepartmentOptions}
            selectedIds={selectedDepartmentIds}
            onToggleOption={(id) => toggleIdInList(id, setSelectedDepartmentIds)}
            onClear={() => setSelectedDepartmentIds([])}
            triggerAriaLabel="Фильтр по отделу"
          />
        </div>
        <label className="staff-search finans-list-page__search">
          <span className="staff-search__icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="#5b7a7a" strokeWidth="1.75" /><path d="M16.5 16.5 21 21" stroke="#5b7a7a" strokeWidth="1.75" strokeLinecap="round" /></svg>
          </span>
          <input
            type="search"
            className="staff-search__input"
            placeholder="Поиск по ФИО"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
            aria-label="Поиск по ФИО"
          />
        </label>
      </div>
      <div className="staff-finances-list">
        <div
          className="finans-list-salary-table"
          role="table"
          aria-label="Свод заработной платы по сотрудникам"
        >
          <div className="sf-cell sf-cell--head" role="columnheader">
            Имя
          </div>
          <div className="sf-cell sf-cell--head" role="columnheader">
            Бонус разработчика
          </div>
          <div className="sf-cell sf-cell--head" role="columnheader">
            Бонус тимлида
          </div>
          <div className="sf-cell sf-cell--head" role="columnheader">
            Бонус руководителя
          </div>
          <div className="sf-cell sf-cell--head" role="columnheader">
            Оклад
          </div>
          {filteredRows.map((row) => {
            const goStaffFinances = () => navigate(`/operations/finans/${row.staffId}`);
            const onRowKeyDown = (e) => {
              if (e.key !== 'Enter' && e.key !== ' ') return;
              e.preventDefault();
              goStaffFinances();
            };
            return (
              <div
                key={row.staffId}
                className="sf-row sf-row--clickable"
                role="row"
                aria-label={`Заработная плата: ${row.name}`}
              >
                <div
                  className="sf-cell sf-cell--task"
                  role="cell"
                  tabIndex={0}
                  onClick={goStaffFinances}
                  onKeyDown={onRowKeyDown}
                >
                  {row.name}
                </div>
                <div className="sf-cell" role="cell" onClick={goStaffFinances}>
                  {moneyFmt.format(row.devBonus)}
                </div>
                <div className="sf-cell" role="cell" onClick={goStaffFinances}>
                  {moneyFmt.format(row.tlBonus)}
                </div>
                <div className="sf-cell" role="cell" onClick={goStaffFinances}>
                  {moneyFmt.format(row.mgrBonus)}
                </div>
                <div className="sf-cell" role="cell" onClick={goStaffFinances}>
                  {moneyFmt.format(row.salary)}
                </div>
              </div>
            );
          })}
          <div className="sf-row sf-row--total" role="row">
            <div className="sf-cell sf-cell--task sf-cell--total-label">ИТОГО</div>
            <div className="sf-cell sf-cell--total-num">{moneyFmt.format(totals.devBonus)}</div>
            <div className="sf-cell sf-cell--total-num">{moneyFmt.format(totals.tlBonus)}</div>
            <div className="sf-cell sf-cell--total-num">{moneyFmt.format(totals.mgrBonus)}</div>
            <div className="sf-cell sf-cell--total-num sf-cell--total-salary">
              {moneyFmt.format(totals.salary)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FinansList;
