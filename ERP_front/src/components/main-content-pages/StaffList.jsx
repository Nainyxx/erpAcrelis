import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStaffList, getStaffDepartments } from '../../services/api/api';
import './StaffList.css';

const StaffList = ({ useMockData = true }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

 useEffect(() => {
  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 1. Загружаем сотрудников (реальный API при USE_MOCK_DATA=false)
      const { employees: loadedEmployees } = await getStaffList(useMockData);
      
      // 2. Загружаем отделы отдельным запросом
      const departmentsData = await getStaffDepartments(useMockData);
      
      console.log('Загруженные сотрудники:', loadedEmployees);
      console.log('Загруженные отделы:', departmentsData);
      
      // 3. Создаем фильтр отделов
      const departmentOptions = [
        { id: 'all', label: 'Все отделы', count: loadedEmployees.length }
      ];
      
      // Добавляем отделы из API
      if (departmentsData.length > 0) {
        departmentsData.forEach(dept => {
          // Считаем сотрудников в отделе
          const count = loadedEmployees.filter(emp => 
            emp.department === dept.id.toString() || 
            emp.departmentLabel === dept.name
          ).length;
          
          departmentOptions.push({
            id: dept.id.toString(),
            label: dept.name,
            count: count
          });
        });
      } else {
        // Если отделов нет, создаем из уникальных отделов сотрудников
        const uniqueDepartments = [...new Set(loadedEmployees.map(emp => emp.departmentLabel))];
        uniqueDepartments.forEach((deptLabel, index) => {
          if (deptLabel && deptLabel !== 'Не указан') {
            const count = loadedEmployees.filter(emp => emp.departmentLabel === deptLabel).length;
            departmentOptions.push({
              id: (index + 1).toString(),
              label: deptLabel,
              count: count
            });
          }
        });
      }
      
      setEmployees(loadedEmployees);
      setDepartments(departmentOptions);
      
    } catch (error) {
      console.error('Ошибка загрузки данных сотрудников:', error);
      setError('Не удалось загрузить данные сотрудников');
      setEmployees([]);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, [useMockData]);

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || 
                             employee.department === selectedDepartment || 
                             employee.departmentLabel === departments.find(d => d.id === selectedDepartment)?.label;
    return matchesSearch && matchesDepartment;
  });

  const generateAvatar = (name) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#FFD166', '#06D6A0', '#118AB2', '#EF476F'];
    const initials = name.split(' ').map(n => n[0]).join('');
    const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    
    return (
      <div className="avatar" style={{ backgroundColor: colors[colorIndex] }}>
        {initials}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="staff-container">
        <div className="loading">Загрузка сотрудников...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="staff-container">
        <div className="error-message">
          {error}
          <button onClick={() => window.location.reload()} className="retry-btn">
            Повторить попытку
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="staff-container">
      <h1 className="staff-title">Сотрудники</h1>

      <div className="filters-container">
        <div className="filters">
          <div className="filter-group">
            <select 
              className="filter-select" 
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.label} ({dept.count || 0})
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group search-group">
            <input
              type="text"
              placeholder="Поиск по ФИО..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="staff-table">
        <div className="header-cell">ФИО</div>
        <div className="header-cell">Роль</div>
        <div className="header-cell">Отдел</div>

        {filteredEmployees.length === 0 ? (
          <div className="no-employees">
            {searchQuery || selectedDepartment !== 'all' 
              ? 'Сотрудники не найдены по заданным фильтрам' 
              : 'Нет сотрудников'}
          </div>
        ) : (
          filteredEmployees.map((employee) => (
            <div className="employee-row" key={employee.id}>
              <div onClick={() => navigate(`/staff/${employee.id}`)}>
                <div className="employee-info">
                  {generateAvatar(employee.name)}
                  <div className="employee-name-text">{employee.name}</div>
                </div>
              </div>
              
              <div onClick={() => navigate(`/staff/${employee.id}`)}>
                <span className="employee-position">
                  {employee.position}
                </span>
              </div>
              
              <div onClick={() => navigate(`/staff/${employee.id}`)}>
                <span className="employee-department">
                  {employee.departmentLabel}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StaffList;