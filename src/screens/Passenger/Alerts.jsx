import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import LoadingRow from '../../components/LoadingRow';
import EmptyState from '../../components/EmptyState';
import { getAlerts } from '../../api/alerts';
import { useDebouncedLoading } from '../../hooks/useDebouncedLoading';
import { useLanguage } from '../../context/LanguageContext';
import './Alerts.scss';

export function Alerts() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const showLoading = useDebouncedLoading(isLoading, 200);

  useEffect(() => {
    setIsLoading(true);
    getAlerts().then((data) => {
      setAlerts(data);
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="alerts-screen">
      <TopBar title={t('alerts')} showBack={false} />

      <main className="alerts-screen__content">
        <section className="alerts-screen__list-section" aria-label={t('alerts')}>
          {showLoading ? (
            <div className="alerts-screen__skeletons" aria-busy="true">
              <LoadingRow />
              <LoadingRow />
              <LoadingRow />
            </div>
          ) : alerts.length === 0 ? (
            <EmptyState
              icon="bi-bell-slash"
              title={t('no_alerts')}
              description={t('no_alerts_desc')}
              actionText={t('check_routes')}
              actionIcon="bi-search"
              onAction={() => navigate('/search')}
            />
          ) : (
            <ul className="alerts-screen__list" role="list">
              {alerts.map((alert) => {
                const isDelay = alert.type === 'delay';
                const typeLabel = isDelay ? t('delay') : t('cancellation');
                const message =
                  language === 'kn' && alert.messageKn
                    ? alert.messageKn
                    : alert.message;

                return (
                  <li
                    key={alert.id}
                    className={`alerts-screen__card alerts-screen__card--${alert.type}`}
                  >
                    <div className="alerts-screen__card-header">
                      <div className="alerts-screen__route-badge">
                        {alert.routeNumber}
                      </div>
                      <span
                        className={`alerts-screen__type-pill alerts-screen__type-pill--${alert.type}`}
                      >
                        {typeLabel}
                      </span>
                    </div>

                    <p className="alerts-screen__card-message">{message}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default Alerts;
