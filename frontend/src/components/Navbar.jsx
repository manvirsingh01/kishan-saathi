import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../App';
import FarmSelector from './FarmSelector';
import './Navbar.css';

function Navbar() {
    const { t, i18n } = useTranslation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'hi' : 'en';
        i18n.changeLanguage(newLang);
        localStorage.setItem('language', newLang);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            <nav className="navbar">
                <div className="container">
                    <div className="navbar-content">
                        {/* Logo */}
                        <Link to="/dashboard" className="navbar-brand">
                            <span className="logo-icon">🌾</span>
                            <span className="logo-text">{t('appName')}</span>
                        </Link>

                        {/* Navigation Links */}
                        {user && (
                            <div className="navbar-menu">
                                <Link to="/dashboard" className="nav-link">{t('nav.dashboard')}</Link>
                                <Link to="/climate-stress" className="nav-link">{t('nav.climateStress')}</Link>
                                <Link to="/crop-recommendation" className="nav-link">{t('nav.cropRecommendation')}</Link>
                                <Link to="/analytics" className="nav-link">{t('nav.analytics')}</Link>
                                <Link to="/government" className="nav-link">{t('nav.government')}</Link>
                            </div>
                        )}

                        {/* User Actions */}
                        {user && (
                            <div className="navbar-actions">
                                <button onClick={toggleLanguage} className="btn-language">
                                    {i18n.language === 'en' ? 'हिंदी' : 'English'}
                                </button>

                                <div className="user-menu">
                                    <span className="user-name">{user.name}</span>
                                    <div className="dropdown-content">
                                        <Link to="/profile" className="dropdown-item">
                                            {t('nav.profile')}
                                        </Link>
                                        {user.role === 'admin' && (
                                            <Link to="/admin" className="dropdown-item">
                                                {t('nav.admin')}
                                            </Link>
                                        )}
                                        <button onClick={handleLogout} className="dropdown-item logout">
                                            {t('nav.logout')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
            {/* Farm Selector below navbar */}
            {user && <FarmSelector />}
        </>
    );
}

export default Navbar;

