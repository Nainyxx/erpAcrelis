// App.jsx
import { useState } from 'react'
import './App.css'
import Header from './components/main-comps/Header'
import SideBar from './components/main-comps/SideBar'
import ProjectsList from './components/main-content-pages/ProjectsList'

const CONFIG = {
  USE_MOCK_DATA: true
}

function App() {
  return (
    <div className='App'>
      <div className='header-container'>
        <Header />
      </div>
      
      <div className='main-container'>
        <SideBar />
        
        <div className='content'>
          <ProjectsList useMockData={CONFIG.USE_MOCK_DATA} />
        </div>
      </div>
    </div>
  )
}

export default App