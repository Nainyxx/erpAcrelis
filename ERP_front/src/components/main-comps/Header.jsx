import React from "react";
import { useNavigate } from "react-router-dom";
import AcrelisLogo from "../../assets/acrelis-logo.svg";
import NotificationIcon from "../../assets/nav-logo-notification.svg";
import AccountIcon from "../../assets/nav-logo-acc.svg";
import { clearTokens } from "../../services/api/api";
import './Header.css';

function Header({ currentUser }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        clearTokens();
        window.location.href = '/login';
    };

    const handleAccountClick = () => {
        navigate('/account');
    };

    return (
        <header className="HeaderCont">
            <img className="logo" src={AcrelisLogo} alt="Acrelis Logo"/>
            <div className="navCont">
                <button className="navButt" title="Уведомления">
                    <img src={NotificationIcon} alt="Уведомления" />
                </button>
                
                <button 
                    className="navButt1" 
                    title="Аккаунт"
                    onClick={handleAccountClick}
                >
                    <img 
                        src={AccountIcon} 
                        alt={currentUser ? currentUser.name : "Гость"}
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