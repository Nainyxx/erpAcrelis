// ERP_front/src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import './App.css';

// Страницы аутентификации
import LoginPage from './components/main-comps/LoginPage';
import RegistrationPageStart from './components/main-comps/RegistrationPageStart';
import RegistrationPageEnd from './components/main-comps/RegistrationPageEnd';
import InviteRegistrationStart from './components/main-comps/InviteRegistrationStart';
import InviteRegistrationEnd from './components/main-comps/InviteRegistrationEnd';

// Основные компоненты
import Header from './components/main-comps/Header';
import SideBar from './components/main-comps/SideBar';
import NotificationContainer from './components/main-comps/Notification'; // WebSocket уведомления

// Страницы контента
import ProjectsList from './components/main-content-pages/ProjectsList';
import ProjectCard from './components/main-content-pages/ProjectCard';
import GanttChart2 from './components/main-content-pages/GanttChart2';
import KanbanTasks from './components/main-content-pages/KanbanTasks';
import MyTasks from './components/main-content-pages/MyTasks';
import TaskCard from './components/main-content-pages/TaskCard';
import StaffList from './components/main-content-pages/StaffList';
import EmployeeCard from './components/main-content-pages/EmployeeCard';
import AccountPage from './components/main-content-pages/AccountPage';

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
  const [isAuthenticatedUser, setIsAuthenticatedUser] = useState(false);

  useEffect(() => {
    // Получаем текущего пользователя при загрузке
    const user = getCurrentUser();
    setCurrentUser(user);
    setIsAuthenticatedUser(isAuthenticated());
  }, []);

  // Добавляем условия для отображения WebSocket уведомлений только когда пользователь авторизован
  const shouldShowWebSocketNotifications = () => {
    return isAuthenticatedUser && window.location.pathname !== '/login';
  };

  return (
    <Router>
      <div className='App'>
        {/* Контейнер для WebSocket уведомлений - показываем только когда пользователь авторизован */}
        {shouldShowWebSocketNotifications() && <NotificationContainer />}
        
        <Routes>
          {/* Публичные маршруты */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPageStart />} />
          <Route path="/register/step2" element={<RegistrationPageEnd />} />
          <Route path="/staff/register/invite/:token" element={<InviteRegistrationStart />} />
          <Route path="/staff/register/invite/:token/step2" element={<InviteRegistrationEnd />} />
          
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
                        <AccountPage 
                          showNotification={() => {}} // Передаем пустую функцию для совместимости
                        />
                      } />
                      
                      {/* Список проектов */}
                      <Route path="/projects" element={
                        <ProjectsList 
                          useMockData={useMockData}
                          onProjectSelect={(project) => {
                            window.location.href = `/projects/${project.id}`;
                          }} 
                          showNotification={() => {}} // WebSocket уведомления будут работать через NotificationContainer
                        />
                      } />
                      
                      {/* Карточка проекта */}
                      <Route path="/projects/:projectId" element={
                        <ProjectCard 
                          useMockData={useMockData}
                          showNotification={() => {}}
                        />
                      } />
                      
                      {/* Канбан задач */}
                      <Route path="/projects/:projectId/kanban" element={
                        <KanbanWrapper 
                          projects={projects}
                          useMockData={useMockData}
                          showNotification={() => {}}
                        />
                      } />
                      
                      {/* Диаграмма Ганта */}
                      <Route path="/projects/:projectId/gantt" element={
                        <GanttChartWrapper 
                          projects={projects}
                          useMockData={useMockData}
                          showNotification={() => {}}
                        />
                      } />
                      
                      {/* Страница моих задач */}
                      <Route path="/my-tasks" element={
                        <MyTasksWrapper 
                          useMockData={useMockData} 
                          showNotification={() => {}}
                        />
                      } />
                      
                      {/* Карточка задачи */}
                      <Route path="/tasks/:taskId" element={
                        <TaskCard 
                          useMockData={useMockData}
                          showNotification={() => {}}
                        />
                      } />
                      
                      {/* Бухгалтерия */}
                      <Route path="/accounting" element={
                        <AccountingPage 
                          showNotification={() => {}}
                        />
                      } />
                      
                      {/* Список сотрудников */}
                      <Route path="/staff" element={
                        <StaffList 
                          useMockData={useMockData}
                          showNotification={() => {}}
                        />
                      } />
                      
                      {/* Карточка сотрудника */}
                      <Route path="/staff/:employeeId" element={
                        <EmployeeCard 
                          useMockData={useMockData}
                          showNotification={() => {}}
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
function KanbanWrapper({ projects, useMockData, showNotification }) {
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
      showNotification={showNotification}
    />
  );
}

function GanttChartWrapper({ projects, useMockData, showNotification }) {
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
      showNotification={showNotification}
    />
  );
}

function MyTasksWrapper({ useMockData, showNotification }) {
  return (
    <MyTasks 
      useMockData={useMockData}
      showNotification={showNotification}
    />
  );
}

// Страница Бухгалтерия
function AccountingPage({ showNotification }) {
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
        <p style={{ color: '#666', fontSize: '16px', marginBottom: '15px' }}>
          Раздел находится в разработке
        </p>
      </div>
    </div>
  );
}

export default App;