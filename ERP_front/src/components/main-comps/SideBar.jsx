import React from "react";
import { useNavigate } from "react-router-dom";
import './SideBar.css';
import ProjectsIcon from "../../assets/sidebar-projects.svg";
import MyTasksIcon from "../../assets/sidebar-mytasks.svg";
import AccountingIcon from "../../assets/sidebar-accounting.svg";
import StaffIcon from "../../assets/sidebar-staff.svg";

function SideBar({ currentPath }) {
  const navigate = useNavigate();
  
  const menuItems = [
    { id: "projects", name: "Проекты", icon: ProjectsIcon, path: "/projects" },
    { id: "mytasks", name: "Мои задачи", icon: MyTasksIcon, path: "/my-tasks" },
    { id: "accounting", name: "Бухгалтерия", icon: AccountingIcon, path: "/accounting" },
    { id: "staff", name: "Сотрудники", icon: StaffIcon, path: "/staff" }
  ];

  const getActivePage = () => {
    const path = currentPath || window.location.pathname;
    
    if (path === '/my-tasks' || path.startsWith('/tasks/')) {
      return 'mytasks';
    }
    else if (path === '/projects' || path.startsWith('/projects/')) {
      return 'projects';
    }
    else if (path === '/staff' || path.startsWith('/staff/')) {
      return 'staff';
    }
    else if (path === '/accounting') {
      return 'accounting';
    }
    
    return 'projects'; 
  };

  const handleItemClick = (path) => {
    navigate(path);
  };

  const activePage = getActivePage();

  return (
    <div className="SideBar">
      {menuItems.map((item) => (
        <button
          key={item.id}
          className={`sidebar-item ${activePage === item.id ? 'active' : ''}`}
          onClick={() => handleItemClick(item.path)}
        >
          <img src={item.icon} alt={item.name} className="sidebar-icon" />
          <span>{item.name}</span>
        </button>
      ))}
    </div>
  );
}

export default SideBar;