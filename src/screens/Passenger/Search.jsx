import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { searchRoutes, searchPlaceToPlace } from '../../api/routes';
import { searchStops } from '../../api/stops';
import { useDebounce } from '../../hooks/useDebounce';
import mrtAsset from '../../assets/mrt-card.png';
import busAsset from '../../assets/bus-card.png';
import './Search.scss';

const DEFAULT_RECENT_SEARCHES = [
  {
    id: 'recent_1',
    mode: 'mrt',
    from: 'Lorem MRT Station',
    to: 'Dolor MRT Station',
    station: 'Lorem MRT Station',
    stationKn: 'ಲೋರೆಂ ಎಮ್ಆರ್ಟಿ ನಿಲ್ದಾಣ',
    time: '10:00 ⟷ 10:30',
    fare: '5.0',
    routeId: 'route_01'
  },
  {
    id: 'recent_2',
    mode: 'mrt',
    from: 'Majestic Metro Station',
    to: 'Whitefield Kadugodi',
    station: 'Majestic ⟷ Whitefield Kadugodi',
    stationKn: 'ಮೆಜೆಸ್ಟಿಕ್ ⟷ ವೈಟ್‌ಫೀಲ್ಡ್ ಕಾಡುಗೋಡಿ',
    time: '11:05 ⟷ 11:45',
    fare: '5.0',
    routeId: 'route_04'
  },
  {
    id: 'recent_3',
    mode: 'bus',
    from: 'Central Silk Board',
    to: 'Hebbal',
    station: 'Central Silk Board ⟷ Hebbal',
    stationKn: 'ಸೆಂಟ್ರಲ್ ಸಿಲ್ಕ್ ಬೋರ್ಡ್ ⟷ ಹೆಬ್ಬಾಳ',
    time: '11:25 ⟷ 12:30',
    fare: '3.0',
    routeId: 'route_01'
  }
];

export function Search() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, language } = useLanguage();

  const initialMode = searchParams.get('mode') === 'bus' ? 'bus' : 'mrt';
  const [transportMode, setTransportMode] = useState(initialMode);

  const [fromQuery, setFromQuery] = useState(searchParams.get('from') || 'Lorem MRT Station');
  const [toQuery, setToQuery] = useState(searchParams.get('to') || 'Dolor MRT Station');

  const debouncedFrom = useDebounce(fromQuery, 250);
  const debouncedTo = useDebounce(toQuery, 250);

  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem('yatre_recent_searches');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return DEFAULT_RECENT_SEARCHES;
  });

  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Live search when user modifies from or to query
  useEffect(() => {
    const isDefaultPair =
      fromQuery === 'Lorem MRT Station' && toQuery === 'Dolor MRT Station';

    if (isDefaultPair || (!debouncedFrom.trim() && !debouncedTo.trim())) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchPlaceToPlace(debouncedFrom, debouncedTo)
      .then((res) => {
        setSearchResults(res || []);
        setIsSearching(false);
      })
      .catch(() => {
        setIsSearching(false);
      });
  }, [debouncedFrom, debouncedTo]);

  const handleSwap = () => {
    const temp = fromQuery;
    setFromQuery(toQuery);
    setToQuery(temp);
  };

  const handleModeChange = (mode) => {
    setTransportMode(mode);
    setSearchParams({ mode });
    if (mode === 'bus' && fromQuery === 'Lorem MRT Station') {
      setFromQuery('Central Silk Board');
      setToQuery('Hebbal');
    } else if (mode === 'mrt' && fromQuery === 'Central Silk Board') {
      setFromQuery('Lorem MRT Station');
      setToQuery('Dolor MRT Station');
    }
  };

  const handleSelectRecent = (item) => {
    setFromQuery(item.from);
    setToQuery(item.to);

    // Save/update to top of recent searches
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
            src={transportMode === 'mrt' ? mrtAsset : busAsset}
            alt={transportMode === 'mrt' ? 'MRT Train' : 'Bus'}
            className={`search-page__vehicle-img search-page__vehicle-img--${transportMode}`}
          />
          <div className="search-page__track-line" />
        </div>
      </header>

      {/* 2. Floating From / To Journey Card */}
      <div className="search-page__floating-container">
        <div className="search-journey-card">
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

          {/* Right Inputs Column */}
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
      </div>

      {/* 3. Recent Searches in place of 'Choose Schedule' */}
      <main className="search-page__body">
        <div className="search-page__section-header">
          <h2 className="search-page__section-title">
            {t('recent_searches') || 'Recent Searches'}
          </h2>
          {recentSearches.length > 0 && !searchResults.length && (
            <button
              type="button"
              className="search-page__clear-btn"
              onClick={handleClearRecent}
            >
              {t('clear_history') || 'Clear'}
            </button>
          )}
        </div>

        {/* Live Search Results (if typing new query) */}
        {searchResults.length > 0 ? (
          <ul className="search-schedule-list" role="list">
            {searchResults.map((route) => (
              <li key={route.id} className="search-schedule-item">
                <div className="search-schedule-item__left">
                  <div className="search-schedule-item__time-row">
                    <i className="bi bi-clock search-schedule-item__icon" />
                    <span className="search-schedule-item__time">
                      {route.headway || '10:00 ⟷ 10:30'}
                    </span>
                  </div>
                  <div className="search-schedule-item__station-row">
                    <i className="bi bi-geo-alt search-schedule-item__icon" />
                    <span className="search-schedule-item__station">
                      {route.from} ⟷ {route.to} ({route.routeNumber})
                    </span>
                  </div>
                </div>

                <div className="search-schedule-item__right">
                  <span className="search-schedule-item__fare">
                    ₹ {route.baseFare || 25}
                  </span>
                  <button
                    type="button"
                    className="search-schedule-item__select-btn"
                    onClick={() => navigate(`/route/${route.id}`)}
                  >
                    {t('select')}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : recentSearches.length > 0 ? (
          /* Recent Searches List formatted identical to reference image */
          <ul className="search-schedule-list" role="list">
            {recentSearches.map((item) => {
              const stationLabel =
                language === 'kn' && item.stationKn ? item.stationKn : item.station;

              return (
                <li key={item.id} className="search-schedule-item">
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
                      $ {item.fare}
                    </span>
                    <button
                      type="button"
                      className="search-schedule-item__select-btn"
                      onClick={() => handleSelectRecent(item)}
                    >
                      {t('select')}
                    </button>
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
      </main>
    </div>
  );
}

export default Search;
