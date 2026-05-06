import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEmployeeById, authFetch, getStaffMediaUrl } from '../../services/api/api';
import { AccountProjectsPanel } from '../shared/AccountProjectsPanel';
import './AccountPage.css';
import './EmployeeCard.css';
import BackgoundFrame from '../../assets/Frame-account.svg';
import statisticDonutSrc from '../../assets/statistic-account.svg';

const EmployeeCard = ({ useMockData = false }) => {
  const { employeeId } = useParams();
  const navigate = useNavigate();

  const [userData, setUserData] = useState({
    id: null,
    name: '',
    post: '',
    director: { name: '' },
    image: null,
    image_url: null,
    statistic_percent: null,
    statistic_label: '',
    current_tasks: 0,
    closed_late_tasks: 0,
    closed_on_time_tasks: 0,
    failed_tasks: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [profileForm, setProfileForm] = useState({
    email: '',
    phone: '',
    telegram: '',
    birthdate: '',
    dream: ''
  });
  const [directorPhotoFailed, setDirectorPhotoFailed] = useState(false);

  useEffect(() => {
    loadEmployeeData();
  }, [employeeId, useMockData]);

  useEffect(() => {
    setDirectorPhotoFailed(false);
  }, [
    employeeId,
    userData.director?.id,
    userData.director?.image,
    userData.director?.image_url,
    userData.director?.staff_image,
    userData.director?.img
  ]);

  const formatTelegramForDisplay = (telegram) => {
    if (!telegram) return '';
    if (telegram.startsWith('@')) return telegram;

    const match = telegram.match(/t\.me\/([a-zA-Z0-9_]+)/);
    if (match && match[1]) {
      return `@${match[1]}`;
    }

    if (/^[a-zA-Z0-9_]+$/.test(telegram)) {
      return `@${telegram}`;
    }

    return telegram;
  };

  const formatBirthDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const formatPhoneForDisplay = (phone) => {
    if (!phone) return '';
    if (phone.includes('(') || phone.includes(')')) return phone;

    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `+7 (${cleaned.substring(1, 4)}) ${cleaned.substring(4, 7)}-${cleaned.substring(7, 9)}-${cleaned.substring(9)}`;
    }
    if (cleaned.length === 10) {
      return `+7 (${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 8)}-${cleaned.substring(8)}`;
    }
    return phone;
  };

  const applyEmployeePayload = (employeeData) => {
    const formattedData = {
      id: employeeData.id,
      name: employeeData.name || '',
      post: employeeData.post || employeeData.position || '',
      director: employeeData.director || { name: '' },
      image: employeeData.image || null,
      image_url: employeeData.image_url || employeeData.image || null,
      statistic_percent:
        employeeData.statistic_percent != null ? employeeData.statistic_percent : null,
      statistic_label: employeeData.statistic_label || '',
      current_tasks: employeeData.current_tasks ?? 0,
      closed_late_tasks: employeeData.closed_late_tasks ?? 0,
      closed_on_time_tasks: employeeData.closed_on_time_tasks ?? 0,
      failed_tasks: employeeData.failed_tasks ?? 0
    };

    setUserData(formattedData);
    const nextProfileForm = {
      email: employeeData.email || '',
      phone: formatPhoneForDisplay(employeeData.phone),
      telegram: formatTelegramForDisplay(employeeData.telegram),
      birthdate: formatBirthDateForDisplay(employeeData.birthday),
      dream: employeeData.dream || ''
    };
    setProfileForm(nextProfileForm);
  };

  const loadEmployeeData = async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      if (!employeeId) {
        throw new Error('Не указан ID сотрудника');
      }

      const response = await authFetch(`https://api.acrelis.ru/staff/staff/${employeeId}/`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`Ошибка загрузки: ${response.status}`);
      }

      const employeeData = await response.json();

      if (!employeeData || !employeeData.id) {
        throw new Error('Сотрудник не найден');
      }

      applyEmployeePayload(employeeData);
    } catch (err) {
      setLoadError('Не удалось загрузить данные сотрудника. Проверьте подключение.');
      try {
        const fallbackData = await getEmployeeById(employeeId, useMockData);
        if (fallbackData && fallbackData.id) {
          applyEmployeePayload(fallbackData);
          setLoadError(null);
        } else {
          setUserData((prev) => ({ ...prev, id: null }));
        }
      } catch {
        setUserData((prev) => ({ ...prev, id: null }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderAvatar = () => {
    if (userData.image || userData.image_url) {
      const imageSrc = userData.image || userData.image_url;
      return (
        <div className="avatar-container">
          <img
            src={imageSrc}
            alt={userData.name}
            className="avatar-image"
            onError={(e) => {
              e.target.style.display = 'none';
              const svg = e.target.parentNode.querySelector('svg');
              if (svg) svg.style.display = 'block';
            }}
          />
          <svg
            width="20.9vh"
            height="20.9vh"
            viewBox="0 0 209 209"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: 'none' }}
          >
            <circle cx="104.5" cy="104.5" r="104.5" fill="#E5E5E5" />
            <path d="M104.5 42.5C119.35 42.5 131.5 56.3132 131.5 73.5C131.5 90.6868 119.35 104.5 104.5 104.5C89.6499 104.5 77.5 90.6868 77.5 73.5C77.5 56.3132 89.6499 42.5 104.5 42.5Z" stroke="#26262C" />
            <path d="M56 151.5C56 145.919 57.2674 140.392 59.7299 135.236C62.1924 130.08 65.8017 125.394 70.3518 121.448C74.9018 117.501 80.3036 114.371 86.2485 112.235C92.1935 110.099 98.5652 109 105 109C111.435 109 117.807 110.099 123.751 112.235C129.696 114.371 135.098 117.501 139.648 121.448C144.198 125.394 147.808 130.08 150.27 135.236C152.733 140.392 154 145.919 154 151.5L153.917 151.5C153.917 145.928 152.651 140.411 150.193 135.264C147.735 130.116 144.132 125.439 139.589 121.499C135.047 117.559 129.654 114.434 123.72 112.302C117.785 110.17 111.424 109.072 105 109.072C98.5762 109.072 92.2153 110.17 86.2805 112.302C80.3456 114.434 74.9531 117.559 70.4108 121.499C65.8685 125.439 62.2653 130.116 59.807 135.264C57.3487 140.411 56.0835 145.928 56.0835 151.5L56 151.5Z" stroke="#26262C" />
          </svg>
        </div>
      );
    }
    return (
      <div className="avatar-container">
        <svg width="20.9vh" height="20.9vh" viewBox="0 0 209 209" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="104.5" cy="104.5" r="104.5" fill="#E5E5E5" />
          <path d="M104.5 42.5C119.35 42.5 131.5 56.3132 131.5 73.5C131.5 90.6868 119.35 104.5 104.5 104.5C89.6499 104.5 77.5 90.6868 77.5 73.5C77.5 56.3132 89.6499 42.5 104.5 42.5Z" stroke="#26262C" />
          <path d="M56 151.5C56 145.919 57.2674 140.392 59.7299 135.236C62.1924 130.08 65.8017 125.394 70.3518 121.448C74.9018 117.501 80.3036 114.371 86.2485 112.235C92.1935 110.099 98.5652 109 105 109C111.435 109 117.807 110.099 123.751 112.235C129.696 114.371 135.098 117.501 139.648 121.448C144.198 125.394 147.808 130.08 150.27 135.236C152.733 140.392 154 145.919 154 151.5L153.917 151.5C153.917 145.928 152.651 140.411 150.193 135.264C147.735 130.116 144.132 125.439 139.589 121.499C135.047 117.559 129.654 114.434 123.72 112.302C117.785 110.17 111.424 109.072 105 109.072C98.5762 109.072 92.2153 110.17 86.2805 112.302C80.3456 114.434 74.9531 117.559 70.4108 121.499C65.8685 125.439 62.2653 130.116 59.807 135.264C57.3487 140.411 56.0835 145.928 56.0835 151.5L56 151.5Z" stroke="#26262C" />
        </svg>
      </div>
    );
  };

  const employeeName = userData.name || 'Сотрудник';
  const displayName = employeeName.length > 30 ? `${employeeName.substring(0, 30)}...` : employeeName;

  const getDirectorInitials = (directorName) => {
    if (!directorName || typeof directorName !== 'string' || !directorName.trim()) return '?';
    const parts = directorName.trim().split(/\s+/).filter((p) => p.length > 0);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return '?';
  };

  const handleDirectorClick = () => {
    const id = userData.director?.id;
    if (id) navigate(`/staff/${id}`);
  };

  const directorRawPhoto =
    userData.director?.image ||
    userData.director?.image_url ||
    userData.director?.staff_image ||
    userData.director?.img ||
    null;
  const directorPhotoUrl = getStaffMediaUrl(directorRawPhoto);

  if (isLoading) {
    return (
      <div className="employee-page_employee_card">
        <h1 className="page-title_employee_card">
          <span className="clickable_employee_card" onClick={() => navigate('/staff')}>
            Сотрудники
          </span>{' '}
          — Загрузка...
        </h1>
        <div className="account-page">
          <div className="account-column-left" />
          <div className="account-column-center">
            <div className="loading-state">
              <div className="loading-spinner" />
              <p>Загрузка данных...</p>
            </div>
          </div>
          <div className="account-column-right" />
        </div>
      </div>
    );
  }

  if (loadError && !userData.id) {
    return (
      <div className="employee-page_employee_card">
        <h1 className="page-title_employee_card">
          <span className="clickable_employee_card" onClick={() => navigate('/staff')}>
            Сотрудники
          </span>{' '}
          — Карточка сотрудника
        </h1>
        <div className="no-tasks-message_gantt_class">
          <div className="no-tasks-content_gantt_class">
            <span className="no-tasks-icon_gantt_class">⚠️</span>
            <h4>Ошибка загрузки</h4>
            <p>{loadError}</p>
            <button
              type="button"
              onClick={loadEmployeeData}
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

  if (!userData.id) {
    return (
      <div className="employee-page_employee_card">
        <h1 className="page-title_employee_card">
          <span className="clickable_employee_card" onClick={() => navigate('/staff')}>
            Сотрудники
          </span>{' '}
          — Карточка сотрудника
        </h1>
        <div className="no-tasks-message_gantt_class">
          <div className="no-tasks-content_gantt_class">
            <span className="no-tasks-icon_gantt_class">👤</span>
            <h4>Сотрудник не найден</h4>
            <p>Запрошенный сотрудник не существует или был удален</p>
            <button
              type="button"
              onClick={() => navigate('/staff')}
              className="gantt-back-btn_gantt_class"
              style={{ marginTop: '2vh' }}
            >
              Вернуться к списку сотрудников
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="employee-page_employee_card">
      <h1 className="page-title_employee_card">
        <span className="clickable_employee_card" onClick={() => navigate('/staff')}>
          Сотрудники
        </span>{' '}
        — {displayName}
      </h1>

      <div className="account-page">
        <img className="account-bg-svg" src={BackgoundFrame} alt="" aria-hidden="true" />

        <div className="account-column-left">
          <div className="account-avatar-anchor">{renderAvatar()}</div>
          <h2>{userData.name || 'Имя не указано'}</h2>
          <p className="user-info">{userData.post || 'Должность не указана'}</p>

          <AccountProjectsPanel
            useMockData={useMockData}
            navigate={navigate}
            headingId="employee-projects-heading"
            searchInputId="employee-projects-search"
          />
        </div>

        <div className="account-column-center">
          <div className="account-center-toolbar" aria-label="Раздел середины карточки сотрудника">
            <button
              type="button"
              className="account-center-tab"
              onClick={() => navigate('/schedule')}
            >
              График
            </button>
            <button
              type="button"
              className="account-center-tab"
              onClick={() =>
                navigate(
                  `/my-tasks?performer=${employeeId}&performerName=${encodeURIComponent(userData.name || '')}`
                )
              }
            >
              Список задач
            </button>
          </div>

          <section className="account-statistics-card" aria-labelledby="employee-director-heading">
            <div className="profile-card-header">
              <h3 id="employee-director-heading">Руководитель</h3>
            </div>
            <div
              className={`employee-director-body${userData.director?.id ? ' employee-director-body-clickable' : ''
                }`}
              onClick={userData.director?.id ? handleDirectorClick : undefined}
              onKeyDown={
                userData.director?.id
                  ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleDirectorClick();
                    }
                  }
                  : undefined
              }
              role={userData.director?.id ? 'button' : undefined}
              tabIndex={userData.director?.id ? 0 : undefined}
              aria-label={
                userData.director?.id
                  ? `Открыть карточку руководителя: ${userData.director?.name || ''}`
                  : undefined
              }
            >
              <div className="employee-director-avatar" aria-hidden="true">
                {directorPhotoUrl && !directorPhotoFailed ? (
                  <img
                    src={directorPhotoUrl}
                    alt=""
                    className="employee-director-avatar-img"
                    onError={() => setDirectorPhotoFailed(true)}
                  />
                ) : (
                  getDirectorInitials(userData.director?.name)
                )}
              </div>
              <div className="employee-director-meta">
                <div className="employee-director-name">
                  {userData.director?.name || 'Не назначен'}
                </div>
                <div className="employee-director-role">
                  {userData.director?.post ||
                    userData.director?.department_name ||
                    '—'}
                </div>
              </div>
            </div>
          </section>

          <section className="account-statistics-card" aria-labelledby="employee-statistics-heading">
            <div className="profile-card-header">
              <h3 id="employee-statistics-heading">Статистика сотрудника</h3>
            </div>
            <div className="account-statistics-chart">
              <div className="account-statistics-donut">
                <img
                  src={statisticDonutSrc}
                  alt=""
                  className="account-statistics-donut-img"
                  width={96}
                  height={96}
                  decoding="async"
                />
                <div className="account-statistics-donut-core" aria-hidden="true">
                  <span className="account-statistics-percent">
                    {userData.statistic_percent != null
                      ? `${userData.statistic_percent}%`
                      : '—'}
                  </span>
                  <span className="account-statistics-grade">
                    {userData.statistic_label ||
                      (userData.statistic_percent != null ? '' : 'Нет данных')}
                  </span>
                </div>
              </div>
            </div>
          </section>


        </div>

        <div className="account-column-right">
          <div className="profile-card">
            <div className="profile-card-header">
              <h3>Личная информация</h3>
            </div>
            <div className="profile-card-body">
              <div className="profile-field">
                <span className="profile-field-label">Почта</span>
                <span className="profile-field-value">
                  {profileForm.email || '—'}
                </span>
              </div>

              <div className="profile-field">
                <span className="profile-field-label">Номер телефона</span>
                <span className="profile-field-value">
                  {profileForm.phone || '—'}
                </span>
              </div>

              <div className="profile-field">
                <span className="profile-field-label">Телеграмм</span>
                <span className="profile-field-value">
                  {profileForm.telegram || '—'}
                </span>
              </div>

              <div className="profile-field">
                <span className="profile-field-label">Дата рождения</span>
                <span className="profile-field-value">
                  {profileForm.birthdate || '—'}
                </span>
              </div>

              <div className="profile-field">
                <span className="profile-field-label">Мечта ❤️</span>
                <span className="profile-field-value profile-field-value-multiline">
                  {profileForm.dream || 'Мечтает заполнить это поле((('}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bottom-cards_employee_card">
        <div className="stat-card_employee_card">
          <div className="stat-number_employee_card">{userData.current_tasks ?? 0}</div>
          <div className="stat-label_employee_card">Текущие задачи</div>
        </div>
        <div className="stat-card_employee_card">
          <div className="stat-number_employee_card">{userData.closed_late_tasks ?? 0}</div>
          <div className="stat-label_employee_card">Не закрытые в срок</div>
        </div>
        <div className="stat-card_employee_card">
          <div className="stat-number_employee_card">{userData.closed_on_time_tasks ?? 0}</div>
          <div className="stat-label_employee_card">Закрытые в срок</div>
        </div>
        <div className="stat-card_employee_card">
          <div className="stat-number_employee_card">{userData.failed_tasks ?? 0}</div>
          <div className="stat-label_employee_card">Проваленные задачи</div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeCard;
