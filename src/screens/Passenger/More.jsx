import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import Sheet from '../../components/Sheet';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import './More.scss';

export function More() {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate('/');
  };

  const menuItems = [
    {
      id: 'schemes',
      label: t('schemes'),
      icon: 'bi-award',
      path: '/schemes'
    },
    {
      id: 'safety',
      label: t('safety'),
      icon: 'bi-shield-check',
      path: '/safety'
    },
    {
      id: 'complaints',
      label: t('complaints'),
      icon: 'bi-chat-dots',
      path: '/complaints'
    },
    {
      id: 'settings',
      label: t('settings'),
      icon: 'bi-gear',
      path: '/settings'
    }
  ];

  return (
    <div className="more-screen">
      <TopBar title={t('more')} showBack={false} />

      <main className="more-screen__content">
        <nav className="more-screen__menu" aria-label={t('more')}>
          <ul className="more-screen__list" role="list">
            {menuItems.map((item) => (
              <li key={item.id} className="more-screen__list-item">
                <button
                  type="button"
                  className="more-screen__menu-btn"
                  onClick={() => navigate(item.path)}
                  aria-label={item.label}
                >
                  <div className="more-screen__btn-left">
                    <span className="more-screen__btn-icon">
                      <i className={`bi ${item.icon}`} aria-hidden="true" />
                    </span>
                    <span className="more-screen__btn-label">{item.label}</span>
                  </div>
                  <i className="bi bi-chevron-right more-screen__chevron" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Option */}
        <div className="more-screen__logout-card">
          <button
            type="button"
            className="more-screen__logout-btn"
            onClick={() => setShowLogoutConfirm(true)}
            aria-label={t('logout')}
          >
            <div className="more-screen__btn-left">
              <span className="more-screen__btn-icon more-screen__btn-icon--logout">
                <i className="bi bi-box-arrow-right" aria-hidden="true" />
              </span>
              <span className="more-screen__logout-label">{t('logout')}</span>
            </div>
            {user?.phone && (
              <span className="more-screen__logout-phone">+91 {user.phone}</span>
            )}
          </button>
        </div>
      </main>

      {/* Logout Confirmation Sheet */}
      <Sheet
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title={t('logout')}
      >
        <div className="logout-confirm-sheet">
          <div className="logout-confirm-sheet__icon-wrap">
            <i className="bi bi-box-arrow-right" aria-hidden="true" />
          </div>
          <p className="logout-confirm-sheet__msg">{t('confirm_logout')}</p>
          <div className="logout-confirm-sheet__actions">
            <button
              type="button"
              className="logout-confirm-sheet__btn logout-confirm-sheet__btn--cancel"
              onClick={() => setShowLogoutConfirm(false)}
            >
              {t('cancel')}
            </button>
            <button
              type="button"
              className="logout-confirm-sheet__btn logout-confirm-sheet__btn--confirm"
              onClick={handleLogout}
            >
              {t('logout')}
            </button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}

export default More;

