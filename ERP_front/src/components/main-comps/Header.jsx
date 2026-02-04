import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AcrelisLogo from "../../assets/acrelis-logo.svg";
import NotificationIcon from "../../assets/nav-logo-notification.svg";
import AccountIcon from "../../assets/nav-logo-acc.svg";
import { clearTokens, authFetch } from "../../services/api/api";
import './Header.css';

function Header({ currentUser }) {
    const navigate = useNavigate();
    const [userAvatar, setUserAvatar] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchUserAvatar();
    }, []);

    const fetchUserAvatar = async () => {
        const staffId = localStorage.getItem('staff_id');
        if (!staffId) return;

        setIsLoading(true);
        try {
            const response = await authFetch(`https://api.acrelis.ru/staff/staff/${staffId}/`, {
                method: 'GET'
            });

            if (response.ok) {
                const userData = await response.json();
                if (userData.image || userData.image_url) {
                    setUserAvatar(userData.image || userData.image_url);
                }
            }
        } catch (error) {
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        clearTokens();
        window.location.href = '#/login';
    };

    const handleAccountClick = () => {
        navigate('/account');
    };

    return (
        <header className="HeaderCont">
            <img className="logo" src={AcrelisLogo} alt="Acrelis Logo"/>
            <div className="navCont">
                
                <button 
                    className="navButt1" 
                    title="Аккаунт"
                    onClick={handleAccountClick}
                >
                    {isLoading ? (
                        <div className="avatar-loading">
                            <div className="loading-spinner-small"></div>
                        </div>
                    ) : userAvatar ? (
                        <img 
                            src={userAvatar} 
                            alt={currentUser ? currentUser.name : "Гость"}
                            className="user-avatar"
                            onError={(e) => {
                                // Если аватарка не загружается, показываем стандартную иконку
                                e.target.style.display = 'none';
                                e.target.parentNode.querySelector('.default-avatar').style.display = 'block';
                            }}
                        />
                    ) : (
                        <img 
                            src={AccountIcon} 
                            alt={currentUser ? currentUser.name : "Гость"}
                            className="default-avatar"
                        />
                    )}
                    {/* Скрытая иконка для fallback */}
                    <img 
                        src={AccountIcon} 
                        alt="Гость"
                        className="default-avatar"
                        style={{ display: 'none' }}
                    />
                </button>
                
                {currentUser && (
                    <button 
                        className="logoutButt"
                        onClick={handleLogout}
                        title="Выйти"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13 12H22" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M16 9L19 12L16 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                )}
            </div>
        </header>
    )
}

export default Header;