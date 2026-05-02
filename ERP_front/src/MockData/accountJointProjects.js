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
        avatarUrl: 'https://picsum.photos/seed/acrelis-collab1/128/128',
        projectIds: ['erp', 'landing']
    },
    {
        id: 102,
        name: 'Кониловская Елизавета',
        role: 'Веб-дизайнер',
        avatarUrl: 'https://picsum.photos/seed/acrelis-collab2/128/128',
        projectIds: ['landing']
    },
    {
        id: 103,
        name: 'Юдин Егор',
        role: 'Тимлид фронта',
        avatarUrl: 'https://picsum.photos/seed/acrelis-collab3/128/128',
        projectIds: ['erp', 'mobile']
    },
    {
        id: 104,
        name: 'Салихов Айдар',
        role: 'Full-stack разработчик',
        avatarUrl: 'https://picsum.photos/seed/acrelis-collab4/128/128',
        projectIds: ['erp']
    },
    {
        id: 105,
        name: 'Петрова Мария',
        role: 'Аналитик',
        avatarUrl: 'https://picsum.photos/seed/acrelis-collab5/128/128',
        projectIds: ['landing', 'mobile']
    },
    {
        id: 106,
        name: 'Козлов Артём',
        role: 'Backend-разработчик',
        avatarUrl: 'https://picsum.photos/seed/acrelis-collab6/128/128',
        projectIds: ['erp']
    },
    {
        id: 107,
        name: 'Волкова Софья',
        role: 'QA-инженер',
        avatarUrl: 'https://picsum.photos/seed/acrelis-collab7/128/128',
        projectIds: ['mobile']
    },
    {
        id: 108,
        name: 'Ибрагимов Рустам',
        role: 'DevOps',
        avatarUrl: 'https://picsum.photos/seed/acrelis-collab8/128/128',
        projectIds: ['erp', 'mobile']
    }
];
