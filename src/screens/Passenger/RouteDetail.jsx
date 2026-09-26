import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import LoadingRow from '../../components/LoadingRow';
import { getRouteDetail } from '../../api/routes';
import { checkSavedStatus, toggleSavedRoute } from '../../api/user';
import { useDebouncedLoading } from '../../hooks/useDebouncedLoading';
import { useLanguage } from '../../context/LanguageContext';
import { useSimulation } from '../../context/SimulationContext';
import { useNetwork } from '../../hooks/useNetwork';
import OfflineStrip from '../../components/OfflineStrip';
import RouteMap from '../../components/RouteMap';
import { formatTime, formatFare } from '../../utils/helpers';
import './RouteDetail.scss';

export function RouteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { liveBuses } = useSimulation();
  const { isOnline } = useNetwork();

  const [routeDetail, setRouteDetail] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('stops'); // 'stops' | 'timetable' | 'map'
  const [isLoading, setIsLoading] = useState(true);
  const [busTops, setBusTops] = useState({});

  const timelineRef = useRef(null);
  const showLoading = useDebouncedLoading(isLoading, 200);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      getRouteDetail(id),
      checkSavedStatus(id, 'route')
    ]).then(([data, savedStatus]) => {
      setRouteDetail(data);
      setIsSaved(savedStatus);
      setIsLoading(false);
    });
  }, [id]);

  const handleToggleSaved = () => {
    toggleSavedRoute(id).then((newStatus) => {
      setIsSaved(newStatus);
    });
  };

  // Filter running buses with GPS for this route
  const activeBuses = liveBuses.filter(
    (b) =>
      (b.routeId || b.route_id) === id &&
      (b.currentStatus || b.current_status) === 'running' &&
      (b.hasGps ?? b.has_gps ?? false)
  );

  // Calculate live bus vertical positions along the timeline track
  useLayoutEffect(() => {
    if (activeTab !== 'stops' || !timelineRef.current || !routeDetail) return;

    const updatePositions = () => {
      const timelineEl = timelineRef.current;
      if (!timelineEl) return;
      const items = timelineEl.querySelectorAll('.route-detail__timeline-item');
      if (!items || items.length === 0) return;

      const newTops = {};
      const maxIndex = Math.min(items.length - 1, routeDetail.stops.length - 1);

      activeBuses.forEach((bus) => {
        const progress = typeof bus.progress === 'number' ? bus.progress : 0;
        const clampedProgress = Math.max(0, Math.min(progress, maxIndex));

        const fromIndex = Math.floor(clampedProgress);
        const toIndex = Math.min(fromIndex + 1, maxIndex);
        const fraction = clampedProgress - fromIndex;

        const fromItem = items[fromIndex];
        const toItem = items[toIndex];
        const fromDot = fromItem?.querySelector('.route-detail__timeline-dot');
        const toDot = toItem?.querySelector('.route-detail__timeline-dot');

        if (fromDot && toDot) {
          const fromY =
            fromItem.offsetTop + fromDot.offsetTop + fromDot.offsetHeight / 2;
          const toY =
            toItem.offsetTop + toDot.offsetTop + toDot.offsetHeight / 2;
          newTops[bus.id] = fromY + (toY - fromY) * fraction;
        }
      });

      setBusTops(newTops);
    };

    updatePositions();
    window.addEventListener('resize', updatePositions);
    return () => window.removeEventListener('resize', updatePositions);
  }, [liveBuses, activeTab, routeDetail]);

  const handleStopClick = (stopId) => {
    navigate(`/stop/${stopId}`);
  };

  return (
    <div className="route-detail">
      <TopBar
        title={routeDetail ? routeDetail.route.routeNumber : ''}
        showBack={true}
        right={
          <button
            type="button"
            className={`top-bar__heart-btn ${
              isSaved
                ? 'top-bar__heart-btn--saved'
                : 'top-bar__heart-btn--unsaved'
            }`}
            onClick={handleToggleSaved}
            aria-label={isSaved ? 'Remove from saved' : 'Save route'}
          >
            {isSaved ? (
              <i className="bi bi-heart-fill"></i>
            ) : (
              <i className="bi bi-heart"></i>
            )}
          </button>
        }
      />

      <main className="route-detail__content">
        {showLoading ? (
          <div className="route-detail__skeletons" aria-busy="true">
            <LoadingRow />
            <LoadingRow />
            <LoadingRow />
          </div>
        ) : (
          routeDetail && (
            <>
              {/* Header Section */}
              <section className="route-detail__header-card">
                <div className="route-detail__path-row">
                  <span className="route-detail__from">
                    {routeDetail.route.from}
                  </span>
                  <span className="route-detail__arrow" aria-hidden="true">
                    →
                  </span>
                  <span className="route-detail__to">
                    {routeDetail.route.to}
                  </span>
                </div>

                <div className="route-detail__meta-grid">
                  <div className="route-detail__meta-item">
                    <span className="route-detail__meta-label">
                      {t('fare')}
                    </span>
                    <span className="route-detail__meta-value">
                      {formatFare(
                        routeDetail.route.baseFare,
                        routeDetail.route.maxFare
                      )}
                    </span>
                  </div>

                  <div className="route-detail__meta-item">
                    <span className="route-detail__meta-label">
                      {t('last_bus')}
                    </span>
                    <span className="route-detail__meta-value">
                      {formatTime(routeDetail.lastBus)}
                    </span>
                  </div>
                </div>
              </section>

              {/* 2-segment Tab Control */}
              <div className="route-detail__tabs" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'stops'}
                  className={`route-detail__tab ${
                    activeTab === 'stops' ? 'route-detail__tab--active' : ''
                  }`}
                  onClick={() => setActiveTab('stops')}
                >
                  {t('stops')}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'timetable'}
                  className={`route-detail__tab ${
                    activeTab === 'timetable'
                      ? 'route-detail__tab--active'
                      : ''
                  }`}
                  onClick={() => setActiveTab('timetable')}
                >
                  {t('timetable')}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'map'}
                  className={`route-detail__tab ${
                    activeTab === 'map' ? 'route-detail__tab--active' : ''
                  }`}
                  onClick={() => setActiveTab('map')}
                >
                  {t('tab_map')}
                </button>
              </div>

              {/* Tab Views */}
              {activeTab === 'stops' && (
                <section
                  className="route-detail__stops-section"
                  aria-label={t('stops')}
                >
                  <ol
                    ref={timelineRef}
                    className="route-detail__timeline"
                    role="list"
                  >
                    {/* Live Bus Markers */}
                    {activeBuses.map((bus) => {
                      const topPx = busTops[bus.id];
                      if (topPx === undefined) return null;

                      return (
                        <div
                          key={bus.id}
                          className="route-detail__live-bus"
                          style={{ top: `${topPx}px` }}
                          aria-label={`Live bus ${bus.registrationNumber}`}
                        >
                          <div
                            className="route-detail__live-bus-dot"
                            aria-hidden="true"
                          />
                          <span className="route-detail__live-bus-badge">
                            {bus.registrationNumber.split(' ').pop()}
                          </span>
                        </div>
                      );
                    })}

                    {/* Stops List */}
                    {routeDetail.stops.map((stop, index) => {
                      const isFirst = index === 0;
                      const isLast = index === routeDetail.stops.length - 1;

                      return (
                        <li
                          key={stop.id}
                          className={`route-detail__timeline-item ${
                            isFirst ? 'route-detail__timeline-item--first' : ''
                          } ${
                            isLast ? 'route-detail__timeline-item--last' : ''
                          }`}
                          onClick={() => handleStopClick(stop.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              handleStopClick(stop.id);
                            }
                          }}
                          role="button"
                          tabIndex={0}
                        >
                          <div
                            className="route-detail__timeline-track"
                            aria-hidden="true"
                          >
                            <span className="route-detail__timeline-dot" />
                          </div>
                          <div className="route-detail__timeline-content">
                            <span className="route-detail__stop-name">
                              {language === 'kn' && stop.nameKn
                                ? stop.nameKn
                                : stop.name}
                            </span>
                            <span className="route-detail__stop-meta">
                              {stop.stopCode} • {stop.corporation}
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </section>
              )}

              {activeTab === 'timetable' && (
                <section
                  className="route-detail__timetable-section"
                  aria-label={t('timetable')}
                >
                  <div className="route-detail__timetable-grid">
                    {routeDetail.departures.map((departure, idx) => (
                      <div key={idx} className="route-detail__timetable-pill">
                        <span className="route-detail__timetable-time">
                          {formatTime(departure)}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {activeTab === 'map' && (
                <section
                  className="route-detail__map-section"
                  aria-label={t('tab_map')}
                >
                  {!isOnline ? (
                    <OfflineStrip stops={routeDetail.stops} />
                  ) : (
                    <RouteMap
                      stops={routeDetail.stops}
                      liveBuses={activeBuses}
                    />
                  )}
                </section>
              )}
            </>
          )
        )}
      </main>
    </div>
  );
}

export default RouteDetail;
