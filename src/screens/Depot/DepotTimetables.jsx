import React, { useState, useEffect } from 'react';
import LoadingRow from '../../components/LoadingRow';
import EmptyState from '../../components/EmptyState';
import { getDepotTimetables } from '../../api/depot';
import { useDebouncedLoading } from '../../hooks/useDebouncedLoading';
import './DepotTimetables.scss';

export function DepotTimetables() {
  const [timetables, setTimetables] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const showLoading = useDebouncedLoading(isLoading, 200);

  useEffect(() => {
    setIsLoading(true);
    getDepotTimetables().then((data) => {
      setTimetables(data);
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="depot-timetables-screen" role="region" aria-label="Depot Route Timetables">
      {/* Top Header */}
      <div className="depot-timetables-screen__header">
        <div className="depot-timetables-screen__titles">
          <h2 className="depot-timetables-screen__title">Depot Master Timetables</h2>
          <p className="depot-timetables-screen__subtitle">
            Scheduled departures, corridor allocations, and service frequencies
          </p>
        </div>

        <div className="depot-timetables-screen__summary-pill">
          <i className="bi bi-clock-history" aria-hidden="true" />
          <span>{timetables.length} Master Schedules</span>
        </div>
      </div>

      {/* Desktop Timetables Table / Card View */}
      <div className="depot-timetables-screen__content">
        {showLoading ? (
          <div style={{ padding: '24px' }}>
            <LoadingRow count={3} height="60px" />
          </div>
        ) : timetables.length === 0 ? (
          <EmptyState
            icon="bi-calendar2-x"
            title="No Timetables Found"
            description="No scheduled routes found for this depot selection."
          />
        ) : (
          <div className="timetable-grid">
            {timetables.map((item) => (
              <div key={item.id} className="timetable-card">
                <div className="timetable-card__header">
                  <div className="timetable-card__route-group">
                    <span className="timetable-card__route-badge">{item.routeNumber}</span>
                    <span className="timetable-card__corp-tag">{item.corporation || 'BMTC'}</span>
                  </div>
                  <span className="timetable-card__direction">
                    Direction: {item.direction ? item.direction.toUpperCase() : 'UP'}
                  </span>
                </div>

                <div className="timetable-card__path">
                  <span className="timetable-card__stop">{item.from}</span>
                  <i className="bi bi-arrow-right" aria-hidden="true" />
                  <span className="timetable-card__stop">{item.to}</span>
                </div>

                <div className="timetable-card__departures-section">
                  <span className="timetable-card__dep-label">
                    Scheduled Departures ({item.departures ? item.departures.length : 0} runs)
                  </span>
                  <div className="timetable-card__chips">
                    {(item.departures || []).map((time, idx) => (
                      <span key={idx} className="timetable-card__chip">
                        {time}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DepotTimetables;
