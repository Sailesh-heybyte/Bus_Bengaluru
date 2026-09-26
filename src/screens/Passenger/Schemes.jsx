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
            {/* Shakti Scheme Card */}
            {shaktiRecord && (
              <section className="schemes-card" aria-label={t('shakti_scheme')}>
                <div className="schemes-card__accent-bar" />

                <div className="schemes-card__header">
                  <div className="schemes-card__title-group">
                    <span className="schemes-card__authority">{t('govt_of_karnataka')}</span>
                    <h2 className="schemes-card__title">{t('shakti_scheme')}</h2>
                  </div>
                  <span className="schemes-card__status-pill">
                    <span className="schemes-card__status-dot" />
                    {t('active')}
                  </span>
                </div>

                <div className="schemes-card__grid">
                  <div className="schemes-card__field">
                    <span className="schemes-card__label">{t('beneficiary_name')}</span>
                    <span className="schemes-card__val schemes-card__val--highlight">
                      {shaktiRecord.beneficiaryName}
                    </span>
                  </div>

                  <div className="schemes-card__field">
                    <span className="schemes-card__label">{t('beneficiary_id')}</span>
                    <span className="schemes-card__val schemes-card__val--mono">
                      {shaktiRecord.beneficiaryId}
                    </span>
                  </div>

                  <div className="schemes-card__field">
                    <span className="schemes-card__label">{t('valid_in')}</span>
                    <span className="schemes-card__val">{shaktiRecord.validIn}</span>
                  </div>

                  <div className="schemes-card__field">
                    <span className="schemes-card__label">{t('excluded')}</span>
                    <span className="schemes-card__val schemes-card__val--muted">
                      {shaktiRecord.excludedServices}
                    </span>
                  </div>
                </div>

                {/* State Savings / Reimbursement Narrative */}
                <div className="schemes-card__highlight-box">
                  <div className="schemes-card__stat-row">
                    <div className="schemes-card__stat-item">
                      <span className="schemes-card__stat-label">{t('trips_this_month')}</span>
                      <span className="schemes-card__stat-num">{shaktiRecord.tripsThisMonth}</span>
                    </div>

                    <div className="schemes-card__divider" />

                    <div className="schemes-card__stat-item schemes-card__stat-item--reimburse">
                      <span className="schemes-card__stat-label">{t('fare_reimbursed')}</span>
                      <span className="schemes-card__stat-amount">₹{shaktiRecord.fareValueThisMonth}</span>
                    </div>
                  </div>

                  <div className="schemes-card__badge-footer">
                    <i className="bi bi-shield-check" aria-hidden="true" />
                    <span>{t('free_travel_guarantee')}</span>
                  </div>
                </div>
              </section>
            )}

            {/* Student Free Pass Card */}
            {studentPass && (
              <section className="schemes-card" aria-label={t('student_pass')}>
                <div className="schemes-card__accent-bar" />

                <div className="schemes-card__header">
                  <div className="schemes-card__title-group">
                    <span className="schemes-card__authority">{studentPass.corporation}</span>
                    <h2 className="schemes-card__title">{t('student_pass')}</h2>
                  </div>
                  <div className="schemes-card__badges">
                    {studentPass.issuedDigitally && (
                      <span className="schemes-card__digital-pill">
                        <i className="bi bi-patch-check-fill" aria-hidden="true" />
                        {t('issued_digitally')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="schemes-card__grid">
                  <div className="schemes-card__field">
                    <span className="schemes-card__label">{t('student_name')}</span>
                    <span className="schemes-card__val schemes-card__val--highlight">
                      {studentPass.studentName}
                    </span>
                  </div>

                  <div className="schemes-card__field">
                    <span className="schemes-card__label">{t('pass_number')}</span>
                    <span className="schemes-card__val schemes-card__val--mono">
                      {studentPass.passNumber}
                    </span>
                  </div>

                  <div className="schemes-card__field">
                    <span className="schemes-card__label">{t('institution')}</span>
                    <span className="schemes-card__val">{studentPass.institution}</span>
                  </div>

                  <div className="schemes-card__field">
                    <span className="schemes-card__label">{t('class_or_course')}</span>
                    <span className="schemes-card__val">{studentPass.classOrCourse}</span>
                  </div>

                  <div className="schemes-card__field schemes-card__field--full">
                    <span className="schemes-card__label">{t('valid_until')}</span>
                    <span className="schemes-card__val">
                      {formatDate(studentPass.validFrom)} - {formatDate(studentPass.validTo)}
                    </span>
                  </div>
                </div>

                <div className="schemes-card__pass-footer">
                  <i className="bi bi-qr-code" aria-hidden="true" />
                  <span>{t('free_travel_pass')}</span>
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default Schemes;
