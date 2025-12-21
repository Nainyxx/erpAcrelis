// services/staffService.js

const mockDepartments = [
  { id: 'all', label: 'Все отделы', count: 42 },
  { id: 'administration', label: 'Отдел Администрация', count: 5 },
  { id: 'sales', label: 'Отдел Продаж', count: 6 },
  { id: 'project', label: 'Отдел Проектный', count: 8 },
  { id: 'design', label: 'Отдел Дизайна', count: 4 },
  { id: 'python', label: 'Отдел Back Python', count: 7 },
  { id: 'csharp', label: 'Отдел Back C#', count: 6 },
  { id: 'front', label: 'Отдел Front', count: 6 }
];

const mockEmployees = [
  { id: 1, name: 'Иванов Иван Иванович', email: 'ivanov@company.com', position: 'Руководитель проекта', department: 'project', departmentLabel: 'Проектный отдел' },
  { id: 2, name: 'Петров Петр Петрович', email: 'petrov@company.com', position: 'Senior Frontend Developer', department: 'front', departmentLabel: 'Frontend отдел' },
  { id: 3, name: 'Сидорова Анна Сергеевна', email: 'sidorova@company.com', position: 'UI/UX Дизайнер', department: 'design', departmentLabel: 'Отдел дизайна' },
  { id: 4, name: 'Кузнецов Алексей Викторович', email: 'kuznetsov@company.com', position: 'Python Team Lead', department: 'python', departmentLabel: 'Backend Python' },
  { id: 5, name: 'Смирнова Екатерина Дмитриевна', email: 'smirnova@company.com', position: 'Менеджер по продажам', department: 'sales', departmentLabel: 'Отдел продаж' },
  { id: 6, name: 'Васильев Дмитрий Олегович', email: 'vasilev@company.com', position: 'Директор', department: 'administration', departmentLabel: 'Администрация' },
  { id: 7, name: 'Николаева Мария Игоревна', email: 'nikolaeva@company.com', position: 'Middle C# Developer', department: 'csharp', departmentLabel: 'Backend C#' },
  { id: 8, name: 'Андреев Андрей Андреевич', email: 'andreev@company.com', position: 'HR Manager', department: 'administration', departmentLabel: 'Администрация' },
  { id: 9, name: 'Федорова Ольга Владимировна', email: 'fedorova@company.com', position: 'Product Manager', department: 'project', departmentLabel: 'Проектный отдел' },
  { id: 10, name: 'Григорьев Сергей Павлович', email: 'grigoriev@company.com', position: 'Junior Frontend Developer', department: 'front', departmentLabel: 'Frontend отдел' },
  { id: 11, name: 'Борисова Татьяна Александровна', email: 'borisova@company.com', position: 'Backend Python Developer', department: 'python', departmentLabel: 'Backend Python' },
  { id: 12, name: 'Михайлов Артем Витальевич', email: 'mikhailov@company.com', position: 'Senior C# Developer', department: 'csharp', departmentLabel: 'Backend C#' },
  { id: 13, name: 'Захарова Юлия Романовна', email: 'zakharova@company.com', position: 'Маркетолог', department: 'sales', departmentLabel: 'Отдел продаж' },
  { id: 14, name: 'Кириллов Максим Ильич', email: 'kirillov@company.com', position: 'Системный администратор', department: 'administration', departmentLabel: 'Администрация' },
  { id: 15, name: 'Данилова Анастасия Валерьевна', email: 'danilova@company.com', position: 'Графический дизайнер', department: 'design', departmentLabel: 'Отдел дизайна' },
  { id: 16, name: 'Егоров Павел Сергеевич', email: 'egorov@company.com', position: 'Project Manager', department: 'project', departmentLabel: 'Проектный отдел' },
  { id: 17, name: 'Тихонова Виктория Олеговна', email: 'tikhonova@company.com', position: 'Middle Python Developer', department: 'python', departmentLabel: 'Backend Python' },
  { id: 18, name: 'Семенов Игорь Денисович', email: 'semenov@company.com', position: 'Junior C# Developer', department: 'csharp', departmentLabel: 'Backend C#' },
  { id: 19, name: 'Фомина Кристина Андреевна', email: 'fomina@company.com', position: 'Frontend Developer', department: 'front', departmentLabel: 'Frontend отдел' },
  { id: 20, name: 'Макаров Денис Евгеньевич', email: 'makarov@company.com', position: 'Бухгалтер', department: 'administration', departmentLabel: 'Администрация' }
];

