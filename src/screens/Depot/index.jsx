import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { getDepotInfo } from '../../api/depot';
import './index.scss';

export function DepotLayout() {
  const [depot, setDepot] = useState(null);

  useEffect(() => {
    getDepotInfo().then((data) => {
      setDepot(data);
    });
  }, []);

  return (
    <div className="depot-layout">
      {/* Sidebar Navigation */}
      <aside className="depot-sidebar" aria-label="Depot Control Sidebar">
        <div className="depot-sidebar__brand">
          <div className="depot-sidebar__logo">
            <i className="bi bi-bus-front-fill" aria-hidden="true" />
          </div>
          <div className="depot-sidebar__title-box">
            <span className="depot-sidebar__title">KBUS Control</span>
            <span className="depot-sidebar__subtitle">Depot Operations</span>
          </div>
        </div>

        <nav className="depot-sidebar__nav">
          <NavLink
            to="/depot"
            end
            className={({ isActive }) =>
              `depot-sidebar__link ${isActive ? 'depot-sidebar__link--active' : ''}`
            }
          >
            <i className="bi bi-map-fill" aria-hidden="true" />
            <span>Fleet Map</span>
          </NavLink>

          <NavLink
            to="/depot/timetables"
            className={({ isActive }) =>
              `depot-sidebar__link ${isActive ? 'depot-sidebar__link--active' : ''}`
            }
          >
            <i className="bi bi-calendar3" aria-hidden="true" />
            <span>Timetables</span>
          </NavLink>

          <NavLink
            to="/depot/sos"
            className={({ isActive }) =>
              `depot-sidebar__link ${isActive ? 'depot-sidebar__link--active' : ''}`
            }
          >
            <i className="bi bi-shield-exclamation" aria-hidden="true" />
            <span>SOS Queue</span>
          </NavLink>

          <NavLink
            to="/depot/complaints"
            className={({ isActive }) =>
              `depot-sidebar__link ${isActive ? 'depot-sidebar__link--active' : ''}`
            }
          >
            <i className="bi bi-chat-dots-fill" aria-hidden="true" />
            <span>Complaints</span>
          </NavLink>
        </nav>

        <div className="depot-sidebar__footer">
          <NavLink to="/" className="depot-sidebar__passenger-link" title="Switch to Passenger View">
            <i className="bi bi-phone" aria-hidden="true" />
            <span>Passenger View</span>
          </NavLink>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="depot-main">
        {/* Top Header */}
        <header className="depot-header">
          <div className="depot-header__left">
            <h1 className="depot-header__title">
              {depot ? depot.name : 'Bengaluru Central Control'}
            </h1>
            {depot && (
              <div className="depot-header__badges">
                <span className="depot-header__corp-badge">{depot.corporation}</span>
                <span className="depot-header__district-tag">{depot.district}</span>
              </div>
            )}
          </div>

          <div className="depot-header__right">
            <div className="depot-header__live-status">
              <span className="depot-header__live-dot" />
              <span>Live Control</span>
            </div>
          </div>
        </header>

        {/* Dynamic Route Screen */}
        <div className="depot-content">
          <Outlet context={{ depot }} />
        </div>
      </div>
    </div>
  );
}

export default DepotLayout;
