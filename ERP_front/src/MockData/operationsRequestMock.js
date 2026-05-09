/** Опции фильтра «Сотрудник» (до API). */
export const REQUEST_STAFF_FILTER_OPTIONS = [
  { id: 'all', label: 'Все сотрудники' },
  { id: 'staff-1', label: 'Иванов И.П.' },
  { id: 'staff-2', label: 'Петрова А.С.' },
  { id: 'staff-3', label: 'Сидоров В.К.' },
];

/** Сортировка списка заявок. */
export const REQUEST_SORT_OPTIONS = [{ id: 'alpha', label: 'По алфавиту' }];

/**
 * @typedef {{
 *   id: string,
 *   type: 'income'|'expense',
 *   projectId: number,
 *   staffId: string,
 *   title: string,
 * }} MockRequest
 */

/** @type {MockRequest[]} */
export const MOCK_REQUESTS = [
  {
    id: 'req-1',
    type: 'expense',
    projectId: 1,
    staffId: 'staff-1',
    title: 'Закупка материалов',
  },
  {
    id: 'req-2',
    type: 'income',
    projectId: 2,
    staffId: 'staff-2',
    title: 'Аванс по договору',
  },
  {
    id: 'req-3',
    type: 'expense',
    projectId: 3,
    staffId: 'staff-3',
    title: 'Оплата подряда',
  },
  {
    id: 'req-4',
    type: 'income',
    projectId: 1,
    staffId: 'staff-2',
    title: 'Поступление на счёт',
  },
  {
    id: 'req-5',
    type: 'expense',
    projectId: 2,
    staffId: 'staff-1',
    title: 'Расходы на офис',
  },
];
