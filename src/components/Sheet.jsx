import React, { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import './Sheet.scss';

export function Sheet({ isOpen, onClose, title, children }) {
  const { t } = useLanguage();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="sheet-root" role="dialog" aria-modal="true" aria-label={title}>
      {/* Dark Overlay */}
      <div
        className="sheet-root__overlay"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-up Container */}
      <div className="sheet-root__container">
        <div className="sheet-root__handle" aria-hidden="true" />

        <div className="sheet-root__header">
          <h2 className="sheet-root__title">{title}</h2>
          <button
            type="button"
            className="sheet-root__close-btn"
            onClick={onClose}
            aria-label={t('close')}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="sheet-root__body">{children}</div>
      </div>
    </div>
  );
}

export default Sheet;
