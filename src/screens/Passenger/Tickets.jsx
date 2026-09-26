import React, { useState, useEffect } from 'react';
import TopBar from '../../components/TopBar';
import LoadingRow from '../../components/LoadingRow';
import Sheet from '../../components/Sheet';
import { getTicketsAndPasses } from '../../api/tickets';
import { useDebouncedLoading } from '../../hooks/useDebouncedLoading';
import { useLanguage } from '../../context/LanguageContext';
import './Tickets.scss';

export function Tickets() {
  const { t } = useLanguage();
  const [activeSegment, setActiveSegment] = useState('tickets'); // 'tickets' | 'passes'
  const [ticketsData, setTicketsData] = useState({ tickets: [], passes: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [activeSheet, setActiveSheet] = useState(null); // null | 'intercity' | 'ncmc'

  const showLoading = useDebouncedLoading(isLoading, 200);

  useEffect(() => {
    setIsLoading(true);
    getTicketsAndPasses().then((data) => {
      setTicketsData(data);
      setIsLoading(false);
    });
  }, []);

  const activeTicket = ticketsData.tickets.find((t) => t.status === 'active');
  const pastTickets = ticketsData.tickets.filter((t) => t.status !== 'active');

  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return isoString;
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="tickets-screen">
      <TopBar title={t('tickets')} showBack={false} />

      <main className="tickets-screen__content">
        {/* 2-Segment Switcher */}
        <div className="tickets-screen__segment-bar" role="tablist" aria-label={t('tickets')}>
          <button
            type="button"
            role="tab"
            aria-selected={activeSegment === 'tickets'}
            className={`tickets-screen__segment-btn ${
              activeSegment === 'tickets' ? 'tickets-screen__segment-btn--active' : ''
            }`}
            onClick={() => setActiveSegment('tickets')}
          >
            {t('tickets')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeSegment === 'passes'}
            className={`tickets-screen__segment-btn ${
              activeSegment === 'passes' ? 'tickets-screen__segment-btn--active' : ''
            }`}
            onClick={() => setActiveSegment('passes')}
          >
            {t('passes')}
          </button>
        </div>

        {showLoading ? (
          <div className="tickets-screen__skeletons" aria-busy="true">
            <LoadingRow />
            <LoadingRow />
            <LoadingRow />
          </div>
        ) : activeSegment === 'tickets' ? (
          <div className="tickets-screen__tab-content">
            {/* Quick Mock Actions: Intercity Booking & NCMC Card */}
            <div className="tickets-screen__action-grid">
              <button
                type="button"
                className="tickets-screen__action-card"
                onClick={() => setActiveSheet('intercity')}
                aria-label={t('intercity_booking')}
              >
                <div className="tickets-screen__action-icon tickets-screen__action-icon--ksrtc">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="15" rx="3" />
                    <circle cx="7.5" cy="15.5" r="1.5" />
                    <circle cx="16.5" cy="15.5" r="1.5" />
                    <path d="M3 10h18" />
                  </svg>
                </div>
                <div className="tickets-screen__action-info">
                  <span className="tickets-screen__action-title">{t('intercity_booking')}</span>
                  <span className="tickets-screen__action-sub">{t('ksrtc_intercity_sub')}</span>
                </div>
                <svg className="tickets-screen__action-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              <button
                type="button"
                className="tickets-screen__action-card"
                onClick={() => setActiveSheet('ncmc')}
                aria-label={t('ncmc_card')}
              >
                <div className="tickets-screen__action-icon tickets-screen__action-icon--ncmc">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                </div>
                <div className="tickets-screen__action-info">
                  <span className="tickets-screen__action-title">{t('ncmc_card')}</span>
                  <span className="tickets-screen__action-sub">{t('ncmc_card_sub')}</span>
                </div>
                <svg className="tickets-screen__action-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            {/* Active Ticket */}
            {activeTicket && (
              <section className="tickets-screen__active-section" aria-label={t('active_ticket')}>
                <div className="tickets-screen__section-header">
                  <h2 className="tickets-screen__section-title">{t('active_ticket')}</h2>
                  <span className="tickets-screen__live-pill">
                    <span className="tickets-screen__live-dot" />
                    {t('active')}
                  </span>
                </div>

                <div className="tickets-screen__active-card">
                  {/* Accent Top Bar */}
                  <div className="tickets-screen__active-accent-bar" />

                  <div className="tickets-screen__active-header">
                    <div className="tickets-screen__badge-group">
                      <span className="tickets-screen__route-badge">{activeTicket.routeNumber}</span>
                      <span className="tickets-screen__ticket-num">{activeTicket.ticketNumber}</span>
                    </div>
                    <div className="tickets-screen__fare-tag">₹{activeTicket.fareAmount}</div>
                  </div>

                  {/* Route Stops */}
                  <div className="tickets-screen__route-flow">
                    <div className="tickets-screen__stop-node">
                      <div className="tickets-screen__stop-point tickets-screen__stop-point--origin" />
                      <div className="tickets-screen__stop-meta">
                        <span className="tickets-screen__stop-label">{t('from')}</span>
                        <span className="tickets-screen__stop-name">{activeTicket.fromStopName}</span>
                      </div>
                    </div>

                    <div className="tickets-screen__route-line">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="7 13 12 18 17 13" />
                        <line x1="12" y1="6" x2="12" y2="18" />
                      </svg>
                    </div>

                    <div className="tickets-screen__stop-node">
                      <div className="tickets-screen__stop-point tickets-screen__stop-point--dest" />
                      <div className="tickets-screen__stop-meta">
                        <span className="tickets-screen__stop-label">{t('to')}</span>
                        <span className="tickets-screen__stop-name">{activeTicket.toStopName}</span>
                      </div>
                    </div>
                  </div>

                  {/* QR Box & Validity */}
                  <div className="tickets-screen__qr-box">
                    <div className="tickets-screen__qr-graphic" aria-label={t('qr_code')}>
                      <svg width="72" height="72" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 2h2v4h-2v-4zm-4-4h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h4v2h-4v-2zm2 4h2v2h-2v-2zm-6 2h4v2h-4v-2zM5 5h2v2H5V5zm12 0h2v2h-2V5zM5 17h2v2H5v-2z" />
                      </svg>
                      <span className="tickets-screen__qr-payload">{activeTicket.ticketNumber}</span>
                    </div>

                    <div className="tickets-screen__qr-details">
                      <div className="tickets-screen__valid-box">
                        <span className="tickets-screen__valid-label">{t('valid_until')}</span>
                        <span className="tickets-screen__valid-time">{formatTime(activeTicket.validUntil)}</span>
                      </div>
                      <p className="tickets-screen__qr-hint">{t('tap_to_view_qr')}</p>
                      <div className="tickets-screen__ticket-tags">
                        <span className="tickets-screen__tag">{activeTicket.paymentMethod.toUpperCase()}</span>
                        <span className="tickets-screen__tag">{t('single_journey')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Past Tickets */}
            <section className="tickets-screen__past-section" aria-label={t('past_tickets')}>
              <h2 className="tickets-screen__section-title">{t('past_tickets')}</h2>
              <ul className="tickets-screen__past-list" role="list">
                {pastTickets.map((ticket) => (
                  <li key={ticket.id} className="tickets-screen__past-item">
                    <div className="tickets-screen__past-main">
                      <div className="tickets-screen__past-badges">
                        <span className="tickets-screen__past-route">{ticket.routeNumber}</span>
                        <span className="tickets-screen__past-number">{ticket.ticketNumber}</span>
                      </div>
                      <div className="tickets-screen__past-route-stops">
                        <span className="tickets-screen__past-stop">{ticket.fromStopName}</span>
                        <span className="tickets-screen__past-arrow">→</span>
                        <span className="tickets-screen__past-stop">{ticket.toStopName}</span>
                      </div>
                      <div className="tickets-screen__past-meta">
                        <span className="tickets-screen__past-date">{formatDate(ticket.issuedAt)}</span>
                        <span className="tickets-screen__past-dot">•</span>
                        <span className="tickets-screen__past-method">{ticket.paymentMethod.toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="tickets-screen__past-end">
                      <span className="tickets-screen__past-fare">₹{ticket.fareAmount}</span>
                      <span className="tickets-screen__past-status">{t('used')}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        ) : (
          /* Passes Tab */
          <div className="tickets-screen__tab-content" aria-label={t('my_passes')}>
            <div className="tickets-screen__passes-list">
              {ticketsData.passes.map((pass) => {
                const isExpiring = pass.status === 'expiring_soon';
                const passTypeLabel = pass.passType === 'monthly_pass' ? t('monthly_pass') : t('weekly_pass');
                const statusLabel = isExpiring ? t('expiring_soon') : t('active');

                return (
                  <div
                    key={pass.id}
                    className={`tickets-screen__pass-card ${
                      isExpiring ? 'tickets-screen__pass-card--expiring' : ''
                    }`}
                  >
                    <div className="tickets-screen__pass-accent-bar" />

                    <div className="tickets-screen__pass-header">
                      <div className="tickets-screen__pass-badges">
                        <span className="tickets-screen__pass-corp">{pass.corporation}</span>
                        <span className="tickets-screen__pass-type">{passTypeLabel}</span>
                      </div>
                      <span
                        className={`tickets-screen__pass-status-pill ${
                          isExpiring ? 'tickets-screen__pass-status-pill--expiring' : 'tickets-screen__pass-status-pill--active'
                        }`}
                      >
                        {statusLabel}
                      </span>
                    </div>

                    <div className="tickets-screen__pass-body">
                      <div className="tickets-screen__pass-number-row">
                        <span className="tickets-screen__pass-num-label">{t('pass_number')}</span>
                        <span className="tickets-screen__pass-number">{pass.passNumber}</span>
                      </div>

                      <div className="tickets-screen__pass-row">
                        <span className="tickets-screen__pass-row-label">{t('zone')}</span>
                        <span className="tickets-screen__pass-row-val">{pass.zoneOrRoute}</span>
                      </div>

                      <div className="tickets-screen__pass-row">
                        <span className="tickets-screen__pass-row-label">{t('valid_until')}</span>
                        <span className="tickets-screen__pass-row-val">
                          {formatDate(pass.validFrom)} - {formatDate(pass.validTo)}
                        </span>
                      </div>
                    </div>

                    {/* Fare Saved Highlight */}
                    <div className="tickets-screen__fare-saved-highlight">
                      <div className="tickets-screen__fare-saved-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <div className="tickets-screen__fare-saved-text">
                        <span className="tickets-screen__fare-saved-label">{t('fare_saved')}</span>
                        <span className="tickets-screen__fare-saved-val">₹{pass.fareSavedTotal}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Intercity Booking Sheet */}
      <Sheet
        isOpen={activeSheet === 'intercity'}
        onClose={() => setActiveSheet(null)}
        title={t('intercity_booking')}
      >
        <div className="tickets-sheet">
          <div className="tickets-sheet__banner">{t('sample_data_notice')}</div>

          <div className="tickets-sheet__form">
            <div className="tickets-sheet__field">
              <label className="tickets-sheet__label">{t('intercity_from')}</label>
              <input
                type="text"
                className="tickets-sheet__input"
                readOnly
                value="Bengaluru (Kempegowda BS)"
              />
            </div>

            <div className="tickets-sheet__field">
              <label className="tickets-sheet__label">{t('intercity_to')}</label>
              <input
                type="text"
                className="tickets-sheet__input"
                readOnly
                value="Mysuru (Suburban BS)"
              />
            </div>

            <div className="tickets-sheet__field">
              <label className="tickets-sheet__label">{t('intercity_date')}</label>
              <input
                type="text"
                className="tickets-sheet__input"
                readOnly
                value="26 Sep 2026"
              />
            </div>

            <button type="button" className="tickets-sheet__btn" disabled>
              {t('search_intercity_buses')}
            </button>
          </div>
        </div>
      </Sheet>

      {/* NCMC Card Sheet */}
      <Sheet
        isOpen={activeSheet === 'ncmc'}
        onClose={() => setActiveSheet(null)}
        title={t('ncmc_card')}
      >
        <div className="tickets-sheet">
          <div className="tickets-sheet__banner">{t('sample_data_notice')}</div>

          {/* RuPay NCMC Mock Card Graphic */}
          <div className="tickets-sheet__ncmc-card">
            <div className="tickets-sheet__ncmc-top">
              <span className="tickets-sheet__ncmc-chip" />
              <span className="tickets-sheet__ncmc-brand">{t('rupay_ncmc')}</span>
            </div>

            <div className="tickets-sheet__ncmc-number">•••• •••• •••• 4289</div>

            <div className="tickets-sheet__ncmc-bottom">
              <div>
                <span className="tickets-sheet__ncmc-label">{t('ncmc_card_holder')}</span>
                <span className="tickets-sheet__ncmc-val">S. Kumar</span>
              </div>
              <div className="tickets-sheet__ncmc-status-badge">{t('linked')}</div>
            </div>
          </div>

          <div className="tickets-sheet__balance-box">
            <span className="tickets-sheet__balance-label">{t('ncmc_balance')}</span>
            <span className="tickets-sheet__balance-amount">₹450.00</span>
          </div>
        </div>
      </Sheet>
    </div>
  );
}

export default Tickets;
