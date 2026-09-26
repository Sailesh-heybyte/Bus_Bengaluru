import React, { useEffect, useState } from 'react';
import './PushBanner.scss';

export function PushBanner({ notification, onClose, onClick, language = 'en' }) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (!notification) return;
    setIsClosing(false);
  }, [notification]);

  if (!notification) return null;

  const handleClose = (e) => {
    e.stopPropagation();
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 280);
  };

  const handleClick = () => {
    if (onClick) {
      onClick(notification);
    }
  };

  const title = language === 'kn' && notification.titleKn
    ? notification.titleKn
    : notification.title;

  const message = language === 'kn' && notification.messageKn
    ? notification.messageKn
    : notification.message;

  return (
    <div
      className={`push-banner ${isClosing ? 'push-banner--closing' : ''}`}
      onClick={handleClick}
      role="alert"
      aria-live="polite"
    >
      <div className="push-banner__header">
        <div className="push-banner__app-info">
          <div className="push-banner__icon-wrap">
            <i className="bi bi-bus-front-fill" />
          </div>
          <span className="push-banner__app-name">YATRE</span>
          <span className="push-banner__bullet">•</span>
          <span className="push-banner__time">
            {language === 'kn' ? 'ಈಗಷ್ಟೇ' : 'Just now'}
          </span>
        </div>
        <button
          type="button"
          className="push-banner__close-btn"
          onClick={handleClose}
          aria-label="Dismiss notification"
        >
          <i className="bi bi-x" />
        </button>
      </div>

      <div className="push-banner__content">
        <h4 className="push-banner__title">{title}</h4>
        <p className="push-banner__message">{message}</p>
      </div>

      <div className="push-banner__pull-indicator" />
    </div>
  );
}

export default PushBanner;
