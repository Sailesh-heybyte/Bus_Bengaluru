import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './index.scss';

export function Splash() {
  const { t } = useLanguage();

  return (
    <div className="splash-screen" role="region" aria-label="Splash Screen">
      {/* Top portion: Brand & Subtitle */}
      <div className="splash-screen__header">
        <h1 className="splash-screen__brand">YATRE</h1>
        <p className="splash-screen__subtitle">{t('yatre_subtitle')}</p>
      </div>

      {/* Bottom portion: Front-facing bus and road */}
      <div className="splash-screen__graphic">
        {/* Front-facing Bus Placeholder (Developer: replace or wrap with <img src="..." alt="YATRE Bus" /> when PNG is ready) */}
        <div className="splash-bus-wrapper" aria-hidden="true">
          <div className="splash-bus">
            {/* Top destination display */}
            <div className="splash-bus__sign">
              <span className="splash-bus__sign-dot" />
              <span className="splash-bus__sign-text">YATRE</span>
              <span className="splash-bus__sign-dot" />
            </div>

            {/* Front windshield */}
            <div className="splash-bus__windshield">
              <div className="splash-bus__reflection" />
            </div>

            {/* Grille and dual headlights */}
            <div className="splash-bus__face">
              <div className="splash-bus__headlight splash-bus__headlight--left" />
              <div className="splash-bus__grille">
                <span className="splash-bus__grille-line" />
                <span className="splash-bus__grille-line" />
              </div>
              <div className="splash-bus__headlight splash-bus__headlight--right" />
            </div>

            {/* Front bumper */}
            <div className="splash-bus__bumper" />

            {/* Wheels */}
            <div className="splash-bus__wheel splash-bus__wheel--left" />
            <div className="splash-bus__wheel splash-bus__wheel--right" />
          </div>
        </div>

        {/* Road Graphic: Tapered dark grey trapezoid anchoring to bottom with stark white dashed center line */}
        <div className="splash-road-container">
          <svg
            className="splash-road"
            viewBox="0 0 390 160"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {/* Dark grey road surface tapering upwards */}
            <polygon points="145,0 245,0 390,160 0,160" fill="#2d3748" />
            {/* Road borders/curbs */}
            <line x1="145" y1="0" x2="0" y2="160" stroke="#4a5568" strokeWidth="3" />
            <line x1="245" y1="0" x2="390" y2="160" stroke="#4a5568" strokeWidth="3" />
            {/* Stark white dashed center line */}
            <line
              x1="195"
              y1="6"
              x2="195"
              y2="155"
              stroke="#ffffff"
              strokeWidth="5"
              strokeDasharray="18 12"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default Splash;
