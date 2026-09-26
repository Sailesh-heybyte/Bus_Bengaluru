import React, { useState, useEffect } from 'react';
import TopBar from '../../components/TopBar';
import LoadingRow from '../../components/LoadingRow';
import { getSchemes } from '../../api/schemes';
import { useDebouncedLoading } from '../../hooks/useDebouncedLoading';
import { useLanguage } from '../../context/LanguageContext';
import './Schemes.scss';

export function Schemes() {
  const { t } = useLanguage();
  const [data, setData] = useState({ shaktiRecord: null, studentPass: null });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPassModal, setSelectedPassModal] = useState(null); // 'shakti' | 'student' | null

  const showLoading = useDebouncedLoading(isLoading, 200);

  useEffect(() => {
    setIsLoading(true);
    getSchemes().then((result) => {
      setData(result);
      setIsLoading(false);
    });
  }, []);

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return isoString;
    }
  };

  const { shaktiRecord, studentPass } = data;
  const activeModalData = selectedPassModal === 'shakti' ? shaktiRecord : (selectedPassModal === 'student' ? studentPass : null);

  return (
    <div className="schemes-screen">
      <TopBar title={t('schemes')} showBack={true} />

      <main className="schemes-screen__content">
        {showLoading ? (
          <div className="schemes-screen__skeletons" aria-busy="true">
            <LoadingRow />
            <LoadingRow />
          </div>
        ) : (
          <div className="schemes-screen__cards-container">
            {/* 1. Shakti Scheme Smart Card */}
            {shaktiRecord && (
              <section
                className="schemes-smart-card schemes-smart-card--shakti"
                onClick={() => setSelectedPassModal('shakti')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSelectedPassModal('shakti');
                  }
                }}
                aria-label={t('shakti_scheme')}
              >
                {/* Official Top Accent Ribbon */}
                <div className="schemes-smart-card__accent-bar schemes-smart-card__accent-bar--shakti" />

                {/* Header Bar */}
                <div className="schemes-smart-card__header">
                  <div className="schemes-smart-card__authority-wrap">
                    <i className="bi bi-shield-shaded schemes-smart-card__crest" />
                    <div>
                      <span className="schemes-smart-card__authority">
                        {t('govt_of_karnataka')}
                      </span>
                      <h2 className="schemes-smart-card__title">
                        {t('shakti_scheme')}
                      </h2>
                    </div>
                  </div>
                  <span className="schemes-smart-card__status-pill">
                    <span className="schemes-smart-card__status-dot" />
                    {t('active')}
                  </span>
                </div>

                {/* EMV Chip & Contactless Indicator */}
                <div className="schemes-smart-card__chip-row">
                  <div className="schemes-smart-card__emv-chip" aria-hidden="true">
                    <div className="schemes-smart-card__chip-line schemes-smart-card__chip-line--h" />
                    <div className="schemes-smart-card__chip-line schemes-smart-card__chip-line--v" />
                  </div>
                  <i className="bi bi-wifi schemes-smart-card__contactless" aria-hidden="true" />
                  <div className="schemes-smart-card__corp-pills">
                    {['BMTC', 'KSRTC', 'NWKRTC', 'KKRTC'].map((corp) => (
                      <span key={corp} className="schemes-smart-card__corp-pill">{corp}</span>
                    ))}
                  </div>
                </div>

                {/* Beneficiary Details Grid */}
                <div className="schemes-smart-card__grid">
                  <div className="schemes-smart-card__field">
                    <span className="schemes-smart-card__label">{t('beneficiary_name')}</span>
                    <span className="schemes-smart-card__val schemes-smart-card__val--highlight">
                      {shaktiRecord.beneficiaryName}
                    </span>
                  </div>

                  <div className="schemes-smart-card__field">
                    <span className="schemes-smart-card__label">{t('beneficiary_id')}</span>
                    <span className="schemes-smart-card__val schemes-smart-card__val--mono">
                      {shaktiRecord.beneficiaryId}
                    </span>
                  </div>

                  <div className="schemes-smart-card__field">
                    <span className="schemes-smart-card__label">{t('valid_in')}</span>
                    <span className="schemes-smart-card__val">{shaktiRecord.validIn}</span>
                  </div>

                  <div className="schemes-smart-card__field">
                    <span className="schemes-smart-card__label">{t('expires_in') || 'Expires in'}</span>
                    <span className="schemes-smart-card__val schemes-smart-card__val--expiry">
                      {shaktiRecord.expiresIn || 'Dec 31, 2026'}
                    </span>
                  </div>
                </div>

                {/* State Savings / Reimbursement Narrative */}
                <div className="schemes-smart-card__highlight-box">
                  <div className="schemes-smart-card__stat-row">
                    <div className="schemes-smart-card__stat-item">
                      <span className="schemes-smart-card__stat-label">{t('trips_this_month')}</span>
                      <span className="schemes-smart-card__stat-num">{shaktiRecord.tripsThisMonth}</span>
                    </div>

                    <div className="schemes-smart-card__divider" />

                    <div className="schemes-smart-card__stat-item schemes-smart-card__stat-item--reimburse">
                      <span className="schemes-smart-card__stat-label">{t('fare_reimbursed')}</span>
                      <span className="schemes-smart-card__stat-amount">₹{shaktiRecord.fareValueThisMonth}</span>
                    </div>
                  </div>

                  <div className="schemes-smart-card__badge-footer">
                    <i className="bi bi-shield-check" aria-hidden="true" />
                    <span>{t('free_travel_guarantee')}</span>
                  </div>
                </div>

                {/* Interactive Action Prompt */}
                <div className="schemes-smart-card__action-btn">
                  <i className="bi bi-qr-code-scan schemes-smart-card__action-qr" />
                  <span>{t('tap_to_view_qr') || 'Tap to View Digital Pass & QR Code'}</span>
                  <i className="bi bi-chevron-right schemes-smart-card__action-arrow" />
                </div>
              </section>
            )}

            {/* 2. BMTC Student Free Pass */}
            {studentPass && (
              <section
                className="schemes-smart-card schemes-smart-card--student"
                onClick={() => setSelectedPassModal('student')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSelectedPassModal('student');
                  }
                }}
                aria-label={t('student_pass')}
              >
                {/* Official Top Accent Ribbon */}
                <div className="schemes-smart-card__accent-bar schemes-smart-card__accent-bar--student" />

                {/* Header Bar */}
                <div className="schemes-smart-card__header">
                  <div className="schemes-smart-card__authority-wrap">
                    <i className="bi bi-mortarboard-fill schemes-smart-card__crest schemes-smart-card__crest--bmtc" />
                    <div>
                      <span className="schemes-smart-card__authority">
                        {studentPass.corporation || 'BMTC'}
                      </span>
                      <h2 className="schemes-smart-card__title">
                        {t('student_pass')}
                      </h2>
                    </div>
                  </div>
                  <span className="schemes-smart-card__digital-pill">
                    <i className="bi bi-patch-check-fill" aria-hidden="true" />
                    {t('issued_digitally')}
                  </span>
                </div>

                {/* EMV Chip & Contactless Indicator */}
                <div className="schemes-smart-card__chip-row">
                  <div className="schemes-smart-card__emv-chip" aria-hidden="true">
                    <div className="schemes-smart-card__chip-line schemes-smart-card__chip-line--h" />
                    <div className="schemes-smart-card__chip-line schemes-smart-card__chip-line--v" />
                  </div>
                  <i className="bi bi-wifi schemes-smart-card__contactless" aria-hidden="true" />
                  <div className="schemes-smart-card__route-tag">
                    <i className="bi bi-signpost-split-fill" />
                    <span>{studentPass.routeName || 'Corridor 500D (Silk Board ⟷ Hebbal)'}</span>
                  </div>
                </div>

                {/* Student Details Grid */}
                <div className="schemes-smart-card__grid">
                  <div className="schemes-smart-card__field">
                    <span className="schemes-smart-card__label">{t('student_name')}</span>
                    <span className="schemes-smart-card__val schemes-smart-card__val--highlight">
                      {studentPass.studentName}
                    </span>
                  </div>

                  <div className="schemes-smart-card__field">
                    <span className="schemes-smart-card__label">{t('pass_number')}</span>
                    <span className="schemes-smart-card__val schemes-smart-card__val--mono">
                      {studentPass.passNumber}
                    </span>
                  </div>

                  <div className="schemes-smart-card__field">
                    <span className="schemes-smart-card__label">{t('institution')}</span>
                    <span className="schemes-smart-card__val">{studentPass.institution}</span>
                  </div>

                  <div className="schemes-smart-card__field">
                    <span className="schemes-smart-card__label">{t('class_or_course')}</span>
                    <span className="schemes-smart-card__val">{studentPass.classOrCourse}</span>
                  </div>

                  <div className="schemes-smart-card__field schemes-smart-card__field--full">
                    <span className="schemes-smart-card__label">{t('expires_in') || 'Expires in'}</span>
                    <span className="schemes-smart-card__val schemes-smart-card__val--expiry">
                      {studentPass.expiresIn || 'May 31, 2026'} ({formatDate(studentPass.validFrom)} – {formatDate(studentPass.validTo)})
                    </span>
                  </div>
                </div>

                {/* Interactive Action Prompt */}
                <div className="schemes-smart-card__action-btn">
                  <i className="bi bi-qr-code-scan schemes-smart-card__action-qr" />
                  <span>{t('tap_to_view_qr') || 'Tap to View Digital Pass & QR Code'}</span>
                  <i className="bi bi-chevron-right schemes-smart-card__action-arrow" />
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* 3. Interactive Boarding-Pass Style QR Code Modal */}
      {selectedPassModal && activeModalData && (
        <div
          className="schemes-modal-backdrop"
          onClick={() => setSelectedPassModal(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-pass-title"
        >
          <div
            className="schemes-pass-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              className="schemes-pass-card__close-btn"
              onClick={() => setSelectedPassModal(null)}
              aria-label={t('close') || 'Close'}
            >
              <i className="bi bi-x-lg" />
            </button>

            {/* TOP CARD SECTION */}
            <div className="schemes-pass-card__top">
              {/* Authority & Security Watermark Header */}
              <div className="schemes-pass-card__auth-row">
                <div className="schemes-pass-card__auth-brand">
                  {selectedPassModal === 'shakti' ? (
                    <i className="bi bi-shield-check schemes-pass-card__auth-icon schemes-pass-card__auth-icon--gov" />
                  ) : (
                    <i className="bi bi-mortarboard-fill schemes-pass-card__auth-icon schemes-pass-card__auth-icon--bmtc" />
                  )}
                  <div>
                    <span className="schemes-pass-card__gov-title">
                      {selectedPassModal === 'shakti' ? t('govt_of_karnataka') : 'BMTC Bengaluru'}
                    </span>
                    <h2 id="modal-pass-title" className="schemes-pass-card__pass-title">
                      {selectedPassModal === 'shakti' ? t('shakti_scheme') : t('student_pass')}
                    </h2>
                  </div>
                </div>

                <span className="schemes-pass-card__verified-badge">
                  <i className="bi bi-patch-check-fill" />
                  <span>VERIFIED</span>
                </span>
              </div>

              {/* Prominent Expiration Countdown Pill */}
              <div className="schemes-pass-card__expiry-banner">
                <i className="bi bi-hourglass-split" />
                <span className="schemes-pass-card__expiry-text">
                  {selectedPassModal === 'shakti'
                    ? (activeModalData.expiresIn || 'Valid until Dec 31, 2026 • Lifetime Free Renewal')
                    : (activeModalData.expiresIn || 'Expires in 8 months • Valid until May 31, 2026')}
                </span>
              </div>

              {/* Main Credentials 2-Column Grid */}
              <div className="schemes-pass-card__details-grid">
                <div className="schemes-pass-card__col">
                  <span className="schemes-pass-card__label">
                    {selectedPassModal === 'shakti' ? t('beneficiary_name') : t('student_name')}
                  </span>
                  <span className="schemes-pass-card__value schemes-pass-card__value--name">
                    {selectedPassModal === 'shakti' ? activeModalData.beneficiaryName : activeModalData.studentName}
                  </span>
                </div>

                <div className="schemes-pass-card__col">
                  <span className="schemes-pass-card__label">
                    {selectedPassModal === 'shakti' ? t('beneficiary_id') : t('pass_number')}
                  </span>
                  <span className="schemes-pass-card__value schemes-pass-card__value--mono">
                    {selectedPassModal === 'shakti' ? activeModalData.beneficiaryId : activeModalData.passNumber}
                  </span>
                </div>

                {selectedPassModal === 'student' ? (
                  <>
                    <div className="schemes-pass-card__col">
                      <span className="schemes-pass-card__label">{t('institution')}</span>
                      <span className="schemes-pass-card__value">
                        {activeModalData.institution}
                      </span>
                    </div>

                    <div className="schemes-pass-card__col">
                      <span className="schemes-pass-card__label">{t('class_or_course')}</span>
                      <span className="schemes-pass-card__value">
                        {activeModalData.classOrCourse}
                      </span>
                    </div>

                    <div className="schemes-pass-card__col schemes-pass-card__col--full">
                      <span className="schemes-pass-card__label">{t('allowed_route') || 'Permitted Route'}</span>
                      <span className="schemes-pass-card__value schemes-pass-card__value--route">
                        {activeModalData.routeName || 'Corridor 500D (Central Silk Board ⟷ Hebbal)'}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="schemes-pass-card__col">
                      <span className="schemes-pass-card__label">{t('valid_in')}</span>
                      <span className="schemes-pass-card__value">
                        {activeModalData.validIn}
                      </span>
                    </div>

                    <div className="schemes-pass-card__col">
                      <span className="schemes-pass-card__label">{t('trips_this_month')}</span>
                      <span className="schemes-pass-card__value schemes-pass-card__value--highlight">
                        {activeModalData.tripsThisMonth} Trips (₹{activeModalData.fareValueThisMonth} Saved)
                      </span>
                    </div>

                    <div className="schemes-pass-card__col schemes-pass-card__col--full">
                      <span className="schemes-pass-card__label">Permitted Buses</span>
                      <span className="schemes-pass-card__value">
                        {activeModalData.allowedServices || 'Ordinary & Express Non-AC City / Rural Buses'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* PERFORATION DIVIDER WITH NOTCHES */}
            <div className="schemes-pass-card__perforation">
              <div className="schemes-pass-card__notch schemes-pass-card__notch--left" />
              <div className="schemes-pass-card__perforated-line" />
              <div className="schemes-pass-card__notch schemes-pass-card__notch--right" />
            </div>

            {/* BOTTOM STUB: HIGH-DEFINITION QR CODE */}
            <div className="schemes-pass-card__stub">
              <div className="schemes-pass-card__qr-box">
                {/* Vector QR Code */}
                <svg
                  className="schemes-pass-card__qr-svg"
                  viewBox="0 0 120 120"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="120" height="120" rx="10" fill="#FFFFFF" />

                  {/* Corner Targets */}
                  {/* Top-Left */}
                  <rect x="10" y="10" width="30" height="30" rx="5" fill="#0F172A" />
                  <rect x="16" y="16" width="18" height="18" rx="2" fill="#FFFFFF" />
                  <rect x="21" y="21" width="8" height="8" rx="1" fill="#0284C7" />

                  {/* Top-Right */}
                  <rect x="80" y="10" width="30" height="30" rx="5" fill="#0F172A" />
                  <rect x="86" y="16" width="18" height="18" rx="2" fill="#FFFFFF" />
                  <rect x="91" y="21" width="8" height="8" rx="1" fill="#0284C7" />

                  {/* Bottom-Left */}
                  <rect x="10" y="80" width="30" height="30" rx="5" fill="#0F172A" />
                  <rect x="16" y="86" width="18" height="18" rx="2" fill="#FFFFFF" />
                  <rect x="21" y="91" width="8" height="8" rx="1" fill="#0284C7" />

                  {/* Data Grid Modules */}
                  <rect x="46" y="12" width="6" height="6" fill="#0F172A" rx="1" />
                  <rect x="58" y="12" width="6" height="6" fill="#0F172A" rx="1" />
                  <rect x="68" y="12" width="6" height="6" fill="#0F172A" rx="1" />

                  <rect x="46" y="24" width="8" height="6" fill="#0284C7" rx="1" />
                  <rect x="58" y="24" width="8" height="6" fill="#0F172A" rx="1" />

                  <rect x="46" y="36" width="6" height="6" fill="#0F172A" rx="1" />
                  <rect x="56" y="36" width="6" height="6" fill="#0F172A" rx="1" />
                  <rect x="68" y="36" width="6" height="6" fill="#0F172A" rx="1" />

                  {/* Center Pattern with Transit Emblem */}
                  <rect x="20" y="48" width="6" height="6" fill="#0F172A" rx="1" />
                  <rect x="32" y="48" width="8" height="6" fill="#0F172A" rx="1" />
                  <rect x="46" y="48" width="8" height="8" fill="#0284C7" rx="1" />
                  <rect x="60" y="48" width="6" height="6" fill="#0F172A" rx="1" />
                  <rect x="72" y="48" width="8" height="6" fill="#0F172A" rx="1" />
                  <rect x="86" y="48" width="6" height="6" fill="#0F172A" rx="1" />
                  <rect x="98" y="48" width="8" height="6" fill="#0F172A" rx="1" />

                  <rect x="14" y="60" width="8" height="6" fill="#0F172A" rx="1" />
                  <rect x="26" y="60" width="6" height="6" fill="#0284C7" rx="1" />
                  <rect x="38" y="60" width="8" height="6" fill="#0F172A" rx="1" />
                  <rect x="54" y="60" width="6" height="6" fill="#0F172A" rx="1" />
                  <rect x="66" y="60" width="8" height="6" fill="#0284C7" rx="1" />
                  <rect x="80" y="60" width="6" height="6" fill="#0F172A" rx="1" />
                  <rect x="94" y="60" width="8" height="6" fill="#0F172A" rx="1" />

                  {/* Bottom Right Modules */}
                  <rect x="46" y="80" width="6" height="6" fill="#0F172A" rx="1" />
                  <rect x="58" y="80" width="8" height="6" fill="#0284C7" rx="1" />
                  <rect x="72" y="80" width="6" height="6" fill="#0F172A" rx="1" />
                  <rect x="84" y="80" width="8" height="6" fill="#0F172A" rx="1" />
                  <rect x="96" y="80" width="6" height="6" fill="#0F172A" rx="1" />

                  <rect x="46" y="94" width="8" height="6" fill="#0284C7" rx="1" />
                  <rect x="60" y="94" width="6" height="6" fill="#0F172A" rx="1" />
                  <rect x="74" y="94" width="8" height="6" fill="#0F172A" rx="1" />
                  <rect x="88" y="94" width="6" height="6" fill="#0F172A" rx="1" />
                  <rect x="100" y="94" width="8" height="6" fill="#0284C7" rx="1" />
                </svg>

                {/* Animated Scanning Beam Line */}
                <div className="schemes-pass-card__scan-beam" />
              </div>

              {/* Dynamic Security Indicator */}
              <div className="schemes-pass-card__token-row">
                <span className="schemes-pass-card__token-dot" />
                <span className="schemes-pass-card__token-text">
                  SECURE DYNAMIC PASS TOKEN • ACTIVE
                </span>
              </div>

              <p className="schemes-pass-card__instructions">
                {t('show_to_conductor') || 'Show this pass & QR code to the conductor on request'}
              </p>

              {/* Close Button */}
              <button
                type="button"
                className="schemes-pass-card__done-btn"
                onClick={() => setSelectedPassModal(null)}
              >
                <span>{t('close') || 'Done'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Schemes;
