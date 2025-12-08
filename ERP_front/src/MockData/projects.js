// Данные проектов
const projectsData = [
  {
    id: 1,
    name: "ERP система для компании",
    type: "website",
    status: "В работе",
    hours: 20,
    price: "1000000.00",
    team: [
      { id: 1, name: "Амир Лутфуллин", role: "Team Lead", avatarColor: "#FF6B6B" },
      { id: 2, name: "Мария Петрова", role: "Backend Developer", avatarColor: "#4ECDC4" },
      { id: 3, name: "Екатерина Смирнова", role: "Frontend Developer", avatarColor: "#FFD166" }
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
      { id: 3, name: 'Архитектура системы.pptx', size: '5.3 МБ', date: '25.01.2024' }
    ],
    priority: "high",
    budget: "1000000.00",
    spent: "650000.00",
    ganttTasks: [
      {
        id: 'task-1-1',
        name: 'Анализ требований',
        start: '2024-01-15',
        end: '2024-01-30',
        progress: 100,
        status: 'completed',
        assignedTo: [1],
        dependencies: ''
      },
      {
        id: 'task-1-2',
        name: 'Проектирование архитектуры',
        start: '2024-01-25',
        end: '2024-02-20',
        progress: 100,
        status: 'completed',
        assignedTo: [1, 2],
        dependencies: 'task-1-1'
      },
      {
        id: 'task-1-3',
        name: 'Разработка бэкенда',
        start: '2024-02-15',
        end: '2024-04-15',
        progress: 80,
        status: 'in-progress',
        assignedTo: [2],
        dependencies: 'task-1-2'
      },
      {
        id: 'task-1-4',
        name: 'Разработка фронтенда',
        start: '2024-03-01',
        end: '2024-05-10',
        progress: 60,
        status: 'in-progress',
        assignedTo: [3],
        dependencies: 'task-1-2'
      },
      {
        id: 'task-1-5',
        name: 'Тестирование',
        start: '2024-04-20',
        end: '2024-06-10',
        progress: 30,
        status: 'planned',
        assignedTo: [1, 2, 3],
        dependencies: 'task-1-3, task-1-4'
      },
      {
        id: 'task-1-6',
        name: 'Внедрение и обучение',
        start: '2024-06-15',
        end: '2024-06-30',
        progress: 0,
        status: 'planned',
        assignedTo: [1],
        dependencies: 'task-1-5'
      }
    ],
    milestones: [
      { id: 'm1-1', name: 'Утверждение ТЗ', date: '2024-01-30', status: 'completed' },
      { id: 'm1-2', name: 'Готовность бэкенда', date: '2024-04-15', status: 'pending' },
      { id: 'm1-3', name: 'Завершение разработки', date: '2024-05-10', status: 'pending' },
      { id: 'm1-4', name: 'Сдача проекта', date: '2024-06-30', status: 'pending' }
    ]
  },
  {
    id: 2,
    name: "Мобильное приложение для доставки",
    type: "mobile",
    status: "В работе",
    hours: 120,
    price: "1500000.50",
    team: [
      { id: 3, name: "Екатерина Смирнова", role: "Frontend Developer", avatarColor: "#FFD166" },
      { id: 4, name: "Дмитрий Иванов", role: "Mobile Developer", avatarColor: "#06D6A0" },
      { id: 5, name: "Алексей Козлов", role: "UI/UX Designer", avatarColor: "#118AB2" }
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
      { id: 3, name: 'API спецификация.json', size: '0.8 МБ', date: '15.02.2024' }
    ],
    priority: "medium",
    budget: "1500000.50",
    spent: "600000.00",
    ganttTasks: [
      {
        id: 'task-2-1',
        name: 'Исследование рынка',
        start: '2024-02-01',
        end: '2024-02-15',
        progress: 100,
        status: 'completed',
        assignedTo: [5],
        dependencies: ''
      },
      {
        id: 'task-2-2',
        name: 'Прототипирование',
        start: '2024-02-10',
        end: '2024-03-10',
        progress: 100,
        status: 'completed',
        assignedTo: [5],
        dependencies: 'task-2-1'
      },
      {
        id: 'task-2-3',
        name: 'Дизайн интерфейса',
        start: '2024-03-01',
        end: '2024-04-15',
        progress: 90,
        status: 'in-progress',
        assignedTo: [5],
        dependencies: 'task-2-2'
      },
      {
        id: 'task-2-4',
        name: 'Разработка iOS',
        start: '2024-03-20',
        end: '2024-06-20',
        progress: 50,
        status: 'in-progress',
        assignedTo: [4],
        dependencies: 'task-2-2'
      },
      {
        id: 'task-2-5',
        name: 'Разработка Android',
        start: '2024-04-01',
        end: '2024-07-01',
        progress: 40,
        status: 'in-progress',
        assignedTo: [4],
        dependencies: 'task-2-2'
      },
      {
        id: 'task-2-6',
        name: 'Бэкенд разработка',
        start: '2024-03-15',
        end: '2024-05-31',
        progress: 60,
        status: 'in-progress',
        assignedTo: [3],
        dependencies: 'task-2-1'
      },
      {
        id: 'task-2-7',
        name: 'Тестирование',
        start: '2024-06-01',
        end: '2024-07-31',
        progress: 10,
        status: 'planned',
        assignedTo: [3, 4, 5],
        dependencies: 'task-2-4, task-2-5, task-2-6'
      },
      {
        id: 'task-2-8',
        name: 'Публикация в сторах',
        start: '2024-08-01',
        end: '2024-08-15',
        progress: 0,
        status: 'planned',
        assignedTo: [4],
        dependencies: 'task-2-7'
      }
    ],
    milestones: [
      { id: 'm2-1', name: 'Утверждение дизайна', date: '2024-03-10', status: 'completed' },
      { id: 'm2-2', name: 'Готовность MVP', date: '2024-05-31', status: 'pending' },
      { id: 'm2-3', name: 'Завершение тестирования', date: '2024-07-31', status: 'pending' },
      { id: 'm2-4', name: 'Запуск приложения', date: '2024-08-15', status: 'pending' }
    ]
  },
  {
    id: 3,
    name: "Корпоративный портал",
    type: "website",
    status: "Готов",
    hours: 80,
    price: "750000.00",
    team: [
      { id: 2, name: "Мария Петрова", role: "Full-stack Developer", avatarColor: "#4ECDC4" },
      { id: 6, name: "Ольга Сидорова", role: "UI Designer", avatarColor: "#EF476F" }
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
      { id: 3, name: 'Документация API.pdf', size: '2.1 МБ', date: '25.02.2024' }
    ],
    priority: "low",
    budget: "750000.00",
    spent: "750000.00",
    ganttTasks: [
      {
        id: 'task-3-1',
        name: 'Сбор требований',
        start: '2023-11-01',
        end: '2023-11-15',
        progress: 100,
        status: 'completed',
        assignedTo: [2],
        dependencies: ''
      },
      {
        id: 'task-3-2',
        name: 'Дизайн интерфейса',
        start: '2023-11-10',
        end: '2023-12-10',
        progress: 100,
        status: 'completed',
        assignedTo: [6],
        dependencies: 'task-3-1'
      },
      {
        id: 'task-3-3',
        name: 'Разработка фронтенда',
        start: '2023-12-01',
        end: '2024-01-15',
        progress: 100,
        status: 'completed',
        assignedTo: [2],
        dependencies: 'task-3-2'
      },
      {
        id: 'task-3-4',
        name: 'Разработка бэкенда',
        start: '2023-12-15',
        end: '2024-01-31',
        progress: 100,
        status: 'completed',
        assignedTo: [2],
        dependencies: 'task-3-1'
      },
      {
        id: 'task-3-5',
        name: 'Интеграция модулей',
        start: '2024-01-20',
        end: '2024-02-10',
        progress: 100,
        status: 'completed',
        assignedTo: [2, 6],
        dependencies: 'task-3-3, task-3-4'
      },
      {
        id: 'task-3-6',
        name: 'Тестирование и фиксы',
        start: '2024-02-11',
        end: '2024-02-25',
        progress: 100,
        status: 'completed',
        assignedTo: [2],
        dependencies: 'task-3-5'
      },
      {
        id: 'task-3-7',
        name: 'Внедрение',
        start: '2024-02-26',
        end: '2024-02-28',
        progress: 100,
        status: 'completed',
        assignedTo: [2],
        dependencies: 'task-3-6'
      }
    ],
    milestones: [
      { id: 'm3-1', name: 'Утверждение дизайна', date: '2023-12-10', status: 'completed' },
      { id: 'm3-2', name: 'Готовность функционала', date: '2024-01-31', status: 'completed' },
      { id: 'm3-3', name: 'Завершение тестирования', date: '2024-02-25', status: 'completed' },
      { id: 'm3-4', name: 'Сдача проекта', date: '2024-02-28', status: 'completed' }
    ]
  },
  {
    id: 4,
    name: "Аналитическая панель BI",
    type: "dashboard",
    status: "В работе",
    hours: 150,
    price: "2200000.75",
    team: [
      { id: 5, name: "Алексей Козлов", role: "Data Analyst", avatarColor: "#118AB2" },
      { id: 1, name: "Амир Лутфуллин", role: "Team Lead", avatarColor: "#FF6B6B" },
      { id: 3, name: "Екатерина Смирнова", role: "Frontend Developer", avatarColor: "#FFD166" },
      { id: 7, name: "Иван Федоров", role: "Backend Developer", avatarColor: "#06D6A0" }
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
      { id: 3, name: 'API документация.pdf', size: '3.5 МБ', date: '01.04.2024' }
    ],
    priority: "high",
    budget: "2200000.75",
    spent: "550000.00",
    ganttTasks: [
      {
        id: 'task-4-1',
        name: 'Анализ требований',
        start: '2024-03-10',
        end: '2024-04-05',
        progress: 100,
        status: 'completed',
        assignedTo: [5],
        dependencies: ''
      },
      {
        id: 'task-4-2',
        name: 'Проектирование БД',
        start: '2024-03-25',
        end: '2024-04-20',
        progress: 100,
        status: 'completed',
        assignedTo: [7],
        dependencies: 'task-4-1'
      },
      {
        id: 'task-4-3',
        name: 'Разработка ETL процессов',
        start: '2024-04-10',
        end: '2024-06-15',
        progress: 40,
        status: 'in-progress',
        assignedTo: [5, 7],
        dependencies: 'task-4-2'
      },
      {
        id: 'task-4-4',
        name: 'Визуализация дашбордов',
        start: '2024-05-01',
        end: '2024-08-15',
        progress: 20,
        status: 'in-progress',
        assignedTo: [3],
        dependencies: 'task-4-1'
      },
      {
        id: 'task-4-5',
        name: 'Интеграция с 1С',
        start: '2024-05-15',
        end: '2024-07-31',
        progress: 15,
        status: 'in-progress',
        assignedTo: [7],
        dependencies: 'task-4-2'
      },
      {
        id: 'task-4-6',
        name: 'Интеграция с CRM',
        start: '2024-06-01',
        end: '2024-08-15',
        progress: 10,
        status: 'planned',
        assignedTo: [7],
        dependencies: 'task-4-2'
      },
      {
        id: 'task-4-7',
        name: 'Тестирование',
        start: '2024-08-16',
        end: '2024-09-15',
        progress: 0,
        status: 'planned',
        assignedTo: [1, 3, 5, 7],
        dependencies: 'task-4-3, task-4-4, task-4-5, task-4-6'
      },
      {
        id: 'task-4-8',
        name: 'Внедрение',
        start: '2024-09-16',
        end: '2024-09-30',
        progress: 0,
        status: 'planned',
        assignedTo: [1],
        dependencies: 'task-4-7'
      }
    ],
    milestones: [
      { id: 'm4-1', name: 'Утверждение архитектуры', date: '2024-04-05', status: 'completed' },
      { id: 'm4-2', name: 'Готовность ETL', date: '2024-06-15', status: 'pending' },
      { id: 'm4-3', name: 'Первые дашборды', date: '2024-07-01', status: 'pending' },
      { id: 'm4-4', name: 'Сдача проекта', date: '2024-09-30', status: 'pending' }
    ]
  },
  {
    id: 5,
    name: "Интернет-магазин электроники",
    type: "ecommerce",
    status: "Планирование",
    hours: 100,
    price: "1250000.00",
    team: [
      { id: 6, name: "Ольга Сидорова", role: "UI Designer", avatarColor: "#EF476F" },
      { id: 7, name: "Иван Федоров", role: "Backend Developer", avatarColor: "#06D6A0" },
      { id: 8, name: "Сергей Николаев", role: "Frontend Developer", avatarColor: "#118AB2" }
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
      { id: 3, name: 'Карта сайта.xml', size: '0.5 МБ', date: '28.11.2025' }
    ],
    priority: "medium",
    budget: "1250000.00",
    spent: "50000.00",
    ganttTasks: [
      {
        id: 'task-5-1',
        name: 'Планирование проекта',
        start: '2024-05-01',
        end: '2024-05-15',
        progress: 80,
        status: 'in-progress',
        assignedTo: [6, 7, 8],
        dependencies: ''
      },
      {
        id: 'task-5-2',
        name: 'Дизайн UI/UX',
        start: '2024-05-10',
        end: '2024-06-20',
        progress: 10,
        status: 'in-progress',
        assignedTo: [6],
        dependencies: 'task-5-1'
      },
      {
        id: 'task-5-3',
        name: 'Разработка бэкенда',
        start: '2024-06-01',
        end: '2024-08-31',
        progress: 0,
        status: 'planned',
        assignedTo: [7],
        dependencies: 'task-5-1'
      },
      {
        id: 'task-5-4',
        name: 'Разработка фронтенда',
        start: '2024-06-15',
        end: '2024-09-30',
        progress: 0,
        status: 'planned',
        assignedTo: [8],
        dependencies: 'task-5-2'
      },
      {
        id: 'task-5-5',
        name: 'Настройка оплаты и доставки',
        start: '2024-08-15',
        end: '2024-10-15',
        progress: 0,
        status: 'planned',
        assignedTo: [7, 8],
        dependencies: 'task-5-3, task-5-4'
      },
      {
        id: 'task-5-6',
        name: 'Тестирование',
        start: '2024-10-16',
        end: '2024-11-30',
        progress: 0,
        status: 'planned',
        assignedTo: [6, 7, 8],
        dependencies: 'task-5-5'
      },
      {
        id: 'task-5-7',
        name: 'Запуск магазина',
        start: '2024-12-01',
        end: '2024-12-15',
        progress: 0,
        status: 'planned',
        assignedTo: [7],
        dependencies: 'task-5-6'
      }
    ],
    milestones: [
      { id: 'm5-1', name: 'Утверждение плана', date: '2024-05-15', status: 'pending' },
      { id: 'm5-2', name: 'Утверждение дизайна', date: '2024-06-20', status: 'pending' },
      { id: 'm5-3', name: 'Готовность бэкенда', date: '2024-08-31', status: 'pending' },
      { id: 'm5-4', name: 'Запуск магазина', date: '2024-12-15', status: 'pending' }
    ]
  },
  {
    id: 6,
    name: "Система управления складом",
    type: "system",
    status: "Готов",
    hours: 200,
    price: "3000000.00",
    team: [
      { id: 8, name: "Сергей Николаев", role: "Frontend Developer", avatarColor: "#118AB2" },
      { id: 9, name: "Анна Кузнецова", role: "Backend Developer", avatarColor: "#FF6B6B" },
      { id: 10, name: "Павел Морозов", role: "DevOps Engineer", avatarColor: "#4ECDC4" },
      { id: 1, name: "Амир Лутфуллин", role: "Project Manager", avatarColor: "#FFD166" }
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
      { id: 3, name: 'Руководство пользователя.pdf', size: '4.5 МБ', date: '25.03.2024' }
    ],
    priority: "high",
    budget: "3000000.00",
    spent: "2800000.00",
    ganttTasks: [
      {
        id: 'task-6-1',
        name: 'Анализ складских процессов',
        start: '2023-09-01',
        end: '2023-10-15',
        progress: 100,
        status: 'completed',
        assignedTo: [1],
        dependencies: ''
      },
      {
        id: 'task-6-2',
        name: 'Проектирование системы',
        start: '2023-09-20',
        end: '2023-11-10',
        progress: 100,
        status: 'completed',
        assignedTo: [1, 9],
        dependencies: 'task-6-1'
      },
      {
        id: 'task-6-3',
        name: 'Разработка ядра системы',
        start: '2023-10-15',
        end: '2024-01-15',
        progress: 100,
        status: 'completed',
        assignedTo: [9],
        dependencies: 'task-6-2'
      },
      {
        id: 'task-6-4',
        name: 'Интерфейс администратора',
        start: '2023-11-01',
        end: '2024-01-31',
        progress: 100,
        status: 'completed',
        assignedTo: [8],
        dependencies: 'task-6-2'
      },
      {
        id: 'task-6-5',
        name: 'Мобильное приложение для сотрудников',
        start: '2023-12-01',
        end: '2024-02-15',
        progress: 100,
        status: 'completed',
        assignedTo: [8],
        dependencies: 'task-6-3'
      },
      {
        id: 'task-6-6',
        name: 'Интеграция с оборудованием',
        start: '2024-01-01',
        end: '2024-02-28',
        progress: 100,
        status: 'completed',
        assignedTo: [10],
        dependencies: 'task-6-3'
      },
      {
        id: 'task-6-7',
        name: 'Тестирование и отладка',
        start: '2024-02-15',
        end: '2024-03-15',
        progress: 100,
        status: 'completed',
        assignedTo: [1, 8, 9, 10],
        dependencies: 'task-6-4, task-6-5, task-6-6'
      },
      {
        id: 'task-6-8',
        name: 'Внедрение и обучение',
        start: '2024-03-16',
        end: '2024-03-31',
        progress: 100,
        status: 'completed',
        assignedTo: [1],
        dependencies: 'task-6-7'
      }
    ],
    milestones: [
      { id: 'm6-1', name: 'Утверждение архитектуры', date: '2023-11-10', status: 'completed' },
      { id: 'm6-2', name: 'Готовность ядра', date: '2024-01-15', status: 'completed' },
      { id: 'm6-3', name: 'Интеграция с оборудованием', date: '2024-02-28', status: 'completed' },
      { id: 'm6-4', name: 'Сдача проекта', date: '2024-03-31', status: 'completed' }
    ]
  },
  {
    id: 7,
    name: "Приложение для фитнеса",
    type: "mobile",
    status: "В работе",
    hours: 90,
    price: "950000.00",
    team: [
      { id: 11, name: "Елена Васнецова", role: "UI/UX Designer", avatarColor: "#FF6B6B" },
      { id: 12, name: "Артем Белов", role: "Mobile Developer", avatarColor: "#4ECDC4" },
      { id: 13, name: "Татьяна Орлова", role: "Backend Developer", avatarColor: "#FFD166" }
    ],
    description: "Фитнес-трекер с персонализированными тренировками, отслеживанием прогресса и интеграцией с умными часами.",
    createdAt: "2025-11-20",
    startDate: "2024-01-10",
    deadline: "2024-07-20",
    customer: "ООО 'ФитнесПро'",
    progress: 55,
    files: [
      { id: 1, name: 'Концепция приложения.pdf', size: '2.3 МБ', date: '10.01.2024' },
      { id: 2, name: 'Дизайн интерфейса.fig', size: '7.8 МБ', date: '25.01.2024' },
      { id: 3, name: 'API для умных часов.json', size: '1.2 МБ', date: '15.02.2024' }
    ],
    priority: "medium",
    budget: "950000.00",
    spent: "520000.00",
    ganttTasks: [
      {
        id: 'task-7-1',
        name: 'Исследование и анализ',
        start: '2024-01-10',
        end: '2024-01-31',
        progress: 100,
        status: 'completed',
        assignedTo: [11],
        dependencies: ''
      },
      {
        id: 'task-7-2',
        name: 'Прототипирование',
        start: '2024-01-20',
        end: '2024-02-20',
        progress: 100,
        status: 'completed',
        assignedTo: [11],
        dependencies: 'task-7-1'
      },
      {
        id: 'task-7-3',
        name: 'Дизайн интерфейса',
        start: '2024-02-10',
        end: '2024-03-20',
        progress: 100,
        status: 'completed',
        assignedTo: [11],
        dependencies: 'task-7-2'
      },
      {
        id: 'task-7-4',
        name: 'Разработка бэкенда',
        start: '2024-02-01',
        end: '2024-04-30',
        progress: 70,
        status: 'in-progress',
        assignedTo: [13],
        dependencies: 'task-7-1'
      },
      {
        id: 'task-7-5',
        name: 'Разработка iOS приложения',
        start: '2024-03-01',
        end: '2024-05-31',
        progress: 60,
        status: 'in-progress',
        assignedTo: [12],
        dependencies: 'task-7-3'
      },
      {
        id: 'task-7-6',
        name: 'Разработка Android приложения',
        start: '2024-03-15',
        end: '2024-06-15',
        progress: 50,
        status: 'in-progress',
        assignedTo: [12],
        dependencies: 'task-7-3'
      },
      {
        id: 'task-7-7',
        name: 'Интеграция с умными часами',
        start: '2024-04-15',
        end: '2024-06-30',
        progress: 30,
        status: 'in-progress',
        assignedTo: [12],
        dependencies: 'task-7-5, task-7-6'
      },
      {
        id: 'task-7-8',
        name: 'Тестирование',
        start: '2024-06-15',
        end: '2024-07-10',
        progress: 0,
        status: 'planned',
        assignedTo: [11, 12, 13],
        dependencies: 'task-7-4, task-7-7'
      },
      {
        id: 'task-7-9',
        name: 'Публикация',
        start: '2024-07-11',
        end: '2024-07-20',
        progress: 0,
        status: 'planned',
        assignedTo: [12],
        dependencies: 'task-7-8'
      }
    ],
    milestones: [
      { id: 'm7-1', name: 'Утверждение дизайна', date: '2024-02-20', status: 'completed' },
      { id: 'm7-2', name: 'Готовность MVP', date: '2024-04-30', status: 'pending' },
      { id: 'm7-3', name: 'Интеграция с гаджетами', date: '2024-06-30', status: 'pending' },
      { id: 'm7-4', name: 'Запуск приложения', date: '2024-07-20', status: 'pending' }
    ]
  },
  {
    id: 8,
    name: "Портал для клиентов",
    type: "website",
    status: "Готов",
    hours: 60,
    price: "500000.00",
    team: [
      { id: 13, name: "Татьяна Орлова", role: "Full-stack Developer", avatarColor: "#FFD166" },
      { id: 14, name: "Михаил Соколов", role: "UI Designer", avatarColor: "#06D6A0" }
    ],
    description: "Личный кабинет для клиентов компании с доступом к документам, истории заказов и техподдержкой.",
    createdAt: "2025-11-12",
    startDate: "2023-12-01",
    deadline: "2024-03-15",
    customer: "ООО 'Сервис Плюс'",
    progress: 100,
    files: [
      { id: 1, name: 'ТЗ портала.pdf', size: '2.1 МБ', date: '01.12.2023' },
      { id: 2, name: 'Дизайн-макет.psd', size: '12.5 МБ', date: '15.12.2023' },
      { id: 3, name: 'Руководство администратора.pdf', size: '3.8 МБ', date: '10.03.2024' }
    ],
    priority: "low",
    budget: "500000.00",
    spent: "480000.00",
    ganttTasks: [
      {
        id: 'task-8-1',
        name: 'Анализ требований',
        start: '2023-12-01',
        end: '2023-12-15',
        progress: 100,
        status: 'completed',
        assignedTo: [13],
        dependencies: ''
      },
      {
        id: 'task-8-2',
        name: 'Дизайн интерфейса',
        start: '2023-12-10',
        end: '2024-01-05',
        progress: 100,
        status: 'completed',
        assignedTo: [14],
        dependencies: 'task-8-1'
      },
      {
        id: 'task-8-3',
        name: 'Разработка фронтенда',
        start: '2024-01-02',
        end: '2024-02-10',
        progress: 100,
        status: 'completed',
        assignedTo: [13],
        dependencies: 'task-8-2'
      },
      {
        id: 'task-8-4',
        name: 'Разработка бэкенда',
        start: '2023-12-20',
        end: '2024-02-15',
        progress: 100,
        status: 'completed',
        assignedTo: [13],
        dependencies: 'task-8-1'
      },
      {
        id: 'task-8-5',
        name: 'Интеграция с CRM',
        start: '2024-02-01',
        end: '2024-02-25',
        progress: 100,
        status: 'completed',
        assignedTo: [13],
        dependencies: 'task-8-4'
      },
      {
        id: 'task-8-6',
        name: 'Тестирование',
        start: '2024-02-20',
        end: '2024-03-05',
        progress: 100,
        status: 'completed',
        assignedTo: [13, 14],
        dependencies: 'task-8-3, task-8-5'
      },
      {
        id: 'task-8-7',
        name: 'Внедрение',
        start: '2024-03-06',
        end: '2024-03-15',
        progress: 100,
        status: 'completed',
        assignedTo: [13],
        dependencies: 'task-8-6'
      }
    ],
    milestones: [
      { id: 'm8-1', name: 'Утверждение дизайна', date: '2024-01-05', status: 'completed' },
      { id: 'm8-2', name: 'Готовность функционала', date: '2024-02-15', status: 'completed' },
      { id: 'm8-3', name: 'Завершение тестирования', date: '2024-03-05', status: 'completed' },
      { id: 'm8-4', name: 'Сдача проекта', date: '2024-03-15', status: 'completed' }
    ]
  },
  {
    id: 9,
    name: "CRM система",
    type: "system",
    status: "В работе",
    hours: 180,
    price: "2800000.00",
    team: [
      { id: 14, name: "Михаил Соколов", role: "UI Designer", avatarColor: "#06D6A0" },
      { id: 15, name: "Юлия Павлова", role: "Backend Developer", avatarColor: "#118AB2" },
      { id: 16, name: "Роман Захаров", role: "Frontend Developer", avatarColor: "#EF476F" },
      { id: 17, name: "Кирилл Попов", role: "DevOps Engineer", avatarColor: "#FF6B6B" }
    ],
    description: "Система управления взаимоотношениями с клиентами с автоматизацией продаж, маркетинга и обслуживания.",
    createdAt: "2025-11-08",
    startDate: "2024-02-15",
    deadline: "2024-10-31",
    customer: "ООО 'БизнесТех'",
    progress: 35,
    files: [
      { id: 1, name: 'Техническое задание CRM.pdf', size: '4.8 МБ', date: '15.02.2024' },
      { id: 2, name: 'Архитектура базы данных.sql', size: '2.3 МБ', date: '01.03.2024' },
      { id: 3, name: 'Дизайн интерфейса.fig', size: '9.5 МБ', date: '20.03.2024' }
    ],
    priority: "high",
    budget: "2800000.00",
    spent: "980000.00",
    ganttTasks: [
      {
        id: 'task-9-1',
        name: 'Анализ бизнес-процессов',
        start: '2024-02-15',
        end: '2024-03-15',
        progress: 100,
        status: 'completed',
        assignedTo: [15],
        dependencies: ''
      },
      {
        id: 'task-9-2',
        name: 'Проектирование архитектуры',
        start: '2024-03-01',
        end: '2024-04-10',
        progress: 100,
        status: 'completed',
        assignedTo: [15, 17],
        dependencies: 'task-9-1'
      },
      {
        id: 'task-9-3',
        name: 'Дизайн интерфейса',
        start: '2024-03-15',
        end: '2024-05-15',
        progress: 80,
        status: 'in-progress',
        assignedTo: [14],
        dependencies: 'task-9-1'
      },
      {
        id: 'task-9-4',
        name: 'Разработка ядра CRM',
        start: '2024-04-01',
        end: '2024-07-31',
        progress: 40,
        status: 'in-progress',
        assignedTo: [15],
        dependencies: 'task-9-2'
      },
      {
        id: 'task-9-5',
        name: 'Фронтенд разработка',
        start: '2024-05-01',
        end: '2024-08-31',
        progress: 25,
        status: 'in-progress',
        assignedTo: [16],
        dependencies: 'task-9-3'
      },
      {
        id: 'task-9-6',
        name: 'Модуль отчетности',
        start: '2024-06-01',
        end: '2024-09-15',
        progress: 15,
        status: 'in-progress',
        assignedTo: [15, 16],
        dependencies: 'task-9-4'
      },
      {
        id: 'task-9-7',
        name: 'Интеграция с почтой',
        start: '2024-07-01',
        end: '2024-09-30',
        progress: 5,
        status: 'planned',
        assignedTo: [15],
        dependencies: 'task-9-4'
      },
      {
        id: 'task-9-8',
        name: 'Тестирование',
        start: '2024-09-01',
        end: '2024-10-15',
        progress: 0,
        status: 'planned',
        assignedTo: [14, 15, 16, 17],
        dependencies: 'task-9-5, task-9-6, task-9-7'
      },
      {
        id: 'task-9-9',
        name: 'Внедрение',
        start: '2024-10-16',
        end: '2024-10-31',
        progress: 0,
        status: 'planned',
        assignedTo: [15],
        dependencies: 'task-9-8'
      }
    ],
    milestones: [
      { id: 'm9-1', name: 'Утверждение архитектуры', date: '2024-04-10', status: 'completed' },
      { id: 'm9-2', name: 'Утверждение дизайна', date: '2024-05-15', status: 'pending' },
      { id: 'm9-3', name: 'Готовность ядра', date: '2024-07-31', status: 'pending' },
      { id: 'm9-4', name: 'Сдача проекта', date: '2024-10-31', status: 'pending' }
    ]
  },
  {
    id: 10,
    name: "Маркетплейс",
    type: "ecommerce",
    status: "Планирование",
    hours: 250,
    price: "4500000.00",
    team: [
      { id: 17, name: "Кирилл Попов", role: "DevOps Engineer", avatarColor: "#FF6B6B" },
      { id: 18, name: "Наталья Фомина", role: "Backend Developer", avatarColor: "#4ECDC4" },
      { id: 19, name: "Вадим Егоров", role: "Frontend Developer", avatarColor: "#FFD166" },
      { id: 20, name: "Светлана Романова", role: "UI/UX Designer", avatarColor: "#06D6A0" },
      { id: 21, name: "Георгий Медведев", role: "Product Manager", avatarColor: "#118AB2" }
    ],
    description: "Многофункциональная площадка для онлайн-торговли с системой рекомендаций, отзывами и безопасными платежами.",
    createdAt: "2025-11-28",
    startDate: "2024-06-01",
    deadline: "2025-03-31",
    customer: "ООО 'ТорговаяПлощадка'",
    progress: 10,
    files: [
      { id: 1, name: 'Бизнес-модель.docx', size: '3.5 МБ', date: '28.11.2025' },
      { id: 2, name: 'Анализ рынка.pdf', size: '5.2 МБ', date: '29.11.2025' },
      { id: 3, name: 'Техническое задание.pptx', size: '8.7 МБ', date: '30.11.2025' }
    ],
    priority: "medium",
    budget: "4500000.00",
    spent: "200000.00",
    ganttTasks: [
      {
        id: 'task-10-1',
        name: 'Исследование рынка',
        start: '2024-06-01',
        end: '2024-07-15',
        progress: 60,
        status: 'in-progress',
        assignedTo: [21],
        dependencies: ''
      },
      {
        id: 'task-10-2',
        name: 'Разработка концепции',
        start: '2024-06-20',
        end: '2024-08-15',
        progress: 30,
        status: 'in-progress',
        assignedTo: [20, 21],
        dependencies: 'task-10-1'
      },
      {
        id: 'task-10-3',
        name: 'Проектирование архитектуры',
        start: '2024-07-15',
        end: '2024-09-15',
        progress: 10,
        status: 'in-progress',
        assignedTo: [17, 18],
        dependencies: 'task-10-2'
      },
      {
        id: 'task-10-4',
        name: 'Дизайн интерфейса',
        start: '2024-08-01',
        end: '2024-10-31',
        progress: 5,
        status: 'planned',
        assignedTo: [20],
        dependencies: 'task-10-2'
      },
      {
        id: 'task-10-5',
        name: 'Разработка бэкенда',
        start: '2024-09-01',
        end: '2025-01-31',
        progress: 0,
        status: 'planned',
        assignedTo: [18],
        dependencies: 'task-10-3'
      },
      {
        id: 'task-10-6',
        name: 'Разработка фронтенда',
        start: '2024-10-01',
        end: '2025-02-28',
        progress: 0,
        status: 'planned',
        assignedTo: [19],
        dependencies: 'task-10-4'
      },
      {
        id: 'task-10-7',
        name: 'Платежная система',
        start: '2024-11-01',
        end: '2025-01-15',
        progress: 0,
        status: 'planned',
        assignedTo: [18],
        dependencies: 'task-10-5'
      },
      {
        id: 'task-10-8',
        name: 'Система рекомендаций',
        start: '2024-12-01',
        end: '2025-02-15',
        progress: 0,
        status: 'planned',
        assignedTo: [18, 19],
        dependencies: 'task-10-5, task-10-6'
      },
      {
        id: 'task-10-9',
        name: 'Тестирование',
        start: '2025-02-16',
        end: '2025-03-15',
        progress: 0,
        status: 'planned',
        assignedTo: [17, 18, 19, 20, 21],
        dependencies: 'task-10-7, task-10-8'
      },
      {
        id: 'task-10-10',
        name: 'Запуск площадки',
        start: '2025-03-16',
        end: '2025-03-31',
        progress: 0,
        status: 'planned',
        assignedTo: [17, 21],
        dependencies: 'task-10-9'
      }
    ],
    milestones: [
      { id: 'm10-1', name: 'Утверждение концепции', date: '2024-08-15', status: 'pending' },
      { id: 'm10-2', name: 'Утверждение архитектуры', date: '2024-09-15', status: 'pending' },
      { id: 'm10-3', name: 'Завершение разработки', date: '2025-02-28', status: 'pending' },
      { id: 'm10-4', name: 'Запуск маркетплейса', date: '2025-03-31', status: 'pending' }
    ]
  }
];

