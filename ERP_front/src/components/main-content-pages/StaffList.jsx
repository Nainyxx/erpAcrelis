import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getStaffList, getStaffDepartments } from '../../services/api';
import { MultiSelectFilterDropdown } from '../shared/MultiSelectFilterDropdown';
import './StaffList.css';

const StaffList = ({ useMockData = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const { employees: loadedEmployees } = await getStaffList(useMockData);
        const departmentsData = await getStaffDepartments(useMockData);

        const departmentOptions = [];

        if (departmentsData.length > 0) {
          departmentsData.forEach((dept) => {
            const count = loadedEmployees.filter(
              (emp) =>
                emp.department === dept.id.toString() ||
                emp.departmentLabel === dept.name
            ).length;

            departmentOptions.push({
              id: dept.id.toString(),
              label: dept.name,
              count
            });
          });
        } else {
          const uniqueDepartments = [
            ...new Set(loadedEmployees.map((emp) => emp.departmentLabel))
          ];
          uniqueDepartments.forEach((deptLabel, index) => {
            if (deptLabel && deptLabel !== 'Не указан') {
              const count = loadedEmployees.filter(
                (emp) => emp.departmentLabel === deptLabel
              ).length;
              departmentOptions.push({
                id: (index + 1).toString(),
                label: deptLabel,
                count
              });
            }
          });
        }

        setEmployees(loadedEmployees);
        setDepartments(departmentOptions);
      } catch (err) {
        setError(
          'Не удалось загрузить данные сотрудников. Проверьте подключение.'
        );
        setEmployees([]);
        setDepartments([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [useMockData]);

  const handleToggleDepartment = useCallback((id) => {
    const sid = String(id);
    setSelectedDepartmentIds((prev) => {
      if (prev.some((x) => String(x) === sid)) {
        return prev.filter((x) => String(x) !== sid);
      }
      return [...prev, id];
    });
  }, []);

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch = employee.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesDepartment =
      selectedDepartmentIds.length === 0 ||
      selectedDepartmentIds.some((deptId) => {
        const dept = departments.find((d) => String(d.id) === String(deptId));
        return (
          employee.department === String(deptId) ||
          employee.departmentLabel === dept?.label
        );
      });
    return matchesSearch && matchesDepartment;
  });

  const renderStaffTabs = () => (
    <div
      className="staff-tabs-bar"
      role="tablist"
      aria-label="Разделы сотрудников"
    >
      <button
        type="button"
        role="tab"
        aria-selected="true"
        className="staff-tab is-active"
      >
        Сотрудники
      </button>
      <button
        type="button"
        role="tab"
        aria-selected="false"
        className="staff-tab"
        onClick={() => navigate('/schedule')}
      >
        График работы
      </button>
    </div>
  );

  const renderStaffToolbar = () => (
    <div className="staff-toolbar">
      <MultiSelectFilterDropdown
        placeholder="Отдел"
        options={departments.map(({ id, label }) => ({ id, label }))}
        selectedIds={selectedDepartmentIds}
        onToggleOption={handleToggleDepartment}
        onClear={() => setSelectedDepartmentIds([])}
        triggerAriaLabel="Фильтр по отделу"
      />
      <label className="staff-search">
        <span className="staff-search__icon" aria-hidden="true">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
              stroke="#5b7a7a"
              strokeWidth="1.75"
            />
            <path
              d="M16.5 16.5 21 21"
              stroke="#5b7a7a"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <input
          type="search"
          className="staff-search__input"
          placeholder="Поиск по ФИО"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoComplete="off"
        />
      </label>
    </div>
  );

  const generateAvatar = (employee) => {
    const colors = [
      '#FF6B6B',
      '#4ECDC4',
      '#FFD166',
      '#06D6A0',
      '#118AB2',
      '#EF476F'
    ];

    let initials = 'НН';
    if (employee.name && employee.name.trim()) {
      const parts = employee.name.split(' ').filter((part) => part.length > 0);
      if (parts.length >= 2) {
        initials = (parts[0][0] + parts[1][0]).toUpperCase();
      } else if (parts.length === 1) {
        initials = parts[0][0].toUpperCase();
      }
    }

    const colorIndex =
      (employee.name || '')
        .split('')
        .reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;

    const imageUrl = employee.image || employee.image_url;

    if (imageUrl) {
      return (
        <div className="avatar">
          <img
            src={imageUrl}
            alt={employee.name}
            onError={(e) => {
              e.target.style.display = 'none';
              const fallback = e.target.parentNode.querySelector(
                '.avatar-fallback'
              );
              if (fallback) fallback.style.display = 'flex';
            }}
          />
          <div
            className="avatar-fallback"
            style={{
              backgroundColor: colors[colorIndex],
              display: 'none'
            }}
          >
            {initials}
          </div>
        </div>
      );
    }

    return (
      <div className="avatar" style={{ backgroundColor: colors[colorIndex] }}>
        {initials}
      </div>
    );
  };

  const breadcrumb = (
    <nav className="projects-breadcrumb" aria-label="Навигация по разделам">
      <button
        type="button"
        className="projects-breadcrumb__home"
        onClick={() => navigate(`/projects${location.search || ''}`)}
      >
        Главная
      </button>
      <span className="projects-breadcrumb__sep" aria-hidden="true">
        {' '}
        /{' '}
      </span>
      <span className="projects-breadcrumb__current">Сотрудники</span>
    </nav>
  );

  if (loading) {
    return (
      <div className="staff-container">
        {breadcrumb}
        {renderStaffTabs()}
        {renderStaffToolbar()}
        <div className="gantt-loading_gantt_class">
          <div className="loading-spinner_gantt_class" />
          <h3
            style={{
              color: 'black',
              margin: '1vh 0',
              fontSize: '2vh'
            }}
          >
            Загрузка списка сотрудников...
          </h3>
          <p style={{ color: 'rgba(0, 0, 0, 0.8)', fontSize: '1.4vh' }}>
            Подготавливаем данные сотрудников
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="staff-container">
        {breadcrumb}
        {renderStaffTabs()}
        {renderStaffToolbar()}
        <div className="no-tasks-message_gantt_class">
          <div className="no-tasks-content_gantt_class">
            <span className="no-tasks-icon_gantt_class">⚠️</span>
            <h4>Ошибка загрузки</h4>
            <p>{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="gantt-back-btn_gantt_class"
              style={{ marginTop: '2vh' }}
            >
              Повторить попытку
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="staff-container">
        {breadcrumb}
        {renderStaffTabs()}
        {renderStaffToolbar()}
        <div className="no-tasks-message_gantt_class">
          <div className="no-tasks-content_gantt_class">
            <span className="no-tasks-icon_gantt_class">👥</span>
            <h4>Сотрудников пока нет</h4>
            <p>В системе еще не зарегистрировано сотрудников</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="staff-container">
      {breadcrumb}
      {renderStaffTabs()}
      {renderStaffToolbar()}

      <div className="staff-table">
        <div className="header-cell">ФИО</div>
        <div className="header-cell">Роль</div>
        <div className="header-cell">Отдел</div>

        {filteredEmployees.length === 0 ? (
          <div className="no-employees">
            {searchQuery || selectedDepartmentIds.length > 0
              ? 'Сотрудники не найдены по заданным фильтрам'
              : 'Нет сотрудников'}
          </div>
        ) : (
          filteredEmployees.map((employee) => (
            <div className="employee-row" key={employee.id}>
              <div onClick={() => navigate(`/staff/${employee.id}`)}>
                <div className="employee-info">
                  {generateAvatar(employee)}
                  <div className="employee-name-text">{employee.name}</div>
                </div>
              </div>

              <div onClick={() => navigate(`/staff/${employee.id}`)}>
                <span className="employee-position">{employee.position}</span>
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
