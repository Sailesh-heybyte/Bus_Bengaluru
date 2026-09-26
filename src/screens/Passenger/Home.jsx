import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingRow from '../../components/LoadingRow';
import { getHomeData } from '../../api/home';
import { useDebouncedLoading } from '../../hooks/useDebouncedLoading';
import { useLanguage } from '../../context/LanguageContext';
import PushBanner from '../../components/PushBanner';
import NotificationPanel from '../../components/NotificationPanel';
import signupAvatar from '../../assets/signup_avatar.png';
import busAsset from '../../assets/bus-card.png';
import mrtAsset from '../../assets/mrt-card.png';
import './Home.scss';

export function Home() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mrtModalOpen, setMrtModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [activePush, setActivePush] = useState(null);

  const showLoading = useDebouncedLoading(isLoading, 200);

  useEffect(() => {
    setIsLoading(true);
    getHomeData().then((homeData) => {
      setData(homeData);
      setNotifications(homeData.notices || []);
      setIsLoading(false);
    });
  }, []);

  // Timed mock phone push notification trigger (appears 3.5s after load)
  useEffect(() => {
    if (!notifications || notifications.length === 0) return;
    const timer = setTimeout(() => {
      const unreadNotice = notifications.find((n) => !n.read) || notifications[0];
      if (unreadNotice) {
        setActivePush(unreadNotice);
      }
    }, 3500);

    return () => clearTimeout(timer);
  }, [notifications.length]);

  // Auto-dismiss push notification banner after 6 seconds
  useEffect(() => {
    if (!activePush) return;
    const dismissTimer = setTimeout(() => {
      setActivePush(null);
    }, 6000);
    return () => clearTimeout(dismissTimer);
  }, [activePush]);

  const handleStopClick = (stopId) => {
    navigate(`/stop/${stopId}`);
  };

  const handlePushClick = (notice) => {
    setActivePush(null);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notice.id ? { ...n, read: true } : n))
    );
    setNotifOpen(true);
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNoticeItemClick = (item) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
    if (item.routeId) {
      setNotifOpen(false);
      navigate(`/route/${item.routeId}`);
    }
  };

  const handleSimulateNotice = () => {
    const mockAlerts = [
      {
        id: `sim_${Date.now()}`,
        category: 'notice',
        type: 'diversion',
        route_id: 'route_01',
        title: 'Route 500D Diversion Alert',
        titleKn: '500D ಮಾರ್ಗ ಬದಲಾವಣೆ ಅಲರ್ಟ್',
        message: 'Route 500D diverted at Marathahalli due to urgent road repair work.',
        messageKn: 'ರಸ್ತೆ ಕಾಮಗಾರಿಯಿಂದಾಗಿ 500D ಮಾರ್ಗವನ್ನು ಮಾರತ್ತಹಳ್ಳಿಯಲ್ಲಿ ಬದಲಾಯಿಸಲಾಗಿದೆ.',
        timeAgo: 'Just now',
        timeAgoKn: 'ಈಗಷ್ಟೇ',
        read: false
      },
      {
        id: `sim_${Date.now()}`,
        category: 'circular',
        type: 'circular',
        route_id: null,
        title: 'Official Circular: Student Pass Verification',
        titleKn: 'ಅಧಿಕೃತ ಸುತ್ತೋಲೆ: ವಿದ್ಯಾರ್ಥಿ ಪಾಸ್ ಪರಿಶೀಲನೆ',
        message: 'Digital verification desk extended till 8 PM at Majestic TTMC.',
        messageKn: 'ಮೆಜೆಸ್ಟಿಕ್ ಟಿಟಿಎಂಸಿಯಲ್ಲಿ ಡಿಜಿಟಲ್ ಪರಿಶೀಲನೆ ಕೌಂಟರ್ ಸಂಜೆ 8 ರವರೆಗೆ ವಿಸ್ತರಿಸಲಾಗಿದೆ.',
        timeAgo: 'Just now',
        timeAgoKn: 'ಈಗಷ್ಟೇ',
        read: false
      },
      {
        id: `sim_${Date.now()}`,
        category: 'alert',
        type: 'live_bus',
        route_id: 'route_01',
        title: 'Live Bus Approaching',
        titleKn: 'ಲೈವ್ ಬಸ್ ಸಮೀಪಿಸುತ್ತಿದೆ',
        message: 'Bus 500D is arriving at Silk Board Junction in 3 minutes.',
        messageKn: 'ಬಸ್ 500D ಸಿಲ್ಕ್ ಬೋರ್ಡ್ ಜಂಕ್ಷನ್‌ಗೆ 3 ನಿಮಿಷಗಳಲ್ಲಿ ಆಗಮಿಸಲಿದೆ.',
        timeAgo: 'Just now',
        timeAgoKn: 'ಈಗಷ್ಟೇ',
        read: false
      }
    ];
    const picked = mockAlerts[Math.floor(Math.random() * mockAlerts.length)];
    setNotifications((prev) => [picked, ...prev]);
    setActivePush(picked);
    setNotifOpen(false);
  };

  const userName = language === 'kn' && data?.user?.nameKn
    ? data.user.nameKn
    : (data?.user?.name || t('user_name'));

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="home-screen">
      {/* Phone Push Notification Toast */}
      <PushBanner
        notification={activePush}
        onClose={() => setActivePush(null)}
        onClick={handlePushClick}
        language={language}
      />

      {/* Sky Blue Header Section */}
      <header className="home-hero">
        <div className="home-hero__top-row">
          <div className="home-hero__greeting-wrap">
            <h1 className="home-hero__greeting-title">
              {t('hello_user')} {userName}
            </h1>
            <p className="home-hero__subtitle">{t('where_you_will_go')}</p>
          </div>

          <div className="home-hero__actions">
            <button
              type="button"
              className="home-hero__notif-btn"
              onClick={() => setNotifOpen(true)}
              aria-label={t('notifications')}
            >
              <i className="bi bi-bell-fill" />
              {unreadCount > 0 && (
                <span className="home-hero__notif-badge">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <button
              type="button"
              className="home-hero__avatar-btn"
              onClick={() => navigate('/settings')}
              aria-label={t('account') || 'Account'}
            >
              <img
                src={signupAvatar}
                alt={userName}
                className="home-hero__avatar-img"
              />
            </button>
          </div>
        </div>

        {/* Embedded Rounded Search Bar */}
        <div
          className="home-hero__search-bar"
          onClick={() => navigate('/search')}
          role="searchbox"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              navigate('/search');
            }
          }}
          aria-label={t('search_placeholder')}
        >
          <i className="bi bi-search home-hero__search-icon" aria-hidden="true" />
          <span className="home-hero__search-placeholder">
            {t('search_placeholder')}
          </span>
        </div>
      </header>

      {/* Floating Overlapping Stats Card */}
      <section className="home-stats-card" aria-label="Account Summary">
        <div className="home-stats-card__col">
          <span className="home-stats-card__label">{t('balance')}</span>
          <span className="home-stats-card__value">₹ 180</span>
        </div>

        <div className="home-stats-card__divider" aria-hidden="true" />

        <div className="home-stats-card__col">
          <span className="home-stats-card__label">{t('total_trips')}</span>
          <span className="home-stats-card__value">120</span>
        </div>
      </section>

      {/* White Surface Body Section */}
      <main className="home-body">
        {/* Choose your Transport Section */}
        <section className="home-transport" aria-label={t('choose_transport')}>
          <h2 className="home-transport__title">{t('choose_transport')}</h2>

          <div className="home-transport__cards">
            {/* Bus Transport Card */}
            <div
              className="home-transport-card home-transport-card--bus"
              onClick={() => navigate('/search')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') navigate('/search');
              }}
            >
              <div className="home-transport-card__info">
                <h3 className="home-transport-card__name">{t('bus')}</h3>
              </div>

              <div className="home-transport-card__graphic" aria-hidden="true">
                <img
                  src={busAsset}
                  alt={t('bus')}
                  className="home__transport-img home__transport-img--bus"
                />
              </div>
            </div>

            {/* MRT Transport Card */}
            <div
              className="home-transport-card home-transport-card--mrt"
              onClick={() => setMrtModalOpen(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setMrtModalOpen(true);
              }}
            >
              <div className="home-transport-card__info">
                <h3 className="home-transport-card__name home-transport-card__name--mrt">
                  {t('Metro')}
                </h3>
              </div>

              <div className="home-transport-card__graphic" aria-hidden="true">
                <img
                  src={mrtAsset}
                  alt={t('mrt')}
                  className="home__transport-img home__transport-img--mrt"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Live Service Notices & Saved Routes */}
        {showLoading ? (
          <div className="home-skeletons" aria-busy="true">
            <LoadingRow />
            <LoadingRow />
          </div>
        ) : (
          data && (
            <div className="home-dashboard-extra">
              {/* Saved Routes */}
              {data.savedRoutes && data.savedRoutes.length > 0 && (
                <section className="home-extra-section" aria-label={t('saved_routes')}>
                  <div className="home-extra-section__header">
                    <h2 className="home-extra-section__title">{t('saved_routes')}</h2>
                    <button
                      type="button"
                      className="home-extra-section__link-btn"
                      onClick={() => navigate('/saved')}
                    >
                      {t('view_all')}
                    </button>
                  </div>
                  <ul className="home-routes-list" role="list">
                    {data.savedRoutes.slice(0, 2).map((route) => (
                      <li
                        key={route.id}
                        className="home-route-card"
                        onClick={() => navigate(`/route/${route.id}`)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            navigate(`/route/${route.id}`);
                          }
                        }}
                      >
                        <div className="home-route-badge">{route.routeNumber}</div>
                        <div className="home-route-details">
                          <div className="home-route-path">
                            <span className="home-route-from">{route.from}</span>
                            <span className="home-route-arrow" aria-hidden="true">→</span>
                            <span className="home-route-to">{route.to}</span>
                          </div>
                          <span className="home-route-meta">{route.corporation}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Nearby Stops */}
              {data.nearbyStops && data.nearbyStops.length > 0 && (
                <section className="home-extra-section" aria-label={t('nearby_stops')}>
                  <div className="home-extra-section__header">
                    <h2 className="home-extra-section__title">{t('nearby_stops')}</h2>
                  </div>
                  <ul className="home-stops-list" role="list">
                    {data.nearbyStops.slice(0, 2).map((stop) => (
                      <li
                        key={stop.id}
                        className="home-stop-card"
                        onClick={() => handleStopClick(stop.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleStopClick(stop.id);
                          }
                        }}
                        tabIndex={0}
                        role="button"
                      >
                        <div className="home-stop-info">
                          <span className="home-stop-name">
                            {language === 'kn' && stop.nameKn ? stop.nameKn : stop.name}
                          </span>
                          <span className="home-stop-meta">
                            {stop.stopCode} • {stop.corporation}
                          </span>
                        </div>
                        <div className="home-stop-chevron" aria-hidden="true">
                          <i className="bi bi-chevron-right" />
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )
        )}
      </main>

      {/* MRT / Metro Info Modal Sheet */}
      {mrtModalOpen && (
        <div
          className="home-modal-overlay"
          onClick={() => setMrtModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="mrt-modal-title"
        >
          <div
            className="home-modal-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="home-modal-sheet__top-bar">
              <div className="home-modal-sheet__handle" />
              <button
                type="button"
                className="home-modal-sheet__top-close"
                onClick={() => setMrtModalOpen(false)}
                aria-label={t('close') || 'Close'}
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className="home-modal-sheet__icon" aria-hidden="true">
              <i className="bi bi-train-front-fill" />
            </div>

            <h3 id="mrt-modal-title" className="home-modal-sheet__title">
              {t('mrt_notice_title')}
            </h3>

            <p className="home-modal-sheet__desc">{t('mrt_notice_desc')}</p>

            <div className="home-modal-sheet__actions">
              <button
                type="button"
                className="home-modal-sheet__primary-btn"
                onClick={() => {
                  setMrtModalOpen(false);
                  navigate('/search?mode=mrt');
                }}
              >
                {t('search_metro_schedules') || 'Search Metro Schedules'}
              </button>

              <button
                type="button"
                className="home-modal-sheet__secondary-btn"
                onClick={() => {
                  setMrtModalOpen(false);
                  navigate('/tickets');
                }}
              >
                {t('view_ncmc')}
              </button>

              <button
                type="button"
                className="home-modal-sheet__close-btn"
                onClick={() => setMrtModalOpen(false)}
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Drawer / Panel */}
      <NotificationPanel
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={handleMarkAllAsRead}
        onItemClick={handleNoticeItemClick}
        language={language}
        t={t}
      />
    </div>
  );
}

export default Home;
