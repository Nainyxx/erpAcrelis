import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import './App.css';
import Header from './components/main-comps/Header';
import SideBar from './components/main-comps/SideBar';
import ProjectsList from './components/main-content-pages/ProjectsList';
import ProjectCard from './components/main-content-pages/ProjectCard';
import GanttChart from './components/main-content-pages/GanttChart';
import KanbanTasks from './components/main-content-pages/KanbanTasks';
import MyTasks from './components/main-content-pages/MyTasks';
import TaskCard from './components/main-content-pages/TaskCard';
import StaffList from './components/main-content-pages/StaffList';
import EmployeeCard from './components/main-content-pages/EmployeeCard';
import { projectsData } from './MockData/projects.js';

const CONFIG = {
  USE_MOCK_DATA: true
};

// Главный компонент
function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [projects] = useState(projectsData);

  return (
    <div className='App'>
      <div className='header-container'>
        <Header />
      </div>
      
      <div className='main-container'>
        <div className="sidebar-wrapper">
          <SideBar currentPath={location.pathname} />
        </div>

        <div className='content-wrapper'>
          <div className='content'>
            <Routes>
              {/* Главная страница */}
              <Route path="/" element={<Navigate to="/projects" replace />} />
              
              {/* Список проектов */}
              <Route path="/projects" element={
                <ProjectsList 
                  useMockData={CONFIG.USE_MOCK_DATA} 
                  onProjectSelect={(project) => {
                    navigate(`/projects/${project.id}`);
                  }} 
                />
              } />
              
              {/* Карточка проекта */}
              <Route path="/projects/:projectId" element={
                <ProjectCardWrapper 
                  projects={projects}
                  navigate={navigate}
                />
              } />
              
              {/* Канбан задач */}
              <Route path="/projects/:projectId/kanban" element={
                <KanbanWrapper 
                  projects={projects}
                  navigate={navigate}
                />
              } />
              
              {/* Диаграмма Ганта */}
              <Route path="/projects/:projectId/gantt" element={
                <GanttChartWrapper 
                  projects={projects}
                  navigate={navigate}
                />
              } />
              
              {/* Страница моих задач */}
              <Route path="/my-tasks" element={
                <MyTasksWrapper navigate={navigate} />
              } />
              
              {/* Карточка задачи */}
              <Route path="/tasks/:taskId" element={
                <TaskCard />
              } />
              
              {/* Бухгалтерия */}
              <Route path="/accounting" element={
                <AccountingPage />
              } />
              
              {/* Список сотрудников */}
              <Route path="/staff" element={
                <StaffPage navigate={navigate} />
              } />
              
              {/* Карточка сотрудника */}
              <Route path="/staff/:employeeId" element={
                <EmployeeCard 
                  useMockData={CONFIG.USE_MOCK_DATA}
                />
              } />
              
              {/* 404 */}
              <Route path="*" element={<Navigate to="/projects" replace />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
}

// Обертка для ProjectCard
function ProjectCardWrapper({ projects, navigate }) {
  const projectId = parseInt(window.location.pathname.split('/')[2]);
  const project = projects.find(p => p.id === projectId);
  
  if (!project) {
    return (
      <div style={{padding: '30px'}}>
        <h2>Проект не найден</h2>
        <button onClick={() => navigate('/projects')}>Вернуться к списку проектов</button>
      </div>
    );
  }
  
  return (
    <ProjectCard 
      project={project}
      onClose={() => navigate('/projects')}
      onShowGantt={() => navigate(`/projects/${projectId}/gantt`)}
      navigate={navigate}
    />
  );
}

// Обертка для KanbanTasks
function KanbanWrapper({ projects, navigate }) {
  const projectId = parseInt(window.location.pathname.split('/')[2]);
  const project = projects.find(p => p.id === projectId);
  
  if (!project) {
    return (
      <div style={{padding: '30px'}}>
        <h2>Проект не найден</h2>
        <button onClick={() => navigate('/projects')}>Вернуться к списку проектов</button>
      </div>
    );
  }
  
  return (
    <KanbanTasks 
      project={project}
    />
  );
}

// Обертка для GanttChart
function GanttChartWrapper({ projects, navigate }) {
  const projectId = parseInt(window.location.pathname.split('/')[2]);
  const project = projects.find(p => p.id === projectId);
  
  if (!project) {
    return <div>Проект не найден</div>;
  }
  
  return (
    <GanttChart 
      project={project}
      onBack={() => navigate(`/projects/${projectId}`)}
    />
  );
}

// Обертка для MyTasks
function MyTasksWrapper({ navigate }) {
  const handleTaskClick = (task) => {
    navigate(`/tasks/${task.id}`);
  };
  
  return (
    <MyTasks 
      useMockData={CONFIG.USE_MOCK_DATA}
      onTaskClick={handleTaskClick}
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

// Страница Сотрудники
function StaffPage({ navigate }) {
  const handleEmployeeSelect = (employee) => {
    navigate(`/staff/${employee.id}`);
  };

  return (
    <StaffList 
      useMockData={CONFIG.USE_MOCK_DATA}
      onEmployeeSelect={handleEmployeeSelect}
    />
  );
}

// Главный компонент App с Router и future flags
function App() {
  return (
    <Router 
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AppContent />
    </Router>
  );
}

export default App;