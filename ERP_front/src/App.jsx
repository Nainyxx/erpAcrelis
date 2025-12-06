import { useState } from 'react';
import './App.css';
import Header from './components/main-comps/Header';
import SideBar from './components/main-comps/SideBar';
import ProjectsList from './components/main-content-pages/ProjectsList';
import ProjectCard from './components/main-content-pages/ProjectCard';

const CONFIG = {
  USE_MOCK_DATA: true
};

function App() {
  const [activePage, setActivePage] = useState('projects');
  const [selectedProject, setSelectedProject] = useState(null);

  const renderContent = () => {
    if (selectedProject) {
      return (
        <ProjectCard 
          project={selectedProject} 
          onClose={() => setSelectedProject(null)} 
        />
      );
    }

    switch(activePage) {
      case 'projects':
        return (
          <ProjectsList 
            useMockData={CONFIG.USE_MOCK_DATA} 
            onProjectSelect={setSelectedProject} 
          />
        );
      case 'mytasks':
        return <div style={{padding: '30px'}}>Мои задачи (в разработке)</div>;
      case 'accounting':
        return <div style={{padding: '30px'}}>Бухгалтерия (в разработке)</div>;
      case 'staff':
        return <div style={{padding: '30px'}}>Сотрудники (в разработке)</div>;
      default:
        return (
          <ProjectsList 
            useMockData={CONFIG.USE_MOCK_DATA} 
            onProjectSelect={setSelectedProject} 
          />
        );
    }
  };

  return (
    <div className='App'>
      <div className='header-container'>
        <Header />
      </div>
      
      <div className='main-container'>
        <div className="sidebar-wrapper">
          <SideBar activePage={activePage} setActivePage={setActivePage} />
        </div>

        <div className='content-wrapper'>
          <div className='content'>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;