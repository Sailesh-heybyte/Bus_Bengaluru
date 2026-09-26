import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { searchPlaceToPlace } from '../../api/routes';
import { useDebounce } from '../../hooks/useDebounce';
import mrtAsset from '../../assets/mrt-card.png';
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

const DEFAULT_MRT_SEARCHES = [
  {
    id: 'mrt_recent_1',
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
    id: 'mrt_recent_2',
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
    id: 'mrt_recent_3',
    mode: 'mrt',
    from: 'Baiyappanahalli',
    to: 'MG Road',
    station: 'Baiyappanahalli ⟷ MG Road',
    stationKn: 'ಬೈಯಪ್ಪನಹಳ್ಳಿ ⟷ ಎಂ.ಜಿ. ರಸ್ತೆ',
    time: '11:25 ⟷ 12:30',
    fare: '3.0',
    routeId: 'route_01'
  }
];

export function Search() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, language } = useLanguage();

  const modeParam = searchParams.get('mode') === 'mrt' ? 'mrt' : 'bus';
  const [transportMode, setTransportMode] = useState(modeParam);

  const defaultFrom = modeParam === 'mrt' ? 'Lorem MRT Station' : 'Central Silk Board';
  const defaultTo = modeParam === 'mrt' ? 'Dolor MRT Station' : 'Hebbal';

  const [fromQuery, setFromQuery] = useState(searchParams.get('from') || defaultFrom);
  const [toQuery, setToQuery] = useState(searchParams.get('to') || defaultTo);

  // Sync mode and default queries when URL mode changes
  useEffect(() => {
    const newMode = searchParams.get('mode') === 'mrt' ? 'mrt' : 'bus';
    setTransportMode(newMode);
    if (!searchParams.get('from')) {
      setFromQuery(newMode === 'mrt' ? 'Lorem MRT Station' : 'Central Silk Board');
    }
    if (!searchParams.get('to')) {
      setToQuery(newMode === 'mrt' ? 'Dolor MRT Station' : 'Hebbal');
    }
  }, [searchParams]);

  const debouncedFrom = useDebounce(fromQuery, 250);
  const debouncedTo = useDebounce(toQuery, 250);

  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem('yatre_recent_searches');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return modeParam === 'mrt' ? DEFAULT_MRT_SEARCHES : DEFAULT_BUS_SEARCHES;
  });

  const [searchResults, setSearchResults] = useState([]);

  // Live search when user modifies from or to query
  useEffect(() => {
    const isDefault =
      (fromQuery === 'Lorem MRT Station' && toQuery === 'Dolor MRT Station') ||
      (fromQuery === 'Central Silk Board' && toQuery === 'Hebbal');

    if (isDefault || (!debouncedFrom.trim() && !debouncedTo.trim())) {
      setSearchResults([]);
      return;
    }

    searchPlaceToPlace(debouncedFrom, debouncedTo)
      .then((res) => {
        setSearchResults(res || []);
      })
      .catch(() => {
        setSearchResults([]);
      });
  }, [debouncedFrom, debouncedTo]);

  const handleSwap = () => {
    const temp = fromQuery;
    setFromQuery(toQuery);
    setToQuery(temp);
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

  const activeSearches =
    recentSearches.length > 0
      ? recentSearches
      : transportMode === 'mrt'
      ? DEFAULT_MRT_SEARCHES
      : DEFAULT_BUS_SEARCHES;

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

        {/* Large Prominent Vehicle Illustration (Bus or Metro) */}
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
                  <i className="bi bi-chevron-right search-schedule-item__chevron" aria-hidden="true" />
                </div>
              </li>
            ))}
          </ul>
        ) : activeSearches.length > 0 ? (
          /* Recent Searches List - Tap anywhere to redirect */
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
                      {transportMode === 'mrt' ? '$' : '₹'} {item.fare}
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
      </main>
    </div>
  );
}

export default Search;
