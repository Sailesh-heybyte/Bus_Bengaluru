import React, { useState, useEffect } from 'react';
import TopBar from '../../components/TopBar';
import LoadingRow from '../../components/LoadingRow';
import { getTicketsAndPasses } from '../../api/tickets';
import { useDebouncedLoading } from '../../hooks/useDebouncedLoading';
import { useLanguage } from '../../context/LanguageContext';
import './Tickets.scss';

export function Tickets() {
  const { t } = useLanguage();
  const [activeSegment, setActiveSegment] = useState('tickets'); // 'tickets' | 'passes'
  const [ticketsData, setTicketsData] = useState({ tickets: [], passes: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicketModal, setSelectedTicketModal] = useState(null); // ticket object | null

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
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return isoString;
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric', weekday: 'short' });
    } catch {
      return isoString;
    }
  };

  // Helper to generate a 3-letter station code just like CDG / FLR in airport transit passes
  const getStopCode = (name) => {
    if (!name) return 'STN';
    const words = name.replace(/[^a-zA-Z\s]/g, '').trim().split(/\s+/);
    if (words.length >= 3) {
      return (words[0][0] + words[1][0] + words[2][0]).toUpperCase();
    }
    if (words.length === 2) {
      return (words[0].slice(0, 2) + words[1][0]).toUpperCase();
    }
    return words[0].slice(0, 3).toUpperCase();
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
            {/* Active Ticket Spotlight Card */}
            {activeTicket && (
              <section className="tickets-screen__active-section" aria-label={t('active_ticket')}>
                <div className="tickets-screen__section-header">
                  <h2 className="tickets-screen__section-title">{t('active_ticket')}</h2>
                  <span className="tickets-screen__live-pill">
                    <span className="tickets-screen__live-dot" />
                    {t('active')}
                  </span>
                </div>

                <div
                  className="tickets-screen__active-card"
                  onClick={() => setSelectedTicketModal(activeTicket)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') setSelectedTicketModal(activeTicket);
                  }}
                >
                  {/* Top Accent Strip */}
                  <div className="tickets-screen__active-accent-bar" />

                  <div className="tickets-screen__active-header">
                    <div className="tickets-screen__badge-group">
                      <span className="tickets-screen__route-badge">{activeTicket.routeNumber}</span>
                      <span className="tickets-screen__ticket-num">{activeTicket.ticketNumber}</span>
                    </div>
                    <div className="tickets-screen__fare-tag">₹{activeTicket.fareAmount}</div>
                  </div>

                  {/* Route Stops Flow */}
                  <div className="tickets-screen__route-flow">
                    <div className="tickets-screen__stop-node">
                      <div className="tickets-screen__stop-point tickets-screen__stop-point--origin" />
                      <div className="tickets-screen__stop-meta">
                        <span className="tickets-screen__stop-label">{t('from')}</span>
                        <span className="tickets-screen__stop-name">{activeTicket.fromStopName}</span>
                      </div>
                    </div>

                    <div className="tickets-screen__route-line">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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

                  {/* Bottom Action Ribbon */}
                  <div className="tickets-screen__active-ribbon">
                    <div className="tickets-screen__valid-box">
                      <span className="tickets-screen__valid-label">{t('valid_until')}</span>
                      <span className="tickets-screen__valid-time">{formatTime(activeTicket.validUntil)}</span>
                    </div>

                    <div className="tickets-screen__open-pass-btn">
                      <span>View Boarding Pass & QR</span>
                      <i className="bi bi-chevron-right" />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Tickets History List */}
            <section className="tickets-screen__past-section" aria-label={t('past_tickets')}>
              <h2 className="tickets-screen__section-title">{t('past_tickets')}</h2>
              <ul className="tickets-screen__past-list" role="list">
                {pastTickets.map((ticket) => (
                  <li
                    key={ticket.id}
                    className="tickets-screen__past-item"
                    onClick={() => setSelectedTicketModal(ticket)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') setSelectedTicketModal(ticket);
                    }}
                  >
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
                      <span className="tickets-screen__past-status">{ticket.status === 'active' ? t('active') : t('used')}</span>
                      <i className="bi bi-chevron-right tickets-screen__past-chevron" aria-hidden="true" />
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
                  <div key={pass.id} className="tickets-screen__pass-card">
                    {/* Pass Top Accent Header */}
                    <div className="tickets-screen__pass-header">
                      <div className="tickets-screen__pass-corp-wrap">
                        <span className="tickets-screen__pass-corp-badge">{pass.corporation}</span>
                        <span className="tickets-screen__pass-type-title">{passTypeLabel}</span>
                      </div>
                      <span
                        className={`tickets-screen__pass-status-pill ${
                          isExpiring ? 'tickets-screen__pass-status-pill--expiring' : ''
                        }`}
                      >
                        {statusLabel}
                      </span>
                    </div>

                    {/* Pass Main Body */}
                    <div className="tickets-screen__pass-body">
                      <div className="tickets-screen__pass-row">
                        <span className="tickets-screen__pass-label">{t('pass_number')}</span>
                        <span className="tickets-screen__pass-num-val">{pass.passNumber}</span>
                      </div>

                      <div className="tickets-screen__pass-row">
                        <span className="tickets-screen__pass-label">{t('zone_coverage')}</span>
                        <span className="tickets-screen__pass-val">{pass.zoneOrRoute}</span>
                      </div>

                      <div className="tickets-screen__pass-dates-grid">
                        <div>
                          <span className="tickets-screen__pass-label">{t('valid_from')}</span>
                          <span className="tickets-screen__pass-date-val">{formatDate(pass.validFrom)}</span>
                        </div>
                        <div>
                          <span className="tickets-screen__pass-label">{t('valid_to')}</span>
                          <span className="tickets-screen__pass-date-val">{formatDate(pass.validTo)}</span>
                        </div>
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

      {/* BOARDING PASS MODAL (Pixel-perfect to Reference Image) */}
      {selectedTicketModal && (
        <div
          className="boarding-pass-overlay"
          onClick={() => setSelectedTicketModal(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="boarding-pass-title"
        >
          <div
            className="boarding-pass-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Overlay Close Button */}
            <button
              type="button"
              className="boarding-pass-card__close-btn"
              onClick={() => setSelectedTicketModal(null)}
              aria-label={t('close') || 'Close'}
            >
              <i className="bi bi-x-lg" />
            </button>

            {/* TOP CARD SECTION */}
            <div className="boarding-pass-card__top">
              {/* FROM ○ ------------ 🚌 ------------ ● TO */}
              <div className="boarding-pass-card__flight-track">
                <span className="boarding-pass-card__track-endpoint">FROM ○</span>
                <div className="boarding-pass-card__track-middle">
                  <span className="boarding-pass-card__track-duration">45 minutes</span>
                  <div className="boarding-pass-card__track-pill">Direct</div>
                  <div className="boarding-pass-card__track-dash" />
                  <div className="boarding-pass-card__track-bus-icon">
                    <i className="bi bi-bus-front-fill" />
                  </div>
                </div>
                <span className="boarding-pass-card__track-endpoint">● TO</span>
              </div>

              {/* STATIONS & TIMES ROW */}
              <div className="boarding-pass-card__stations-grid">
                {/* Origin */}
                <div className="boarding-pass-card__station-col boarding-pass-card__station-col--from">
                  <h2 className="boarding-pass-card__code">
                    {getStopCode(selectedTicketModal.fromStopName)}
                  </h2>
                  <p className="boarding-pass-card__stop-full">
                    {selectedTicketModal.fromStopName}
                  </p>
                  <div className="boarding-pass-card__time">
                    {formatTime(selectedTicketModal.issuedAt) || '09:30 AM'}
                  </div>
                  <div className="boarding-pass-card__date">
                    {formatDate(selectedTicketModal.issuedAt) || 'Sep 26, Sat'}
                  </div>
                </div>

                {/* Destination */}
                <div className="boarding-pass-card__station-col boarding-pass-card__station-col--to">
                  <h2 className="boarding-pass-card__code">
                    {getStopCode(selectedTicketModal.toStopName)}
                  </h2>
                  <p className="boarding-pass-card__stop-full">
                    {selectedTicketModal.toStopName}
                  </p>
                  <div className="boarding-pass-card__time">
                    {formatTime(selectedTicketModal.validUntil) || '11:15 AM'}
                  </div>
                  <div className="boarding-pass-card__date">
                    {formatDate(selectedTicketModal.validUntil || selectedTicketModal.issuedAt) || 'Sep 26, Sat'}
                  </div>
                </div>
              </div>

              {/* EXECUTIVE 2x2 SEGMENTED MATRIX (Zero Overflow, Classic & Serene) */}
              <div className="boarding-pass-card__mid-matrix">
                {/* Row 1: Boarding Time & High-Contrast Route Badge */}
                <div className="boarding-pass-card__matrix-row">
                  <div className="boarding-pass-card__matrix-col">
                    <span className="boarding-pass-card__matrix-label">Boarding Time</span>
                    <span className="boarding-pass-card__matrix-val">
                      {formatTime(selectedTicketModal.issuedAt) || '09:00 AM'}
                    </span>
                  </div>
                  <div className="boarding-pass-card__matrix-col boarding-pass-card__matrix-col--right">
                    <span className="boarding-pass-card__matrix-label">Route</span>
                    <div className="boarding-pass-card__route-badge">
                      <i className="bi bi-signpost-split-fill" />
                      <span>{selectedTicketModal.routeNumber || '500D'}</span>
                    </div>
                  </div>
                </div>

                {/* Subtle Translucent Hairline Divider */}
                <div className="boarding-pass-card__matrix-divider" />

                {/* Row 2: Bus Vehicle Plate & Service Class */}
                <div className="boarding-pass-card__matrix-row">
                  <div className="boarding-pass-card__matrix-col">
                    <span className="boarding-pass-card__matrix-label">Vehicle No</span>
                    <span className="boarding-pass-card__matrix-val boarding-pass-card__matrix-val--mono">
                      KA-01-F-4012
                    </span>
                  </div>
                  <div className="boarding-pass-card__matrix-col boarding-pass-card__matrix-col--right">
                    <span className="boarding-pass-card__matrix-label">Service</span>
                    <span className="boarding-pass-card__matrix-val boarding-pass-card__matrix-val--service">
                      Direct Express
                    </span>
                  </div>
                </div>
              </div>

              {/* PASSENGER & FARE DETAILS ROW (Spacious 2 Columns) */}
              <div className="boarding-pass-card__passenger-row">
                <div className="boarding-pass-card__pass-col">
                  <span className="boarding-pass-card__pass-label">Passenger</span>
                  <span className="boarding-pass-card__pass-val">Ravi Kumar</span>
                </div>
                <div className="boarding-pass-card__pass-col boarding-pass-card__pass-col--fare">
                  <span className="boarding-pass-card__pass-label">Fare</span>
                  <span className="boarding-pass-card__pass-val">
                    ₹{selectedTicketModal.fareAmount} ({selectedTicketModal.paymentMethod?.toUpperCase() || 'UPI'})
                  </span>
                </div>
              </div>
            </div>

            {/* PERFORATION DIVIDER WITH NOTCHES */}
            <div className="boarding-pass-card__perforation">
              <div className="boarding-pass-card__notch boarding-pass-card__notch--left" />
              <div className="boarding-pass-card__perforated-line" />
              <div className="boarding-pass-card__notch boarding-pass-card__notch--right" />
            </div>

            {/* BOTTOM STUB: QR CODE IN PLACE OF BARCODE */}
            <div className="boarding-pass-card__stub">
              <div className="boarding-pass-card__qr-box">
                {/* High-Definition Responsive QR Code Vector */}
                <svg
                  className="boarding-pass-card__qr-svg"
                  viewBox="0 0 120 120"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="120" height="120" rx="10" fill="#FFFFFF" />

                  {/* Corner Targets */}
                  {/* Top-Left */}
                  <rect x="10" y="10" width="30" height="30" rx="5" fill="#0F172A" />
                  <rect x="16" y="16" width="18" height="18" rx="2" fill="#FFFFFF" />
                  <rect x="21" y="21" width="8" height="8" rx="1" fill="#0F172A" />

                  {/* Top-Right */}
                  <rect x="80" y="10" width="30" height="30" rx="5" fill="#0F172A" />
                  <rect x="86" y="16" width="18" height="18" rx="2" fill="#FFFFFF" />
                  <rect x="91" y="21" width="8" height="8" rx="1" fill="#0F172A" />

                  {/* Bottom-Left */}
                  <rect x="10" y="80" width="30" height="30" rx="5" fill="#0F172A" />
                  <rect x="16" y="86" width="18" height="18" rx="2" fill="#FFFFFF" />
                  <rect x="21" y="91" width="8" height="8" rx="1" fill="#0F172A" />

                  {/* Data patterns */}
                  <rect x="46" y="12" width="6" height="6" fill="#0F172A" rx="1" />
                  <rect x="58" y="12" width="6" height="6" fill="#0F172A" rx="1" />
                  <rect x="68" y="12" width="6" height="6" fill="#0F172A" rx="1" />

                  <rect x="46" y="24" width="8" height="6" fill="#0284C7" rx="1" />
                  <rect x="58" y="24" width="8" height="6" fill="#0F172A" rx="1" />

                  <rect x="46" y="36" width="6" height="6" fill="#0F172A" rx="1" />
                  <rect x="56" y="36" width="6" height="6" fill="#0F172A" rx="1" />
                  <rect x="68" y="36" width="6" height="6" fill="#0F172A" rx="1" />

                  {/* Center Modules */}
                  <rect x="20" y="48" width="6" height="6" fill="#0F172A" rx="1" />
                  <rect x="32" y="48" width="8" height="6" fill="#0F172A" rx="1" />
                  <rect x="46" y="48" width="8" height="8" fill="#0284C7" rx="1" />
                  <rect x="60" y="48" width="6" height="6" fill="#0F172A" rx="1" />
                  <rect x="72" y="48" width="8" height="6" fill="#0F172A" rx="1" />
                  <rect x="86" y="48" width="6" height="6" fill="#0F172A" rx="1" />
                  <rect x="98" y="48" width="8" height="6" fill="#0F172A" rx="1" />

                  <rect x="14" y="60" width="8" height="6" fill="#0F172A" rx="1" />
                  <rect x="28" y="60" width="6" height="6" fill="#0F172A" rx="1" />
                  <rect x="42" y="60" width="8" height="6" fill="#0F172A" rx="1" />
                  <rect x="56" y="60" width="8" height="8" fill="#0284C7" rx="1" />
                  <rect x="70" y="60" width="6" height="6" fill="#0F172A" rx="1" />
                  <rect x="82" y="60" width="8" height="6" fill="#0F172A" rx="1" />
                  <rect x="96" y="60" width="6" height="6" fill="#0F172A" rx="1" />

                  <rect x="20" y="70" width="6" height="6" fill="#0F172A" rx="1" />
                  <rect x="34" y="70" width="8" height="6" fill="#0F172A" rx="1" />
                  <rect x="48" y="70" width="6" height="6" fill="#0F172A" rx="1" />
                  <rect x="62" y="70" width="8" height="6" fill="#0F172A" rx="1" />
                  <rect x="76" y="70" width="6" height="6" fill="#0F172A" rx="1" />
                  <rect x="90" y="70" width="8" height="6" fill="#0F172A" rx="1" />

                  {/* Bottom Right cluster */}
                  <rect x="48" y="84" width="8" height="6" fill="#0F172A" rx="1" />
                  <rect x="62" y="84" width="6" height="6" fill="#0F172A" rx="1" />
                  <rect x="74" y="84" width="8" height="8" fill="#0284C7" rx="1" />
                  <rect x="88" y="84" width="6" height="6" fill="#0F172A" rx="1" />
                  <rect x="100" y="84" width="6" height="6" fill="#0F172A" rx="1" />

                  <rect x="48" y="96" width="6" height="6" fill="#0F172A" rx="1" />
                  <rect x="60" y="96" width="8" height="6" fill="#0F172A" rx="1" />
                  <rect x="74" y="96" width="6" height="6" fill="#0F172A" rx="1" />
                  <rect x="86" y="96" width="8" height="6" fill="#0F172A" rx="1" />
                  <rect x="100" y="96" width="6" height="6" fill="#0F172A" rx="1" />

                  <rect x="54" y="106" width="8" height="6" fill="#0F172A" rx="1" />
                  <rect x="68" y="106" width="6" height="6" fill="#0F172A" rx="1" />
                  <rect x="80" y="106" width="8" height="6" fill="#0F172A" rx="1" />
                  <rect x="94" y="106" width="8" height="6" fill="#0284C7" rx="1" />
                </svg>
              </div>

              <div className="boarding-pass-card__stub-meta">
                <span className="boarding-pass-card__stub-num">
                  {selectedTicketModal.ticketNumber}
                </span>
                <div className="boarding-pass-card__stub-badge">
                  <span className="boarding-pass-card__stub-dot" />
                  <span>Conductor ETM Validated</span>
                </div>
                <p className="boarding-pass-card__stub-hint">
                  Show QR to conductor upon boarding
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tickets;
