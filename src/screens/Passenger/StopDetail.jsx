import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import LoadingRow from '../../components/LoadingRow';
import EmptyState from '../../components/EmptyState';
import { getStop, getArrivals } from '../../api/stops';
import { checkSavedStatus, toggleSavedStop } from '../../api/user';
import { createStopAlert } from '../../api/alerts';
import { useDebouncedLoading } from '../../hooks/useDebouncedLoading';
import { useLanguage } from '../../context/LanguageContext';
import Sheet from '../../components/Sheet';
import './StopDetail.scss';

export function StopDetail() {
  const { id } = useParams();
  const { t } = useLanguage();
  const [stop, setStop] = useState({ name: '' });
  const [arrivals, setArrivals] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Stop Alert setup state
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [alertRouteId, setAlertRouteId] = useState('');
  const [alertMinutes, setAlertMinutes] = useState(5);
  const [alertSavedFeedback, setAlertSavedFeedback] = useState(false);

  const showLoading = useDebouncedLoading(isLoading, 200);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      getStop(id),
      getArrivals(id),
      checkSavedStatus(id, 'stop')
    ]).then(([stopData, arrivalsData, savedStatus]) => {
      setStop(stopData);
      setArrivals(arrivalsData);
      setIsSaved(savedStatus);
      if (arrivalsData && arrivalsData.length > 0) {
        setAlertRouteId(arrivalsData[0].routeId || 'route_01');
      } else {
        setAlertRouteId('route_01');
      }
      setIsLoading(false);
    });
  }, [id]);

  const handleToggleSaved = () => {
    toggleSavedStop(id).then((newStatus) => {
      setIsSaved(newStatus);
    });
  };

  const handleSaveAlert = (e) => {
    e.preventDefault();
    createStopAlert({
      stopId: id,
      routeId: alertRouteId || 'route_01',
      minutes: Number(alertMinutes) || 5
    }).then(() => {
      setIsSheetOpen(false);
      setAlertSavedFeedback(true);
      setTimeout(() => {
        setAlertSavedFeedback(false);
      }, 3000);
    });
  };

  // Derive unique route options for alert setup
  const uniqueRoutes = arrivals
    ? Array.from(
        new Map(
          arrivals.map((a) => [a.routeId || a.routeNumber, a])
        ).values()
      )
    : [];

  return (
    <div className="stop-detail">
      <TopBar
        title={stop.name}
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
            aria-label={isSaved ? 'Remove from saved' : 'Save stop'}
          >
            {isSaved ? (
              <i className="bi bi-heart-fill"></i>
            ) : (
              <i className="bi bi-heart"></i>
            )}
          </button>
        }
      />

      <main className="stop-detail__content">
        {/* Set Alert Trigger Banner */}
        <section className="stop-detail__alert-action-bar">
          <button
            type="button"
            className={`stop-detail__alert-btn ${
              alertSavedFeedback ? 'stop-detail__alert-btn--saved' : ''
            }`}
            onClick={() => setIsSheetOpen(true)}
            aria-label={alertSavedFeedback ? t('alert_saved') : t('set_alert')}
          >
            <i
              className={
                alertSavedFeedback ? 'bi bi-bell-fill' : 'bi bi-bell'
              }
              aria-hidden="true"
            />
            <span>
              {alertSavedFeedback ? t('alert_saved') : t('set_alert')}
            </span>
          </button>
        </section>

        <section className="stop-detail__arrivals-section" aria-label={t('arrivals')}>
          <div className="stop-detail__section-header">
            <h2 className="stop-detail__section-title">{t('arrivals')}</h2>
          </div>

          {showLoading ? (
            <div className="stop-detail__skeletons" aria-busy="true">
              <LoadingRow />
              <LoadingRow />
              <LoadingRow />
            </div>
          ) : arrivals && arrivals.length === 0 ? (
            <EmptyState
              icon="bi-bus-front"
              title={t('no_arrivals')}
              description={t('no_arrivals_desc')}
            />
          ) : (
            arrivals && (
              <ul className="stop-detail__list" role="list">
                {arrivals.map((arrival) => (
                  <li key={arrival.id} className="stop-detail__card">
                    <div className="stop-detail__card-primary">
                      <div className="stop-detail__route-badge">
                        {arrival.routeNumber}
                      </div>
                      <div className="stop-detail__route-info">
                        <span className="stop-detail__destination">
                          {arrival.destination}
                        </span>
                      </div>
                    </div>

                    <div className="stop-detail__card-secondary">
                      <div className="stop-detail__eta">
                        <span className="stop-detail__eta-time">
                          {arrival.expectedMinutes}
                        </span>
                        <span className="stop-detail__eta-unit">
                          {t('mins_away')}
                        </span>
                      </div>
                      <div
                        className={`stop-detail__status stop-detail__status--${arrival.status}`}
                      >
                        <span className="stop-detail__status-dot" aria-hidden="true" />
                        <span className="stop-detail__status-text">
                          {arrival.status === 'on_time' ? t('on_time') : t('delayed')}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )
          )}
        </section>
      </main>

      {/* Set Alert Bottom Sheet */}
      <Sheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title={t('set_alert')}
      >
        <form onSubmit={handleSaveAlert} className="stop-detail__sheet-form">
          <div className="stop-detail__form-group">
            <label htmlFor="sheet-route-select" className="stop-detail__form-label">
              {t('tab_route')}
            </label>
            <select
              id="sheet-route-select"
              className="stop-detail__form-select"
              value={alertRouteId}
              onChange={(e) => setAlertRouteId(e.target.value)}
            >
              {uniqueRoutes.length > 0 ? (
                uniqueRoutes.map((r) => (
                  <option key={r.id || r.routeId} value={r.routeId || r.id}>
                    {r.routeNumber} → {r.destination}
                  </option>
                ))
              ) : (
                <option value="route_01">500D</option>
              )}
            </select>
          </div>

          <div className="stop-detail__form-group">
            <label htmlFor="sheet-minutes-input" className="stop-detail__form-label">
              {t('alert_me_when')}
            </label>
            <div className="stop-detail__minutes-input-row">
              <input
                id="sheet-minutes-input"
                type="number"
                min="1"
                max="60"
                className="stop-detail__form-input"
                value={alertMinutes}
                onChange={(e) => setAlertMinutes(e.target.value)}
                required
              />
              <span className="stop-detail__minutes-suffix">
                {t('mins_away')}
              </span>
            </div>
          </div>

          <button type="submit" className="stop-detail__sheet-submit-btn">
            {t('save_alert')}
          </button>
        </form>
      </Sheet>
    </div>
  );
}

export default StopDetail;
