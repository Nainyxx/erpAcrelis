// Данные проектов
export const projectsData = [
  {
    id: 1,
    name: "ERP система для компании",
    type: "website",
    typeLabel: "Веб-сайт",
    status: "В работе",
    hours: 20,
    price: "1000000.00",
    teamSize: 3,
    team: [
      { id: 1, name: "Амир Лутфуллин", role: "Team Lead" },
      { id: 2, name: "Мария Петрова", role: "Frontend Dev" },
      { id: 3, name: "Екатерина Смирнова", role: "Backend Dev" }
    ],
    description: "Внутренняя ERP система для управления бизнес-процессами компании. Включает модули: бухгалтерия, склад, CRM, отчетность.",
    createdAt: "2025-11-19",
    startDate: "2024-01-15",
    deadline: "2024-06-30",
    customer: "ООО 'ТехноПрогресс'",
    progress: 65,
    files: [
      { id: 1, name: 'Техническое задание.pdf', size: '2.4 МБ', date: '15.01.2024' },
      { id: 2, name: 'Дизайн-макеты.sketch', size: '15.7 МБ', date: '20.01.2024' },
      { id: 3, name: 'Смета.xlsx', size: '0.8 МБ', date: '18.01.2024' },
      { id: 4, name: 'Архитектура системы.vsdx', size: '3.2 МБ', date: '25.01.2024' },
      { id: 5, name: 'API документация.pdf', size: '1.5 МБ', date: '30.01.2024' }
    ],
    priority: "high",
    budget: "1000000.00",
    spent: "650000.00"
  },
  {
    id: 2,
    name: "Мобильное приложение для доставки",
    type: "mobile",
    typeLabel: "Мобильное приложение",
    status: "В работе",
    hours: 120,
    price: "1500000.50",
    teamSize: 2,
    team: [
      { id: 3, name: "Екатерина Смирнова", role: "iOS Dev" },
      { id: 5, name: "Дмитрий Иванов", role: "Android Dev" }
    ],
    description: "Приложение для службы доставки еды с функционалом: выбор ресторана, заказ, оплата, отслеживание курьера.",
    createdAt: "2025-11-18",
    startDate: "2024-02-01",
    deadline: "2024-08-15",
    customer: "ООО 'ФастФуд Деливери'",
    progress: 40,
    files: [
      { id: 1, name: 'Концепция проекта.pdf', size: '1.8 МБ', date: '01.02.2024' },
      { id: 2, name: 'UI дизайн.fig', size: '8.2 МБ', date: '10.02.2024' },
      { id: 3, name: 'API документация.docx', size: '1.1 МБ', date: '15.02.2024' },
      { id: 4, name: 'Мокапы экранов.pdf', size: '4.5 МБ', date: '20.02.2024' }
    ],
    priority: "medium",
    budget: "1500000.50",
    spent: "600000.00"
  },
  {
    id: 3,
    name: "Корпоративный портал",
    type: "website",
    typeLabel: "Веб-сайт",
    status: "Готов",
    hours: 80,
    price: "750000.00",
    teamSize: 1,
    team: [
      { id: 2, name: "Мария Петрова", role: "Fullstack Dev" }
    ],
    description: "Корпоративный портал для внутреннего использования сотрудниками компании. Включает новости, документы, календарь событий.",
    createdAt: "2025-11-15",
    startDate: "2023-11-01",
    deadline: "2024-02-28",
    customer: "ООО 'ПромСтрой'",
    progress: 100,
    files: [
      { id: 1, name: 'Техническое задание.pdf', size: '3.2 МБ', date: '01.11.2023' },
      { id: 2, name: 'Исходный код.zip', size: '45.3 МБ', date: '28.02.2024' },
      { id: 3, name: 'Отчет по проекту.docx', size: '2.5 МБ', date: '01.03.2024' },
      { id: 4, name: 'Руководство пользователя.pdf', size: '5.7 МБ', date: '05.03.2024' }
    ],
    priority: "low",
    budget: "750000.00",
    spent: "750000.00"
  },
  {
    id: 4,
    name: "Аналитическая панель BI",
    type: "dashboard",
    typeLabel: "Дашборд",
    status: "В работе",
    hours: 150,
    price: "2200000.75",
    teamSize: 3,
    team: [
      { id: 4, name: "Алексей Козлов", role: "Data Analyst" },
      { id: 1, name: "Амир Лутфуллин", role: "Backend Dev" },
      { id: 3, name: "Екатерина Смирнова", role: "Frontend Dev" }
    ],
    description: "Бизнес-аналитика и отчетность в реальном времени. Интеграция с 1С, CRM системами, Google Analytics.",
    createdAt: "2025-11-10",
    startDate: "2024-03-10",
    deadline: "2024-09-30",
    customer: "Банк 'ФинансИнвест'",
    progress: 25,
    files: [
      { id: 1, name: 'Требования заказчика.pdf', size: '4.1 МБ', date: '10.03.2024' },
      { id: 2, name: 'Архитектура системы.dwg', size: '12.8 МБ', date: '25.03.2024' },
      { id: 3, name: 'Прототип панели.fig', size: '6.7 МБ', date: '05.04.2024' },
      { id: 4, name: 'Отчет по интеграции.docx', size: '2.3 МБ', date: '15.04.2024' }
    ],
    priority: "high",
    budget: "2200000.75",
    spent: "550000.00"
  },
  {
    id: 5,
    name: "Интернет-магазин электроники",
    type: "ecommerce",
    typeLabel: "Интернет-магазин",
    status: "Планирование",
    hours: 100,
    price: "1250000.00",
    teamSize: 2,
    team: [
      { id: 6, name: "Ольга Сидорова", role: "Designer" },
      { id: 7, name: "Иван Федоров", role: "Developer" }
    ],
    description: "Онлайн магазин электроники с полным циклом продаж: каталог товаров, корзина, оплата, доставка, личный кабинет.",
    createdAt: "2025-11-25",
    startDate: "2024-05-01",
    deadline: "2024-12-15",
    customer: "ООО 'ЭлектронМаркет'",
    progress: 5,
    files: [
      { id: 1, name: 'Бизнес-план.docx', size: '1.2 МБ', date: '25.11.2025' },
      { id: 2, name: 'Анализ конкурентов.pdf', size: '3.4 МБ', date: '26.11.2025' },
      { id: 3, name: 'Предварительная смета.xlsx', size: '0.9 МБ', date: '27.11.2025' },
      { id: 4, name: 'Концепция дизайна.pdf', size: '2.1 МБ', date: '28.11.2025' }
    ],
    priority: "medium",
    budget: "1250000.00",
    spent: "50000.00"
  },
  {
    id: 6,
    name: "Система управления складом",
    type: "system",
    typeLabel: "Система",
    status: "Готов",
    hours: 200,
    price: "3000000.00",
    teamSize: 4,
    team: [
      { id: 8, name: "Сергей Николаев", role: "Team Lead" },
      { id: 9, name: "Анна Кузнецова", role: "Backend Dev" },
      { id: 10, name: "Павел Морозов", role: "Frontend Dev" },
      { id: 1, name: "Амир Лутфуллин", role: "Architect" }
    ],
    description: "Автоматизированная система управления складскими процессами: приемка, хранение, отгрузка, инвентаризация.",
    createdAt: "2025-11-05",
    startDate: "2023-09-01",
    deadline: "2024-03-31",
    customer: "ООО 'Логистик Групп'",
    progress: 100,
    files: [
      { id: 1, name: 'Техническое задание.pdf', size: '5.8 МБ', date: '01.09.2023' },
      { id: 2, name: 'Схема базы данных.pdf', size: '3.2 МБ', date: '15.09.2023' },
      { id: 3, name: 'Руководство по установке.pdf', size: '4.1 МБ', date: '31.03.2024' },
      { id: 4, name: 'Тестовые данные.xlsx', size: '8.5 МБ', date: '05.04.2024' }
    ],
    priority: "high",
    budget: "3000000.00",
    spent: "2800000.00"
  }
];

// Типы проектов для фильтра
export const projectTypes = [
  { id: 'all', label: 'Все проекты', count: 6 },
  { id: 'website', label: 'Веб-сайт', count: 2 },
  { id: 'mobile', label: 'Мобильное приложение', count: 1 },
  { id: 'dashboard', label: 'Дашборд', count: 1 },
  { id: 'ecommerce', label: 'Интернет-магазин', count: 1 },
  { id: 'system', label: 'Система', count: 1 }
];

// Функция для форматирования цены
export const formatPrice = (price) => {
  const num = parseFloat(price);
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num) + ' ₽';
};

// Дополнительные данные для ProjectCard
export const projectCardData = {
  kanbanUrl: "/projects/kanban",
  ganttUrl: "/projects/gantt",
  statuses: [
    { id: 'В работе', label: 'В работе', color: '#4A90E2' },
    { id: 'Готов', label: 'Готов', color: '#7ED321' },
    { id: 'Планирование', label: 'Планирование', color: '#F5A623' }
  ],
  priorities: [
    { id: 'high', label: 'Высокий', color: '#D0021B' },
    { id: 'medium', label: 'Средний', color: '#F5A623' },
    { id: 'low', label: 'Низкий', color: '#7ED321' }
  ]
};