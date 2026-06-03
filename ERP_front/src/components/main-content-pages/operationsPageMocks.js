/** Пока все вложения ведут на один файл с API (см. downloadOperationAttachment на странице). */
export const MOCK_OPERATION_FILE_DOWNLOAD_URL =
  'https://api.acrelis.ru/media/project_files/2026/04/23/%D0%A2%D0%97_APK.docx';

export const OPERATION_TYPE_OPTIONS = [
  { id: 'all', label: 'Все типы' },
  { id: 'income', label: 'Приход' },
  { id: 'expense', label: 'Расход' },
];

/** Только приход/расход — для формы создания операции */
export const CREATE_OPERATION_TYPE_OPTIONS = [
  { id: 'income', label: 'Приход' },
  { id: 'expense', label: 'Расход' },
];

/** Счета до подключения API (id — внутренний ключ формы) */
export const MOCK_ACCOUNT_OPTIONS = [
  { id: '4081-4081', label: '4081 **** **** 4081' },
  { id: '4070-9012', label: '4070 **** **** 9012' },
  { id: '4070-3311', label: '4070 **** **** 3311' },
  { id: 'cash', label: 'Наличные (касса)' },
];

export const PERIOD_OPTIONS = [
  { id: 'all', label: 'За всё время' },
  { id: 'day', label: 'День' },
  { id: 'week', label: 'Неделя' },
  { id: 'month', label: 'Месяц' },
  { id: 'year', label: 'Год' },
  { id: 'quarter', label: 'Квартал' },
  { id: 'other', label: 'Другое' },
];

export const REQUEST_TYPE_OPTIONS = [
  { id: 'all', label: 'Все типы' },
  { id: 'salary', label: 'Заработная плата' },
  { id: 'equipment', label: 'Оборудование' },
  { id: 'services', label: 'Услуги' },
  { id: 'other', label: 'Прочее' },
];

/** @typedef {{ id: string, type: 'income'|'expense', amount: number, purpose: string, date: string, projectId: number, projectName: string, paymentMethod: string, managerName: string, accountMasked: string, files?: { name: string }[] }} MockOperation */

/** @type {MockOperation[]} */
export const MOCK_OPERATIONS = [
  {
    id: 'op-1',
    type: 'income',
    amount: 100_000,
    purpose: 'Оплата по договору ДУ001-06072025',
    date: '2025-02-15T11:30:00',
    projectId: 1,
    projectName: 'ЖК «Северный»',
    paymentMethod: 'Безналичный',
    managerName: 'Иванов И.П.',
    accountMasked: '4081 **** **** 4081',
    files: [{ name: 'договор.pdf' }, { name: 'счет.pdf' }],
  },
  {
    id: 'op-2',
    type: 'expense',
    amount: 45_500,
    purpose: 'Закупка серверного оборудования',
    date: '2026-05-03T09:15:00',
    projectId: 2,
    projectName: 'Офисное помещение',
    paymentMethod: 'Безналичный',
    managerName: 'Петрова А.С.',
    accountMasked: '4070 **** **** 9012',
    files: [{ name: 'накладная.pdf' }],
  },
  {
    id: 'op-3',
    type: 'income',
    amount: 250_000,
    purpose: 'Аванс по договору подряда',
    date: '2026-05-06T16:45:00',
    projectId: 1,
    projectName: 'ЖК «Северный»',
    paymentMethod: 'Безналичный',
    managerName: 'Иванов И.П.',
    accountMasked: '4081 **** **** 4081',
  },
  {
    id: 'op-4',
    type: 'expense',
    amount: 128_000,
    purpose: 'Выплата заработной платы за апрель',
    date: '2026-05-01T10:00:00',
    projectId: 3,
    projectName: 'Корпоративный сайт',
    paymentMethod: 'Безналичный',
    managerName: 'Сидоров В.К.',
    accountMasked: '4070 **** **** 3311',
  },
  {
    id: 'op-5',
    type: 'expense',
    amount: 12_300,
    purpose: 'Канцтовары и расходные материалы',
    date: '2026-05-07T13:20:00',
    projectId: 2,
    projectName: 'Офисное помещение',
    paymentMethod: 'Наличный',
    managerName: 'Петрова А.С.',
    accountMasked: '—',
  },
  {
    id: 'op-6',
    type: 'income',
    amount: 58_750,
    purpose: 'Оплата услуг проектирования',
    date: '2026-04-28T14:10:00',
    projectId: 3,
    projectName: 'Корпоративный сайт',
    paymentMethod: 'Безналичный',
    managerName: 'Сидоров В.К.',
    accountMasked: '4081 **** **** 5522',
    files: [{ name: 'акт.pdf' }, { name: 'счет.pdf' }],
  },
  {
    id: 'op-7',
    type: 'expense',
    amount: 9_800,
    purpose: 'Хостинг и домен на год',
    date: '2026-05-05T08:00:00',
    projectId: 3,
    projectName: 'Корпоративный сайт',
    paymentMethod: 'Безналичный',
    managerName: 'Сидоров В.К.',
    accountMasked: '4070 **** **** 9012',
  },
  {
    id: 'op-8',
    type: 'income',
    amount: 15_000,
    purpose: 'Возврат излишне перечисленных средств',
    date: '2025-11-20T12:00:00',
    projectId: 2,
    projectName: 'Офисное помещение',
    paymentMethod: 'Безналичный',
    managerName: 'Петрова А.С.',
    accountMasked: '4081 **** **** 4081',
  },
  {
    id: 'op-9',
    type: 'expense',
    amount: 320_000,
    purpose: 'Закупка лицензий ПО',
    date: '2026-05-02T11:30:00',
    projectId: 1,
    projectName: 'ЖК «Северный»',
    paymentMethod: 'Безналичный',
    managerName: 'Иванов И.П.',
    accountMasked: '4070 **** **** 1188',
    files: [{ name: 'лицензия.pdf' }],
  },
  {
    id: 'op-10',
    type: 'income',
    amount: 42_000,
    purpose: 'Доплата по смете',
    date: '2026-05-08T09:45:00',
    projectId: 1,
    projectName: 'ЖК «Северный»',
    paymentMethod: 'Наличный',
    managerName: 'Иванов И.П.',
    accountMasked: '—',
  },
];
