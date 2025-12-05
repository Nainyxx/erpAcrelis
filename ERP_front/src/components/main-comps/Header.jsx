import React from "react";
import AcrelisLogo from "../../assets/acrelis-logo.svg";
import NotificationIcon from "../../assets/nav-logo-notification.svg";
import AccountIcon from "../../assets/nav-logo-acc.svg";
import './Header.css';

function Header() {
    return (
        <header className="HeaderCont">
            <img className="logo" src={AcrelisLogo} alt="Acrelis Logo"/>
            <div className="navCont">
                <button className="navButt">
                    <img src={NotificationIcon} alt="Уведомления" />
                </button>
                <button className="navButt">
                    <img 
                        src={AccountIcon} 
                        alt="Аккаунт"
                        style={{
                          objectPosition: 'center top' // обрезает снизу
                        }} 
                      />
                </button>
            </div>
        </header>
    )
}

export default Header;