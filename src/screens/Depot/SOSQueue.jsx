import React, { useState, useEffect } from 'react';
import LoadingRow from '../../components/LoadingRow';
import EmptyState from '../../components/EmptyState';
import { getSosQueue, resolveSosEvent } from '../../api/depot';
import { useDebouncedLoading } from '../../hooks/useDebouncedLoading';
import './SOSQueue.scss';

export function SOSQueue() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState(null);

  const showLoading = useDebouncedLoading(isLoading, 200);

  const loadQueue = () => {
    setIsLoading(true);
    getSosQueue().then((data) => {
      setEvents(data);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleResolve = async (id) => {
    setActionInProgress(id);
    await resolveSosEvent(id);
    setActionInProgress(null);
    loadQueue();
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      const date = d.toLocaleDateString([], { day: '2-digit', month: 'short' });
      return `${time} (${date})`;
    } catch {
      return isoString;
    }
  };

  const openCount = events.filter((e) => e.status === 'open').length;
  const resolvedCount = events.filter((e) => e.status === 'resolved').length;

  return (
    <div className="sos-queue-screen" role="region" aria-label="SOS Emergency Queue">
      {/* Top Controls / Summary */}
      <div className="sos-queue-screen__header">
        <div className="sos-queue-screen__titles">
          <h2 className="sos-queue-screen__title">SOS Emergency Queue</h2>
          <p className="sos-queue-screen__subtitle">
            Real-time emergency distress alerts from passenger devices
          </p>
        </div>

        <div className="sos-queue-screen__counters">
          <div className="sos-counter sos-counter--open">
            <span className="sos-counter__val">{openCount}</span>
            <span className="sos-counter__lbl">Active Alerts</span>
          </div>
          <div className="sos-counter sos-counter--resolved">
            <span className="sos-counter__val">{resolvedCount}</span>
            <span className="sos-counter__lbl">Resolved</span>
          </div>
        </div>
      </div>

      {/* Desktop Data Table */}
      <div className="sos-queue-screen__table-wrapper">
        {showLoading ? (
          <div style={{ padding: '24px' }}>
            <LoadingRow count={3} height="52px" />
          </div>
        ) : events.length === 0 ? (
          <EmptyState
            icon="bi-shield-check"
            title="No Active Emergencies"
            description="All depot vehicle emergency channels are clear. Ongoing feeds are continuously monitored."
          />
        ) : (
          <table className="sos-table">
            <thead>
              <tr>
                <th>Event ID</th>
                <th>Time</th>
                <th>Passenger</th>
                <th>Location</th>
                <th>Route</th>
                <th>Vehicle Plate</th>
                <th>Status</th>
                <th className="sos-table__action-col">Action</th>
              </tr>
            </thead>
            <tbody>
              {events.map((evt) => {
                const isOpen = evt.status === 'open';

                return (
                  <tr
                    key={evt.id}
                    className={`sos-table__row ${isOpen ? 'sos-table__row--open' : 'sos-table__row--resolved'}`}
                  >
                    <td className="sos-table__id">{evt.id}</td>
                    <td className="sos-table__time">{formatDateTime(evt.raisedAt)}</td>
                    <td className="sos-table__passenger">{evt.passengerName}</td>
                    <td className="sos-table__location">
                      <i className="bi bi-geo-alt-fill" aria-hidden="true" />
                      <span>{evt.location}</span>
                    </td>
                    <td className="sos-table__route">
                      <span className="sos-table__route-badge">{evt.routeNumber}</span>
                    </td>
                    <td className="sos-table__reg">{evt.busRegistration}</td>
                    <td>
                      <span
                        className={`sos-status-pill ${
                          isOpen ? 'sos-status-pill--open' : 'sos-status-pill--resolved'
                        }`}
                      >
                        {isOpen && <span className="sos-status-pill__dot" />}
                        {isOpen ? 'Open' : 'Resolved'}
                      </span>
                    </td>
                    <td className="sos-table__action-col">
                      {isOpen ? (
                        <button
                          type="button"
                          className="sos-table__resolve-btn"
                          disabled={actionInProgress === evt.id}
                          onClick={() => handleResolve(evt.id)}
                          aria-label={`Mark SOS ${evt.id} as Resolved`}
                        >
                          <i className="bi bi-check-circle-fill" aria-hidden="true" />
                          <span>{actionInProgress === evt.id ? 'Resolving...' : 'Mark as Resolved'}</span>
                        </button>
                      ) : (
                        <span className="sos-table__done-tag">
                          <i className="bi bi-check2-all" aria-hidden="true" />
                          <span>Handled</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default SOSQueue;
