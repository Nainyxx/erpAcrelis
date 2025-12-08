import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './App.css';
import Header from './components/main-comps/Header';
import SideBar from './components/main-comps/SideBar';
import ProjectsList from './components/main-content-pages/ProjectsList';
import ProjectCard from './components/main-content-pages/ProjectCard';
import GanttChart from './components/main-content-pages/GanttChart';
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
              
              {/* Диаграмма Ганта */}
              <Route path="/projects/:projectId/gantt" element={
                <GanttChartWrapper 
                  projects={projects}
                  navigate={navigate}
                />
              } />
              
              {/* Страница моих задач */}
              <Route path="/my-tasks" element={
                <div style={{padding: '30px'}}>Мои задачи (в разработке)</div>
              } />
              
              {/* Бухгалтерия */}
              <Route path="/accounting" element={
                <div style={{padding: '30px'}}>Бухгалтерия (в разработке)</div>
              } />
              
              {/* Сотрудники */}
              <Route path="/staff" element={
                <div style={{padding: '30px'}}>Сотрудники (в разработке)</div>
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

// Главный компонент App с Router
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;