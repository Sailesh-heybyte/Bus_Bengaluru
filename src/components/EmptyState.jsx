import React from 'react';
import './EmptyState.scss';

export function EmptyState({
  icon = 'bi-inbox',
  title,
  description,
  actionText,
  onAction,
  actionIcon,
  className = ''
}) {
  return (
    <div className={`empty-state ${className}`} role="status">
      <div className="empty-state__icon-wrap" aria-hidden="true">
        {typeof icon === 'string' ? (
          <i className={`bi ${icon}`} />
        ) : (
          icon
        )}
      </div>

      {title && <h3 className="empty-state__title">{title}</h3>}

      {description && <p className="empty-state__desc">{description}</p>}

      {actionText && onAction && (
        <button
          type="button"
          className="empty-state__action-btn"
          onClick={onAction}
        >
          {actionIcon && <i className={`bi ${actionIcon}`} aria-hidden="true" />}
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
}

export default EmptyState;
