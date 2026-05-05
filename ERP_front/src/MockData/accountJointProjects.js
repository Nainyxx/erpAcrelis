// Мок фильтров и участников блока «Совместные проекты» на странице аккаунта
export const jointProjectsFilterMock = [
    { id: 'all', label: 'Все проекты' },
    { id: 'erp', label: 'ERP Acrelis' },
    { id: 'landing', label: 'Корпоративный лендинг' },
    { id: 'mobile', label: 'Мобильное приложение' }
];

export const jointProjectMembersMock = [
    {
        id: 101,
        name: 'Янина Анна',
        role: 'Тимлид дизайна',
        projectIds: ['erp', 'landing']
    },
    {
        id: 102,
        name: 'Кониловская Елизавета',
        role: 'Веб-дизайнер',
        projectIds: ['landing']
    },
    {
        id: 103,
        name: 'Юдин Егор',
        role: 'Тимлид фронта',
        projectIds: ['erp', 'mobile']
    },
    {
        id: 104,
        name: 'Салихов Айдар',
        role: 'Full-stack разработчик',
        projectIds: ['erp']
    },
    {
        id: 105,
        name: 'Петрова Мария',
        role: 'Аналитик',
        projectIds: ['landing', 'mobile']
    },
    {
        id: 106,
        name: 'Козлов Артём',
        role: 'Backend-разработчик',
        projectIds: ['erp']
    },
    {
        id: 107,
        name: 'Волкова Софья',
        role: 'QA-инженер',
        projectIds: ['mobile']
    },
    {
        id: 108,
        name: 'Ибрагимов Рустам',
        role: 'DevOps',
        projectIds: ['erp', 'mobile']
    }
];
