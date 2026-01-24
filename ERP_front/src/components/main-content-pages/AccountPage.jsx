import React, { useState, useEffect } from 'react';
import { getCurrentUser, getEmployeeById } from '../../services/api/api';
import './AccountPage.css';

function AccountPage() {
    const [userData, setUserData] = useState({
        name: '',
        post: '',
        email: '',
        telegram: '@username',
        phone: '+7 (XXX) XXX-XX-XX',
        birthDate: '01.01.1990',
        director: {
            name: '',
            post: ''
        }
    });
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchAccountData();
    }, []);

    const fetchAccountData = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            // Получаем текущего пользователя из localStorage/токена
            const currentUser = getCurrentUser();
            
            if (!currentUser || !currentUser.staff_id) {
                throw new Error('Не удалось определить сотрудника');
            }

            // Используем USE_MOCK_DATA = false для реальных данных
            const USE_MOCK_DATA = false;
            
            // Получаем данные сотрудника через API
            const employeeData = await getEmployeeById(currentUser.staff_id, USE_MOCK_DATA);
            
            // Форматируем данные для отображения
            const formattedData = {
                name: employeeData.name || currentUser.name || '',
                post: employeeData.position || employeeData.post || currentUser.post || '',
                email: employeeData.email || currentUser.email || '',
                telegram: employeeData.telegram || '@username',
                phone: employeeData.phone || '+7 (XXX) XXX-XX-XX',
                birthDate: formatBirthDate(employeeData.birthday) || '01.01.1990',
                director: employeeData.director || { name: '', post: '' }
            };
            
            setUserData(formattedData);
            
        } catch (error) {
            console.error('Ошибка загрузки данных аккаунта:', error);
            setError(error.message);
            
            // Fallback: используем данные из localStorage
            const name = localStorage.getItem('name') || '';
            const post = localStorage.getItem('post') || '';
            const email = localStorage.getItem('email') || '';
            
            setUserData(prev => ({
                ...prev,
                name,
                post,
                email
            }));
        } finally {
            setIsLoading(false);
        }
    };

    const formatBirthDate = (dateString) => {
        if (!dateString) return '';
        
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month, day] = dateString.split('-');
            return `${day}.${month}.${year}`;
        }
        
        return dateString;
    };

    if (isLoading) {
        return (
            <div className="account-page-container">
                <div className="account-card">
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Загрузка данных...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !userData.name) {
        return (
            <div className="account-page-container">
                <div className="account-card">
                    <div className="error-state">
                        <p className="error-message">Ошибка загрузки данных: {error}</p>
                        <button 
                            className="retry-button"
                            onClick={fetchAccountData}
                        >
                            Повторить попытку
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="account-page-container">
            <div className="account-card">
                {/* Кнопка редактирования */}
                <button className="edit-button">
                    Редактировать
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 13.3333H14M11 2.33333C11.2652 2.06811 11.6249 1.91905 12 1.91905C12.1857 1.91905 12.3696 1.95566 12.5412 2.02667C12.7128 2.09768 12.8687 2.20165 13 2.33333C13.1313 2.46501 13.2355 2.62115 13.3066 2.79306C13.3778 2.96497 13.4144 3.14917 13.4144 3.33521C13.4144 3.52125 13.3778 3.70545 13.3066 3.87736C13.2355 4.04927 13.1313 4.20541 13 4.33709L4.66667 12.6667L2 13.3333L2.66667 10.6667L11 2.33333Z" stroke="#0066CC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>

                {/* Основная информация */}
                <div className="profile-section">
                    {/* Аватарка */}
                    <div className="avatar-container">
                        <svg width="20.9vh" height="20.9vh" viewBox="0 0 209 209" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="104.5" cy="104.5" r="104.5" fill="#E5E5E5"/>
                            <path d="M104.5 42.5C119.35 42.5 131.5 56.3132 131.5 73.5C131.5 90.6868 119.35 104.5 104.5 104.5C89.6499 104.5 77.5 90.6868 77.5 73.5C77.5 56.3132 89.6499 42.5 104.5 42.5Z" stroke="#26262C"/>
                            <path d="M56 151.5C56 145.919 57.2674 140.392 59.7299 135.236C62.1924 130.08 65.8017 125.394 70.3518 121.448C74.9018 117.501 80.3036 114.371 86.2485 112.235C92.1935 110.099 98.5652 109 105 109C111.435 109 117.807 110.099 123.751 112.235C129.696 114.371 135.098 117.501 139.648 121.448C144.198 125.394 147.808 130.08 150.27 135.236C152.733 140.392 154 145.919 154 151.5L153.917 151.5C153.917 145.928 152.651 140.411 150.193 135.264C147.735 130.116 144.132 125.439 139.589 121.499C135.047 117.559 129.654 114.434 123.72 112.302C117.785 110.17 111.424 109.072 105 109.072C98.5762 109.072 92.2153 110.17 86.2805 112.302C80.3456 114.434 74.9531 117.559 70.4108 121.499C65.8685 125.439 62.2653 130.116 59.807 135.264C57.3487 140.411 56.0835 145.928 56.0835 151.5L56 151.5Z" stroke="#26262C"/>
                        </svg>
                    </div>

                    {/* Имя и должность */}
                    <div className="name-section">
                        <h1 className="user-name">{userData.name || 'Имя не указано'}</h1>
                        <p className="user-post">{userData.post || 'Должность не указана'}</p>
                        {userData.director && userData.director.name && (
                            <p className="user-director">
                                <span className="director-label">Руководитель: </span>
                                <span className="director-name">{userData.director.name}</span>
                            </p>
                        )}
                    </div>
                </div>

                {/* Личная информация */}
                <div className="personal-info-section">
                    <h2 className="section-title">Личная информация</h2>
                    
                    {/* Первая строка: Email и Telegram */}
                    <div className="input-row">
                        <div className="input-group">
                            <label className="input-label">Email</label>
                            <div className="input-field">
                                <input 
                                    type="email" 
                                    value={userData.email}
                                    readOnly
                                    className="readonly-input"
                                />
                            </div>
                        </div>
                        
                        <div className="input-group">
                            <label className="input-label">Telegram</label>
                            <div className="input-field">
                                <input 
                                    type="text" 
                                    value={userData.telegram}
                                    readOnly
                                    className="readonly-input"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Вторая строка: Телефон и Дата рождения */}
                    <div className="input-row">
                        <div className="input-group">
                            <label className="input-label">Телефон</label>
                            <div className="input-field">
                                <input 
                                    type="tel" 
                                    value={formatPhoneNumber(userData.phone)}
                                    readOnly
                                    className="readonly-input"
                                />
                            </div>
                        </div>
                        
                        <div className="input-group">
                            <label className="input-label">Дата рождения</label>
                            <div className="input-field">
                                <input 
                                    type="text" 
                                    value={userData.birthDate}
                                    readOnly
                                    className="readonly-input"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Функция для форматирования номера телефона
function formatPhoneNumber(phone) {
    if (!phone) return '+7 (XXX) XXX-XX-XX';
    
    // Если номер уже отформатирован
    if (phone.includes('(') || phone.includes(')')) {
        return phone;
    }
    
    // Убираем все нецифровые символы
    const cleaned = phone.replace(/\D/g, '');
    
    // Форматируем российский номер
    if (cleaned.length === 11) {
        // Формат: +7 (XXX) XXX-XX-XX
        return `+7 (${cleaned.substring(1, 4)}) ${cleaned.substring(4, 7)}-${cleaned.substring(7, 9)}-${cleaned.substring(9)}`;
    } else if (cleaned.length === 10) {
        // Формат: +7 (XXX) XXX-XX-XX (без первой 7/8)
        return `+7 (${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 8)}-${cleaned.substring(8)}`;
    }
    
    // Если не удалось отформатировать, возвращаем как есть
    return phone;
}

export default AccountPage;