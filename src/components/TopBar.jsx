import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './TopBar.scss';

export function TopBar({ title, showBack = false, onBack, right }) {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleToggleLanguage = () => {
    setLanguage(language === 'kn' ? 'en' : 'kn');
  };

  return (
    <header className="top-bar">
      <div className="top-bar__left">
        {showBack && (
          <button
            type="button"
            className="top-bar__back-btn"
            onClick={handleBack}
            aria-label={t('back')}
          >
            <svg
              className="top-bar__back-icon"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
        )}
      </div>

      <h1 className="top-bar__title">{title}</h1>

      <div className="top-bar__right">
        {right}
        <button
          type="button"
          className="top-bar__lang-btn"
          onClick={handleToggleLanguage}
          aria-label={t('switch_language')}
        >
          {t('switch_language')}
        </button>
      </div>
    </header>
  );
}

export default TopBar;
