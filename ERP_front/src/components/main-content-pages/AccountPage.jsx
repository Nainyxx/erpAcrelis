import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEmployeeById, updateEmployeeById } from '../../services/api';
import { AccountProjectsPanel } from '../shared/AccountProjectsPanel';
import { PageLoading } from '../shared/PageLoading';
import { AvatarPhoto } from '../shared/AvatarPhoto';
import './AccountPage.css';
import { MY_TASKS_NAV_QUERY_STORAGE_KEY } from '../../constants/navigationKeys';
import BackgoundFrame from "../../assets/Frame-account.svg";
import statisticDonutSrc from '../../assets/statistic-account.svg';

function AccountPage({ useMockData = false }) {
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
    const [isProfileEditing, setIsProfileEditing] = useState(false);
    const [isProfileSaving, setIsProfileSaving] = useState(false);
    const [error, setError] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [profileForm, setProfileForm] = useState({
        email: 'email@mail.ru',
        phone: '+7 (900) 123-45-67',
        telegram: '@username',
        birthdate: '05.07.2006',
        dream: 'Я хочу печеньки в офис...'
    });
    const [originalProfileForm, setOriginalProfileForm] = useState({
        email: '',
        phone: '',
        telegram: '',
        birthdate: '',
        dream: ''
    });
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchAccountData();
    }, []);

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

    const formatPhoneForAPI = (phone) => {
        if (!phone) return '';

        const cleaned = phone.replace(/\D/g, '');
        if (!cleaned) return '';
        if (cleaned.startsWith('7') || cleaned.startsWith('8')) return cleaned;
        if (cleaned.length === 10) return `7${cleaned}`;
        return cleaned;
    };

    const formatBirthDateForAPI = (birthDate) => {
        if (!birthDate) return '';
        if (/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) return birthDate;

        if (/^\d{2}\.\d{2}\.\d{4}$/.test(birthDate)) {
            const [day, month, year] = birthDate.split('.');
            return `${year}-${month}-${day}`;
        }

        return '';
    };

    const formatTelegramForAPI = (telegram) => {
        if (!telegram) return '';
        const trimmed = telegram.trim();
        if (!trimmed) return '';
        if (trimmed.startsWith('@')) return trimmed.slice(1);

        const match = trimmed.match(/t\.me\/([a-zA-Z0-9_]+)/);
        if (match && match[1]) return match[1];

        return trimmed;
    };

    const fetchAccountData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const staffId = localStorage.getItem('staff_id');
            if (!staffId) {
                throw new Error('Не удалось определить сотрудника');
            }

            const employeeData = await getEmployeeById(staffId, false);

            const formattedData = {
                id: employeeData.id,
                name: employeeData.name || '',
                post: employeeData.post || '',
                director: employeeData.director || { name: '' },
                image: employeeData.image || null,
                image_url: employeeData.image_url || null,
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
            setOriginalProfileForm(nextProfileForm);

            localStorage.setItem('name', formattedData.name);
            localStorage.setItem('post', formattedData.post);
            localStorage.setItem('email', employeeData.email || '');
        } catch (loadError) {
            setError(loadError.message);
            setUserData({
                id: parseInt(localStorage.getItem('staff_id')) || null,
                name: localStorage.getItem('name') || '',
                post: localStorage.getItem('post') || '',
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
            const fallbackProfileForm = {
                email: localStorage.getItem('email') || '',
                phone: '',
                telegram: '',
                birthdate: '',
                dream: ''
            };
            setProfileForm(fallbackProfileForm);
            setOriginalProfileForm(fallbackProfileForm);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAvatarClick = () => {
        if (isProfileEditing && fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Пожалуйста, выберите изображение (JPEG, PNG, GIF)');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('Размер файла не должен превышать 5MB');
            return;
        }

        const imageUrl = URL.createObjectURL(file);
        setImagePreview((prev) => {
            if (prev && typeof prev === 'string' && prev.startsWith('blob:')) {
                URL.revokeObjectURL(prev);
            }
            return imageUrl;
        });
        setImageFile(file);
        setError(null);
        event.target.value = '';
    };

    const handleProfileFieldChange = (event) => {
        const { name, value } = event.target;
        setError(null);
        setProfileForm((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleProfileEditButtonClick = async () => {
        if (!isProfileEditing) {
            setError(null);
            setIsProfileEditing(true);
            return;
        }

        const hasScalarChanges =
            profileForm.email !== originalProfileForm.email ||
            profileForm.phone !== originalProfileForm.phone ||
            profileForm.telegram !== originalProfileForm.telegram ||
            profileForm.birthdate !== originalProfileForm.birthdate;

        if (!imageFile && !hasScalarChanges) {
            setIsProfileEditing(false);
            setImagePreview((prev) => {
                if (prev && typeof prev === 'string' && prev.startsWith('blob:')) {
                    URL.revokeObjectURL(prev);
                }
                return null;
            });
            setImageFile(null);
            return;
        }

        if (!userData.id) {
            setError('ID сотрудника не найден');
            return;
        }

        setIsProfileSaving(true);
        setError(null);

        try {
            const payload = {};

            if (profileForm.email !== originalProfileForm.email) {
                payload.email = profileForm.email.trim();
            }

            if (profileForm.phone !== originalProfileForm.phone) {
                payload.phone = formatPhoneForAPI(profileForm.phone);
            }

            if (profileForm.telegram !== originalProfileForm.telegram) {
                payload.telegram = formatTelegramForAPI(profileForm.telegram);
            }

            if (profileForm.birthdate !== originalProfileForm.birthdate) {
                payload.birthday = formatBirthDateForAPI(profileForm.birthdate);
            }

            if (imageFile) {
                payload.image = imageFile;
            }

            if (Object.keys(payload).length === 0) {
                setImagePreview((prev) => {
                    if (prev && typeof prev === 'string' && prev.startsWith('blob:')) {
                        URL.revokeObjectURL(prev);
                    }
                    return null;
                });
                setImageFile(null);
                setIsProfileEditing(false);
                return;
            }

            await updateEmployeeById(userData.id, payload, false);

            setImagePreview((prev) => {
                if (prev && typeof prev === 'string' && prev.startsWith('blob:')) {
                    URL.revokeObjectURL(prev);
                }
                return null;
            });
            setImageFile(null);
            setIsProfileEditing(false);
            await fetchAccountData();
        } catch (saveError) {
            setError(saveError.message || 'Ошибка при сохранении данных');
        } finally {
            setIsProfileSaving(false);
        }
    };

    const renderAvatar = () => {
        if (imagePreview) {
            return (
                <div
                    className={`avatar-container ${isProfileEditing ? 'editable' : ''}`}
                    onClick={handleAvatarClick}
                    title={isProfileEditing ? 'Нажмите для изменения фото' : ''}
                >
                    <AvatarPhoto
                        src={imagePreview}
                        alt="Предпросмотр"
                        imgClassName="avatar-image"
                    />
                    {isProfileEditing && (
                        <div className="avatar-overlay">
                            <span>Изменить фото</span>
                        </div>
                    )}
                </div>
            );
        } else if (userData.image || userData.image_url) {
            const imageSrc = userData.image || userData.image_url;
            return (
                <div
                    className={`avatar-container ${isProfileEditing ? 'editable' : ''}`}
                    onClick={handleAvatarClick}
                    title={isProfileEditing ? 'Нажмите для изменения фото' : ''}
                >
                    <AvatarPhoto
                        src={imageSrc}
                        alt={userData.name || ''}
                        imgClassName="avatar-image"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            const svg = e.target.closest('.avatar-container')?.querySelector('svg');
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
                    {isProfileEditing && (
                        <div className="avatar-overlay">
                            <span>Изменить фото</span>
                        </div>
                    )}
                </div>
            );
        } else {
            return (
                <div
                    className={`avatar-container ${isProfileEditing ? 'editable' : ''}`}
                    onClick={handleAvatarClick}
                    title={isProfileEditing ? "Нажмите для добавления фото" : ""}
                >
                    <svg width="20.9vh" height="20.9vh" viewBox="0 0 209 209" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="104.5" cy="104.5" r="104.5" fill="#E5E5E5" />
                        <path d="M104.5 42.5C119.35 42.5 131.5 56.3132 131.5 73.5C131.5 90.6868 119.35 104.5 104.5 104.5C89.6499 104.5 77.5 90.6868 77.5 73.5C77.5 56.3132 89.6499 42.5 104.5 42.5Z" stroke="#26262C" />
                        <path d="M56 151.5C56 145.919 57.2674 140.392 59.7299 135.236C62.1924 130.08 65.8017 125.394 70.3518 121.448C74.9018 117.501 80.3036 114.371 86.2485 112.235C92.1935 110.099 98.5652 109 105 109C111.435 109 117.807 110.099 123.751 112.235C129.696 114.371 135.098 117.501 139.648 121.448C144.198 125.394 147.808 130.08 150.27 135.236C152.733 140.392 154 145.919 154 151.5L153.917 151.5C153.917 145.928 152.651 140.411 150.193 135.264C147.735 130.116 144.132 125.439 139.589 121.499C135.047 117.559 129.654 114.434 123.72 112.302C117.785 110.17 111.424 109.072 105 109.072C98.5762 109.072 92.2153 110.17 86.2805 112.302C80.3456 114.434 74.9531 117.559 70.4108 121.499C65.8685 125.439 62.2653 130.116 59.807 135.264C57.3487 140.411 56.0835 145.928 56.0835 151.5L56 151.5Z" stroke="#26262C" />
                    </svg>
                    {isProfileEditing && (
                        <div className="avatar-overlay">
                            <span>Добавить фото</span>
                        </div>
                    )}
                </div>
            );
        }
    };

    if (isLoading) {
        return (
            <div className="account-page">
                <div className="account-column-left"></div>
                <div className="account-column-center">
                    <PageLoading title="Загрузка данных..." />
                </div>
                <div className="account-column-right"></div>
            </div>
        );
    }

    return (
        <div className="account-page">
            <img
                className="account-bg-svg"
                src={BackgoundFrame}
                alt=""
                aria-hidden="true"
            />

            <div className="account-column-left">
                <input
                    type="file"
                    ref={fileInputRef}
                    className="account-avatar-file-input"
                    accept="image/*"
                    aria-hidden="true"
                    tabIndex={-1}
                    onChange={handleFileChange}
                />
                <div className="account-avatar-anchor">
                    {renderAvatar()}
                </div>
                <h2>{userData.name || 'Имя не указано'}</h2>
                <p className="user-info">{userData.post || 'Должность не указана'}</p>
                <p className="user-info">Руководитель: {userData.director?.name || 'не указан'}</p>

                <div className="left-stats-list">
                    <div className="left-stat-item">
                        <span>Текущие задачи:</span>
                        <span>{userData.current_tasks ?? 0}</span>
                    </div>
                    <div className="left-stat-item">
                        <span>Не закрытые в срок:</span>
                        <span>{userData.closed_late_tasks ?? 0}</span>
                    </div>
                    <div className="left-stat-item">
                        <span>Закрытые в срок:</span>
                        <span>{userData.closed_on_time_tasks ?? 0}</span>
                    </div>
                    <div className="left-stat-item" style={{ marginBottom: '0' }}>
                        <span>Проваленные задачи:</span>
                        <span>{userData.failed_tasks ?? 0}</span>
                    </div>
                </div>
            </div>
            <div className="account-column-center">
                <div className="account-center-toolbar" aria-label="Раздел середины профиля">
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
                        onClick={() => {
                            try {
                                const saved = sessionStorage.getItem(MY_TASKS_NAV_QUERY_STORAGE_KEY) || '';
                                navigate(saved ? `/my-tasks${saved}` : '/my-tasks');
                            } catch (_) {
                                navigate('/my-tasks');
                            }
                        }}
                    >
                        Список задач
                    </button>
                </div>
                <section className="account-statistics-card" aria-labelledby="account-statistics-heading">
                    <div className="profile-card-header">
                        <h3 id="account-statistics-heading">Статистика сотрудника</h3>
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
                                    {userData.statistic_label || (userData.statistic_percent != null ? '' : 'Нет данных')}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                <AccountProjectsPanel
                    useMockData={useMockData}
                    navigate={navigate}
                    headingId="account-projects-heading"
                    searchInputId="account-projects-search"
                />

            </div>
            <div className="account-column-right">
                <div className="profile-card">
                    <div className="profile-card-header">
                        <h3>Личная информация</h3>
                        <button
                            type="button"
                            className={`profile-edit-button ${isProfileEditing ? 'is-active' : ''}`}
                            aria-label={isProfileEditing ? 'Завершить редактирование профиля' : 'Редактировать профиль'}
                            onClick={handleProfileEditButtonClick}
                            disabled={isProfileSaving}
                        >
                            {isProfileSaving ? '…' : (isProfileEditing ? '✓' : '✎')}
                        </button>
                    </div>
                    <div className="profile-card-body">
                        {error && <p className="profile-error-text">{error}</p>}

                        <div className="profile-field">
                            <label htmlFor="profile-email">Почта</label>
                            <input
                                id="profile-email"
                                name="email"
                                type="text"
                                value={profileForm.email}
                                readOnly={!isProfileEditing}
                                onChange={handleProfileFieldChange}
                            />
                        </div>

                        <div className="profile-field">
                            <label htmlFor="profile-phone">Номер телефона</label>
                            <input
                                id="profile-phone"
                                name="phone"
                                type="text"
                                value={profileForm.phone}
                                readOnly={!isProfileEditing}
                                onChange={handleProfileFieldChange}
                            />
                        </div>

                        <div className="profile-field">
                            <label htmlFor="profile-telegram">Телеграмм</label>
                            <input
                                id="profile-telegram"
                                name="telegram"
                                type="text"
                                value={profileForm.telegram}
                                readOnly={!isProfileEditing}
                                onChange={handleProfileFieldChange}
                            />
                        </div>

                        <div className="profile-field">
                            <label htmlFor="profile-birthdate">Дата рождения</label>
                            <input
                                id="profile-birthdate"
                                name="birthdate"
                                type="text"
                                value={profileForm.birthdate}
                                readOnly={!isProfileEditing}
                                onChange={handleProfileFieldChange}
                            />
                        </div>

                        <div className="profile-field">
                            <label htmlFor="profile-dream">Мечта ❤️</label>
                            <textarea
                                id="profile-dream"
                                name="dream"
                                rows="3"
                                value={profileForm.dream}
                                readOnly={!isProfileEditing}
                                onChange={handleProfileFieldChange}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AccountPage;