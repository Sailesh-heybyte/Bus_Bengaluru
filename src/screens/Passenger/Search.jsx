import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { searchPlaceToPlace } from '../../api/routes';
import busAsset from '../../assets/bus-card.png';
import './Search.scss';

const DEFAULT_BUS_SEARCHES = [
  {
    id: 'bus_recent_1',
    mode: 'bus',
    from: 'Central Silk Board',
    to: 'Hebbal',
    station: 'Central Silk Board ⟷ Hebbal (500D)',
    stationKn: 'ಸೆಂಟ್ರಲ್ ಸಿಲ್ಕ್ ಬೋರ್ಡ್ ⟷ ಹೆಬ್ಬಾಳ (500D)',
    time: '10:00 ⟷ 10:30',
    fare: '25.0',
    routeId: 'route_01'
  },
  {
    id: 'bus_recent_2',
    mode: 'bus',
    from: 'Majestic (KBS)',
    to: 'Whitefield TTMC',
    station: 'Majestic ⟷ Whitefield (335E)',
    stationKn: 'ಮೆಜೆಸ್ಟಿಕ್ ⟷ ವೈಟ್‌ಫೀಲ್ಡ್ (335E)',
    time: '11:05 ⟷ 11:45',
    fare: '35.0',
    routeId: 'route_04'
  },
  {
    id: 'bus_recent_3',
    mode: 'bus',
    from: 'Electronic City',
    to: 'KBS Majestic',
    station: 'Electronic City ⟷ Majestic',
    stationKn: 'ಎಲೆಕ್ಟ್ರಾನಿಕ್ ಸಿಟಿ ⟷ ಮೆಜೆಸ್ಟಿಕ್',
    time: '11:25 ⟷ 12:30',
    fare: '30.0',
    routeId: 'route_01'
  }
];

