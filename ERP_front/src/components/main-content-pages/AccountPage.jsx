// ERP_front/src/components/main-content-pages/AccountPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { getEmployeeById, authFetch } from '../../services/api/api';
import './AccountPage.css';

function AccountPage() {
    const [userData, setUserData] = useState({
        id: null,
        name: '',
        post: '',
        email: '',
        telegram: '',
        phone: '',
        birthday: '',
        birthDate: '',
        image: null,
        image_url: null,
        director: {
            id: null,
            name: '',
            post: ''
        },
        department: '',
        department_name: '',
        is_active: true,
        created: ''
    });
    
    const [originalData, setOriginalData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    
    const fileInputRef = useRef(null);
    const nameRef = useRef(null);
    const postRef = useRef(null);
    const emailRef = useRef(null);
    const telegramRef = useRef(null);
    const phoneRef = useRef(null);
    const birthDateRef = useRef(null);

    useEffect(() => {
        fetchAccountData();
    }, []);

    const fetchAccountData = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
            const staffId = localStorage.getItem('staff_id');
            
            if (!staffId) {
                throw new Error('Не удалось определить сотрудника');
            }

            // Получаем полные данные сотрудника из API
            const response = await authFetch(`https://api.acrelis.ru/staff/staff/${staffId}/`, {
                method: 'GET'
            });

            if (!response.ok) {
                throw new Error(`Ошибка загрузки данных: ${response.status}`);
            }

            const employeeData = await response.json();
            
            console.log('Полученные данные сотрудника:', employeeData);
            
            // Форматируем телефон для отображения
            const formattedPhone = formatPhoneForDisplay(employeeData.phone);
            
            // Автоматически форматируем дату рождения
            const formattedBirthDate = formatBirthDateForDisplay(employeeData.birthday);
            
            const formattedData = {
                id: employeeData.id,
                name: employeeData.name || '',
                post: employeeData.post || '',
                email: employeeData.email || '',
                telegram: employeeData.telegram || '',
                phone: formattedPhone,
                originalPhone: employeeData.phone || '', // Сохраняем оригинальный номер
                birthday: employeeData.birthday || '',
                birthDate: formattedBirthDate,
                image: employeeData.image || null,
                image_url: employeeData.image_url || null,
                director: employeeData.director || { id: null, name: '', post: '' },
                department: employeeData.department || '',
                department_name: employeeData.department_name || '',
                is_active: employeeData.is_active !== undefined ? employeeData.is_active : true,
                created: employeeData.created || ''
            };
            
            setUserData(formattedData);
            setOriginalData(formattedData);
            
            // Обновляем localStorage актуальными данными
            localStorage.setItem('name', formattedData.name);
            localStorage.setItem('post', formattedData.post);
            localStorage.setItem('email', formattedData.email);
            
        } catch (error) {
            console.error('Ошибка загрузки данных аккаунта:', error);
            setError(error.message);
            
            // Fallback на данные из localStorage
            const fallbackData = {
                id: parseInt(localStorage.getItem('staff_id')) || null,
                name: localStorage.getItem('name') || '',
                post: localStorage.getItem('post') || '',
                email: localStorage.getItem('email') || '',
                telegram: '',
                phone: '',
                birthday: '',
                birthDate: '',
                image: null,
                image_url: null,
                director: { id: null, name: '', post: '' },
                department: '',
                department_name: '',
                is_active: true,
                created: ''
            };
            
            setUserData(fallbackData);
            setOriginalData(fallbackData);
        } finally {
            setIsLoading(false);
        }
    };

    const formatBirthDateForDisplay = (dateString) => {
        if (!dateString) return '';
        
        try {
            // Если это уже отформатированная дата DD.MM.YYYY, возвращаем как есть
            if (dateString.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
                return dateString;
            }
            
            // Пытаемся разобрать дату в формате YYYY-MM-DD
            if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
                const date = new Date(dateString);
                if (!isNaN(date.getTime())) {
                    const day = String(date.getDate()).padStart(2, '0');
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const year = date.getFullYear();
                    return `${day}.${month}.${year}`;
                }
            }
            
            // Если это ISO строка
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                return `${day}.${month}.${year}`;
            }
            
            return dateString;
        } catch (error) {
            console.error('Ошибка форматирования даты:', error);
            return dateString;
        }
    };

    const formatDateForAPI = (dateString) => {
        if (!dateString) return '';
        
        try {
            // Если дата в формате DD.MM.YYYY
            if (dateString.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
                const [day, month, year] = dateString.split('.');
                const date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
                if (!isNaN(date.getTime())) {
                    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                }
            }
            
            // Если это уже YYYY-MM-DD формат
            if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
                return dateString;
            }
            
            // Пытаемся разобрать любую дату
            const date = new Date(dateString);
            if (!isNaN(date.getTime())) {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            }
            
            return '';
        } catch (error) {
            console.error('Ошибка конвертации даты для API:', error);
            return '';
        }
    };

    const formatPhoneForDisplay = (phone) => {
        if (!phone) return '';
        
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
        } else if (cleaned.length === 12 && cleaned.startsWith('7')) {
            // Формат: +7 (XXX) XXX-XX-XX (уже с +7 в начале)
            return `+7 (${cleaned.substring(1, 4)}) ${cleaned.substring(4, 7)}-${cleaned.substring(7, 9)}-${cleaned.substring(9)}`;
        }
        
        // Если не удалось отформатировать, возвращаем как есть
        return phone;
    };

    const formatPhoneForAPI = (phone) => {
        if (!phone) return '';
        
        // Убираем все нецифровые символы
        const cleaned = phone.replace(/\D/g, '');
        
        // Если номер начинается с 7 или 8, оставляем как есть
        if (cleaned.startsWith('7') || cleaned.startsWith('8')) {
            return cleaned;
        }
        
        // Если номер начинается с других цифр, добавляем 7
        if (cleaned.length === 10) {
            return '7' + cleaned;
        }
        
        return cleaned;
    };

    const handleEditClick = () => {
        setIsEditing(true);
        setError(null);
    };

    const handleCancelClick = () => {
        setUserData(originalData);
        setIsEditing(false);
        setError(null);
        setImageFile(null);
        setImagePreview(null);
    };

    const handleSaveClick = async () => {
        if (!userData.id) {
            setError('ID сотрудника не найден');
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            const formData = new FormData();
            let hasChanges = false;
            
            // Получаем текущие значения из редактируемых полей
            const currentName = nameRef.current?.textContent || userData.name;
            const currentPost = postRef.current?.textContent || userData.post;
            const currentEmail = emailRef.current?.textContent || userData.email;
            const currentTelegram = telegramRef.current?.textContent || userData.telegram;
            const currentPhone = phoneRef.current?.textContent || userData.phone;
            const currentBirthDate = birthDateRef.current?.textContent || userData.birthDate;
            
            console.log('Текущие значения:', {
                name: currentName,
                post: currentPost,
                email: currentEmail,
                telegram: currentTelegram,
                phone: currentPhone,
                birthDate: currentBirthDate
            });

            // Проверяем изменения и добавляем в formData
            if (currentName !== originalData.name) {
                formData.append('name', currentName);
                hasChanges = true;
                console.log('Изменено имя:', currentName);
            }
            
            if (currentPost !== originalData.post) {
                formData.append('post', currentPost);
                hasChanges = true;
                console.log('Изменена должность:', currentPost);
            }
            
            if (currentEmail !== originalData.email) {
                formData.append('email', currentEmail);
                hasChanges = true;
                console.log('Изменен email:', currentEmail);
            }
            
            if (currentTelegram !== originalData.telegram) {
                formData.append('telegram', currentTelegram);
                hasChanges = true;
                console.log('Изменен telegram:', currentTelegram);
            }
            
            if (currentPhone !== originalData.phone) {
                const cleanPhone = formatPhoneForAPI(currentPhone);
                formData.append('phone', cleanPhone);
                hasChanges = true;
                console.log('Изменен телефон:', cleanPhone);
            }
            
            if (currentBirthDate !== originalData.birthDate) {
                const apiDate = formatDateForAPI(currentBirthDate);
                if (apiDate) {
                    formData.append('birthday', apiDate);
                    hasChanges = true;
                    console.log('Изменена дата рождения:', apiDate);
                }
            }
            
            // Добавляем новое изображение если есть
            if (imageFile) {
                formData.append('image', imageFile);
                hasChanges = true;
                console.log('Добавлено новое изображение');
            }

            if (!hasChanges) {
                setError('Нет изменений для сохранения');
                setIsSaving(false);
                return;
            }

            console.log('Отправляем PATCH запрос с данными:', {
                id: userData.id,
                hasChanges: hasChanges
            });

            // Отправляем PATCH запрос
            const response = await authFetch(`https://api.acrelis.ru/staff/staff/${userData.id}/`, {
                method: 'PATCH',
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Ошибка API:', errorText);
                throw new Error(`Ошибка сохранения: ${response.status} - ${errorText}`);
            }

            const updatedData = await response.json();
            console.log('Ответ от сервера:', updatedData);
            
            // Обновляем локальные данные
            const formattedUpdatedData = {
                id: updatedData.id,
                name: updatedData.name,
                post: updatedData.post,
                email: updatedData.email,
                telegram: updatedData.telegram || '',
                phone: formatPhoneForDisplay(updatedData.phone),
                originalPhone: updatedData.phone || '',
                birthday: updatedData.birthday || '',
                birthDate: formatBirthDateForDisplay(updatedData.birthday), // Автоматическое форматирование
                image: updatedData.image || updatedData.image_url || null,
                image_url: updatedData.image_url || updatedData.image || null,
                director: updatedData.director || userData.director,
                department: updatedData.department || '',
                department_name: updatedData.department_name || '',
                is_active: updatedData.is_active !== undefined ? updatedData.is_active : true,
                created: updatedData.created || userData.created
            };
            
            setUserData(formattedUpdatedData);
            setOriginalData(formattedUpdatedData);
            setIsEditing(false);
            setImageFile(null);
            setImagePreview(null);
            
            // Обновляем localStorage
            localStorage.setItem('name', formattedUpdatedData.name);
            localStorage.setItem('post', formattedUpdatedData.post);
            localStorage.setItem('email', formattedUpdatedData.email);
            
            console.log('Данные успешно сохранены и обновлены');
            
        } catch (error) {
            console.error('Ошибка сохранения данных:', error);
            setError(error.message || 'Ошибка при сохранении данных');
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarClick = () => {
        if (isEditing && fileInputRef.current) {
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
        setImageFile(file);
        setImagePreview(imageUrl);
        setError(null);
    };

    const renderAvatar = () => {
        if (imagePreview) {
            return (
                <div 
                    className={`avatar-container ${isEditing ? 'editable' : ''}`}
                    onClick={handleAvatarClick}
                    title={isEditing ? "Нажмите для изменения фото" : ""}
                >
                    <img 
                        src={imagePreview} 
                        alt="Предпросмотр" 
                        className="avatar-image"
                    />
                    {isEditing && (
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
                    className={`avatar-container ${isEditing ? 'editable' : ''}`}
                    onClick={handleAvatarClick}
                    title={isEditing ? "Нажмите для изменения фото" : ""}
                >
                    <img 
                        src={imageSrc} 
                        alt={userData.name} 
                        className="avatar-image"
                        onError={(e) => {
                            // Если изображение не загружается, показываем SVG
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
                        <circle cx="104.5" cy="104.5" r="104.5" fill="#E5E5E5"/>
                        <path d="M104.5 42.5C119.35 42.5 131.5 56.3132 131.5 73.5C131.5 90.6868 119.35 104.5 104.5 104.5C89.6499 104.5 77.5 90.6868 77.5 73.5C77.5 56.3132 89.6499 42.5 104.5 42.5Z" stroke="#26262C"/>
                        <path d="M56 151.5C56 145.919 57.2674 140.392 59.7299 135.236C62.1924 130.08 65.8017 125.394 70.3518 121.448C74.9018 117.501 80.3036 114.371 86.2485 112.235C92.1935 110.099 98.5652 109 105 109C111.435 109 117.807 110.099 123.751 112.235C129.696 114.371 135.098 117.501 139.648 121.448C144.198 125.394 147.808 130.08 150.27 135.236C152.733 140.392 154 145.919 154 151.5L153.917 151.5C153.917 145.928 152.651 140.411 150.193 135.264C147.735 130.116 144.132 125.439 139.589 121.499C135.047 117.559 129.654 114.434 123.72 112.302C117.785 110.17 111.424 109.072 105 109.072C98.5762 109.072 92.2153 110.17 86.2805 112.302C80.3456 114.434 74.9531 117.559 70.4108 121.499C65.8685 125.439 62.2653 130.116 59.807 135.264C57.3487 140.411 56.0835 145.928 56.0835 151.5L56 151.5Z" stroke="#26262C"/>
                    </svg>
                    {isEditing && (
                        <div className="avatar-overlay">
                            <span>Изменить фото</span>
                        </div>
                    )}
                </div>
            );
        } else {
            return (
                <div 
                    className={`avatar-container ${isEditing ? 'editable' : ''}`}
                    onClick={handleAvatarClick}
                    title={isEditing ? "Нажмите для добавления фото" : ""}
                >
                    <svg width="20.9vh" height="20.9vh" viewBox="0 0 209 209" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="104.5" cy="104.5" r="104.5" fill="#E5E5E5"/>
                        <path d="M104.5 42.5C119.35 42.5 131.5 56.3132 131.5 73.5C131.5 90.6868 119.35 104.5 104.5 104.5C89.6499 104.5 77.5 90.6868 77.5 73.5C77.5 56.3132 89.6499 42.5 104.5 42.5Z" stroke="#26262C"/>
                        <path d="M56 151.5C56 145.919 57.2674 140.392 59.7299 135.236C62.1924 130.08 65.8017 125.394 70.3518 121.448C74.9018 117.501 80.3036 114.371 86.2485 112.235C92.1935 110.099 98.5652 109 105 109C111.435 109 117.807 110.099 123.751 112.235C129.696 114.371 135.098 117.501 139.648 121.448C144.198 125.394 147.808 130.08 150.27 135.236C152.733 140.392 154 145.919 154 151.5L153.917 151.5C153.917 145.928 152.651 140.411 150.193 135.264C147.735 130.116 144.132 125.439 139.589 121.499C135.047 117.559 129.654 114.434 123.72 112.302C117.785 110.17 111.424 109.072 105 109.072C98.5762 109.072 92.2153 110.17 86.2805 112.302C80.3456 114.434 74.9531 117.559 70.4108 121.499C65.8685 125.439 62.2653 130.116 59.807 135.264C57.3487 140.411 56.0835 145.928 56.0835 151.5L56 151.5Z" stroke="#26262C"/>
                    </svg>
                    {isEditing && (
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
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleFileChange}
                />

                {!isEditing ? (
                    <button 
                        className="edit-button"
                        onClick={handleEditClick}
                    >
                        Редактировать
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 13.3333H14M11 2.33333C11.2652 2.06811 11.6249 1.91905 12 1.91905C12.1857 1.91905 12.3696 1.95566 12.5412 2.02667C12.7128 2.09768 12.8687 2.20165 13 2.33333C13.1313 2.46501 13.2355 2.62115 13.3066 2.79306C13.3778 2.96497 13.4144 3.14917 13.4144 3.33521C13.4144 3.52125 13.3778 3.70545 13.3066 3.87736C13.2355 4.04927 13.1313 4.20541 13 4.33709L4.66667 12.6667L2 13.3333L2.66667 10.6667L11 2.33333Z" stroke="#0066CC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                ) : (
                    <div className="edit-controls">
                        <button 
                            className="cancel-button"
                            onClick={handleCancelClick}
                            disabled={isSaving}
                        >
                            Отмена
                        </button>
                        <button 
                            className="save-button"
                            onClick={handleSaveClick}
                            disabled={isSaving}
                        >
                            {isSaving ? 'Сохранение...' : 'Сохранить'}
                        </button>
                    </div>
                )}

                {error && (
                    <div className="error-message-banner">
                        {error}
                    </div>
                )}

                <div className="profile-section">
                    {renderAvatar()}

                    <div className="name-section">
                        {isEditing ? (
                            <>
                                <h1 
                                    ref={nameRef}
                                    className="user-name editable"
                                    contentEditable
                                    suppressContentEditableWarning
                                >
                                    {userData.name || ''}
                                </h1>
                                <span 
                                    ref={postRef}
                                    className="user-post editable"
                                    contentEditable
                                    suppressContentEditableWarning
                                >
                                    {userData.post || ''}
                                </span>
                            </>
                        ) : (
                            <>
                                <h1 className="user-name">{userData.name || 'Имя не указано'}</h1>
                                <p className="user-post">{userData.post || 'Должность не указана'}</p>
                            </>
                        )}
                        {userData.director && userData.director.name && (
                            <p className="user-director">
                                <span className="director-label">Руководитель: </span>
                                <span className="director-name">{userData.director.name}</span>
                            </p>
                        )}
                        {userData.department_name && (
                            <p className="user-department">
                                <span className="department-label">Отдел: </span>
                                <span className="department-name">{userData.department_name}</span>
                            </p>
                        )}
                    </div>
                </div>

                <div className="personal-info-section">
                    <h2 className="section-title">Личная информация</h2>
                    
                    <div className="input-row">
                        <div className="input-group">
                            <label className="input-label">Email</label>
                            <div className="input-field">
                                {isEditing ? (
                                    <div 
                                        ref={emailRef}
                                        className="readonly-input editable"
                                        contentEditable
                                        suppressContentEditableWarning
                                    >
                                        {userData.email || ''}
                                    </div>
                                ) : (
                                    <div className="readonly-input">
                                        {userData.email || 'Не указан'}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="input-group">
                            <label className="input-label">Telegram</label>
                            <div className="input-field">
                                {isEditing ? (
                                    <div 
                                        ref={telegramRef}
                                        className="readonly-input editable"
                                        contentEditable
                                        suppressContentEditableWarning
                                    >
                                        {userData.telegram || ''}
                                    </div>
                                ) : (
                                    <div className="readonly-input">
                                        {userData.telegram || 'Не указан'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="input-row">
                        <div className="input-group">
                            <label className="input-label">Телефон</label>
                            <div className="input-field">
                                {isEditing ? (
                                    <div 
                                        ref={phoneRef}
                                        className="readonly-input editable"
                                        contentEditable
                                        suppressContentEditableWarning
                                    >
                                        {userData.phone || ''}
                                    </div>
                                ) : (
                                    <div className="readonly-input">
                                        {userData.phone || 'Не указан'}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="input-group">
                            <label className="input-label">Дата рождения</label>
                            <div className="input-field">
                                {isEditing ? (
                                    <div 
                                        ref={birthDateRef}
                                        className="readonly-input editable"
                                        contentEditable
                                        suppressContentEditableWarning
                                    >
                                        {userData.birthDate || ''}
                                    </div>
                                ) : (
                                    <div className="readonly-input">
                                        {userData.birthDate || 'Не указана'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AccountPage;