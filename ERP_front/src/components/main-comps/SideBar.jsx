import React from "react";
import { useNavigate } from "react-router-dom";
import './SideBar.css';
import ProjectsIcon from "../../assets/sidebar-projects.svg";
import MyTasksIcon from "../../assets/sidebar-mytasks.svg";
import AccountingIcon from "../../assets/sidebar-accounting.svg";
import StaffIcon from "../../assets/sidebar-staff.svg";

function SideBar() {
  const navigate = useNavigate();
  
  const menuItems = [
    { id: "projects", name: "Проекты", icon: ProjectsIcon, path: "/projects" },
    { id: "mytasks", name: "Мои задачи", icon: MyTasksIcon, path: "/my-tasks" },
    { id: "accounting", name: "Бухгалтерия", icon: AccountingIcon, path: "/accounting" },
    { id: "staff", name: "Сотрудники", icon: StaffIcon, path: "/staff" }
  ];

  // Получаем активную страницу из URL
  const getActivePage = () => {
    const path = window.location.pathname;
    if (path.startsWith('/project')) return 'projects'; // Проекты активны, когда мы на странице проекта
    if (path.startsWith('/my-tasks')) return 'mytasks';
    if (path.startsWith('/accounting')) return 'accounting';
    if (path.startsWith('/staff')) return 'staff';
    if (path === '/projects') return 'projects';
    return 'projects'; // По умолчанию
  };

  const handleItemClick = (path) => {
    navigate(path);
  };

  return (
    <div className="SideBar">
      {menuItems.map((item) => (
        <button
          key={item.id}
          className={`sidebar-item ${getActivePage() === item.id ? 'active' : ''}`}
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