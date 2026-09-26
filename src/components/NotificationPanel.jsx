import React, { useState } from 'react';
import './NotificationPanel.scss';

export function NotificationPanel({
  isOpen,
  onClose,
  notifications = [],
  onMarkAllAsRead,
  onItemClick,
  onSimulateNotice,
  language = 'en',
  t
}) {
  const [activeTab, setActiveTab] = useState('all');

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotices = notifications.filter((item) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'notices') return item.category === 'notice';
    if (activeTab === 'circulars') return item.category === 'circular';
    if (activeTab === 'alerts') return item.category === 'alert';
    return true;
  });

  const getCategoryIcon = (item) => {
    if (item.category === 'circular') {
      return {
        icon: 'bi-file-earmark-text-fill',
        badgeClass: 'notif-item__badge--circular'
      };
    }
    if (item.type === 'diversion') {
      return {
        icon: 'bi-sign-turn-right-fill',
        badgeClass: 'notif-item__badge--diversion'
      };
    }
    if (item.type === 'extra_service') {
      return {
        icon: 'bi-bus-front-fill',
        badgeClass: 'notif-item__badge--extra'
      };
    }
    if (item.type === 'live_bus' || item.category === 'alert') {
      return {
        icon: 'bi-broadcast-pin',
        badgeClass: 'notif-item__badge--alert'
      };
    }
    return {
      icon: 'bi-info-circle-fill',
      badgeClass: 'notif-item__badge--default'
    };
  };

  return (
    <div
      className="notif-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="notif-panel-title"
    >
      <div
        className="notif-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Handle for mobile gestures */}
        <div className="notif-sheet__handle" />

        {/* Panel Header */}
        <div className="notif-sheet__header">
          <div className="notif-sheet__title-group">
            <div className="notif-sheet__icon-wrap">
              <i className="bi bi-bell-fill" />
            </div>
            <div>
              <h2 id="notif-panel-title" className="notif-sheet__title">
                {t ? t('notifications') : 'Notifications'}
              </h2>
              {unreadCount > 0 && (
                <span className="notif-sheet__count-badge">
                  {unreadCount} {t ? t('unread') : 'unread'}
                </span>
              )}
            </div>
          </div>

          <div className="notif-sheet__header-actions">
            {unreadCount > 0 && (
              <button
                type="button"
                className="notif-sheet__action-btn"
                onClick={onMarkAllAsRead}
              >
                {t ? t('mark_all_read') : 'Mark all read'}
              </button>
            )}
            <button
              type="button"
              className="notif-sheet__close-btn"
              onClick={onClose}
              aria-label={t ? t('close') : 'Close'}
            >
              <i className="bi bi-x-lg" />
            </button>
          </div>
        </div>

        {/* Test Simulator Banner Button */}
        {onSimulateNotice && (
          <div className="notif-sheet__sim-row">
            <button
              type="button"
              className="notif-sheet__sim-btn"
              onClick={onSimulateNotice}
            >
              <i className="bi bi-phone-vibrate" />
              <span>{t ? t('simulate_notice') : 'Simulate Phone Notification'}</span>
            </button>
          </div>
        )}

        {/* Category Tabs */}
        <nav className="notif-tabs" aria-label="Notification Categories">
          <button
            type="button"
            className={`notif-tab ${activeTab === 'all' ? 'notif-tab--active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            {t ? t('all') : 'All'}
          </button>
          <button
            type="button"
            className={`notif-tab ${activeTab === 'notices' ? 'notif-tab--active' : ''}`}
            onClick={() => setActiveTab('notices')}
          >
            {t ? t('notices') : 'Notices'}
          </button>
          <button
            type="button"
            className={`notif-tab ${activeTab === 'circulars' ? 'notif-tab--active' : ''}`}
            onClick={() => setActiveTab('circulars')}
          >
            {t ? t('circulars') : 'Circulars'}
          </button>
          <button
            type="button"
            className={`notif-tab ${activeTab === 'alerts' ? 'notif-tab--active' : ''}`}
            onClick={() => setActiveTab('alerts')}
          >
            {t ? t('alerts') : 'Alerts'}
          </button>
        </nav>

        {/* Notifications List */}
        <div className="notif-sheet__body">
          {filteredNotices.length === 0 ? (
            <div className="notif-empty">
              <div className="notif-empty__icon">
                <i className="bi bi-bell-slash" />
              </div>
              <p className="notif-empty__text">
                {t ? t('no_notifications') : 'No notifications right now'}
              </p>
            </div>
          ) : (
            <ul className="notif-list" role="list">
              {filteredNotices.map((item) => {
                const { icon, badgeClass } = getCategoryIcon(item);
                const title = language === 'kn' && item.titleKn ? item.titleKn : item.title;
                const message = language === 'kn' && item.messageKn ? item.messageKn : item.message;
                const timeAgo = language === 'kn' && item.timeAgoKn ? item.timeAgoKn : item.timeAgo;

                return (
                  <li
                    key={item.id}
                    className={`notif-item ${!item.read ? 'notif-item--unread' : ''}`}
                    onClick={() => onItemClick && onItemClick(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        onItemClick && onItemClick(item);
                      }
                    }}
                  >
                    <div className={`notif-item__badge ${badgeClass}`} aria-hidden="true">
                      <i className={`bi ${icon}`} />
                    </div>

                    <div className="notif-item__content">
                      <div className="notif-item__top">
                        <span className="notif-item__title">{title}</span>
                        <div className="notif-item__meta-wrap">
                          <span className="notif-item__time">{timeAgo}</span>
                          {!item.read && <span className="notif-item__unread-dot" />}
                        </div>
                      </div>

                      <p className="notif-item__message">{message}</p>

                      {item.routeId && (
                        <div className="notif-item__tag">
                          <i className="bi bi-signpost-split" />
                          <span>{item.routeId.replace('route_', 'Route ')}</span>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationPanel;
