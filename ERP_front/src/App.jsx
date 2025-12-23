import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import './App.css';
import Header from './components/main-comps/Header';
import SideBar from './components/main-comps/SideBar';
import ProjectsList from './components/main-content-pages/ProjectsList';
import ProjectCard from './components/main-content-pages/ProjectCard';
import GanttChart2 from './components/main-content-pages/GanttChart2';
import KanbanTasks from './components/main-content-pages/KanbanTasks';
import MyTasks from './components/main-content-pages/MyTasks';
import TaskCard from './components/main-content-pages/TaskCard';
import StaffList from './components/main-content-pages/StaffList';
import EmployeeCard from './components/main-content-pages/EmployeeCard';
import { projectsData } from './MockData/projects.js';

// Конфигурация
const CONFIG = {
  USE_MOCK_DATA: false,
  API_BASE_URL: 'https://api.acrelis.ru/'
};

function App() {
  const [projects] = useState(projectsData);
  const [useMockData] = useState(CONFIG.USE_MOCK_DATA);

  return (
    <Router>
      <div className='App'>
        <div className='header-container'>
          <Header />
        </div>
        
        <div className='main-container'>
          <div className="sidebar-wrapper">
            <SideBar />
          </div>

          <div className='content-wrapper'>
            <div className='content'>
              <Routes>
                {/* Главная страница */}
                <Route path="/" element={<Navigate to="/projects" replace />} />
                
                {/* Список проектов */}
                <Route path="/projects" element={
                  <ProjectsList 
                    useMockData={useMockData} // ← Передаем в ProjectsList
                    onProjectSelect={(project) => {
                      // Простая навигация через window.location
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
                  <TaskCard />
                } />
                
                {/* Бухгалтерия */}
                <Route path="/accounting" element={
                  <AccountingPage />
                } />
                
                {/* Список сотрудников */}
                <Route path="/staff" element={
                  <StaffPage />
                } />
                
                {/* Карточка сотрудника */}
                <Route path="/staff/:employeeId" element={
                  <EmployeeCard 
                    useMockData={useMockData}
                  />
                } />
                
                {/* 404 */}
                <Route path="*" element={<Navigate to="/projects" replace />} />
              </Routes>
            </div>
          </div>
        </div>
      </div>
    </Router>
  );
}

// Обертка для ProjectCard
function ProjectCardWrapper({ projects, useMockData }) {
  const projectId = parseInt(window.location.pathname.split('/projects/')[1]);
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
    <ProjectCard 
      project={project}
      useMockData={useMockData} // ← Передаем в ProjectCard
    />
  );
}

// Обертка для KanbanTasks
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
      useMockData={useMockData} // ← Передаем в KanbanTasks
    />
  );
}

// Обертка для GanttChart
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
      useMockData={useMockData} // ← Передаем в GanttChart2
    />
  );
}

// Обертка для MyTasks
function MyTasksWrapper({ useMockData }) {
  return (
    <MyTasks 
      useMockData={useMockData} // ← Передаем в MyTasks
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
function StaffPage() {
  return (
    <StaffList />
  );
}

export default App;