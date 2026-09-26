import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import './OfflineStrip.scss';

export function OfflineStrip({ stops = [] }) {
  const { t, language } = useLanguage();

  const displayStops =
    stops && stops.length > 0
      ? stops
      : [
          { id: 'off_1', name: 'Start Terminal', nameKn: 'ಆರಂಭಿಕ ನಿಲ್ದಾಣ' },
          { id: 'off_2', name: 'Stop 2', nameKn: 'ನಿಲ್ದಾಣ ೨' },
          { id: 'off_3', name: 'Stop 3', nameKn: 'ನಿಲ್ದಾಣ ೩' },
          { id: 'off_4', name: 'Stop 4', nameKn: 'ನಿಲ್ದಾಣ ೪' },
          { id: 'off_5', name: 'End Terminal', nameKn: 'ಅಂತಿಮ ನಿಲ್ದಾಣ' }
        ];

  const total = displayStops.length;
  const itemHeight = 56;
  const svgHeight = Math.max(320, total * itemHeight);
  const startY = 32;
  const endY = svgHeight - 32;

  return (
    <div className="offline-strip" role="region" aria-label="Offline Route Strip">
      <div className="offline-strip__warning">
        <svg
          className="offline-strip__warning-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="1" y1="1" x2="23" y2="23" />
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
          <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
          <line x1="12" y1="20" x2="12.01" y2="20" />
        </svg>
        <span className="offline-strip__warning-text">
          {t('offline_warning')}
        </span>
      </div>

      <div className="offline-strip__diagram-card">
        <svg
          className="offline-strip__svg"
          viewBox={`0 0 320 ${svgHeight}`}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          {/* Vertical connecting line */}
          <line
            x1="36"
            y1={startY}
            x2="36"
            y2={endY}
            stroke="#cbd5e1"
            strokeWidth="3"
            strokeDasharray="6 4"
          />

          {/* Dots and Labels */}
          {displayStops.map((stop, index) => {
            const y =
              total > 1
                ? startY + (index / (total - 1)) * (endY - startY)
                : startY;
            const isTerminal = index === 0 || index === total - 1;
            const stopName =
              language === 'kn' && stop.nameKn ? stop.nameKn : stop.name;

            return (
              <g key={stop.id || index} className="offline-strip__node">
                {/* Outer ring for terminals */}
                {isTerminal && (
                  <circle
                    cx="36"
                    cy={y}
                    r="9"
                    fill="none"
                    stroke="#851313"
                    strokeWidth="2"
                    opacity="0.3"
                  />
                )}
                {/* Node dot */}
                <circle
                  cx="36"
                  cy={y}
                  r={isTerminal ? 6 : 4.5}
                  fill={isTerminal ? '#851313' : '#ffffff'}
                  stroke="#851313"
                  strokeWidth="2.5"
                />
                {/* Node Label */}
                <text
                  x="58"
                  y={y + 4}
                  fill="#0f172a"
                  fontSize="13"
                  fontWeight={isTerminal ? '700' : '500'}
                  fontFamily="'Noto Sans Kannada', 'Noto Sans', sans-serif"
                >
                  {stopName}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

export default OfflineStrip;
