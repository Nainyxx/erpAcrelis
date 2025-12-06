import React from "react";
import './SideBar.css';
import ProjectsIcon from "../../assets/sidebar-projects.svg";
import MyTasksIcon from "../../assets/sidebar-mytasks.svg";
import AccountingIcon from "../../assets/sidebar-accounting.svg";
import StaffIcon from "../../assets/sidebar-staff.svg";

function SideBar({ activePage, setActivePage }) {
  const menuItems = [
    { id: "projects", name: "Проекты", icon: ProjectsIcon },
    { id: "mytasks", name: "Мои задачи", icon: MyTasksIcon },
    { id: "accounting", name: "Бухгалтерия", icon: AccountingIcon },
    { id: "staff", name: "Сотрудники", icon: StaffIcon }
  ];

  return (
    <div className="SideBar">
      {menuItems.map((item) => (
        <button
          key={item.id}
          className={`sidebar-item ${activePage === item.id ? 'active' : ''}`}
          onClick={() => setActivePage(item.id)}
        >
          <img src={item.icon} alt={item.name} className="sidebar-icon" />
          <span>{item.name}</span>
        </button>
      ))}
    </div>
  );
}

export default SideBar;