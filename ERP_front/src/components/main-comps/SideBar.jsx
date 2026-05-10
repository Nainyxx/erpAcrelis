import React from "react";
import { useNavigate } from "react-router-dom";
import {
  MY_TASKS_NAV_QUERY_STORAGE_KEY,
  PROJECTS_NAV_QUERY_STORAGE_KEY,
} from "../../constants/navigationKeys";
import './SideBar.css';
import AcrelisLogo from "../../assets/acrelis-logo.svg";
import ProjectsIcon from "../../assets/sidebar-projects.svg";
import MyTasksIcon from "../../assets/sidebar-mytasks.svg";
import AccountingIcon from "../../assets/sidebar-accounting.svg";
import StaffIcon from "../../assets/sidebar-staff.svg";

function SideBar({ onAfterNavigate }) {
  const navigate = useNavigate();

  const menuItems = [
    { id: "projects", name: "Проекты", icon: ProjectsIcon, path: "/projects" },
    { id: "mytasks", name: "Мои задачи", icon: MyTasksIcon, path: "/my-tasks" },
    { id: "operations", name: "Операции", icon: AccountingIcon, path: "/operations" },
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
    else if (urlPath.includes('/projects') || urlPath.includes('/project/') || urlPath.includes('/kanban/') || urlPath.includes('/gantt/')) {
      return 'projects';
    }
    else if (urlPath.includes('/staff')) {
      return 'staff';
    }
    else if (urlPath.includes('/operations') || urlPath.includes('/accounting')) {
      return 'operations';
    }
    else if (urlPath === '/' || urlPath === '' || urlPath === '/#' || urlPath === '#/') {
      return 'projects';
    }

    return '';
  };

  const handleItemClick = (path, itemId) => {
    // Из сайдбара — «свой» раздел без сохранённых фильтров (чистый URL)
    if (itemId === "projects") {
      try {
        sessionStorage.removeItem(PROJECTS_NAV_QUERY_STORAGE_KEY);
      } catch (_) { }
      navigate("/projects");
      onAfterNavigate?.();
      return;
    }
    if (itemId === "mytasks") {
      try {
        sessionStorage.removeItem(MY_TASKS_NAV_QUERY_STORAGE_KEY);
      } catch (_) { }
      navigate("/my-tasks");
      onAfterNavigate?.();
      return;
    }
    navigate(path);
    onAfterNavigate?.();
  };

  const activePage = getActivePage();

  return (
    <div className="SideBar">
      <div className="sidebar-logo-wrap">
        <img className="sidebar-logo" src={AcrelisLogo} alt="Acrelis Logo" />
      </div>
      {menuItems.map((item) => (
        <button
          key={item.id}
          className={`sidebar-item ${activePage === item.id ? 'active' : ''}`}
          onClick={() => handleItemClick(item.path, item.id)}
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