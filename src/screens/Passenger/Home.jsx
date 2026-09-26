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
import './Home.scss';

export function Home() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
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
          onClick={() => navigate('/search?mode=bus')}
          role="searchbox"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              navigate('/search?mode=bus');
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
              onClick={() => navigate('/search?mode=bus')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') navigate('/search?mode=bus');
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

            {/* My Tickets Transport Card */}
            <div
              className="home-transport-card home-transport-card--tickets"
              onClick={() => navigate('/tickets')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') navigate('/tickets');
              }}
            >
              <div className="home-transport-card__info">
                <h3 className="home-transport-card__name home-transport-card__name--tickets">
                  {t('my_tickets') || 'My Tickets'}
                </h3>
              </div>

              <div className="home-transport-card__graphic" aria-hidden="true">
                <div className="home-transport-card__ticket-art">
                  <svg
                    className="home__transport-ticket-svg"
                    viewBox="0 0 160 84"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Shadow / back angled pass */}
                    <g opacity="0.38" transform="translate(8, -3) rotate(3 80 42)">
                      <rect x="12" y="10" width="136" height="64" rx="10" fill="#38BDF8" />
                    </g>

                    {/* Main Ticket Surface */}
                    <g filter="drop-shadow(0 4px 10px rgba(0, 0, 0, 0.22))">
                      {/* Ticket Shape with side cutout notches */}
                      <path
                        d="M10 20C10 14.4772 14.4772 10 20 10H140C145.523 10 150 14.4772 150 20V34C145.582 34 142 37.5817 142 42C142 46.4183 145.582 50 150 50V64C150 69.5228 145.523 74 140 74H20C14.4772 74 10 69.5228 10 64V50C14.4183 50 18 46.4183 18 42C18 37.5817 14.4183 34 10 34V20Z"
                        fill="#FFFFFF"
                      />

                      {/* Perforated Stub Divider */}
                      <line
                        x1="104"
                        y1="12"
                        x2="104"
                        y2="72"
                        stroke="#CBD5E1"
                        strokeWidth="2"
                        strokeDasharray="3 3"
                      />

                      {/* Header badge */}
                      <rect x="22" y="18" width="50" height="15" rx="4" fill="#0284C7" />
                      <text
                        x="47"
                        y="29"
                        fill="#FFFFFF"
                        fontSize="9"
                        fontWeight="800"
                        fontFamily="'Plus Jakarta Sans', sans-serif"
                        textAnchor="middle"
                        letterSpacing="0.5"
                      >
                        BMTC PASS
                      </text>

                      {/* Ticket Detail Lines */}
                      <rect x="22" y="40" width="56" height="5" rx="2.5" fill="#0F172A" />
                      <rect x="22" y="49" width="68" height="4" rx="2" fill="#64748B" />
                      <rect x="22" y="57" width="40" height="4" rx="2" fill="#0284C7" />

                      {/* QR Code Graphic on Stub */}
                      <rect x="112" y="19" width="30" height="30" rx="4" fill="#0F172A" />
                      <rect x="115" y="22" width="8" height="8" fill="#FFFFFF" rx="1.5" />
                      <rect x="117" y="24" width="4" height="4" fill="#0F172A" />
                      <rect x="131" y="22" width="8" height="8" fill="#FFFFFF" rx="1.5" />
                      <rect x="133" y="24" width="4" height="4" fill="#0F172A" />
                      <rect x="115" y="38" width="8" height="8" fill="#FFFFFF" rx="1.5" />
                      <rect x="117" y="40" width="4" height="4" fill="#0F172A" />
                      <rect x="126" y="32" width="5" height="5" fill="#38BDF8" rx="1" />
                      <rect x="133" y="38" width="6" height="6" fill="#FFFFFF" rx="1" />

                      {/* Barcode lines */}
                      <line x1="113" y1="56" x2="113" y2="66" stroke="#475569" strokeWidth="2" />
                      <line x1="117" y1="56" x2="117" y2="66" stroke="#475569" strokeWidth="1" />
                      <line x1="120" y1="56" x2="120" y2="66" stroke="#475569" strokeWidth="2.5" />
                      <line x1="125" y1="56" x2="125" y2="66" stroke="#475569" strokeWidth="1" />
                      <line x1="128" y1="56" x2="128" y2="66" stroke="#475569" strokeWidth="2" />
                      <line x1="133" y1="56" x2="133" y2="66" stroke="#475569" strokeWidth="1.5" />
                      <line x1="138" y1="56" x2="138" y2="66" stroke="#475569" strokeWidth="2.5" />
                    </g>
                  </svg>
                </div>
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