export const getStaffList = async (useMockData = true) => {
  if (useMockData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          employees: mockEmployees,
          departments: mockDepartments
        });
      }, 500);
    });
  }
  
  // Здесь будет реальный API запрос
  try {
    const response = await fetch('/api/staff/list');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching staff data:', error);
    throw error;
  }
};

const mockTasks = [
  { id: 1, employeeId: 1, name: 'Разработка API для проекта X', status: 'in-progress', deadline: '15.12.2023' },
  { id: 2, employeeId: 1, name: 'Тестирование модуля авторизации', status: 'completed', deadline: '10.12.2023' },
  { id: 3, employeeId: 1, name: 'Рефакторинг кода базы данных', status: 'overdue', deadline: '05.12.2023' },
  { id: 4, employeeId: 1, name: 'Документация API', status: 'in-progress', deadline: '20.12.2023' },
  { id: 5, employeeId: 1, name: 'Интеграция с платежной системой', status: 'planned', deadline: '25.12.2023' },
];

// staffService.js (добавить эти функции)

// Моковые данные для карточки сотрудника
const mockEmployeeCard = {
  id: 1,
  name: 'Иванов Иван Иванович',
  email: 'ivanov@company.com',
  phone: '+7 (999) 123-45-67',
  telegram: '@ivanov',
  position: 'Руководитель проекта',
  department: 'project',
  departmentLabel: 'Проектный отдел',
  manager: {
    id: 6,
    name: 'Васильев Дмитрий Олегович',
    department: 'Администрация',
    departmentLabel: 'Администрация'
  }
};

// Моковые задачи сотрудника
const mockEmployeeTasks = [
  { id: 1, employeeId: 1, name: 'Разработка API для проекта X', status: 'in-progress', deadline: '15.12.2023' },
  { id: 2, employeeId: 1, name: 'Тестирование модуля авторизации', status: 'completed', deadline: '10.12.2023' },
  { id: 3, employeeId: 1, name: 'Рефакторинг кода базы данных', status: 'overdue', deadline: '05.12.2023' },
  { id: 4, employeeId: 1, name: 'Документация API', status: 'in-progress', deadline: '20.12.2023' },
  { id: 5, employeeId: 1, name: 'Интеграция с платежной системой', status: 'planned', deadline: '25.12.2023' },
  { id: 6, employeeId: 1, name: 'Оптимизация производительности', status: 'in-progress', deadline: '18.12.2023' },
  { id: 7, employeeId: 1, name: 'Код ревью новых фич', status: 'planned', deadline: '22.12.2023' },
];

// Функция для получения карточки сотрудника
export const getEmployeeById = async (id, useMockData = true) => {
  if (useMockData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Возвращаем копию моковых данных с подставленным id
        const employee = { 
          ...mockEmployeeCard, 
          id: parseInt(id),
          name: getRandomEmployeeName(id) // Генерируем имя на основе id
        };
        resolve(employee);
      }, 500);
    });
  }
  
  try {
    const response = await fetch(`/api/employees/${id}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching employee:', error);
    throw error;
  }
};

// Функция для получения задач сотрудника
export const getEmployeeTasks = async (employeeId, useMockData = true) => {
  if (useMockData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Фильтруем задачи по employeeId
        const tasks = mockEmployeeTasks
          .filter(task => task.employeeId === parseInt(employeeId))
          .map(task => ({ ...task }));
        resolve(tasks);
      }, 500);
    });
  }
  
  try {
    const response = await fetch(`/api/employees/${employeeId}/tasks`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching employee tasks:', error);
    throw error;
  }
};

// Вспомогательная функция для генерации случайного имени
const getRandomEmployeeName = (id) => {
  const names = [
    'Иванов Иван Иванович',
    'Петров Петр Петрович',
    'Сидорова Анна Сергеевна',
    'Кузнецов Алексей Викторович',
    'Смирнова Екатерина Дмитриевна',
    'Васильев Дмитрий Олегович',
    'Николаева Мария Игоревна',
    'Андреев Андрей Андреевич',
    'Федорова Ольга Владимировна',
    'Григорьев Сергей Павлович',
    'Борисова Татьяна Александровна',
    'Михайлов Артем Витальевич',
    'Захарова Юлия Романовна',
    'Кириллов Максим Ильич',
    'Данилова Анастасия Валерьевна',
    'Егоров Павел Сергеевич',
    'Тихонова Виктория Олеговна',
    'Семенов Игорь Денисович',
    'Фомина Кристина Андреевна',
    'Макаров Денис Евгеньевич'
  ];
  
  const index = parseInt(id) % names.length;
  return names[index];
};