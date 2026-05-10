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
 *   date: string,
 *   amount: number,
 *   purpose: string,
 *   projectName: string,
 *   accountMasked: string,
 *   managerName: string,
 *   files?: { name: string }[],
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
    date: '2026-02-15T14:30:00',
    amount: 5000,
    purpose: 'Оплата по договору ДУ001-08072025',
    projectName: 'ERP Acrelis',
    accountMasked: '4081 **** **** 4081',
    managerName: 'Козлова А.С.',
    files: [{ name: 'договор.pdf' }, { name: 'счёт.pdf' }],
  },
  {
    id: 'req-2',
    type: 'income',
    projectId: 2,
    staffId: 'staff-2',
    title: 'Аванс по договору',
    date: '2026-03-02T10:15:00',
    amount: 120_000,
    purpose: 'Аванс по договору подряда №12',
    projectName: 'Офисное помещение',
    accountMasked: '4081 **** **** 9012',
    managerName: 'Иванов И.П.',
    files: [{ name: 'договор.pdf' }],
  },
  {
    id: 'req-3',
    type: 'expense',
    projectId: 3,
    staffId: 'staff-3',
    title: 'Оплата подряда',
    date: '2026-04-18T16:00:00',
    amount: 85_000,
    purpose: 'Оплата работ по этапу 2',
    projectName: 'Корпоративный сайт',
    accountMasked: '4070 **** **** 3311',
    managerName: 'Сидоров В.К.',
  },
  {
    id: 'req-4',
    type: 'income',
    projectId: 1,
    staffId: 'staff-2',
    title: 'Поступление на счёт',
    date: '2026-05-06T11:45:00',
    amount: 250_000,
    purpose: 'Поступление по счёту №44 от 05.05.2026',
    projectName: 'ERP Acrelis',
    accountMasked: '4081 **** **** 4081',
    managerName: 'Петрова А.С.',
    files: [{ name: 'платёжка.pdf' }],
  },
  {
    id: 'req-5',
    type: 'expense',
    projectId: 2,
    staffId: 'staff-1',
    title: 'Расходы на офис',
    date: '2026-05-08T09:20:00',
    amount: 12_500,
    purpose: 'Канцтовары и расходники',
    projectName: 'Офисное помещение',
    accountMasked: '4070 **** **** 9012',
    managerName: 'Иванов И.П.',
  },
];
