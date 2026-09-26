import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './BottomNav.scss';

export function BottomNav() {
  const { t } = useLanguage();
  const location = useLocation();

  const isHomeActive = location.pathname === '/';
  const isProfileActive =
    location.pathname === '/settings' ||
    location.pathname === '/account' ||
    location.pathname === '/more' ||
    location.pathname === '/schemes' ||
    location.pathname === '/safety' ||
    location.pathname === '/complaints';
  const isSearchActive =
    location.pathname === '/search' ||
    location.pathname.startsWith('/stop/') ||
    location.pathname.startsWith('/route/') ||
    location.pathname === '/planner';

  return (
    <nav className="bottom-nav" aria-label="Bottom Navigation">
      <div className="bottom-nav__container">
        {/* 1. Home Item */}
        <NavLink
          to="/"
          className={`bottom-nav__item ${isHomeActive ? 'bottom-nav__item--active' : ''}`}
          aria-label={t('home') || 'Home'}
          aria-current={isHomeActive ? 'page' : undefined}
          end
        >
          <i
            className={`bottom-nav__icon ${isHomeActive ? 'bi bi-house-door-fill' : 'bi bi-house-door'}`}
            aria-hidden="true"
          />
        </NavLink>

        {/* 2. Profile / Account Item */}
        <NavLink
          to="/settings"
          className={`bottom-nav__item ${isProfileActive ? 'bottom-nav__item--active' : ''}`}
          aria-label={t('account') || 'Account'}
          aria-current={isProfileActive ? 'page' : undefined}
        >
          <i
            className={`bottom-nav__icon ${isProfileActive ? 'bi bi-person-fill' : 'bi bi-person'}`}
            aria-hidden="true"
          />
        </NavLink>

        {/* 3. Search / Map / Pin Item */}
        <NavLink
          to="/search"
          className={`bottom-nav__item ${isSearchActive ? 'bottom-nav__item--active' : ''}`}
          aria-label={t('search') || 'Map'}
          aria-current={isSearchActive ? 'page' : undefined}
        >
          <i
            className={`bottom-nav__icon ${isSearchActive ? 'bi bi-geo-alt-fill' : 'bi bi-geo-alt'}`}
            aria-hidden="true"
          />
        </NavLink>
      </div>
    </nav>
  );
}

export default BottomNav;
