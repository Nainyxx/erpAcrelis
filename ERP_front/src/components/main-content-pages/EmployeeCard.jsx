import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEmployeeById } from '../../services/staffService';
import './EmployeeCard.css';

const EmployeeCard = ({ useMockData = true }) => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const employeeData = await getEmployeeById(employeeId, useMockData);
      setEmployee(employeeData);
      setLoading(false);
    };

    loadData();
  }, [employeeId, useMockData]);

  const generateAvatar = (name) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2', '#EF476F'];
    const initials = name.split(' ').slice(0, 2).map(n => n[0]).join('');
    const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    
    return (
      <div className="avatar-large" style={{ backgroundColor: colors[colorIndex] }}>
        {initials}
      </div>
    );
  };

  if (loading || !employee) {
    return (
      <div className="employee-page">
        <h1 className="page-title">Сотрудники — Карточка сотрудника</h1>
        <div>Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="employee-page">
      <h1 className="page-title">
        <span className="clickable" onClick={() => navigate('/staff')}>Сотрудники</span> — Карточка сотрудника
      </h1>

      {/* Большой белый прямоугольник */}
      <div className="main-card">
        {/* Верхняя часть: фото и руководитель */}
        <div className="top-section">
          <div className="employee-info">
            {generateAvatar(employee.name)}
            <div className="name-section">
              <h2>{employee.name}</h2>
              <p>{employee.position}</p>
            </div>
          </div>
          
          <div className="manager-box">
            <div className="manager-label">Руководитель</div>
            <div className="manager-row">
              <div className="small-avatar">ВД</div>
              <div className="manager-details">
                <div className="manager-name">Васильев Дмитрий</div>
                <div className="manager-role">Директор</div>
              </div>
            </div>
          </div>
        </div>

        {/* Средняя часть: контакты в одну строку и кнопка */}
        <div className="middle-section">
          <div className="contacts-row">
            <div className="contact-item">
              <span className="contact-label">E-mail</span>
              <span className="contact-value">{employee.email}</span>
            </div>
            <div className="contact-item">
              <span className="contact-label">Тел.</span>
              <span className="contact-value">{employee.phone || '+78988989898'}</span>
            </div>
            <div className="contact-item">
              <span className="contact-label">Telegram</span>
              <span className="contact-value">{employee.telegram || '@acrelis'}</span>
            </div>
          </div>
          
          <button className="tasks-button">
            Задачи сотрудника
          </button>
        </div>
      </div>

      {/* ОТДЕЛЬНЫЕ 4 прямоугольника ПОД большим прямоугольником */}
      <div className="bottom-cards">
        <div className="stat-card">
          <div className="stat-number">5</div>
          <div className="stat-label">Текущие задачи</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">2</div>
          <div className="stat-label">Не закрытые в срок</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">15</div>
          <div className="stat-label">Закрытые в срок</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">1</div>
          <div className="stat-label">Проваленные задачи</div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCard;