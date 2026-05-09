/** Мок для списка заработной платы (FinansList). */

export const finansListPeriodOptions = [
  { id: '2025-10', label: 'Октябрь 2025' },
  { id: '2025-11', label: 'Ноябрь 2025' },
  { id: '2025-12', label: 'Декабрь 2025' }
];

export const finansListInitialSelectedPeriodIds = ['2025-11'];

export const finansListDepartmentOptions = [
  { id: 'development', label: 'Отдел разработки' },
  { id: 'design', label: 'Отдел дизайна' },
  { id: 'marketing', label: 'Отдел маркетинга' }
];

/** Строки свода ЗП по сотрудникам */
export const finansListSalaryRows = [
  {
    staffId: '1',
    name: 'Михаил Гапшин',
    departmentId: 'development',
    devBonus: 0,
    tlBonus: 0,
    mgrBonus: 0,
    salary: 0
  },
  {
    staffId: '2',
    name: 'Плохих Олег',
    departmentId: 'development',
    devBonus: 0,
    tlBonus: 0,
    mgrBonus: 0,
    salary: 0
  },
  {
    staffId: '3',
    name: 'Янина Анна',
    departmentId: 'design',
    devBonus: 0,
    tlBonus: 0,
    mgrBonus: 0,
    salary: 0
  },
  {
    staffId: '4',
    name: 'Селецкий Святослав',
    departmentId: 'development',
    devBonus: 0,
    tlBonus: 0,
    mgrBonus: 0,
    salary: 0
  },
  {
    staffId: '5',
    name: 'Лутфуллин Амир',
    departmentId: 'marketing',
    devBonus: 0,
    tlBonus: 0,
    mgrBonus: 0,
    salary: 0
  },
  {
    staffId: '6',
    name: 'Галиуллин Радмир',
    departmentId: 'development',
    devBonus: 0,
    tlBonus: 0,
    mgrBonus: 0,
    salary: 0
  }
];
