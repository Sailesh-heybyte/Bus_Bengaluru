import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingRow from '../../components/LoadingRow';
import { getHomeData } from '../../api/home';
import { useDebouncedLoading } from '../../hooks/useDebouncedLoading';
import { useLanguage } from '../../context/LanguageContext';
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

  const showLoading = useDebouncedLoading(isLoading, 200);

  useEffect(() => {
    setIsLoading(true);
    getHomeData().then((homeData) => {
      setData(homeData);
      setIsLoading(false);
    });
  }, []);

  const handleStopClick = (stopId) => {
    navigate(`/stop/${stopId}`);
  };

  const userName = language === 'kn' && data?.user?.nameKn
    ? data.user.nameKn
    : (data?.user?.name || t('user_name'));

  return (
    <div className="home-screen">
      {/* Sky Blue Header Section */}
      <header className="home-hero">
        <div className="home-hero__top-row">
          <div className="home-hero__greeting-wrap">
            <h1 className="home-hero__greeting-title">
              {t('hello_user')} {userName}
            </h1>
            <p className="home-hero__subtitle">{t('where_you_will_go')}</p>
          </div>

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
                <button
                  type="button"
                  className="home-transport-card__btn home-transport-card__btn--bus"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/search');
                  }}
                >
                  {t('select')}
                </button>
              </div>

              <div className="home-transport-card__graphic" aria-hidden="true">
                <img
                  src={busAsset}
                  alt={t('bus')}
                  className="home__transport-img"
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
                  {t('mrt')}
                </h3>
                <button
                  type="button"
                  className="home-transport-card__btn home-transport-card__btn--mrt"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMrtModalOpen(true);
                  }}
                >
                  {t('select')}
                </button>
              </div>

              <div className="home-transport-card__graphic" aria-hidden="true">
                <img
                  src={mrtAsset}
                  alt={t('mrt')}
                  className="home__transport-img"
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
              {/* Service Notices */}
              {data.notices && data.notices.length > 0 && (
                <section className="home-extra-section" aria-label={t('service_notices')}>
                  <div className="home-extra-section__header">
                    <h2 className="home-extra-section__title">{t('service_notices')}</h2>
                  </div>
                  <ul className="home-notices-list" role="list">
                    {data.notices.map((notice) => (
                      <li key={notice.id} className="home-notice-card">
                        <div className="home-notice-icon" aria-hidden="true">
                          <i className="bi bi-info-circle-fill" />
                        </div>
                        <p className="home-notice-message">
                          {language === 'kn' ? notice.messageKn : notice.message}
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

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
            <div className="home-modal-sheet__handle" />
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
    </div>
  );
}

export default Home;
