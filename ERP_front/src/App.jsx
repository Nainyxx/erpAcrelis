import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './App.css';

// Страницы аутентификации
import LoginPage from './components/main-comps/LoginPage';
import RegistrationPageStart from './components/main-comps/RegistrationPageStart';
import RegistrationPageEnd from './components/main-comps/RegistrationPageEnd';

// Основные компоненты
import Header from './components/main-comps/Header';
import SideBar from './components/main-comps/SideBar';

// Страницы контента
import ProjectsList from './components/main-content-pages/ProjectsList';
import ProjectCard from './components/main-content-pages/ProjectCard';
import GanttChart2 from './components/main-content-pages/GanttChart2';
import KanbanTasks from './components/main-content-pages/KanbanTasks';
import MyTasks from './components/main-content-pages/MyTasks';
import TaskCard from './components/main-content-pages/TaskCard';
import StaffList from './components/main-content-pages/StaffList';
import EmployeeCard from './components/main-content-pages/EmployeeCard';
import AccountPage from './components/main-content-pages/AccountPage'; // Добавили импорт

// Мок данные
import { projectsData } from './MockData/projects.js';

// Импорт функции аутентификации
import { isAuthenticated, getCurrentUser } from './services/api/api';

// Конфигурация
const CONFIG = {
  USE_MOCK_DATA: false,
  API_BASE_URL: 'https://api.acrelis.ru/'
};

// Компонент для защищённых роутов
function PrivateRoute({ children }) {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = isAuthenticated();
      setIsAuth(authenticated);
      setAuthChecked(true);
    };

    checkAuth();
  }, []);

  if (!authChecked) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#F6F6FE'
      }}>
        <div className="loading-spinner" style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e1e1e1',
          borderTopColor: '#667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  return isAuth ? children : <Navigate to="/login" />;
}

function App() {
  const [projects] = useState(projectsData);
  const [useMockData] = useState(CONFIG.USE_MOCK_DATA);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Получаем текущего пользователя при загрузке
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);

  return (
    <Router>
      <div className='App'>
        <Routes>
          {/* Публичные маршруты */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPageStart />} />
          <Route path="/register/step2" element={<RegistrationPageEnd />} />
          
          {/* Защищённые маршруты */}
          <Route path="/*" element={
            <PrivateRoute>
              <div className='header-container'>
                <Header currentUser={currentUser} />
              </div>
              
              <div className='main-container'>
                <div className="sidebar-wrapper">
                  <SideBar currentUser={currentUser} />
                </div>

                <div className='content-wrapper'>
                  <div className='content'>
                    <Routes>
                      {/* Главная страница */}
                      <Route path="/" element={<Navigate to="/projects" replace />} />
                      
                      {/* Страница аккаунта */}
                      <Route path="/account" element={
                        <AccountPage />
                      } />
                      
                      {/* Список проектов */}
                      <Route path="/projects" element={
                        <ProjectsList 
                          useMockData={useMockData}
                          onProjectSelect={(project) => {
                            window.location.href = `/projects/${project.id}`;
                          }} 
                        />
                      } />
                      
                      {/* Карточка проекта */}
                      <Route path="/projects/:projectId" element={
                        <ProjectCard 
                          useMockData={useMockData}
                        />
                      } />
                      
                      {/* Канбан задач */}
                      <Route path="/projects/:projectId/kanban" element={
                        <KanbanWrapper 
                          projects={projects}
                          useMockData={useMockData}
                        />
                      } />
                      
                      {/* Диаграмма Ганта */}
                      <Route path="/projects/:projectId/gantt" element={
                        <GanttChartWrapper 
                          projects={projects}
                          useMockData={useMockData}
                        />
                      } />
                      
                      {/* Страница моих задач */}
                      <Route path="/my-tasks" element={
                        <MyTasksWrapper useMockData={useMockData} />
                      } />
                      
                      {/* Карточка задачи */}
                      <Route path="/tasks/:taskId" element={
                        <TaskCard useMockData={useMockData} />
                      } />
                      
                      {/* Бухгалтерия */}
                      <Route path="/accounting" element={
                        <AccountingPage />
                      } />
                      
                      {/* Список сотрудников */}
                      <Route path="/staff" element={
                        <StaffList 
                          useMockData={useMockData}
                        />
                      } />
                      
                      {/* Карточка сотрудника */}
                      <Route path="/staff/:employeeId" element={
                        <EmployeeCard 
                          useMockData={useMockData}
                        />
                      } />
                      
                      {/* 404 - перенаправляем на проекты */}
                      <Route path="*" element={<Navigate to="/projects" replace />} />
                    </Routes>
                  </div>
                </div>
              </div>
            </PrivateRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

// Обёртки для компонентов
function KanbanWrapper({ projects, useMockData }) {
  const path = window.location.pathname;
  const parts = path.split('/');
  const projectId = parts[2] ? parseInt(parts[2]) : null;
  const project = projects.find(p => p.id === projectId);
  
  if (!project) {
    return (
      <div style={{padding: '30px'}}>
        <h2>Проект не найден</h2>
        <button 
          onClick={() => window.location.href = '/projects'}
          style={{
            padding: '10px 20px',
            background: '#0066CC',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Вернуться к списку проектов
        </button>
      </div>
    );
  }
  
  return (
    <KanbanTasks 
      project={project}
      useMockData={useMockData}
    />
  );
}

function GanttChartWrapper({ projects, useMockData }) {
  const path = window.location.pathname;
  const parts = path.split('/');
  const projectId = parts[2] ? parseInt(parts[2]) : null;
  const project = projects.find(p => p.id === projectId);
  
  if (!project) {
    return (
      <div style={{padding: '30px'}}>
        <h2>Проект не найден</h2>
        <button 
          onClick={() => window.location.href = '/projects'}
          style={{
            padding: '10px 20px',
            background: '#0066CC',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Вернуться к списку проектов
        </button>
      </div>
    );
  }
  
  return (
    <GanttChart2 
      project={project}
      useMockData={useMockData}
    />
  );
}

function MyTasksWrapper({ useMockData }) {
  return (
    <MyTasks 
      useMockData={useMockData}
    />
  );
}

// Страница Бухгалтерия
function AccountingPage() {
  return (
    <div style={{
      padding: '30px',
      backgroundColor: '#F6F6FE',
      minHeight: 'calc(100vh - 90px)'
    }}>
      <h1 style={{
        color: '#5B5B5B',
        fontSize: '24px',
        fontWeight: 600,
        marginBottom: '20px'
      }}>Бухгалтерия</h1>
      <div style={{
        background: 'white',
        borderRadius: '10px',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <p style={{ color: '#666', fontSize: '16px' }}>Раздел находится в разработке</p>
      </div>
    </div>
  );
}

export default App;