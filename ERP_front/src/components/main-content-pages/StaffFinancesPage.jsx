import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { MultiSelectFilterDropdown } from '../shared/MultiSelectFilterDropdown';
import {
    staffFinancesEmployeeFullName,
    staffFinancesInitialSelectedMonthIds,
    staffFinancesInitialSelectedYearIds,
    staffFinancesMonthOptions,
    staffFinancesTaskRows,
    staffFinancesYearOptions
} from '../../MockData/staffFinancesPageMock';
import './StaffFinancesPage.css';
import { Breadcrumbs } from '../shared/Breadcrumbs';

function toggleIdInList(id, setSelectedIds) {
    setSelectedIds((prev) => {
        const idStr = String(id);
        const has = prev.some((x) => String(x) === idStr);
        if (has) return prev.filter((x) => String(x) !== idStr);
        return [...prev, id];
    });
}

function StaffFinancesPage() {
    const myStaffId = localStorage.getItem('staff_id');

    const [selectedMonthIds, setSelectedMonthIds] = useState(() => [
        ...staffFinancesInitialSelectedMonthIds
    ]);
    const [selectedYearIds, setSelectedYearIds] = useState(() => [
        ...staffFinancesInitialSelectedYearIds
    ]);

    if (!myStaffId) {
        return <Navigate to="/account" replace />;
    }

    const breadcrumbItems = [
        { label: 'Главная', to: '/projects', preserveSearch: true },
        { label: 'Операции', to: '/operations' },
        { label: 'Заработная плата', to: '/operations/finans' },
        { label: 'Сотрудник' },
    ];

    return (
        <div className="staff-finances-page">
            <Breadcrumbs items={breadcrumbItems} />
            <div className="staff-finances-toolbar">
                <h1 className="staff-finances-toolbar__name">{staffFinancesEmployeeFullName}</h1>
                <div className="staff-finances-toolbar__filters">
                    <MultiSelectFilterDropdown
                        placeholder="Месяц"
                        options={staffFinancesMonthOptions}
                        selectedIds={selectedMonthIds}
                        onToggleOption={(id) => toggleIdInList(id, setSelectedMonthIds)}
                        triggerAriaLabel="Выбор месяцев"
                    />
                    <MultiSelectFilterDropdown
                        placeholder="Год"
                        options={staffFinancesYearOptions}
                        selectedIds={selectedYearIds}
                        onToggleOption={(id) => toggleIdInList(id, setSelectedYearIds)}
                        triggerAriaLabel="Выбор лет"
                    />
                </div>
            </div>
            <div className="staff-finances-list">
                <div className="staff-finances-table" role="table">
                    <div className="sf-cell sf-cell--head" role="columnheader">
                        Задача
                    </div>
                    <div className="sf-cell sf-cell--head" role="columnheader">
                        Часы
                    </div>
                    <div className="sf-cell sf-cell--head" role="columnheader">
                        Сумма
                    </div>
                    <div className="sf-cell sf-cell--head" role="columnheader">
                        Цена часа
                    </div>
                    {staffFinancesTaskRows.map((row) => (
                        <div key={row.id} className="sf-row" role="row">
                            <div className="sf-cell sf-cell--task">{row.task}</div>
                            <div className="sf-cell">{row.hours}</div>
                            <div className="sf-cell">{row.sum}</div>
                            <div className="sf-cell">{row.hourPrice}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default StaffFinancesPage;
