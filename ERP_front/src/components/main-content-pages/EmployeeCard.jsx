import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEmployeeById } from '../../services/api/api';
import './EmployeeCard.css';

const EmployeeCard = ({ useMockData = true }) => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const employeeData = await getEmployeeById(employeeId, useMockData);
      setEmployee(employeeData);
      setLoading(false);
      setAvatarError(false);
    };

    loadData();
  }, [employeeId, useMockData]);

  const generateAvatar = (name, imageUrl) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2', '#EF476F'];
    const initials = name.split(' ').slice(0, 2).map(n => n[0]).join('');
    const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    
    if (imageUrl && !avatarError) {
      return (
        <div className="avatar-large_employee_card">
          <img 
            src={imageUrl} 
            alt={name}
            onError={() => setAvatarError(true)}
          />
        </div>
      );
    }
    console.log(employee)
    return (
      <div className="avatar-large_employee_card" style={{ backgroundColor: colors[colorIndex] }}>
        {initials}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="employee-page_employee_card">
        <h1 className="page-title_employee_card">Сотрудники — Карточка сотрудника</h1>
        <div>Загрузка...</div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="employee-page_employee_card">
        <h1 className="page-title_employee_card">Сотрудники — Карточка сотрудника</h1>
        <div>Сотрудник не найден</div>
      </div>
    );
  }

  return (
    <div className="employee-page_employee_card">
      <h1 className="page-title_employee_card">
        <span className="clickable_employee_card" onClick={() => navigate('/staff')}>Сотрудники</span> — Карточка сотрудника
      </h1>

      <div className="main-card_employee_card">
        <div className="top-section_employee_card">
          <div className="employee-info_employee_card">
            {generateAvatar(employee.name, employee.image_url)}
            <div className="name-section_employee_card">
              <h2>{employee.name}</h2>
              <p>{employee.position}</p>
            </div>
          </div>
          
          <div className="manager-box_employee_card">
            <div className="manager-label_employee_card">Руководитель</div>
            <div className="manager-row_employee_card">
              <div className="small-avatar_employee_card">ВД</div>
              <div className="manager-details_employee_card">
                <div className="manager-name_employee_card">Васильев Дмитрий</div>
                <div className="manager-role_employee_card">Директор</div>
              </div>
            </div>
          </div>
        </div>

        <div className="middle-section_employee_card">
          <div className="contacts-row_employee_card">
            <div className="contact-item_employee_card">
              <span className="contact-label_employee_card">E-mail</span>
              <span className="contact-value_employee_card">{employee.email}</span>
            </div>
            <div className="contact-item_employee_card">
              <span className="contact-label_employee_card">Тел.</span>
              <span className="contact-value_employee_card">{employee.phone || 'Не указан'}</span>
            </div>
            <div className="contact-item_employee_card">
              <span className="contact-label_employee_card">Telegram</span>
              <span className="contact-value_employee_card">{employee.telegram || '@acrelis'}</span>
            </div>
          </div>
          
          <button className="tasks-button_employee_card">
            Задачи сотрудника
          </button>
        </div>
      </div>

      <div className="bottom-cards_employee_card">
        <div className="stat-card_employee_card">
          <div className="stat-number_employee_card">5</div>
          <div className="stat-label_employee_card">Текущие задачи</div>
        </div>
        <div className="stat-card_employee_card">
          <div className="stat-number_employee_card">2</div>
          <div className="stat-label_employee_card">Не закрытые в срок</div>
        </div>
        <div className="stat-card_employee_card">
          <div className="stat-number_employee_card">15</div>
          <div className="stat-label_employee_card">Закрытые в срок</div>
        </div>
        <div className="stat-card_employee_card">
          <div className="stat-number_employee_card">1</div>
          <div className="stat-label_employee_card">Проваленные задачи</div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCard;