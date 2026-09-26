import React from 'react';
import './LoadingRow.scss';

export function LoadingRow({ count = 1, height, className = '' }) {
  if (count > 1) {
    const rows = Array.from({ length: count });
    return (
      <div className={`loading-rows-group ${className}`} aria-busy="true" aria-live="polite">
        {rows.map((_, i) => (
          <div
            key={i}
            className="loading-row"
            style={height ? { height } : undefined}
            aria-hidden="true"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`loading-row ${className}`}
      style={height ? { height } : undefined}
      aria-busy="true"
      aria-live="polite"
      aria-hidden="true"
    />
  );
}

export default LoadingRow;
