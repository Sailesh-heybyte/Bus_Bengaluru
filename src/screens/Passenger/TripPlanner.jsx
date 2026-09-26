import React, { useState } from 'react';
import TopBar from '../../components/TopBar';
import LoadingRow from '../../components/LoadingRow';
import { getTripPlan } from '../../api/planner';
import { useDebouncedLoading } from '../../hooks/useDebouncedLoading';
import { useLanguage } from '../../context/LanguageContext';
import './TripPlanner.scss';

export function TripPlanner() {
  const { t } = useLanguage();
  const [fromQuery, setFromQuery] = useState('Majestic');
  const [toQuery, setToQuery] = useState('Hebbal');
  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const showLoading = useDebouncedLoading(isLoading, 200);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setHasSearched(true);

    getTripPlan(fromQuery, toQuery).then((result) => {
      setPlan(result);
      setIsLoading(false);
    });
  };

  const handleSwap = () => {
    setFromQuery(toQuery);
    setToQuery(fromQuery);
  };

  return (
    <div className="trip-planner">
      <TopBar title={t('trip_planner')} showBack={true} />

      <main className="trip-planner__content">
        {/* Search Section */}
        <section className="trip-planner__search-card">
          <form onSubmit={handleSearch} className="trip-planner__form">
            <div className="trip-planner__input-group">
              <label htmlFor="tp-from" className="trip-planner__label">
                {t('starting_point')}
              </label>
              <div className="trip-planner__input-wrapper">
                <span className="trip-planner__input-dot trip-planner__input-dot--start" aria-hidden="true" />
                <input
                  id="tp-from"
                  type="text"
                  className="trip-planner__input"
                  value={fromQuery}
                  onChange={(e) => setFromQuery(e.target.value)}
                  placeholder={t('starting_point')}
                  required
                />
              </div>
            </div>

            <div className="trip-planner__swap-row">
              <div className="trip-planner__input-divider" aria-hidden="true" />
              <button
                type="button"
                className="trip-planner__swap-btn"
                onClick={handleSwap}
                aria-label="Swap locations"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
            </div>

            <div className="trip-planner__input-group">
              <label htmlFor="tp-to" className="trip-planner__label">
                {t('destination')}
              </label>
              <div className="trip-planner__input-wrapper">
                <span className="trip-planner__input-dot trip-planner__input-dot--end" aria-hidden="true" />
                <input
                  id="tp-to"
                  type="text"
                  className="trip-planner__input"
                  value={toQuery}
                  onChange={(e) => setToQuery(e.target.value)}
                  placeholder={t('destination')}
                  required
                />
              </div>
            </div>

            <button type="submit" className="trip-planner__submit-btn">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>{t('find_routes')}</span>
            </button>
          </form>
        </section>

        {/* Loading Skeletons */}
        {showLoading && (
          <div className="trip-planner__skeletons" aria-busy="true">
            <LoadingRow />
            <LoadingRow />
            <LoadingRow />
          </div>
        )}

        {/* Result Section */}
        {!showLoading && hasSearched && plan && (
          <section className="trip-planner__result-card" aria-label="Trip Itinerary">
            {/* Summary Metrics */}
            <div className="trip-planner__summary-bar">
              <div className="trip-planner__summary-item">
                <span className="trip-planner__summary-label">{t('total_time')}</span>
                <span className="trip-planner__summary-val">
                  {plan.totalDurationMins} {t('mins')}
                </span>
              </div>
              <div className="trip-planner__summary-divider" aria-hidden="true" />
              <div className="trip-planner__summary-item">
                <span className="trip-planner__summary-label">{t('total_fare')}</span>
                <span className="trip-planner__summary-val">
                  ₹{plan.totalFare}
                </span>
              </div>
            </div>

            {/* Vertical Multi-leg Timeline */}
            <div className="trip-planner__timeline">
              {plan.legs.map((leg, index) => {
                if (leg.type === 'interchange') {
                  return (
                    <div key={index} className="trip-planner__leg trip-planner__leg--interchange">
                      <div className="trip-planner__leg-track" aria-hidden="true">
                        <span className="trip-planner__node trip-planner__node--interchange" />
                      </div>
                      <div className="trip-planner__leg-content">
                        <div className="trip-planner__interchange-box">
                          <div className="trip-planner__interchange-text">
                            <span className="trip-planner__change-label">{t('change_at')}</span>
                            <strong className="trip-planner__change-location">{leg.location}</strong>
                          </div>
                          <span className="trip-planner__wait-badge">
                            <svg
                              width="13"
                              height="13"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                            {leg.waitMins} {t('mins')} {t('wait')}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Ride Leg
                const isLastLeg = index === plan.legs.length - 1;

                return (
                  <div key={index} className="trip-planner__leg trip-planner__leg--ride">
                    <div className="trip-planner__leg-track" aria-hidden="true">
                      <span className="trip-planner__node trip-planner__node--ride" />
                      {isLastLeg && (
                        <span className="trip-planner__node trip-planner__node--ride-end" />
                      )}
                    </div>
                    <div className="trip-planner__leg-content">
                      {/* Origin Stop */}
                      <div className="trip-planner__stop-point">
                        <span className="trip-planner__stop-title">{leg.from}</span>
                      </div>

                      {/* Ride Vehicle & Duration Card */}
                      <div className="trip-planner__ride-info">
                        <div className="trip-planner__route-pill">
                          <span className="trip-planner__route-tag">{t('tab_route')}</span>
                          <strong className="trip-planner__route-number">{leg.routeNumber}</strong>
                        </div>
                        <span className="trip-planner__ride-duration">
                          {leg.durationMins} {t('mins')} {t('ride')}
                        </span>
                      </div>

                      {/* Final Destination Stop if last leg */}
                      {isLastLeg && (
                        <div className="trip-planner__stop-point trip-planner__stop-point--end">
                          <span className="trip-planner__stop-title">{leg.to}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default TripPlanner;
