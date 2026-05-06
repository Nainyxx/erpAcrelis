/** Мок для страницы заработной платы сотрудника (StaffFinancesPage). */

const MONTH_LABELS = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь'
];

export const staffFinancesEmployeeFullName = 'Михаил Гапшин';

export const staffFinancesMonthOptions = MONTH_LABELS.map((label, index) => ({
  id: index + 1,
  label
}));

/** Опции года в том же формате, что и месяцы — для MultiSelectFilterDropdown (можно выбрать несколько). */
export const staffFinancesYearOptions = [2024, 2025, 2026].map((y) => ({
  id: y,
  label: String(y)
}));

/** Начальный выбор месяцев (id месяца, 1 — январь … 12 — декабрь) */
export const staffFinancesInitialSelectedMonthIds = [10];

/** Начальный выбор лет (несколько id из staffFinancesYearOptions) */
export const staffFinancesInitialSelectedYearIds = [2025];

/** Строки таблицы задач (ЗП сотрудника) — мок для StaffFinancesPage. */
export const staffFinancesTaskRows = [
  { id: 1, task: 'Руководство ERP', hours: 10, sum: 10000, hourPrice: 1000 },
  { id: 2, task: 'Сервис Договоров ERP', hours: 13, sum: 13000, hourPrice: 1000 },
  { id: 3, task: 'Изменения в формах и проектах ERP', hours: 7, sum: 4200, hourPrice: 600 },
  { id: 4, task: 'Страница лидов и руководителя инвест отдела', hours: 8, sum: 7200, hourPrice: 900 },
  { id: 5, task: 'Либерти (Регистрация, главная, ЛК)', hours: 10, sum: 8000, hourPrice: 800 },
  { id: 6, task: 'ЛинкТри Эрнест', hours: 2, sum: 2000, hourPrice: 1000 }
];
