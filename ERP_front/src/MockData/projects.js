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
      { id: 1, name: "Амир Лутфуллин" },
      { id: 2, name: "Мария Петрова" },
      { id: 3, name: "Екатерина Смирнова" }
    ],
    description: "Внутренняя ERP система для управления бизнес-процессами",
    createdAt: "2025-11-19"
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
      { id: 3, name: "Екатерина Смирнова" },
      { id: 5, name: "Дмитрий Иванов" }
    ],
    description: "Приложение для службы доставки еды",
    createdAt: "2025-11-18"
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
      { id: 2, name: "Мария Петрова" }
    ],
    description: "Корпоративный портал для внутреннего использования",
    createdAt: "2025-11-15"
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
      { id: 4, name: "Алексей Козлов" },
      { id: 1, name: "Амир Лутфуллин" },
      { id: 3, name: "Екатерина Смирнова" }
    ],
    description: "Бизнес-аналитика и отчетность в реальном времени",
    createdAt: "2025-11-10"
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
      { id: 6, name: "Ольга Сидорова" },
      { id: 7, name: "Иван Федоров" }
    ],
    description: "Онлайн магазин электроники с полным циклом продаж",
    createdAt: "2025-11-25"
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
      { id: 8, name: "Сергей Николаев" },
      { id: 9, name: "Анна Кузнецова" },
      { id: 10, name: "Павел Морозов" },
      { id: 1, name: "Амир Лутфуллин" }
    ],
    description: "Автоматизированная система управления складскими процессами",
    createdAt: "2025-11-05"
  },
  {
    id: 7,
    name: "Приложение для фитнеса",
    type: "mobile",
    typeLabel: "Мобильное приложение",
    status: "В работе",
    hours: 90,
    price: "950000.00",
    teamSize: 2,
    team: [
      { id: 11, name: "Елена Васнецова" },
      { id: 12, name: "Артем Белов" }
    ],
    description: "Фитнес-трекер с персонализированными тренировками",
    createdAt: "2025-11-20"
  },
  {
    id: 8,
    name: "Портал для клиентов",
    type: "website",
    typeLabel: "Веб-сайт",
    status: "Готов",
    hours: 60,
    price: "500000.00",
    teamSize: 1,
    team: [
      { id: 13, name: "Татьяна Орлова" }
    ],
    description: "Личный кабинет для клиентов компании",
    createdAt: "2025-11-12"
  },
  {
    id: 9,
    name: "CRM система",
    type: "system",
    typeLabel: "Система",
    status: "В работе",
    hours: 180,
    price: "2800000.00",
    teamSize: 3,
    team: [
      { id: 14, name: "Михаил Соколов" },
      { id: 15, name: "Юлия Павлова" },
      { id: 16, name: "Роман Захаров" }
    ],
    description: "Система управления взаимоотношениями с клиентами",
    createdAt: "2025-11-08"
  },
  {
    id: 10,
    name: "Маркетплейс",
    type: "ecommerce",
    typeLabel: "Интернет-магазин",
    status: "Планирование",
    hours: 250,
    price: "4500000.00",
    teamSize: 5,
    team: [
      { id: 17, name: "Кирилл Попов" },
      { id: 18, name: "Наталья Фомина" },
      { id: 19, name: "Вадим Егоров" },
      { id: 20, name: "Светлана Романова" },
      { id: 21, name: "Георгий Медведев" }
    ],
    description: "Многофункциональная площадка для онлайн-торговли",
    createdAt: "2025-11-28"
  },
  {
    id: 11,
    name: "Аналитика соцсетей",
    type: "dashboard",
    typeLabel: "Дашборд",
    status: "Готов",
    hours: 70,
    price: "850000.00",
    teamSize: 2,
    team: [
      { id: 22, name: "Алина Герасимова" },
      { id: 23, name: "Станислав Борисов" }
    ],
    description: "Мониторинг и аналитика социальных медиа",
    createdAt: "2025-11-14"
  },
  {
    id: 12,
    name: "Приложение для бронирования",
    type: "mobile",
    typeLabel: "Мобильное приложение",
    status: "В работе",
    hours: 110,
    price: "1350000.00",
    teamSize: 3,
    team: [
      { id: 24, name: "Вера Тихонова" },
      { id: 25, name: "Григорий Макаров" },
      { id: 26, name: "Людмила Алексеева" }
    ],
    description: "Приложение для бронирования столиков в ресторанах",
    createdAt: "2025-11-16"
  },
  {
    id: 13,
    name: "Корпоративный блог",
    type: "website",
    typeLabel: "Веб-сайт",
    status: "Готов",
    hours: 40,
    price: "350000.00",
    teamSize: 1,
    team: [
      { id: 27, name: "Николай Данилов" }
    ],
    description: "Корпоративный блог с системой публикаций",
    createdAt: "2025-11-22"
  },
  {
    id: 14,
    name: "Система электронного документооборота",
    type: "system",
    typeLabel: "Система",
    status: "В работе",
    hours: 160,
    price: "2400000.00",
    teamSize: 4,
    team: [
      { id: 28, name: "Дарья Савельева" },
      { id: 29, name: "Антон Поляков" },
      { id: 30, name: "Маргарита Федорова" },
      { id: 31, name: "Валерий Комаров" }
    ],
    description: "Цифровая система управления документами",
    createdAt: "2025-11-09"
  },
  {
    id: 15,
    name: "Приложение для обучения",
    type: "mobile",
    typeLabel: "Мобильное приложение",
    status: "Планирование",
    hours: 130,
    price: "1650000.00",
    teamSize: 3,
    team: [
      { id: 32, name: "Зоя Михайлова" },
      { id: 33, name: "Тимофей Новиков" },
      { id: 34, name: "Лидия Воронова" }
    ],
    description: "Образовательная платформа с курсами",
    createdAt: "2025-11-26"
  },
  {
    id: 16,
    name: "Портал для партнеров",
    type: "website",
    typeLabel: "Веб-сайт",
    status: "Готов",
    hours: 75,
    price: "900000.00",
    teamSize: 2,
    team: [
      { id: 35, name: "Руслан Крылов" },
      { id: 36, name: "Ульяна Ефимова" }
    ],
    description: "Портал для взаимодействия с партнерами",
    createdAt: "2025-11-13"
  },
  {
    id: 17,
    name: "Дашборд продаж",
    type: "dashboard",
    typeLabel: "Дашборд",
    status: "В работе",
    hours: 95,
    price: "1100000.00",
    teamSize: 2,
    team: [
      { id: 37, name: "Федор Сергеев" },
      { id: 38, name: "Агата Ковалева" }
    ],
    description: "Визуализация данных о продажах в реальном времени",
    createdAt: "2025-11-17"
  },
  {
    id: 18,
    name: "Интернет-магазин одежды",
    type: "ecommerce",
    typeLabel: "Интернет-магазин",
    status: "Готов",
    hours: 85,
    price: "950000.00",
    teamSize: 2,
    team: [
      { id: 39, name: "Семен Ильин" },
      { id: 40, name: "Виктория Лебедева" }
    ],
    description: "Онлайн-магазин модной одежды",
    createdAt: "2025-11-11"
  },
  {
    id: 19,
    name: "Приложение для путешествий",
    type: "mobile",
    typeLabel: "Мобильное приложение",
    status: "В работе",
    hours: 140,
    price: "1800000.00",
    teamSize: 3,
    team: [
      { id: 41, name: "Евгений Семенов" },
      { id: 42, name: "Инна Петухова" },
      { id: 43, name: "Аркадий Филиппов" }
    ],
    description: "Планировщик путешествий и маршрутов",
    createdAt: "2025-11-21"
  },
  {
    id: 20,
    name: "Система учета времени",
    type: "system",
    typeLabel: "Система",
    status: "Готов",
    hours: 65,
    price: "780000.00",
    teamSize: 2,
    team: [
      { id: 44, name: "Василиса Маслова" },
      { id: 45, name: "Игорь Тарасов" }
    ],
    description: "Тайм-трекер для учета рабочего времени",
    createdAt: "2025-11-23"
  },
  {
    id: 21,
    name: "Корпоративный сайт",
    type: "website",
    typeLabel: "Веб-сайт",
    status: "В работе",
    hours: 55,
    price: "650000.00",
    teamSize: 1,
    team: [
      { id: 46, name: "Лариса Соловьева" }
    ],
    description: "Официальный сайт компании",
    createdAt: "2025-11-24"
  },
  {
    id: 22,
    name: "Дашборд для маркетинга",
    type: "dashboard",
    typeLabel: "Дашборд",
    status: "Планирование",
    hours: 120,
    price: "1450000.00",
    teamSize: 3,
    team: [
      { id: 47, name: "Геннадий Виноградов" },
      { id: 48, name: "Регина Павлова" },
      { id: 49, name: "Владислав Морозов" }
    ],
    description: "Аналитика маркетинговых кампаний",
    createdAt: "2025-11-27"
  },
  {
    id: 23,
    name: "Приложение для здоровья",
    type: "mobile",
    typeLabel: "Мобильное приложение",
    status: "В работе",
    hours: 105,
    price: "1250000.00",
    teamSize: 2,
    team: [
      { id: 50, name: "Клавдия Никитина" },
      { id: 51, name: "Родион Зайцев" }
    ],
    description: "Мониторинг здоровья и wellness-трекер",
    createdAt: "2025-11-19"
  },
  {
    id: 24,
    name: "Платформа для событий",
    type: "website",
    typeLabel: "Веб-сайт",
    status: "Готов",
    hours: 95,
    price: "1150000.00",
    teamSize: 3,
    team: [
      { id: 52, name: "Степан Григорьев" },
      { id: 53, name: "Анжела Матвеева" },
      { id: 54, name: "Ярослав Родионов" }
    ],
    description: "Платформа для организации и проведения мероприятий",
    createdAt: "2025-11-07"
  },
  {
    id: 25,
    name: "Система тестирования",
    type: "system",
    typeLabel: "Система",
    status: "В работе",
    hours: 175,
    price: "2600000.00",
    teamSize: 4,
    team: [
      { id: 55, name: "Нина Аксенова" },
      { id: 56, name: "Виктор Сорокин" },
      { id: 57, name: "Галина Власова" },
      { id: 58, name: "Константин Меркушев" }
    ],
    description: "Автоматизированная система тестирования ПО",
    createdAt: "2025-11-06"
  },
  {
    id: 26,
    name: "Приложение для финансов",
    type: "mobile",
    typeLabel: "Мобильное приложение",
    status: "Планирование",
    hours: 145,
    price: "1950000.00",
    teamSize: 3,
    team: [
      { id: 59, name: "Вячеслав Горбунов" },
      { id: 60, name: "Оксана Наумова" },
      { id: 61, name: "Арсений Логинов" }
    ],
    description: "Персональный финансовый менеджер",
    createdAt: "2025-11-29"
  },
  {
    id: 27,
    name: "Интернет-магазин книг",
    type: "ecommerce",
    typeLabel: "Интернет-магазин",
    status: "Готов",
    hours: 70,
    price: "850000.00",
    teamSize: 2,
    team: [
      { id: 62, name: "Тамара Орлова" },
      { id: 63, name: "Святослав Фомин" }
    ],
    description: "Онлайн-магазин книг и литературы",
    createdAt: "2025-11-04"
  },
  {
    id: 28,
    name: "Дашборд для HR",
    type: "dashboard",
    typeLabel: "Дашборд",
    status: "В работе",
    hours: 88,
    price: "1050000.00",
    teamSize: 2,
    team: [
      { id: 64, name: "Борис Шестаков" },
      { id: 65, name: "Ксения Дьячкова" }
    ],
    description: "Аналитика кадровых показателей",
    createdAt: "2025-11-18"
  },
  {
    id: 29,
    name: "Портал поддержки",
    type: "website",
    typeLabel: "Веб-сайт",
    status: "Готов",
    hours: 50,
    price: "550000.00",
    teamSize: 1,
    team: [
      { id: 66, name: "Герман Носков" }
    ],
    description: "Система поддержки клиентов",
    createdAt: "2025-11-03"
  },
  {
    id: 30,
    name: "Система мониторинга",
    type: "system",
    typeLabel: "Система",
    status: "Планирование",
    hours: 195,
    price: "3200000.00",
    teamSize: 5,
    team: [
      { id: 67, name: "Лидия Михеева" },
      { id: 68, name: "Виталий Еремин" },
      { id: 69, name: "Алла Гаврилова" },
      { id: 70, name: "Платон Румянцев" },
      { id: 71, name: "Роза Чернова" }
    ],
    description: "Система мониторинга IT-инфраструктуры",
    createdAt: "2025-11-30"
  }
];

// Типы проектов для фильтра
export const projectTypes = [
  { id: 'all', label: 'Все проекты', count: 30 },
  { id: 'website', label: 'Веб-сайт', count: 8 },
  { id: 'mobile', label: 'Мобильное приложение', count: 8 },
  { id: 'dashboard', label: 'Дашборд', count: 6 },
  { id: 'ecommerce', label: 'Интернет-магазин', count: 5 },
  { id: 'system', label: 'Система', count: 7 },
];

// Функция для форматирования цены
export const formatPrice = (price) => {
  const num = parseFloat(price);
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num) + ' ₽';
};