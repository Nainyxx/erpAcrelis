import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import './SideBar.css';
import ProjectsIcon from "../../assets/sidebar-projects.svg";
import MyTasksIcon from "../../assets/sidebar-mytasks.svg";
import AccountingIcon from "../../assets/sidebar-accounting.svg";
import StaffIcon from "../../assets/sidebar-staff.svg";

function SideBar() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const menuItems = [
    { id: "projects", name: "Проекты", icon: ProjectsIcon, path: "/projects" },
    { id: "mytasks", name: "Мои задачи", icon: MyTasksIcon, path: "/my-tasks" },
    { id: "accounting", name: "Бухгалтерия", icon: AccountingIcon, path: "/accounting" },
    { id: "staff", name: "Сотрудники", icon: StaffIcon, path: "/staff" }
  ];

  const getActivePage = () => {
    // Получаем текущий URL целиком
    const currentUrl = window.location.href;
    
    // Извлекаем часть после домена
    const urlPath = currentUrl.split(window.location.origin)[1] || '';
    
    // Проверяем каждый возможный путь
    if (urlPath.includes('/my-tasks') || urlPath.includes('/tasks/')) {
      return 'mytasks';
    }
    else if (urlPath.includes('/projects') || urlPath.includes('/project/')) {
      return 'projects';
    }
    else if (urlPath.includes('/staff')) {
      return 'staff';
    }
    else if (urlPath.includes('/accounting')) {
      return 'accounting';
    }
    else if (urlPath === '/' || urlPath === '' || urlPath === '/#' || urlPath === '#/') {
      return 'projects';
    }
    
    return '';
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
          <img 
            src={item.icon} 
            alt={item.name} 
            className="sidebar-icon"
          />
          <span className="sidebar-text">{item.name}</span>
        </button>
      ))}
    </div>
  );
}

export default SideBar;