import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import LoadingRow from '../../components/LoadingRow';
import EmptyState from '../../components/EmptyState';
import { getSavedItems } from '../../api/user';
import { useDebouncedLoading } from '../../hooks/useDebouncedLoading';
import { useLanguage } from '../../context/LanguageContext';
import './Saved.scss';

export function Saved() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState('routes'); // 'routes' | 'stops'
  const [savedData, setSavedData] = useState({ savedRoutes: [], savedStops: [] });
  const [isLoading, setIsLoading] = useState(true);

  const showLoading = useDebouncedLoading(isLoading, 200);

  useEffect(() => {
    setIsLoading(true);
    getSavedItems().then((data) => {
      setSavedData(data);
      setIsLoading(false);
    });
  }, []);

  const handleRouteClick = (routeId) => {
    navigate(`/route/${routeId}`);
  };

  const handleStopClick = (stopId) => {
    navigate(`/stop/${stopId}`);
  };

  const currentList =
    activeTab === 'routes' ? savedData.savedRoutes : savedData.savedStops;

  return (
    <div className="saved-screen">
      <TopBar title={t('saved')} showBack={true} />

      <main className="saved-screen__content">
        {/* 2-segment Tab Control */}
        <div className="saved-screen__tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'routes'}
            className={`saved-screen__tab ${
              activeTab === 'routes' ? 'saved-screen__tab--active' : ''
            }`}
            onClick={() => setActiveTab('routes')}
          >
            {t('tab_routes')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'stops'}
            className={`saved-screen__tab ${
              activeTab === 'stops' ? 'saved-screen__tab--active' : ''
            }`}
            onClick={() => setActiveTab('stops')}
          >
            {t('tab_stops')}
          </button>
        </div>

        {/* List Content */}
        <section className="saved-screen__list-section">
          {showLoading ? (
            <div className="saved-screen__skeletons" aria-busy="true">
              <LoadingRow />
              <LoadingRow />
              <LoadingRow />
            </div>
          ) : currentList.length === 0 ? (
            activeTab === 'routes' ? (
              <EmptyState
                icon="bi-bookmark-heart"
                title={t('no_saved_routes')}
                description={t('no_saved_routes_desc')}
                actionText={t('find_routes')}
                actionIcon="bi-search"
                onAction={() => navigate('/search')}
              />
            ) : (
              <EmptyState
                icon="bi-geo-alt"
                title={t('no_saved_stops')}
                description={t('no_saved_stops_desc')}
                actionText={t('find_stops')}
                actionIcon="bi-search"
                onAction={() => navigate('/search')}
              />
            )
          ) : (
            <ul className="saved-screen__list" role="list">
              {activeTab === 'routes' &&
                savedData.savedRoutes.map((route) => (
                  <li
                    key={route.id}
                    className="saved-screen__card saved-screen__card--route"
                    onClick={() => handleRouteClick(route.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleRouteClick(route.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="saved-screen__route-info">
                      <span className="saved-screen__route-number">
                        {route.routeNumber}
                      </span>
                      <span className="saved-screen__route-path">
                        {route.from} → {route.to}
                      </span>
                    </div>
                    <span className="saved-screen__corporation">
                      {route.corporation}
                    </span>
                  </li>
                ))}

              {activeTab === 'stops' &&
                savedData.savedStops.map((stop) => (
                  <li
                    key={stop.id}
                    className="saved-screen__card saved-screen__card--stop"
                    onClick={() => handleStopClick(stop.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleStopClick(stop.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="saved-screen__stop-info">
                      <span className="saved-screen__stop-name">
                        {language === 'kn' && stop.nameKn
                          ? stop.nameKn
                          : stop.name}
                      </span>
                      <span className="saved-screen__stop-meta">
                        {stop.stopCode} • {stop.corporation}
                      </span>
                    </div>
                    <div className="saved-screen__chevron" aria-hidden="true">
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
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  </li>
                ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default Saved;
