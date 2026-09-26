import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useSimulation } from '../../context/SimulationContext';
import { searchPlaceToPlace } from '../../api/routes';
import busAsset from '../../assets/bus-card.png';
import './Search.scss';

function formatTime12(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutesStr = minutes < 10 ? '0' + minutes : minutes;
  return `${hours}:${minutesStr} ${ampm}`;
}

function formatTime24(date) {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function buildAvailableBuses(routes, liveBuses) {
  if (!routes || routes.length === 0) return [];
  const now = Date.now();
  const busesList = [];

  routes.forEach((route) => {
    // 1. Live buses for this route
    const matchingLive = (liveBuses || []).filter((b) => {
      const routeMatch = (b.routeId || b.route_id) === route.id;
      const isRunning = (b.currentStatus || b.current_status) === 'running';
      return routeMatch && isRunning;
    });

    matchingLive.forEach((bus, i) => {
      const etaMins = Math.max(2, Math.round(((i + 1) * 5) + ((bus.progress || 0) % 1) * 3));
      const depTime = new Date(now + etaMins * 60 * 1000);
      const durationMins = route.distanceKm ? Math.round(route.distanceKm * 1.3) : 38;
      const arrTime = new Date(depTime.getTime() + durationMins * 60 * 1000);

      busesList.push({
        id: bus.id,
        routeId: route.id,
        routeNumber: route.routeNumber || route.id,
        corporation: bus.corporation || route.corporation || 'BMTC',
        busType: bus.bus_type || 'Ordinary',
        registrationNumber: bus.registration_number || `KA-01 F 901${i + 1}`,
        isLive: true,
        etaMinutes: etaMins,
        timeFormatted: `${formatTime24(depTime)} ⟷ ${formatTime24(arrTime)}`,
        departureTime: formatTime12(depTime),
        departureTimestamp: depTime.getTime(),
        fare: route.baseFare || 25,
        from: route.from,
        to: route.to,
        statusText: `Live GPS • ${etaMins}m`
      });
    });

    // 2. Upcoming scheduled buses
    const intervals = [16, 28, 42, 56, 70, 88];
    intervals.forEach((intervalMins, idx) => {
      const depTime = new Date(now + intervalMins * 60 * 1000);
      const durationMins = route.distanceKm ? Math.round(route.distanceKm * 1.3) : 38;
      const arrTime = new Date(depTime.getTime() + durationMins * 60 * 1000);
      const isAC = idx % 2 === 1;

      busesList.push({
        id: `sched_${route.id}_${idx}`,
        routeId: route.id,
        routeNumber: route.routeNumber || route.id,
        corporation: route.corporation || 'BMTC',
        busType: isAC ? 'Vajra (AC)' : 'Ordinary',
        registrationNumber: isAC ? `KA-01 F 92${idx}` : `KA-01 F 91${idx}`,
        isLive: false,
        etaMinutes: intervalMins,
        timeFormatted: `${formatTime24(depTime)} ⟷ ${formatTime24(arrTime)}`,
        departureTime: formatTime12(depTime),
        departureTimestamp: depTime.getTime(),
        fare: isAC ? (route.baseFare ? route.baseFare + 10 : 35) : (route.baseFare || 25),
        from: route.from,
        to: route.to,
        statusText: 'Scheduled'
      });
    });
  });

  return busesList.sort((a, b) => a.departureTimestamp - b.departureTimestamp);
}

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
  const { liveBuses } = useSimulation();

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
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'live' | 'ac'

  // Build dynamic time-sorted available buses
  const availableBuses = useMemo(() => {
    return buildAvailableBuses(searchResults, liveBuses);
  }, [searchResults, liveBuses]);

  // Filter available buses based on selected pill
  const filteredBuses = useMemo(() => {
    return availableBuses.filter((bus) => {
      if (activeFilter === 'live') return bus.isLive;
      if (activeFilter === 'ac') {
        const type = bus.busType.toLowerCase();
        return type.includes('ac') || type.includes('vajra') || type.includes('chigari');
      }
      return true;
    });
  }, [availableBuses, activeFilter]);

  const liveCount = useMemo(() => availableBuses.filter((b) => b.isLive).length, [availableBuses]);
  const acCount = useMemo(() => availableBuses.filter((b) => {
    const type = b.busType.toLowerCase();
    return type.includes('ac') || type.includes('vajra') || type.includes('chigari');
  }).length, [availableBuses]);

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

  const handleBusClick = (bus) => {
    if (bus.isLive) {
      navigate(`/route/${bus.routeId}?busId=${bus.id}`);
    } else {
      navigate(`/route/${bus.routeId}`);
    }
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

    // Trigger search
    setHasSearched(true);
    setIsSearching(true);
    searchPlaceToPlace(item.from, item.to).then((res) => {
      setSearchResults(res || []);
      setIsSearching(false);
    });
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
                {t('available_buses') || 'Available Buses'} ({filteredBuses.length})
              </h2>
              <button
                type="button"
                className="search-page__clear-btn"
                onClick={() => setHasSearched(false)}
              >
                {t('recent_searches') || 'Recent Searches'}
              </button>
            </div>

            {/* Filter Pills Bar */}
            <div className="search-filter-bar" role="tablist" aria-label="Bus filters">
              <button
                type="button"
                className={`search-filter-pill ${activeFilter === 'all' ? 'search-filter-pill--active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                <span>{t('all_buses') || 'All Buses'}</span>
                <span className="search-filter-pill__count">{availableBuses.length}</span>
              </button>

              <button
                type="button"
                className={`search-filter-pill ${activeFilter === 'live' ? 'search-filter-pill--active' : ''}`}
                onClick={() => setActiveFilter('live')}
              >
                <span className="search-filter-pill__live-dot" />
                <span>{t('live_only') || 'Live GPS'}</span>
                <span className="search-filter-pill__count">{liveCount}</span>
              </button>

              <button
                type="button"
                className={`search-filter-pill ${activeFilter === 'ac' ? 'search-filter-pill--active' : ''}`}
                onClick={() => setActiveFilter('ac')}
              >
                <span>{t('ac_buses') || 'AC Vajra'}</span>
                <span className="search-filter-pill__count">{acCount}</span>
              </button>
            </div>

            {isSearching ? (
              <div className="search-page__loading">
                <div className="search-page__spinner" />
                <span>Searching active routes...</span>
              </div>
            ) : filteredBuses.length > 0 ? (
              <ul className="search-bus-list" role="list">
                {filteredBuses.map((bus) => (
                  <li
                    key={bus.id}
                    className={`search-bus-card ${bus.isLive ? 'search-bus-card--live' : ''}`}
                    onClick={() => handleBusClick(bus)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleBusClick(bus);
                      }
                    }}
                  >
                    {/* Top Row: Time Range & Live Status */}
                    <div className="search-bus-card__top">
                      <div className="search-bus-card__time-badge">
                        <i className="bi bi-clock" />
                        <span>{bus.timeFormatted}</span>
                      </div>

                      {bus.isLive ? (
                        <span className="search-bus-card__status-pill search-bus-card__status-pill--live">
                          <span className="search-bus-card__pulse-dot" />
                          <span>{t('live_gps') || 'Live GPS'} • {bus.etaMinutes}m away</span>
                        </span>
                      ) : (
                        <span className="search-bus-card__status-pill search-bus-card__status-pill--sched">
                          <i className="bi bi-calendar3" />
                          <span>{t('scheduled') || 'Scheduled'}</span>
                        </span>
                      )}
                    </div>

                    {/* Middle Row: Route Badge, Bus Type & Corridor */}
                    <div className="search-bus-card__middle">
                      <div className="search-bus-card__badge-col">
                        <span className="search-bus-card__route-badge">
                          {bus.routeNumber}
                        </span>
                        <span className="search-bus-card__corp-tag">
                          {bus.corporation}
                        </span>
                      </div>

                      <div className="search-bus-card__meta">
                        <div className="search-bus-card__name-row">
                          <span className="search-bus-card__bus-type">{bus.busType}</span>
                          <span className="search-bus-card__bus-reg">• {bus.registrationNumber}</span>
                        </div>
                        <div className="search-bus-card__corridor">
                          <i className="bi bi-geo-alt-fill search-bus-card__corridor-icon" />
                          <span className="search-bus-card__corridor-text">
                            {bus.from} ➔ {bus.to}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Fare & Track on Map Button */}
                    <div className="search-bus-card__bottom">
                      <div className="search-bus-card__fare-block">
                        <span className="search-bus-card__fare-label">{t('fare') || 'Fare'}</span>
                        <span className="search-bus-card__fare-val">₹ {bus.fare}</span>
                      </div>

                      <button
                        type="button"
                        className="search-bus-card__track-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBusClick(bus);
                        }}
                      >
                        <i className="bi bi-map-fill" />
                        <span>{t('track_on_map') || 'Track on Map'}</span>
                        <i className="bi bi-chevron-right search-bus-card__track-arrow" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="search-page__empty-search">
                <i className="bi bi-bus-front search-page__empty-icon" />
                <p className="search-page__empty-title">
                  {t('no_buses_found') || 'No buses found for this filter'}
                </p>
                <p className="search-page__empty-sub">
                  Try switching filters or check major transit stops like Central Silk Board, Hebbal, or Majestic.
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
