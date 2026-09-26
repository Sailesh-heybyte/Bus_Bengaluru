import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import Sheet from '../../components/Sheet';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import signupAvatar from '../../assets/signup_avatar.png';
import './Settings.scss';

export function Settings() {
  const { t, language, setLanguage } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeSheet, setActiveSheet] = useState(null); // 'whatsapp' | 'sms' | 'voice' | 'logout' | null

  const handleToggleLanguage = () => {
    setLanguage(language === 'en' ? 'kn' : 'en');
  };

  const handleToggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleLogout = () => {
    setActiveSheet(null);
    logout();
    navigate('/');
  };

  return (
    <div className="settings-screen">
      <TopBar title={t('account')} showBack={true} />

      <main className="settings-screen__content">
        {/* User Profile Header Card */}
        <section className="profile-hero-card" aria-label="User Profile">
          <div className="profile-hero-card__avatar-wrap">
            <img
              src={signupAvatar}
              alt={t('user_name')}
              className="profile-hero-card__avatar-img"
            />
          </div>
          <div className="profile-hero-card__info">
            <h1 className="profile-hero-card__name">{t('user_name')}</h1>
            <p className="profile-hero-card__phone">
              +91 {user?.phone || '9876543210'}
            </p>
            <div className="profile-hero-card__badge">
              <i className="bi bi-shield-fill-check" aria-hidden="true" />
              <span>{t('shakti_scheme')} {t('active')}</span>
            </div>
          </div>
        </section>

        {/* Section 1: Emergency & Safety (High Priority) */}
        <section className="settings-screen__section" aria-label={t('safety')}>
          <h2 className="settings-screen__section-title">{t('safety')}</h2>
          <div className="settings-screen__card">
            <div
              className="settings-row settings-row--emergency"
              onClick={() => navigate('/safety')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') navigate('/safety');
              }}
              aria-label={t('safety')}
            >
              <div className="settings-row__left">
                <div className="settings-row__icon settings-row__icon--emergency">
                  <i className="bi bi-shield-fill-exclamation" aria-hidden="true" />
                </div>
                <div className="settings-row__info">
                  <span className="settings-row__label settings-row__label--emergency">
                    {t('safety')} & {t('sos_emergency')}
                  </span>
                  <span className="settings-row__sub">{t('emergency_safety_sub')}</span>
                </div>
              </div>

              <div className="settings-row__right">
                <span className="settings-row__pill-badge settings-row__pill-badge--danger">
                  112 • 1091
                </span>
                <i className="bi bi-chevron-right settings-row__chevron" aria-hidden="true" />
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Government Schemes & Benefits */}
        <section className="settings-screen__section" aria-label={t('schemes')}>
          <h2 className="settings-screen__section-title">{t('schemes')}</h2>
          <div className="settings-screen__card">
            <div
              className="settings-row"
              onClick={() => navigate('/schemes')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') navigate('/schemes');
              }}
              aria-label={t('schemes')}
            >
              <div className="settings-row__left">
                <div className="settings-row__icon settings-row__icon--schemes">
                  <i className="bi bi-award-fill" aria-hidden="true" />
                </div>
                <div className="settings-row__info">
                  <span className="settings-row__label">{t('schemes')}</span>
                  <span className="settings-row__sub">{t('schemes_sub')}</span>
                </div>
              </div>

              <div className="settings-row__right">
                <span className="settings-row__pill-badge settings-row__pill-badge--success">
                  {t('active')}
                </span>
                <i className="bi bi-chevron-right settings-row__chevron" aria-hidden="true" />
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Transit & Services (Tickets, Alerts, Saved, Complaints) */}
        <section className="settings-screen__section" aria-label={t('transit_services')}>
          <h2 className="settings-screen__section-title">{t('transit_services')}</h2>
          <div className="settings-screen__card">
            {/* Tickets & Passes */}
            <div
              className="settings-row"
              onClick={() => navigate('/tickets')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') navigate('/tickets');
              }}
              aria-label={t('tickets')}
            >
              <div className="settings-row__left">
                <div className="settings-row__icon settings-row__icon--tickets">
                  <i className="bi bi-ticket-perforated-fill" aria-hidden="true" />
                </div>
                <div className="settings-row__info">
                  <span className="settings-row__label">{t('tickets')} & {t('passes')}</span>
                  <span className="settings-row__sub">{t('tickets_sub')}</span>
                </div>
              </div>
              <i className="bi bi-chevron-right settings-row__chevron" aria-hidden="true" />
            </div>

            {/* Service Alerts */}
            <div
              className="settings-row"
              onClick={() => navigate('/alerts')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') navigate('/alerts');
              }}
              aria-label={t('alerts')}
            >
              <div className="settings-row__left">
                <div className="settings-row__icon settings-row__icon--alerts">
                  <i className="bi bi-bell-fill" aria-hidden="true" />
                </div>
                <div className="settings-row__info">
                  <span className="settings-row__label">{t('alerts')}</span>
                  <span className="settings-row__sub">{t('alerts_sub')}</span>
                </div>
              </div>
              <i className="bi bi-chevron-right settings-row__chevron" aria-hidden="true" />
            </div>

            {/* Saved Routes & Stops */}
            <div
              className="settings-row"
              onClick={() => navigate('/saved')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') navigate('/saved');
              }}
              aria-label={t('saved')}
            >
              <div className="settings-row__left">
                <div className="settings-row__icon settings-row__icon--saved">
                  <i className="bi bi-bookmark-star-fill" aria-hidden="true" />
                </div>
                <div className="settings-row__info">
                  <span className="settings-row__label">{t('saved')}</span>
                  <span className="settings-row__sub">{t('saved_routes')}</span>
                </div>
              </div>
              <i className="bi bi-chevron-right settings-row__chevron" aria-hidden="true" />
            </div>

            {/* Complaints & Helpdesk */}
            <div
              className="settings-row"
              onClick={() => navigate('/complaints')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') navigate('/complaints');
              }}
              aria-label={t('complaints')}
            >
              <div className="settings-row__left">
                <div className="settings-row__icon settings-row__icon--complaints">
                  <i className="bi bi-chat-dots-fill" aria-hidden="true" />
                </div>
                <div className="settings-row__info">
                  <span className="settings-row__label">{t('complaints')}</span>
                  <span className="settings-row__sub">{t('complaints_sub')}</span>
                </div>
              </div>
              <i className="bi bi-chevron-right settings-row__chevron" aria-hidden="true" />
            </div>
          </div>
        </section>

        {/* Section 4: Omnichannel (Offline & Voice Services) */}
        <section className="settings-screen__section" aria-label={t('omnichannel')}>
          <h2 className="settings-screen__section-title">{t('omnichannel')}</h2>
          <div className="settings-screen__card">
            {/* WhatsApp Service */}
            <div
              className="settings-row"
              onClick={() => setActiveSheet('whatsapp')}
              role="button"
              tabIndex={0}
              aria-label={t('whatsapp_service')}
            >
              <div className="settings-row__left">
                <div className="settings-row__icon settings-row__icon--wa">
                  <i className="bi bi-whatsapp" aria-hidden="true" />
                </div>
                <span className="settings-row__label">{t('whatsapp_service')}</span>
              </div>
              <i className="bi bi-chevron-right settings-row__chevron" aria-hidden="true" />
            </div>

            {/* SMS Service */}
            <div
              className="settings-row"
              onClick={() => setActiveSheet('sms')}
              role="button"
              tabIndex={0}
              aria-label={t('sms_service')}
            >
              <div className="settings-row__left">
                <div className="settings-row__icon settings-row__icon--sms">
                  <i className="bi bi-chat-left-dots" aria-hidden="true" />
                </div>
                <span className="settings-row__label">{t('sms_service')}</span>
              </div>
              <i className="bi bi-chevron-right settings-row__chevron" aria-hidden="true" />
            </div>

            {/* Voice Search */}
            <div
              className="settings-row"
              onClick={() => setActiveSheet('voice')}
              role="button"
              tabIndex={0}
              aria-label={t('voice_search')}
            >
              <div className="settings-row__left">
                <div className="settings-row__icon settings-row__icon--voice">
                  <i className="bi bi-mic" aria-hidden="true" />
                </div>
                <span className="settings-row__label">{t('voice_search')}</span>
              </div>
              <i className="bi bi-chevron-right settings-row__chevron" aria-hidden="true" />
            </div>
          </div>
        </section>

        {/* Section 5: Preferences */}
        <section className="settings-screen__section" aria-label={t('preferences')}>
          <h2 className="settings-screen__section-title">{t('preferences')}</h2>
          <div className="settings-screen__card">
            {/* Language Setting Row */}
            <div
              className="settings-row"
              onClick={handleToggleLanguage}
              role="button"
              tabIndex={0}
              aria-label={`${t('language')}: ${language === 'en' ? t('english') : t('kannada')}`}
            >
              <div className="settings-row__left">
                <div className="settings-row__icon settings-row__icon--lang">
                  <i className="bi bi-translate" aria-hidden="true" />
                </div>
                <div className="settings-row__info">
                  <span className="settings-row__label">{t('language')}</span>
                  <span className="settings-row__sub">
                    {language === 'en' ? t('english') : t('kannada')}
                  </span>
                </div>
              </div>

              <div className="settings-row__right">
                <span className="settings-row__toggle-badge">
                  {language === 'en' ? 'ಕನ್ನಡ' : 'English'}
                </span>
                <i className="bi bi-chevron-right settings-row__chevron" aria-hidden="true" />
              </div>
            </div>

            {/* Dark Mode Row */}
            <div
              className="settings-row"
              onClick={handleToggleDarkMode}
              role="button"
              tabIndex={0}
              aria-label={t('dark_mode')}
            >
              <div className="settings-row__left">
                <div className="settings-row__icon settings-row__icon--dark">
                  <i className="bi bi-moon-stars" aria-hidden="true" />
                </div>
                <span className="settings-row__label">{t('dark_mode')}</span>
              </div>

              <div className="settings-row__right">
                <div
                  className={`settings-switch ${isDarkMode ? 'settings-switch--active' : ''}`}
                  aria-hidden="true"
                >
                  <div className="settings-switch__thumb" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 6: Account Actions & Logout */}
        <section className="settings-screen__section" aria-label={t('account')}>
          <div className="settings-screen__card">
            <div
              className="settings-row settings-row--danger"
              onClick={() => setActiveSheet('logout')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setActiveSheet('logout');
              }}
              aria-label={t('logout')}
            >
              <div className="settings-row__left">
                <div className="settings-row__icon settings-row__icon--logout">
                  <i className="bi bi-box-arrow-right" aria-hidden="true" />
                </div>
                <span className="settings-row__label settings-row__label--danger">
                  {t('logout')}
                </span>
              </div>
              <i className="bi bi-chevron-right settings-row__chevron" aria-hidden="true" />
            </div>
          </div>
        </section>
      </main>

      {/* Logout Confirmation Sheet */}
      <Sheet
        isOpen={activeSheet === 'logout'}
        onClose={() => setActiveSheet(null)}
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
              onClick={() => setActiveSheet(null)}
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

      {/* WhatsApp Mock-up Sheet */}
      <Sheet
        isOpen={activeSheet === 'whatsapp'}
        onClose={() => setActiveSheet(null)}
        title={t('whatsapp_service')}
      >
        <div className="omni-sheet">
          <div className="omni-sheet__banner">{t('sample_data_notice')}</div>

          <div className="omni-sheet__chat-header">
            <i className="bi bi-whatsapp" aria-hidden="true" />
            <span>{t('wa_header')}</span>
          </div>

          <div className="chat-ui">
            <div className="chat-ui__bubble chat-ui__bubble--user">
              <p className="chat-ui__text">{t('wa_user_msg')}</p>
              <span className="chat-ui__time">16:15</span>
            </div>
            <div className="chat-ui__bubble chat-ui__bubble--bot">
              <p className="chat-ui__text">{t('wa_bot_reply')}</p>
              <span className="chat-ui__time">16:15</span>
            </div>
          </div>
        </div>
      </Sheet>

      {/* SMS Mock-up Sheet */}
      <Sheet
        isOpen={activeSheet === 'sms'}
        onClose={() => setActiveSheet(null)}
        title={t('sms_service')}
      >
        <div className="omni-sheet">
          <div className="omni-sheet__banner">{t('sample_data_notice')}</div>

          <div className="omni-sheet__chat-header">
            <i className="bi bi-chat-left-text" aria-hidden="true" />
            <span>{t('sms_header')}</span>
          </div>

          <div className="chat-ui">
            <div className="chat-ui__bubble chat-ui__bubble--user">
              <p className="chat-ui__text">{t('sms_user_msg')}</p>
              <span className="chat-ui__time">16:14</span>
            </div>
            <div className="chat-ui__bubble chat-ui__bubble--bot">
              <p className="chat-ui__text">{t('sms_bot_reply')}</p>
              <span className="chat-ui__time">16:14</span>
            </div>
          </div>
        </div>
      </Sheet>

      {/* Voice Search Mock-up Sheet */}
      <Sheet
        isOpen={activeSheet === 'voice'}
        onClose={() => setActiveSheet(null)}
        title={t('voice_search')}
      >
        <div className="omni-sheet">
          <div className="omni-sheet__banner">{t('sample_data_notice')}</div>

          <div className="voice-ui">
            <div className="voice-ui__pulse-container">
              <div className="voice-ui__pulse-ring voice-ui__pulse-ring--1" />
              <div className="voice-ui__pulse-ring voice-ui__pulse-ring--2" />
              <div className="voice-ui__mic-btn">
                <i className="bi bi-mic-fill" aria-hidden="true" />
              </div>
            </div>

            <p className="voice-ui__prompt">{t('voice_listening')}</p>
            <div className="voice-ui__result-box">
              <i className="bi bi-soundwave" aria-hidden="true" />
              <span className="voice-ui__result-text">{t('voice_searching')}</span>
            </div>
          </div>
        </div>
      </Sheet>
    </div>
  );
}

export default Settings;
