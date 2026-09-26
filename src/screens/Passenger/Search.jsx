import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import LoadingRow from '../../components/LoadingRow';
import EmptyState from '../../components/EmptyState';
import { searchRoutes, searchPlaceToPlace } from '../../api/routes';
import { searchStops } from '../../api/stops';
import { useDebounce } from '../../hooks/useDebounce';
import { useDebouncedLoading } from '../../hooks/useDebouncedLoading';
import { useLanguage } from '../../context/LanguageContext';
import './Search.scss';

export function Search() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState('route'); // 'route' | 'stop' | 'places'
  const [routeQuery, setRouteQuery] = useState('');
  const [stopQuery, setStopQuery] = useState('');
  const [fromQuery, setFromQuery] = useState('');
  const [toQuery, setToQuery] = useState('');

  const debouncedRouteQuery = useDebounce(routeQuery, 300);
  const debouncedStopQuery = useDebounce(stopQuery, 300);
  const debouncedFromQuery = useDebounce(fromQuery, 300);
  const debouncedToQuery = useDebounce(toQuery, 300);

  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const showLoading = useDebouncedLoading(isLoading, 200);

  useEffect(() => {
    if (activeTab === 'route') {
      if (!debouncedRouteQuery.trim()) {
        setResults([]);
        setHasSearched(false);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setHasSearched(true);
      searchRoutes(debouncedRouteQuery).then((res) => {
        setResults(res);
        setIsLoading(false);
      });
    } else if (activeTab === 'stop') {
      if (!debouncedStopQuery.trim()) {
        setResults([]);
        setHasSearched(false);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setHasSearched(true);
      searchStops(debouncedStopQuery).then((res) => {
        setResults(res);
        setIsLoading(false);
      });
    } else if (activeTab === 'places') {
      if (!debouncedFromQuery.trim() && !debouncedToQuery.trim()) {
        setResults([]);
        setHasSearched(false);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setHasSearched(true);
      searchPlaceToPlace(debouncedFromQuery, debouncedToQuery).then((res) => {
        setResults(res);
        setIsLoading(false);
      });
    }
  }, [
    activeTab,
    debouncedRouteQuery,
    debouncedStopQuery,
    debouncedFromQuery,
    debouncedToQuery
  ]);

  const handleRouteClick = (routeId) => {
    navigate(`/route/${routeId}`);
  };

  const handleStopClick = (stopId) => {
    navigate(`/stop/${stopId}`);
  };

  return (
    <div className="search-screen">
      <TopBar title={t('search')} showBack={false} />

      <main className="search-screen__content">
        {/* 3-segment Tab Control */}
        <div className="search-screen__tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'route'}
            className={`search-screen__tab ${
              activeTab === 'route' ? 'search-screen__tab--active' : ''
            }`}
            onClick={() => setActiveTab('route')}
          >
            {t('tab_route')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'stop'}
            className={`search-screen__tab ${
              activeTab === 'stop' ? 'search-screen__tab--active' : ''
            }`}
            onClick={() => setActiveTab('stop')}
          >
            {t('tab_stop')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'places'}
            className={`search-screen__tab ${
              activeTab === 'places' ? 'search-screen__tab--active' : ''
            }`}
            onClick={() => setActiveTab('places')}
          >
            {t('tab_places')}
          </button>
        </div>

        {/* Input Section */}
        <div className="search-screen__inputs">
          {activeTab === 'route' && (
            <input
              type="search"
              className="search-screen__input"
              placeholder={t('search_route_placeholder')}
              value={routeQuery}
              onChange={(e) => setRouteQuery(e.target.value)}
              aria-label={t('search_route_placeholder')}
            />
          )}

          {activeTab === 'stop' && (
            <input
              type="search"
              className="search-screen__input"
              placeholder={t('search_stop_placeholder')}
              value={stopQuery}
              onChange={(e) => setStopQuery(e.target.value)}
              aria-label={t('search_stop_placeholder')}
            />
          )}

          {activeTab === 'places' && (
            <div className="search-screen__places-inputs">
              <input
                type="search"
                className="search-screen__input"
                placeholder={t('from_placeholder')}
                value={fromQuery}
                onChange={(e) => setFromQuery(e.target.value)}
                aria-label={t('from_placeholder')}
              />
              <input
                type="search"
                className="search-screen__input"
                placeholder={t('to_placeholder')}
                value={toQuery}
                onChange={(e) => setToQuery(e.target.value)}
                aria-label={t('to_placeholder')}
              />
            </div>
          )}
        </div>

        {/* Results / Skeleton / Empty state */}
        <section className="search-screen__results-section" aria-live="polite">
          {showLoading ? (
            <div className="search-screen__skeletons" aria-busy="true">
              <LoadingRow />
              <LoadingRow />
              <LoadingRow />
            </div>
          ) : hasSearched && results.length === 0 ? (
            <EmptyState
              icon="bi-search"
              title={t('no_results')}
              description={t('no_results_desc')}
            />
          ) : (
            <ul className="search-screen__results-list" role="list">
              {(activeTab === 'route' || activeTab === 'places') &&
                results.map((route) => (
                  <li
                    key={route.id}
                    className="search-screen__card search-screen__card--route"
                    onClick={() => handleRouteClick(route.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleRouteClick(route.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="search-screen__route-info">
                      <span className="search-screen__route-number">
                        {route.routeNumber}
                      </span>
                      <span className="search-screen__route-path">
                        {route.from} → {route.to}
                      </span>
                    </div>
                    <span className="search-screen__corporation">
                      {route.corporation}
                    </span>
                  </li>
                ))}

              {activeTab === 'stop' &&
                results.map((stop) => (
                  <li
                    key={stop.id}
                    className="search-screen__card search-screen__card--stop"
                    onClick={() => handleStopClick(stop.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleStopClick(stop.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="search-screen__stop-info">
                      <span className="search-screen__stop-name">
                        {language === 'kn' && stop.nameKn ? stop.nameKn : stop.name}
                      </span>
                      <span className="search-screen__stop-meta">
                        {stop.stopCode} • {stop.corporation}
                      </span>
                    </div>
                    <div className="search-screen__chevron" aria-hidden="true">
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

export default Search;