export function Search() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, language } = useLanguage();

  const defaultFrom = 'Central Silk Board';
  const defaultTo = 'Hebbal';

  const [fromQuery, setFromQuery] = useState(searchParams.get('from') || defaultFrom);
  const [toQuery, setToQuery] = useState(searchParams.get('to') || defaultTo);

  // Clean and initialize recent searches, filtering out any legacy MRT or Lorem entries
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem('yatre_recent_searches');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const clean = parsed.filter(
            (item) =>
              item &&
              !item.from?.includes('MRT') &&
              !item.to?.includes('MRT') &&
              !item.from?.includes('Lorem') &&
              !item.station?.includes('MRT') &&
              item.mode !== 'mrt'
          );
          if (clean.length > 0) {
            localStorage.setItem('yatre_recent_searches', JSON.stringify(clean));
            return clean;
          }
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_BUS_SEARCHES;
  });

  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const handleSwap = () => {
    const temp = fromQuery;
    setFromQuery(toQuery);
    setToQuery(temp);
  };

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (!fromQuery.trim() && !toQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    searchPlaceToPlace(fromQuery.trim(), toQuery.trim())
      .then((res) => {
        setSearchResults(res || []);
        setIsSearching(false);

        // Add search to recent history
        const newEntry = {
          id: `bus_search_${Date.now()}`,
          mode: 'bus',
          from: fromQuery.trim(),
          to: toQuery.trim(),
          station: `${fromQuery.trim()} ⟷ ${toQuery.trim()}`,
          time: '10:00 ⟷ 10:45',
          fare: res && res[0] && res[0].baseFare ? `${res[0].baseFare}.0` : '25.0',
          routeId: res && res[0] ? res[0].id : 'route_01'
        };

        setRecentSearches((prev) => {
          const filtered = prev.filter(
            (item) =>
              !(
                item.from?.toLowerCase() === fromQuery.trim().toLowerCase() &&
                item.to?.toLowerCase() === toQuery.trim().toLowerCase()
              )
          );
          const updated = [newEntry, ...filtered].slice(0, 5);
          try {
            localStorage.setItem('yatre_recent_searches', JSON.stringify(updated));
          } catch {
            // ignore
          }
          return updated;
        });
      })
      .catch(() => {
        setSearchResults([]);
        setIsSearching(false);
      });
  };

  const handleSelectRecent = (item) => {
    setFromQuery(item.from);
    setToQuery(item.to);

    const updated = [
      item,
      ...recentSearches.filter((r) => r.id !== item.id)
    ];
    setRecentSearches(updated);
    try {
      localStorage.setItem('yatre_recent_searches', JSON.stringify(updated));
    } catch {
      // ignore
    }

    if (item.routeId) {
      navigate(`/route/${item.routeId}`);
    } else {
      // Trigger search
      setHasSearched(true);
      searchPlaceToPlace(item.from, item.to).then((res) => setSearchResults(res || []));
    }
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('yatre_recent_searches');
    } catch {
      // ignore
    }
  };

  const activeSearches = recentSearches.length > 0 ? recentSearches : DEFAULT_BUS_SEARCHES;

  return (
    <div className="search-page">
      {/* 1. Sky Blue Hero Header */}
      <header className="search-page__hero">
        <div className="search-page__nav-row">
          <button
            type="button"
            className="search-page__back-btn"
            onClick={() => navigate(-1)}
            aria-label={t('back')}
          >
            <i className="bi bi-chevron-left" />
          </button>
        </div>

        {/* Large Prominent Vehicle Illustration */}
        <div className="search-page__vehicle-wrap" aria-hidden="true">
          <img
            src={busAsset}
            alt="Bus"
            className="search-page__vehicle-img search-page__vehicle-img--bus"
          />
          <div className="search-page__track-line" />
        </div>
      </header>

      {/* 2. Floating From / To Journey Card with Search Button */}
      <div className="search-page__floating-container">
        <form className="search-journey-card" onSubmit={handleSearchSubmit}>
          {/* Main Inputs Row */}
          <div className="search-journey-card__main-row">
            {/* Left Pins Timeline */}
            <div className="search-journey-card__timeline" aria-hidden="true">
              <div className="search-journey-card__pin search-journey-card__pin--from">
                <i className="bi bi-geo-alt-fill" />
              </div>
              <div className="search-journey-card__line" />
              <div className="search-journey-card__pin search-journey-card__pin--to">
                <i className="bi bi-geo-alt-fill" />
              </div>
            </div>

            {/* Middle Inputs Column */}
            <div className="search-journey-card__fields">
              {/* From Input */}
              <div className="search-journey-card__group">
                <label className="search-journey-card__label" htmlFor="from-input">
                  {t('from_label') || 'From'}
                </label>
                <input
                  id="from-input"
                  type="text"
                  className="search-journey-card__input"
                  value={fromQuery}
                  onChange={(e) => setFromQuery(e.target.value)}
                  placeholder={t('from_station')}
                  autoComplete="off"
                />
              </div>

              <div className="search-journey-card__divider" />

              {/* To Input */}
              <div className="search-journey-card__group">
                <label className="search-journey-card__label" htmlFor="to-input">
                  {t('to_label') || 'To'}
                </label>
                <input
                  id="to-input"
                  type="text"
                  className="search-journey-card__input"
                  value={toQuery}
                  onChange={(e) => setToQuery(e.target.value)}
                  placeholder={t('to_station')}
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Swap Button */}
            <button
              type="button"
              className="search-journey-card__swap-btn"
              onClick={handleSwap}
              aria-label="Swap origin and destination"
            >
              <i className="bi bi-arrow-down-up" />
            </button>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            className="search-journey-card__search-btn"
            disabled={isSearching}
          >
            {isSearching ? (
              <span className="search-journey-card__search-spinner" />
            ) : (
              <i className="bi bi-search search-journey-card__search-icon" aria-hidden="true" />
            )}
            <span>{t('search_buses') || 'Search Buses'}</span>
          </button>
        </form>
      </div>

      {/* 3. Results Section or Recent Searches */}
      <main className="search-page__body">
        {hasSearched ? (
          <div className="search-page__results-section">
            <div className="search-page__section-header">
              <h2 className="search-page__section-title">
                {t('available_buses') || 'Available Bus Routes'} ({searchResults.length})
              </h2>
              <button
                type="button"
                className="search-page__clear-btn"
                onClick={() => setHasSearched(false)}
              >
                {t('recent_searches') || 'Recent Searches'}
              </button>
            </div>

            {isSearching ? (
              <div className="search-page__loading">
                <div className="search-page__spinner" />
                <span>Searching active routes...</span>
              </div>
            ) : searchResults.length > 0 ? (
              <ul className="search-schedule-list" role="list">
                {searchResults.map((route) => (
                  <li
                    key={route.id}
                    className="search-schedule-item"
                    onClick={() => navigate(`/route/${route.id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        navigate(`/route/${route.id}`);
                      }
                    }}
                  >
                    <div className="search-schedule-item__left">
                      <div className="search-schedule-item__time-row">
                        <span className="search-schedule-item__route-badge">
                          {route.routeNumber || route.id}
                        </span>
                        <span className="search-schedule-item__time">
                          {route.headway || '10:00 ⟷ 10:30'}
                        </span>
                      </div>
                      <div className="search-schedule-item__station-row">
                        <i className="bi bi-geo-alt search-schedule-item__icon" />
                        <span className="search-schedule-item__station">
                          {route.from} ⟷ {route.to}
                        </span>
                      </div>
                    </div>

                    <div className="search-schedule-item__right">
                      <span className="search-schedule-item__fare">
                        ₹ {route.baseFare || 25}
                      </span>
                      <i className="bi bi-chevron-right search-schedule-item__chevron" aria-hidden="true" />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="search-page__empty-search">
                <i className="bi bi-bus-front search-page__empty-icon" />
                <p className="search-page__empty-title">
                  {t('no_buses_found') || 'No direct buses found between these stops'}
                </p>
                <p className="search-page__empty-sub">
                  Try checking popular stops like Central Silk Board, Hebbal, KBS Majestic, or Whitefield TTMC.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Recent Searches List */
          <div className="search-page__recent-section">
            <div className="search-page__section-header">
              <h2 className="search-page__section-title">
                {t('recent_searches') || 'Recent Searches'}
              </h2>
              {recentSearches.length > 0 && (
                <button
                  type="button"
                  className="search-page__clear-btn"
                  onClick={handleClearRecent}
                >
                  {t('clear_history') || 'Clear'}
                </button>
              )}
            </div>

            {activeSearches.length > 0 ? (
              <ul className="search-schedule-list" role="list">
                {activeSearches.map((item) => {
                  const stationLabel =
                    language === 'kn' && item.stationKn ? item.stationKn : item.station;

                  return (
                    <li
                      key={item.id}
                      className="search-schedule-item"
                      onClick={() => handleSelectRecent(item)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleSelectRecent(item);
                        }
                      }}
                    >
                      <div className="search-schedule-item__left">
                        <div className="search-schedule-item__time-row">
                          <i className="bi bi-clock search-schedule-item__icon" />
                          <span className="search-schedule-item__time">{item.time}</span>
                        </div>
                        <div className="search-schedule-item__station-row">
                          <i className="bi bi-geo-alt search-schedule-item__icon" />
                          <span className="search-schedule-item__station">
                            {stationLabel}
                          </span>
                        </div>
                      </div>

                      <div className="search-schedule-item__right">
                        <span className="search-schedule-item__fare">
                          ₹ {item.fare}
                        </span>
                        <i className="bi bi-chevron-right search-schedule-item__chevron" aria-hidden="true" />
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="search-page__empty">
                <div className="search-page__empty-icon">
                  <i className="bi bi-search" />
                </div>
                <p className="search-page__empty-text">
                  {t('no_recent_searches') || 'No recent searches'}
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default Search;
