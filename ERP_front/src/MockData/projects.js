// Моковые данные проектов (15 проектов)
export const projectsData = [
  {
    id: 1,
    name: "ERP система для нас",
    status: "tests",
    status_display: "Тестируется",
    type: "system",
    type_display: "Система",
    description: "Разработка ERP системы для внутреннего использования компании. Включает модули управления финансами, кадрами и логистикой.",
    customer: "Рога и Копыта",
    price: "1250000.00",
    available: true,
    deadline: "2025-12-01T21:00:00+03:00",
    hours: 1200,
    created: "2025-11-19T18:35:27.394381+03:00",
    updated: "2025-11-19T23:14:57.062758+03:00",
    progress: 75,
    priority: "high",
    startDate: "2025-11-01T00:00:00+03:00",
    files: [
      {
        id: 1,
        file: "http://127.0.0.1:8000/media/project_files/2025/11/19/image5.jpg",
        uploaded_at: "2025-11-19T18:35:56.954072+03:00",
        name: "Диаграмма архитектуры.jpg"
      },
      {
        id: 2,
        file: "http://127.0.0.1:8000/media/project_files/2025/11/19/image2.jpg",
        uploaded_at: "2025-11-19T22:53:56.608350+03:00",
        name: "Макет интерфейса.jpg"
      },
      {
        id: 3,
        file: "http://127.0.0.1:8000/media/project_files/2025/11/19/%D0%9B%D0%B0%D0%B1%D0%B0_3_.txt",
        uploaded_at: "2025-11-19T22:55:48.149725+03:00",
        name: "Требования.txt"
      }
    ],
    performers: [
      {
        id: 1,
        staff: 1,
        staff_name: "Амир Лутфуллин",
        assigned_at: "2025-11-19T18:35:40.903743+03:00",
        role: "Team Lead"
      },
      {
        id: 2,
        staff: 2,
        staff_name: "Мария Петрова",
        assigned_at: "2025-11-20T10:15:30.123456+03:00",
        role: "Дизайнер"
      }
    ],
    team: [
      {
        id: 1,
        name: "Амир Лутфуллин",
        role: "Team Lead",
        avatar: "https://via.placeholder.com/40"
      },
      {
        id: 4,
        name: "Михаил",
        role: "Project Manager",
        avatar: "https://via.placeholder.com/40"
      },
      {
        id: 2,
        name: "Мария Петрова",
        role: "Дизайнер",
        avatar: "https://via.placeholder.com/40"
      },
      {
        id: 3,
        name: "Иван Иванов",
        role: "Разработчик",
        avatar: "https://via.placeholder.com/40"
      },
      {
        id: 5,
        name: "Дмитрий Васильев",
        role: "Аналитик",
        avatar: "https://via.placeholder.com/40"
      }
    ],
    logs: [
      {
        id: 7,
        content: "Изменено: Статус - Тестируется, Цена - 1,250,000, Заказчик - Рога и Копыта",
        created: "2025-11-19T23:14:57.076152+03:00"
      },
      {
        id: 6,
        content: "Изменено: Статус - Приостановлен",
        created: "2025-11-19T23:14:29.753845+03:00"
      },
      {
        id: 5,
        content: "Изменено: Название: ERP система для нас",
        created: "2025-11-19T23:13:42.336695+03:00"
      },
      {
        id: 4,
        content: "Добавлен файл: project_files/2025/11/19/Лаба_3_.txt",
        created: "2025-11-19T22:55:48.162063+03:00"
      },
      {
        id: 3,
        content: "Добавлен файл: project_files/2025/11/19/image2.jpg",
        created: "2025-11-19T22:53:56.620861+03:00"
      },
      {
        id: 2,
        content: "Информация о проекте частично обновлена",
        created: "2025-11-19T22:52:05.431366+03:00"
      },
      {
        id: 1,
        content: "Проект создан",
        created: "2025-11-19T18:56:50.581457+03:00"
      }
    ],
    tasks: [
      {
        id: 1,
        name: "Первая задача в нашей ERP",
        description: "Пишем модели и апи полностью",
        status: "completed",
        status_display: "Готова",
        project: 1,
        project_name: "ERP система для нас",
        director: 4,
        director_name: "Михаил",
        performer: 1,
        performer_name: "Амир Лутфуллин",
        deadline: "2025-11-26T15:00:00+03:00",
        hours: 120,
        is_overdue: true,
        created: "2025-11-21T16:24:24.461029+03:00",
        updated: "2025-11-25T15:29:22.832093+03:00",
        progress: 100
      },
      {
        id: 2,
        name: "Задача2",
        description: "Разработка интерфейса администратора",
        status: "new",
        status_display: "Новое",
        project: 1,
        project_name: "ERP система для нас",
        director: 1,
        director_name: "Амир Лутфуллин",
        performer: 3,
        performer_name: "Иван Иванов",
        deadline: "2025-11-27T00:00:00+03:00",
        hours: 80,
        is_overdue: true,
        created: "2025-11-26T15:50:38.631404+03:00",
        progress: 0
      }
    ],
    ganttTasks: [
      {
        id: 1,
        name: "Анализ требований",
        start: "2025-11-01",
        end: "2025-11-05",
        progress: 100,
        status: "completed",
        assignedTo: [4, 5],
        dependencies: []
      },
      {
        id: 2,
        name: "Проектирование архитектуры",
        start: "2025-11-05",
        end: "2025-11-10",
        progress: 100,
        status: "completed",
        assignedTo: [1, 4],
        dependencies: [1]
      },
      {
        id: 3,
        name: "Разработка моделей и API",
        start: "2025-11-10",
        end: "2025-11-15",
        progress: 100,
        status: "completed",
        assignedTo: [1, 3],
        dependencies: [2]
      },
      {
        id: 4,
        name: "Разработка интерфейса",
        start: "2025-11-15",
        end: "2025-11-25",
        progress: 60,
        status: "in-progress",
        assignedTo: [2, 3],
        dependencies: [3]
      },
      {
        id: 5,
        name: "Тестирование системы",
        start: "2025-11-25",
        end: "2025-12-01",
        progress: 30,
        status: "in-progress",
        assignedTo: [1, 3, 5],
        dependencies: [4]
      },
      {
        id: 6,
        name: "Документация",
        start: "2025-11-20",
        end: "2025-11-30",
        progress: 40,
        status: "in-progress",
        assignedTo: [4, 5],
        dependencies: [3]
      }
    ]
  },
  {
    id: 2,
    name: "Корпоративный сайт",
    status: "in_progress",
    status_display: "В работе",
    type: "website",
    type_display: "Сайт",
    description: "Разработка корпоративного сайта для компании ТехноПрофи. Включает админ-панель и мультиязычность.",
    customer: "ТехноПрофи",
    price: "450000.00",
    available: true,
    deadline: "2025-12-15T18:00:00+03:00",
    hours: 320,
    created: "2025-11-10T10:20:15.123456+03:00",
    updated: "2025-11-20T14:30:45.789012+03:00",
    progress: 45,
    priority: "medium",
    startDate: "2025-11-01T00:00:00+03:00",
    files: [
      {
        id: 4,
        file: "http://127.0.0.1:8000/media/project_files/2025/11/10/site_mockup.jpg",
        uploaded_at: "2025-11-10T10:25:30.123456+03:00",
        name: "Макет сайта.jpg"
      }
    ],
    performers: [
      {
        id: 2,
        staff: 2,
        staff_name: "Мария Петрова",
        assigned_at: "2025-11-10T10:21:00.123456+03:00",
        role: "Дизайнер"
      },
      {
        id: 3,
        staff: 3,
        staff_name: "Иван Иванов",
        assigned_at: "2025-11-11T09:15:00.123456+03:00",
        role: "Разработчик"
      }
    ],
    team: [
      {
        id: 2,
        name: "Мария Петрова",
        role: "Дизайнер",
        avatar: "https://via.placeholder.com/40"
      },
      {
        id: 3,
        name: "Иван Иванов",
        role: "Разработчик",
        avatar: "https://via.placeholder.com/40"
      },
      {
        id: 4,
        name: "Михаил",
        role: "Project Manager",
        avatar: "https://via.placeholder.com/40"
      }
    ],
    logs: [
      {
        id: 101,
        content: "Проект создан",
        created: "2025-11-10T10:20:15.123456+03:00"
      },
      {
        id: 102,
        content: "Назначен исполнитель: Мария Петрова",
        created: "2025-11-10T10:21:00.123456+03:00"
      },
      {
        id: 103,
        content: "Назначен исполнитель: Иван Иванов",
        created: "2025-11-11T09:15:00.123456+03:00"
      }
    ],
    tasks: [
      {
        id: 3,
        name: "Дизайн главной страницы",
        description: "Создание дизайна главной страницы сайта",
        status: "completed",
        status_display: "Готова",
        project: 2,
        project_name: "Корпоративный сайт",
        director: 4,
        director_name: "Михаил",
        performer: 2,
        performer_name: "Мария Петрова",
        deadline: "2025-11-15T18:00:00+03:00",
        hours: 40,
        is_overdue: false,
        created: "2025-11-12T11:00:00.123456+03:00",
        updated: "2025-11-15T17:30:00.123456+03:00",
        progress: 100
      }
    ],
    ganttTasks: [
      {
        id: 7,
        name: "Анализ конкурентов",
        start: "2025-11-01",
        end: "2025-11-03",
        progress: 100,
        status: "completed",
        assignedTo: [2],
        dependencies: []
      },
      {
        id: 8,
        name: "Создание дизайн-макетов",
        start: "2025-11-03",
        end: "2025-11-10",
        progress: 100,
        status: "completed",
        assignedTo: [2],
        dependencies: [7]
      },
      {
        id: 9,
        name: "Верстка страниц",
        start: "2025-11-10",
        end: "2025-11-25",
        progress: 60,
        status: "in-progress",
        assignedTo: [3],
        dependencies: [8]
      },
      {
        id: 10,
        name: "Разработка бэкенда",
        start: "2025-11-15",
        end: "2025-12-05",
        progress: 20,
        status: "in-progress",
        assignedTo: [3],
        dependencies: [8]
      },
      {
        id: 11,
        name: "Тестирование",
        start: "2025-11-25",
        end: "2025-12-10",
        progress: 0,
        status: "planned",
        assignedTo: [2, 3],
        dependencies: [9, 10]
      }
    ]
  },
  {
    id: 3,
    name: "Мобильное приложение для доставки",
    status: "planned",
    status_display: "Планируется",
    type: "mobile",
    type_display: "Мобильное приложение",
    description: "Разработка мобильного приложения для доставки еды для iOS и Android",
    customer: "Стартап Инновации",
    price: "850000.00",
    available: true,
    deadline: "2026-02-01T12:00:00+03:00",
    hours: 650,
    created: "2025-11-25T09:00:00.123456+03:00",
    updated: "2025-11-25T09:00:00.123456+03:00",
    progress: 10,
    priority: "high",
    startDate: "2025-12-01T00:00:00+03:00",
    files: [],
    performers: [],
    team: [
      {
        id: 3,
        name: "Иван Иванов",
        role: "Разработчик",
        avatar: "https://via.placeholder.com/40"
      },
      {
        id: 5,
        name: "Дмитрий Васильев",
        role: "Аналитик",
        avatar: "https://via.placeholder.com/40"
      },
      {
        id: 6,
        name: "Елена Кузнецова",
        role: "Тестировщик",
        avatar: "https://via.placeholder.com/40"
      }
    ],
    logs: [
      {
        id: 201,
        content: "Проект создан",
        created: "2025-11-25T09:00:00.123456+03:00"
      }
    ],
    tasks: [],
    ganttTasks: [
      {
        id: 12,
        name: "Анализ требований",
        start: "2025-12-01",
        end: "2025-12-10",
        progress: 0,
        status: "planned",
        assignedTo: [5],
        dependencies: []
      },
      {
        id: 13,
        name: "Проектирование архитектуры",
        start: "2025-12-10",
        end: "2025-12-20",
        progress: 0,
        status: "planned",
        assignedTo: [3, 5],
        dependencies: [12]
      }
    ]
  },
  {
    id: 4,
    name: "Дашборд аналитики продаж",
    status: "completed",
    status_display: "Завершен",
    type: "dashboard",
    type_display: "Дашборд",
    description: "Создание дашборда для визуализации бизнес-метрик и аналитики продаж",
    customer: "Аналитика Про",
    price: "275000.00",
    available: false,
    deadline: "2025-10-15T18:00:00+03:00",
    hours: 180,
    created: "2025-09-01T14:00:00.123456+03:00",
    updated: "2025-10-20T16:30:00.123456+03:00",
    progress: 100,
    priority: "low",
    startDate: "2025-09-01T00:00:00+03:00",
    files: [
      {
        id: 5,
        file: "http://127.0.0.1:8000/media/project_files/2025/09/01/dashboard_final.jpg",
        uploaded_at: "2025-10-20T16:25:00.123456+03:00",
        name: "Финальный дашборд.jpg"
      }
    ],
    performers: [
      {
        id: 4,
        staff: 4,
        staff_name: "Михаил",
        assigned_at: "2025-09-01T14:05:00.123456+03:00",
        role: "Project Manager"
      }
    ],
    team: [
      {
        id: 4,
        name: "Михаил",
        role: "Project Manager",
        avatar: "https://via.placeholder.com/40"
      },
      {
        id: 3,
        name: "Иван Иванов",
        role: "Разработчик",
        avatar: "https://via.placeholder.com/40"
      }
    ],
    logs: [
      {
        id: 301,
        content: "Проект создан",
        created: "2025-09-01T14:00:00.123456+03:00"
      },
      {
        id: 302,
        content: "Проект завершен",
        created: "2025-10-20T16:30:00.123456+03:00"
      }
    ],
    tasks: [
      {
        id: 4,
        name: "Интеграция с API",
        description: "Настройка подключения к API данных",
        status: "completed",
        status_display: "Готова",
        project: 4,
        project_name: "Дашборд аналитики продаж",
        director: 4,
        director_name: "Михаил",
        performer: 3,
        performer_name: "Иван Иванов",
        deadline: "2025-10-10T18:00:00+03:00",
        hours: 40,
        is_overdue: false,
        created: "2025-09-15T11:00:00.123456+03:00",
        updated: "2025-10-10T17:45:00.123456+03:00",
        progress: 100
      }
    ],
    ganttTasks: [
      {
        id: 14,
        name: "Сбор требований",
        start: "2025-09-01",
        end: "2025-09-05",
        progress: 100,
        status: "completed",
        assignedTo: [4],
        dependencies: []
      },
      {
        id: 15,
        name: "Проектирование",
        start: "2025-09-05",
        end: "2025-09-12",
        progress: 100,
        status: "completed",
        assignedTo: [4],
        dependencies: [14]
      },
      {
        id: 16,
        name: "Разработка",
        start: "2025-09-12",
        end: "2025-10-05",
        progress: 100,
        status: "completed",
        assignedTo: [3],
        dependencies: [15]
      },
      {
        id: 17,
        name: "Тестирование",
        start: "2025-10-05",
        end: "2025-10-15",
        progress: 100,
        status: "completed",
        assignedTo: [4],
        dependencies: [16]
      }
    ]
  },
  {
    id: 5,
    name: "Интернет-магазин мебели",
    status: "in_progress",
    status_display: "В работе",
    type: "ecommerce",
    type_display: "Интернет-магазин",
    description: "Создание полнофункционального интернет-магазина с каталогом, корзиной и оплатой",
    customer: "МебельПрестиж",
    price: "620000.00",
    available: true,
    deadline: "2026-01-20T18:00:00+03:00",
    hours: 420,
    created: "2025-10-15T11:30:00.123456+03:00",
    updated: "2025-11-28T16:45:00.123456+03:00",
    progress: 35,
    priority: "medium",
    startDate: "2025-10-20T00:00:00+03:00",
    files: [
      {
        id: 6,
        file: "http://127.0.0.1:8000/media/project_files/2025/10/15/furniture_catalog.jpg",
        uploaded_at: "2025-10-20T10:15:00.123456+03:00",
        name: "Каталог мебели.jpg"
      }
    ],
    performers: [
      {
        id: 2,
        staff: 2,
        staff_name: "Мария Петрова",
        assigned_at: "2025-10-15T12:00:00.123456+03:00",
        role: "Дизайнер"
      },
      {
        id: 3,
        staff: 3,
        staff_name: "Иван Иванов",
        assigned_at: "2025-10-16T09:30:00.123456+03:00",
        role: "Разработчик"
      }
    ],
    team: [
      {
        id: 2,
        name: "Мария Петрова",
        role: "Дизайнер",
        avatar: "https://via.placeholder.com/40"
      },
      {
        id: 3,
        name: "Иван Иванов",
        role: "Разработчик",
        avatar: "https://via.placeholder.com/40"
      },
      {
        id: 7,
        name: "Сергей Новиков",
        role: "Backend разработчик",
        avatar: "https://via.placeholder.com/40"
      }
    ],
    logs: [
      {
        id: 401,
        content: "Проект создан",
        created: "2025-10-15T11:30:00.123456+03:00"
      },
      {
        id: 402,
        content: "Назначен дизайнер: Мария Петрова",
        created: "2025-10-15T12:00:00.123456+03:00"
      }
    ],
    tasks: [
      {
        id: 5,
        name: "Дизайн главной страницы магазина",
        description: "Создание дизайна главной страницы интернет-магазина",
        status: "in_progress",
        status_display: "В работе",
        project: 5,
        project_name: "Интернет-магазин мебели",
        director: 4,
        director_name: "Михаил",
        performer: 2,
        performer_name: "Мария Петрова",
        deadline: "2025-11-30T18:00:00+03:00",
        hours: 60,
        is_overdue: false,
        created: "2025-10-25T14:00:00.123456+03:00",
        updated: "2025-11-28T15:00:00.123456+03:00",
        progress: 70
      }
    ],
    ganttTasks: [
      {
        id: 18,
        name: "Проектирование структуры",
        start: "2025-10-20",
        end: "2025-10-27",
        progress: 100,
        status: "completed",
        assignedTo: [2, 7],
        dependencies: []
      },
      {
        id: 19,
        name: "Дизайн интерфейса",
        start: "2025-10-27",
        end: "2025-11-20",
        progress: 70,
        status: "in-progress",
        assignedTo: [2],
        dependencies: [18]
      },
      {
        id: 20,
        name: "Разработка фронтенда",
        start: "2025-11-10",
        end: "2025-12-20",
        progress: 30,
        status: "in-progress",
        assignedTo: [3],
        dependencies: [18]
      },
      {
        id: 21,
        name: "Разработка бэкенда",
        start: "2025-11-01",
        end: "2025-12-10",
        progress: 40,
        status: "in-progress",
        assignedTo: [7],
        dependencies: [18]
      }
    ]
  },
  {
    id: 6,
    name: "Система управления обучением",
    status: "tests",
    status_display: "Тестируется",
    type: "system",
    type_display: "Система",
    description: "LMS система для онлайн-обучения с видео-лекциями, тестами и сертификатами",
    customer: "Образовательный Центр",
    price: "980000.00",
    available: true,
    deadline: "2025-12-10T18:00:00+03:00",
    hours: 580,
    created: "2025-09-20T09:15:00.123456+03:00",
    updated: "2025-11-29T14:20:00.123456+03:00",
    progress: 85,
    priority: "high",
    startDate: "2025-09-25T00:00:00+03:00",
    files: [
      {
        id: 7,
        file: "http://127.0.0.1:8000/media/project_files/2025/09/20/lms_spec.pdf",
        uploaded_at: "2025-09-25T11:30:00.123456+03:00",
        name: "Спецификация LMS.pdf"
      }
    ],
    performers: [
      {
        id: 1,
        staff: 1,
        staff_name: "Амир Лутфуллин",
        assigned_at: "2025-09-20T10:00:00.123456+03:00",
        role: "Team Lead"
      },
      {
        id: 3,
        staff: 3,
        staff_name: "Иван Иванов",
        assigned_at: "2025-09-21T09:00:00.123456+03:00",
        role: "Разработчик"
      }
    ],
    team: [
      {
        id: 1,
        name: "Амир Лутфуллин",
        role: "Team Lead",
        avatar: "https://via.placeholder.com/40"
      },
      {
        id: 3,
        name: "Иван Иванов",
        role: "Разработчик",
        avatar: "https://via.placeholder.com/40"
      },
      {
        id: 8,
        name: "Анна Смирнова",
        role: "Контент-менеджер",
        avatar: "https://via.placeholder.com/40"
      }
    ],
    logs: [
      {
        id: 501,
        content: "Проект создан",
        created: "2025-09-20T09:15:00.123456+03:00"
      },
      {
        id: 502,
        content: "Назначен team lead: Амир Лутфуллин",
        created: "2025-09-20T10:00:00.123456+03:00"
      }
    ],
    tasks: [
      {
        id: 6,
        name: "Интеграция видео-платформы",
        description: "Настройка интеграции с YouTube API для загрузки видео",
        status: "tests",
        status_display: "Тестируется",
        project: 6,
        project_name: "Система управления обучением",
        director: 1,
        director_name: "Амир Лутфуллин",
        performer: 3,
        performer_name: "Иван Иванов",
        deadline: "2025-11-25T18:00:00+03:00",
        hours: 80,
        is_overdue: true,
        created: "2025-10-10T16:00:00.123456+03:00",
        updated: "2025-11-28T11:00:00.123456+03:00",
        progress: 95
      }
    ],
    ganttTasks: [
      {
        id: 22,
        name: "Анализ требований",
        start: "2025-09-25",
        end: "2025-10-05",
        progress: 100,
        status: "completed",
        assignedTo: [1, 8],
        dependencies: []
      },
      {
        id: 23,
        name: "Проектирование архитектуры",
        start: "2025-10-05",
        end: "2025-10-15",
        progress: 100,
        status: "completed",
        assignedTo: [1, 3],
        dependencies: [22]
      },
      {
        id: 24,
        name: "Разработка ядра системы",
        start: "2025-10-15",
        end: "2025-11-10",
        progress: 100,
        status: "completed",
        assignedTo: [1, 3],
        dependencies: [23]
      },
      {
        id: 25,
        name: "Интеграция внешних сервисов",
        start: "2025-11-10",
        end: "2025-11-25",
        progress: 95,
        status: "in-progress",
        assignedTo: [3],
        dependencies: [24]
      },
      {
        id: 26,
        name: "Тестирование",
        start: "2025-11-20",
        end: "2025-12-05",
        progress: 60,
        status: "in-progress",
        assignedTo: [1, 8],
        dependencies: [24]
      }
    ]
  },
  {
    id: 7,
    name: "Портал новостей",
    status: "completed",
    status_display: "Завершен",
    type: "website",
    type_display: "Сайт",
    description: "Разработка новостного портала с системой комментариев и рейтингами",
    customer: "МедиаХолдинг",
    price: "320000.00",
    available: false,
    deadline: "2025-09-30T18:00:00+03:00",
    hours: 240,
    created: "2025-07-10T14:20:00.123456+03:00",
    updated: "2025-09-30T17:00:00.123456+03:00",
    progress: 100,
    priority: "medium",
    startDate: "2025-07-15T00:00:00+03:00",
    files: [
      {
        id: 8,
        file: "http://127.0.0.1:8000/media/project_files/2025/07/10/news_portal_final.jpg",
        uploaded_at: "2025-09-30T16:45:00.123456+03:00",
        name: "Финальный вид портала.jpg"
      }
    ],
    performers: [
      {
        id: 3,
        staff: 3,
        staff_name: "Иван Иванов",
        assigned_at: "2025-07-11T10:00:00.123456+03:00",
        role: "Разработчик"
      }
    ],
    team: [
      {
        id: 3,
        name: "Иван Иванов",
        role: "Разработчик",
        avatar: "https://via.placeholder.com/40"
      },
      {
        id: 9,
        name: "Павел Орлов",
        role: "Frontend разработчик",
        avatar: "https://via.placeholder.com/40"
      }
    ],
    logs: [
      {
        id: 601,
        content: "Проект создан",
        created: "2025-07-10T14:20:00.123456+03:00"
      },
      {
        id: 602,
        content: "Проект завершен и сдан заказчику",
        created: "2025-09-30T17:00:00.123456+03:00"
      }
    ],
    tasks: [],
    ganttTasks: [
      {
        id: 27,
        name: "Проектирование",
        start: "2025-07-15",
        end: "2025-07-22",
        progress: 100,
        status: "completed",
        assignedTo: [3, 9],
        dependencies: []
      },
      {
        id: 28,
        name: "Разработка фронтенда",
        start: "2025-07-22",
        end: "2025-08-15",
        progress: 100,
        status: "completed",
        assignedTo: [9],
        dependencies: [27]
      },
      {
        id: 29,
        name: "Разработка бэкенда",
        start: "2025-07-22",
        end: "2025-08-20",
        progress: 100,
        status: "completed",
        assignedTo: [3],
        dependencies: [27]
      },
      {
        id: 30,
        name: "Интеграция",
        start: "2025-08-20",
        end: "2025-09-10",
        progress: 100,
        status: "completed",
        assignedTo: [3, 9],
        dependencies: [28, 29]
      }
    ]
  },
  {
    id: 8,
    name: "Приложение для фитнеса",
    status: "in_progress",
    status_display: "В работе",
    type: "mobile",
    type_display: "Мобильное приложение",
    description: "Разработка фитнес-приложения с трекингом тренировок и питания",
    customer: "ФитнесЛайф",
    price: "550000.00",
    available: true,
    deadline: "2026-03-15T18:00:00+03:00",
    hours: 380,
    created: "2025-11-05T13:45:00.123456+03:00",
    updated: "2025-11-28T10:30:00.123456+03:00",
    progress: 25,
    priority: "high",
    startDate: "2025-11-10T00:00:00+03:00",
    files: [],
    performers: [
      {
        id: 10,
        staff: 10,
        staff_name: "Алексей Волков",
        assigned_at: "2025-11-06T09:00:00.123456+03:00",
        role: "Мобильный разработчик"
      }
    ],
    team: [
      {
        id: 10,
        name: "Алексей Волков",
        role: "Мобильный разработчик",
        avatar: "https://via.placeholder.com/40"
      },
      {
        id: 2,
        name: "Мария Петрова",
        role: "Дизайнер",
        avatar: "https://via.placeholder.com/40"
      }
    ],
    logs: [
      {
        id: 701,
        content: "Проект создан",
        created: "2025-11-05T13:45:00.123456+03:00"
      },
      {
        id: 702,
        content: "Назначен мобильный разработчик",
        created: "2025-11-06T09:00:00.123456+03:00"
      }
    ],
    tasks: [
      {
        id: 7,
        name: "Дизайн экранов приложения",
        description: "Создание дизайна основных экранов фитнес-приложения",
        status: "in_progress",
        status_display: "В работе",
        project: 8,
        project_name: "Приложение для фитнеса",
        director: 4,
        director_name: "Михаил",
        performer: 2,
        performer_name: "Мария Петрова",
        deadline: "2025-12-10T18:00:00+03:00",
        hours: 50,
        is_overdue: false,
        created: "2025-11-15T11:00:00.123456+03:00",
        updated: "2025-11-28T14:00:00.123456+03:00",
        progress: 60
      }
    ],
    ganttTasks: [
      {
        id: 31,
        name: "Исследование рынка",
        start: "2025-11-10",
        end: "2025-11-17",
        progress: 100,
        status: "completed",
        assignedTo: [2, 10],
        dependencies: []
      },
      {
        id: 32,
        name: "Дизайн интерфейса",
        start: "2025-11-17",
        end: "2025-12-10",
        progress: 60,
        status: "in-progress",
        assignedTo: [2],
        dependencies: [31]
      },
      {
        id: 33,
        name: "Разработка прототипа",
        start: "2025-11-24",
        end: "2026-01-15",
        progress: 15,
        status: "in-progress",
        assignedTo: [10],
        dependencies: [31]
      }
    ]
  },
  {
    id: 9,
    name: "CRM для автосалона",
    status: "planned",
    status_display: "Планируется",
    type: "system",
    type_display: "Система",
    description: "Разработка CRM системы для управления продажами автомобилей",
    customer: "АвтоМир",
    price: "750000.00",
    available: true,
    deadline: "2026-04-30T18:00:00+03:00",
    hours: 520,
    created: "2025-11-30T16:20:00.123456+03:00",
    updated: "2025-11-30T16:20:00.123456+03:00",
    progress: 5,
    priority: "medium",
    startDate: "2026-01-15T00:00:00+03:00",
    files: [],
    performers: [],
    team: [
      {
        id: 1,
        name: "Амир Лутфуллин",
        role: "Team Lead",
        avatar: "https://via.placeholder.com/40"
      },
      {
        id: 7,
        name: "Сергей Новиков",
        role: "Backend разработчик",
        avatar: "https://via.placeholder.com/40"
      }
    ],
    logs: [
      {
        id: 801,
        content: "Проект создан",
        created: "2025-11-30T16:20:00.123456+03:00"
      }
    ],
    tasks: [],
    ganttTasks: [
      {
        id: 34,
        name: "Подготовка к старту",
        start: "2026-01-15",
        end: "2026-01-22",
        progress: 0,
        status: "planned",
        assignedTo: [1, 7],
        dependencies: []
      }
    ]
  },
  {
    id: 10,
    name: "Сайт ресторана",
    status: "in_progress",
    status_display: "В работе",
    type: "website",
    type_display: "Сайт",
    description: "Создание сайта для ресторана с онлайн-бронированием и меню",
    customer: "Ресторан Италия",
    price: "180000.00",
    available: true,
    deadline: "2025-12-25T18:00:00+03:00",
    hours: 120,
    created: "2025-11-15T12:30:00.123456+03:00",
    updated: "2025-11-29T11:45:00.123456+03:00",
    progress: 40,
    priority: "low",
    startDate: "2025-11-20T00:00:00+03:00",
    files: [
      {
        id: 9,
        file: "http://127.0.0.1:8000/media/project_files/2025/11/15/restaurant_logo.png",
        uploaded_at: "2025-11-20T10:00:00.123456+03:00",
        name: "Логотип ресторана.png"
      }
    ],
    performers: [
      {
        id: 9,
        staff: 9,
        staff_name: "Павел Орлов",
        assigned_at: "2025-11-16T09:00:00.123456+03:00",
        role: "Frontend разработчик"
      }
    ],
    team: [
      {
        id: 9,
        name: "Павел Орлов",
        role: "Frontend разработчик",
        avatar: "https://via.placeholder.com/40"
      },
      {
        id: 11,
        name: "Ольга Романова",
        role: "Копирайтер",
        avatar: "https://via.placeholder.com/40"
      }
    ],
    logs: [
      {
        id: 901,
        content: "Проект создан",
        created: "2025-11-15T12:30:00.123456+03:00"
      },
      {
        id: 902,
        content: "Загружен логотип ресторана",
        created: "2025-11-20T10:00:00.123456+03:00"
      }
    ],
    tasks: [
      {
        id: 8,
        name: "Верстка главной страницы",
        description: "Верстка главной страницы сайта ресторана",
        status: "in_progress",
        status_display: "В работе",
        project: 10,
        project_name: "Сайт ресторана",
        director: 4,
        director_name: "Михаил",
        performer: 9,
        performer_name: "Павел Орлов",
        deadline: "2025-12-05T18:00:00+03:00",
        hours: 30,
        is_overdue: false,
        created: "2025-11-25T14:00:00.123456+03:00",
        updated: "2025-11-29T16:30:00.123456+03:00",
        progress: 70
      }
    ],
    ganttTasks: [
      {
        id: 35,
        name: "Дизайн макетов",
        start: "2025-11-20",
        end: "2025-11-27",
        progress: 100,
        status: "completed",
        assignedTo: [2],
        dependencies: []
      },
      {
        id: 36,
        name: "Верстка сайта",
        start: "2025-11-27",
        end: "2025-12-15",
        progress: 70,
        status: "in-progress",
        assignedTo: [9],
        dependencies: [35]
      },
      {
        id: 37,
        name: "Наполнение контентом",
        start: "2025-12-05",
        end: "2025-12-20",
        progress: 20,
        status: "in-progress",
        assignedTo: [11],
        dependencies: [35]
      }
    ]
  },
  {
    id: 11,
    name: "Дашборд для логистики",
    status: "tests",
    status_display: "Тестируется",
    type: "dashboard",
    type_display: "Дашборд",
    description: "Дашборд для отслеживания логистических операций и аналитики",
    customer: "ЛогистикГрупп",
    price: "410000.00",
    available: true,
    deadline: "2025-12-05T18:00:00+03:00",
    hours: 280,
    created: "2025-10-05T15:10:00.123456+03:00",
    updated: "2025-11-30T09:20:00.123456+03:00",
    progress: 90,
    priority: "high",
    startDate: "2025-10-10T00:00:00+03:00",
    files: [
      {
        id: 10,
        file: "http://127.0.0.1:8000/media/project_files/2025/10/05/logistics_schema.pdf",
        uploaded_at: "2025-10-11T11:30:00.123456+03:00",
        name: "Схема логистики.pdf"
      }
    ],
    performers: [
      {
        id: 5,
        staff: 5,
        staff_name: "Дмитрий Васильев",
        assigned_at: "2025-10-06T10:00:00.123456+03:00",
        role: "Аналитик"
      },
      {
        id: 3,
        staff: 3,
        staff_name: "Иван Иванов",
        assigned_at: "2025-10-07T09:00:00.123456+03:00",
        role: "Разработчик"
      }
    ],
    team: [
      {
        id: 5,
        name: "Дмитрий Васильев",
        role: "Аналитик",
        avatar: "https://via.placeholder.com/40"
      },
      {
        id: 3,
        name: "Иван Иванов",
        role: "Разработчик",
        avatar: "https://via.placeholder.com/40"
      }
    ],
    logs: [
      {
        id: 1001,
        content: "Проект создан",
        created: "2025-10-05T15:10:00.123456+03:00"
      },
      {
        id: 1002,
        content: "Начат этап тестирования",
        created: "2025-11-25T14:00:00.123456+03:00"
      }
    ],
    tasks: [
      {
        id: 9,
        name: "Интеграция с API транспортных компаний",
        description: "Настройка интеграции с API транспортных компаний",
        status: "tests",
        status_display: "Тестируется",
        project: 11,
        project_name: "Дашборд для логистики",
        director: 5,
        director_name: "Дмитрий Васильев",
        performer: 3,
        performer_name: "Иван Иванов",
        deadline: "2025-11-30T18:00:00+03:00",
        hours: 90,
        is_overdue: false,
        created: "2025-10-20T16:00:00.123456+03:00",
        updated: "2025-11-29T17:00:00.123456+03:00",
        progress: 95
      }
    ],
    ganttTasks: [
      {
        id: 38,
        name: "Анализ данных",
        start: "2025-10-10",
        end: "2025-10-20",
        progress: 100,
        status: "completed",
        assignedTo: [5],
        dependencies: []
      },
      {
        id: 39,
        name: "Проектирование дашборда",
        start: "2025-10-20",
        end: "2025-10-31",
        progress: 100,
        status: "completed",
        assignedTo: [5, 3],
        dependencies: [38]
      },
      {
        id: 40,
        name: "Разработка",
        start: "2025-10-31",
        end: "2025-11-20",
        progress: 100,
        status: "completed",
        assignedTo: [3],
        dependencies: [39]
      },
      {
        id: 41,
        name: "Тестирование",
        start: "2025-11-20",
        end: "2025-12-03",
        progress: 80,
        status: "in-progress",
        assignedTo: [5, 3],
        dependencies: [40]
      }
    ]
  },
  {
    id: 12,
    name: "Мобильный банкинг",
    status: "in_progress",
    status_display: "В работе",
    type: "mobile",
    type_display: "Мобильное приложение",
    description: "Разработка мобильного банковского приложения с биометрией",
    customer: "БанкФинанс",
    price: "1200000.00",
    available: true,
    deadline: "2026-05-31T18:00:00+03:00",
    hours: 850,
    created: "2025-10-25T11:45:00.123456+03:00",
    updated: "2025-11-28T13:15:00.123456+03:00",
    progress: 20,
    priority: "high",
    startDate: "2025-11-01T00:00:00+03:00",
    files: [
      {
        id: 11,
        file: "http://127.0.0.1:8000/media/project_files/2025/10/25/security_spec.pdf",
        uploaded_at: "2025-10-28T14:30:00.123456+03:00",
        name: "Требования безопасности.pdf"
      }
    ],
    performers: [
      {
        id: 10,
        staff: 10,
        staff_name: "Алексей Волков",
        assigned_at: "2025-10-26T10:00:00.123456+03:00",
        role: "Мобильный разработчик"
      },
      {
        id: 12,
        staff: 12,
        staff_name: "Евгений Белов",
        assigned_at: "2025-10-27T09:00:00.123456+03:00",
        role: "Security специалист"
      }
    ],
    team: [
      {
        id: 10,
        name: "Алексей Волков",
        role: "Мобильный разработчик",
        avatar: "https://via.placeholder.com/40"
      },
      {
        id: 12,
        name: "Евгений Белов",
        role: "Security специалист",
        avatar: "https://via.placeholder.com/40"
      },
      {
        id: 2,
        name: "Мария Петрова",
        role: "Дизайнер",
        avatar: "https://via.placeholder.com/40"
      }
    ],
    logs: [
      {
        id: 1101,
        content: "Проект создан",
        created: "2025-10-25T11:45:00.123456+03:00"
      },
      {
        id: 1102,
        content: "Добавлены требования безопасности",
        created: "2025-10-28T14:30:00.123456+03:00"
      }
    ],
    tasks: [
      {
        id: 10,
        name: "Проектирование архитектуры безопасности",
        description: "Разработка архитектуры безопасности приложения",
        status: "in_progress",
        status_display: "В работе",
        project: 12,
        project_name: "Мобильный банкинг",
        director: 12,
        director_name: "Евгений Белов",
        performer: 12,
        performer_name: "Евгений Белов",
        deadline: "2025-12-15T18:00:00+03:00",
        hours: 120,
        is_overdue: false,
        created: "2025-11-10T10:00:00.123456+03:00",
        updated: "2025-11-28T15:30:00.123456+03:00",
        progress: 40
      }
    ],
    ganttTasks: [
      {
        id: 42,
        name: "Анализ требований безопасности",
        start: "2025-11-01",
        end: "2025-11-15",
        progress: 100,
        status: "completed",
        assignedTo: [12],
        dependencies: []
      },
      {
        id: 43,
        name: "Проектирование безопасности",
        start: "2025-11-15",
        end: "2025-12-15",
        progress: 40,
        status: "in-progress",
        assignedTo: [12],
        dependencies: [42]
      },
      {
        id: 44,
        name: "Дизайн интерфейса",
        start: "2025-11-10",
        end: "2025-12-20",
        progress: 30,
        status: "in-progress",
        assignedTo: [2],
        dependencies: [42]
      }
    ]
  },
  {
    id: 13,
    name: "Платформа для вебинаров",
    status: "completed",
    status_display: "Завершен",
    type: "system",
    type_display: "Система",
    description: "Разработка платформы для проведения вебинаров с чатом и записью",
    customer: "ОнлайнОбразование",
    price: "680000.00",
    available: false,
    deadline: "2025-10-10T18:00:00+03:00",
    hours: 420,
    created: "2025-06-15T10:30:00.123456+03:00",
    updated: "2025-10-11T12:00:00.123456+03:00",
    progress: 100,
    priority: "medium",
    startDate: "2025-06-20T00:00:00+03:00",
    files: [
      {
        id: 12,
        file: "http://127.0.0.1:8000/media/project_files/2025/06/15/webinar_platform.jpg",
        uploaded_at: "2025-10-11T11:45:00.123456+03:00",
        name: "Платформа вебинаров.jpg"
      }
    ],
    performers: [
      {
        id: 3,
        staff: 3,
        staff_name: "Иван Иванов",
        assigned_at: "2025-06-16T09:00:00.123456+03:00",
        role: "Разработчик"
      },
      {
        id: 7,
        staff: 7,
        staff_name: "Сергей Новиков",
        assigned_at: "2025-06-17T10:00:00.123456+03:00",
        role: "Backend разработчик"
      }
    ],
    team: [
      {
        id: 3,
        name: "Иван Иванов",
        role: "Разработчик",
        avatar: "https://via.placeholder.com/40"
      },
      {
        id: 7,
        name: "Сергей Новиков",
        role: "Backend разработчик",
        avatar: "https://via.placeholder.com/40"
      }
    ],
    logs: [
      {
        id: 1201,
        content: "Проект создан",
        created: "2025-06-15T10:30:00.123456+03:00"
      },
      {
        id: 1202,
        content: "Проект успешно завершен",
        created: "2025-10-11T12:00:00.123456+03:00"
      }
    ],
    tasks: [],
    ganttTasks: [
      {
        id: 45,
        name: "Исследование технологий",
        start: "2025-06-20",
        end: "2025-06-30",
        progress: 100,
        status: "completed",
        assignedTo: [3, 7],
        dependencies: []
      },
      {
        id: 46,
        name: "Разработка прототипа",
        start: "2025-06-30",
        end: "2025-07-20",
        progress: 100,
        status: "completed",
        assignedTo: [3],
        dependencies: [45]
      },
      {
        id: 47,
        name: "Разработка бэкенда",
        start: "2025-07-20",
        end: "2025-08-31",
        progress: 100,
        status: "completed",
        assignedTo: [7],
        dependencies: [46]
      },
      {
        id: 48,
        name: "Тестирование и запуск",
        start: "2025-09-01",
        end: "2025-09-30",
        progress: 100,
        status: "completed",
        assignedTo: [3, 7],
        dependencies: [47]
      }
    ]
  },
  {
    id: 14,
    name: "Интернет-магазин одежды",
    status: "in_progress",
    status_display: "В работе",
    type: "ecommerce",
    type_display: "Интернет-магазин",
    description: "Создание интернет-магазина одежды с системой рекомендаций",
    customer: "МодаСтиль",
    price: "380000.00",
    available: true,
    deadline: "2026-02-28T18:00:00+03:00",
    hours: 320,
    created: "2025-11-10T14:20:00.123456+03:00",
    updated: "2025-11-29T15:40:00.123456+03:00",
    progress: 30,
    priority: "medium",
    startDate: "2025-11-15T00:00:00+03:00",
    files: [
      {
        id: 13,
        file: "http://127.0.0.1:8000/media/project_files/2025/11/10/fashion_catalog.pdf",
        uploaded_at: "2025-11-16T11:00:00.123456+03:00",
        name: "Каталог одежды.pdf"
      }
    ],
    performers: [
      {
        id: 2,
        staff: 2,
        staff_name: "Мария Петрова",
        assigned_at: "2025-11-11T10:00:00.123456+03:00",
        role: "Дизайнер"
      },
      {
        id: 9,
        staff: 9,
        staff_name: "Павел Орлов",
        assigned_at: "2025-11-12T09:00:00.123456+03:00",
        role: "Frontend разработчик"
      }
    ],
    team: [
      {
        id: 2,
        name: "Мария Петрова",
        role: "Дизайнер",
        avatar: "https://via.placeholder.com/40"
      },
      {
        id: 9,
        name: "Павел Орлов",
        role: "Frontend разработчик",
        avatar: "https://via.placeholder.com/40"
      },
      {
        id: 7,
        name: "Сергей Новиков",
        role: "Backend разработчик",
        avatar: "https://via.placeholder.com/40"
      }
    ],
    logs: [
      {
        id: 1301,
        content: "Проект создан",
        created: "2025-11-10T14:20:00.123456+03:00"
      },
      {
        id: 1302,
        content: "Загружен каталог одежды",
        created: "2025-11-16T11:00:00.123456+03:00"
      }
    ],
    tasks: [
      {
        id: 11,
        name: "Дизайн карточек товаров",
        description: "Создание дизайна карточек товаров для каталога",
        status: "in_progress",
        status_display: "В работе",
        project: 14,
        project_name: "Интернет-магазин одежды",
        director: 4,
        director_name: "Михаил",
        performer: 2,
        performer_name: "Мария Петрова",
        deadline: "2025-12-15T18:00:00+03:00",
        hours: 45,
        is_overdue: false,
        created: "2025-11-20T13:00:00.123456+03:00",
        updated: "2025-11-29T14:30:00.123456+03:00",
        progress: 50
      }
    ],
    ganttTasks: [
      {
        id: 49,
        name: "Анализ конкурентов",
        start: "2025-11-15",
        end: "2025-11-22",
        progress: 100,
        status: "completed",
        assignedTo: [2, 9],
        dependencies: []
      },
      {
        id: 50,
        name: "Дизайн интерфейса",
        start: "2025-11-22",
        end: "2025-12-20",
        progress: 50,
        status: "in-progress",
        assignedTo: [2],
        dependencies: [49]
      },
      {
        id: 51,
        name: "Разработка фронтенда",
        start: "2025-12-01",
        end: "2026-01-20",
        progress: 10,
        status: "in-progress",
        assignedTo: [9],
        dependencies: [49]
      },
      {
        id: 52,
        name: "Разработка бэкенда",
        start: "2025-12-01",
        end: "2026-01-31",
        progress: 15,
        status: "in-progress",
        assignedTo: [7],
        dependencies: [49]
      }
    ]
  },
  {
    id: 15,
    name: "Портал для государственных услуг",
    status: "planned",
    status_display: "Планируется",
    type: "website",
    type_display: "Сайт",
    description: "Разработка портала для предоставления государственных услуг онлайн",
    customer: "Министерство цифрового развития",
    price: "2500000.00",
    available: true,
    deadline: "2026-12-31T18:00:00+03:00",
    hours: 1500,
    created: "2025-11-28T16:00:00.123456+03:00",
    updated: "2025-11-28T16:00:00.123456+03:00",
    progress: 2,
    priority: "high",
    startDate: "2026-01-10T00:00:00+03:00",
    files: [],
    performers: [],
    team: [
      {
        id: 1,
        name: "Амир Лутфуллин",
        role: "Team Lead",
        avatar: "https://via.placeholder.com/40"
      },
      {
        id: 4,
        name: "Михаил",
        role: "Project Manager",
        avatar: "https://via.placeholder.com/40"
      },
      {
        id: 5,
        name: "Дмитрий Васильев",
        role: "Аналитик",
        avatar: "https://via.placeholder.com/40"
      }
    ],
    logs: [
      {
        id: 1401,
        content: "Проект создан",
        created: "2025-11-28T16:00:00.123456+03:00"
      }
    ],
    tasks: [],
    ganttTasks: [
      {
        id: 53,
        name: "Подготовительный этап",
        start: "2026-01-10",
        end: "2026-02-10",
        progress: 0,
        status: "planned",
        assignedTo: [1, 4, 5],
        dependencies: []
      }
    ]
  }
];

// Экспорт списка всех пользователей для удобства
export const allUsers = [
  { id: 1, name: "Амир Лутфуллин", role: "Team Lead" },
  { id: 2, name: "Мария Петрова", role: "Дизайнер" },
  { id: 3, name: "Иван Иванов", role: "Разработчик" },
  { id: 4, name: "Михаил", role: "Project Manager" },
  { id: 5, name: "Дмитрий Васильев", role: "Аналитик" },
  { id: 6, name: "Елена Кузнецова", role: "Тестировщик" },
  { id: 7, name: "Сергей Новиков", role: "Backend разработчик" },
  { id: 8, name: "Анна Смирнова", role: "Контент-менеджер" },
  { id: 9, name: "Павел Орлов", role: "Frontend разработчик" },
  { id: 10, name: "Алексей Волков", role: "Мобильный разработчик" },
  { id: 11, name: "Ольга Романова", role: "Копирайтер" },
  { id: 12, name: "Евгений Белов", role: "Security специалист" }
];