// ERP_front/src/App.jsx
import { Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
import NotificationContainer from './components/main-comps/Notification';

// Страницы контента
import ProjectsList from './components/main-content-pages/ProjectsList';
import ProjectCard from './components/main-content-pages/ProjectCard';
import ProjectFinancesPage from './components/main-content-pages/ProjectFinancesPage';
import GanttChart2 from './components/main-content-pages/GanttChart2';
import KanbanTasks from './components/main-content-pages/KanbanTasks';
import MyTasks from './components/main-content-pages/MyTasks';
import TaskCard from './components/main-content-pages/TaskCard';
import StaffList from './components/main-content-pages/StaffList';
import EmployeeCard from './components/main-content-pages/EmployeeCard';
import AccountPage from './components/main-content-pages/AccountPage';
import SchedulePage from './components/main-content-pages/SchedulePage';
import OperationsPage from './components/main-content-pages/OperationsPage';
import StaffFinancesPage from './components/main-content-pages/StaffFinancesPage';

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
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      
      // Даем небольшую задержку для плавности
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const authenticated = isAuthenticated();
      setIsAuth(authenticated);
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
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

  // Если есть токен - показываем контент, если нет - редирект на логин
  return isAuth ? children : <Navigate to="/login" />;
}

// Главный Layout для защищенных страниц
function MainLayout({ children, currentUser }) {
  return (
    <>
      <div className='header-container'>
        <Header currentUser={currentUser} />
      </div>
      
      <div className='main-container'>
        <div className="sidebar-wrapper">
          <SideBar currentUser={currentUser} />
        </div>

        <div className='content-wrapper'>
          <div className='content'>
            {children}
          </div>
        </div>
      </div>
    </>
  );
}

// Обёртки для компонентов с использованием HashRouter-совместимых маршрутов
function KanbanPage({ useMockData, showNotification }) {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  if (!projectId) {
    return (
      <div style={{padding: '30px'}}>
        <h2>Проект не найден</h2>
        <button 
          onClick={() => navigate('/projects')}
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
      useMockData={useMockData}
      showNotification={showNotification}
    />
  );
}

function GanttPage({ useMockData, showNotification }) {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  if (!projectId) {
    return (
      <div style={{padding: '30px'}}>
        <h2>Проект не найден</h2>
        <button 
          onClick={() => navigate('/projects')}
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
      useMockData={useMockData}
      showNotification={showNotification}
    />
  );
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

  // Определяем, показывать ли WebSocket уведомления
  const shouldShowWebSocketNotifications = () => {
    return isAuthenticated();
  };

  return (
    <div className='App'>
      {/* Контейнер для WebSocket уведомлений */}
      {shouldShowWebSocketNotifications() && <NotificationContainer />}
      
      <Routes>
        {/* Главная страница - сразу на проекты, PrivateRoute сам решит что делать */}
        <Route path="/" element={
          <PrivateRoute>
            <Navigate to="/projects" replace />
          </PrivateRoute>
        } />
        
        {/* Публичные маршруты */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPageStart />} />
        <Route path="/register/step2" element={<RegistrationPageEnd />} />
        
        {/* Приглашения по токену */}
        <Route 
          path="/staff/register/invite/:token" 
          element={<InviteRegistrationStart />} 
        />
        <Route 
          path="/staff/register/invite/:token/step2" 
          element={<InviteRegistrationEnd />} 
        />
        
        {/* Защищённые маршруты */}
        <Route path="/*" element={
          <PrivateRoute>
            <MainLayout currentUser={currentUser}>
              <Routes>
                {/* Главная страница */}
                <Route path="/" element={<Navigate to="/projects" replace />} />
                
                {/* Страница аккаунта */}
                <Route path="/account" element={
                  <AccountPage showNotification={() => {}} />
                } />
                
                {/* Список проектов */}
                <Route path="/projects" element={
                  <ProjectsList 
                    useMockData={useMockData}
                    showNotification={() => {}}
                  />
                } />
                
                {/* Финансы проекта (заглушка) — до /projects/:projectId, иначе finans съестся как id */}
                <Route path="/projects/finans/:projectId" element={<ProjectFinancesPage />} />

                {/* Карточка проекта */}
                <Route path="/projects/:projectId" element={
                  <ProjectCard 
                    useMockData={useMockData}
                    showNotification={() => {}}
                  />
                } />
                
                {/* Канбан задач */}
                <Route path="/kanban/:projectId" element={
                  <KanbanPage 
                    useMockData={useMockData}
                    showNotification={() => {}}
                  />
                } />
                
                {/* Диаграмма Ганта */}
                <Route path="/gantt/:projectId" element={
                  <GanttPage 
                    useMockData={useMockData}
                    showNotification={() => {}}
                  />
                } />
                
                {/* Страница моих задач */}
                <Route path="/my-tasks" element={
                  <MyTasks 
                    useMockData={useMockData} 
                    showNotification={() => {}}
                  />
                } />

                {/* Расписание */}
                <Route path="/schedule" element={<SchedulePage />} />
                
                {/* Карточка задачи */}
                <Route path="/tasks/:taskId" element={
                  <TaskCard 
                    useMockData={useMockData}
                    showNotification={() => {}}
                  />
                } />
                
                {/* Карточка задачи через канбан */}
                <Route path="/kanban/:projectId/:taskId" element={
                  <TaskCard 
                    useMockData={useMockData}
                    showNotification={() => {}}
                  />
                } />

                {/* Карточка задачи через Гант */}
                <Route path="/gantt/:projectId/:taskId" element={
                  <TaskCard 
                    useMockData={useMockData}
                    showNotification={() => {}}
                  />
                } />
                
                {/* Операции — finans до /operations, иначе :staffId съестся */}
                <Route path="/operations/finans/:staffId" element={<StaffFinancesPage />} />
                <Route path="/operations" element={
                  <OperationsPage showNotification={() => {}} />
                } />
                <Route path="/accounting" element={<Navigate to="/operations" replace />} />
                
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
            </MainLayout>
          </PrivateRoute>
        } />
      </Routes>
    </div>
  );
}

export default App;