// Типы проектов для фильтра
const projectTypes = [
  { id: 'all', label: 'Все проекты', count: projectsData.length },
  { id: 'website', label: 'Веб-сайт', count: projectsData.filter(p => p.type === 'website').length },
  { id: 'mobile', label: 'Мобильное приложение', count: projectsData.filter(p => p.type === 'mobile').length },
  { id: 'dashboard', label: 'Дашборд', count: projectsData.filter(p => p.type === 'dashboard').length },
  { id: 'ecommerce', label: 'Интернет-магазин', count: projectsData.filter(p => p.type === 'ecommerce').length },
  { id: 'system', label: 'Система', count: projectsData.filter(p => p.type === 'system').length }
];

// Дополнительные данные для Ганта
const ganttColors = {
  'completed': '#06D6A0',
  'in-progress': '#4ECDC4',
  'planned': '#FFD166',
  'high': '#FF6B6B',
  'medium': '#FFD166',
  'low': '#118AB2'
};

// Функции для работы с данными Ганта
export const getProjectGanttTasks = (projectId) => {
  const project = projectsData.find(p => p.id === projectId);
  return project ? project.ganttTasks : [];
};

export const getProjectMilestones = (projectId) => {
  const project = projectsData.find(p => p.id === projectId);
  return project ? project.milestones : [];
};

export const getTaskById = (projectId, taskId) => {
  const project = projectsData.find(p => p.id === projectId);
  if (!project || !project.ganttTasks) return null;
  return project.ganttTasks.find(task => task.id === taskId);
};

export const getTeamMemberById = (memberId) => {
  // Собираем всех членов команд из всех проектов
  const allMembers = projectsData.flatMap(project => project.team);
  return allMembers.find(member => member.id === memberId);
};

// Функция для форматирования цены
export const formatPrice = (price) => {
  const num = parseFloat(price);
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num) + ' ₽';
};

// Функция для форматирования даты
export const formatDate = (dateString) => {
  if (!dateString) return 'Не указана';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Неверная дата';
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}.${month}.${year}`;
};

// Функция для расчета длительности задачи
export const calculateTaskDuration = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Функция для получения статуса проекта
export const getProjectStatus = (progress) => {
  if (progress === 100) return 'completed';
  if (progress > 0 && progress < 100) return 'in-progress';
  return 'planned';
};

// Экспорт данных
export { projectsData, projectTypes, ganttColors };