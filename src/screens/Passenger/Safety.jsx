import React from 'react';
import TopBar from '../../components/TopBar';
import { useLanguage } from '../../context/LanguageContext';
import './Safety.scss';

export function Safety() {
  const { t } = useLanguage();

  const handleShareTrip = () => {
    alert("Mock: Native Share Sheet");
  };

  const helplineList = [
    {
      id: 'police',
      label: t('police'),
      tel: '112',
      number: '112'
    },
    {
      id: 'women',
      label: t('women_helpline'),
      tel: '1091',
      number: '1091'
    }
  ];

  return (
    <div className="safety-screen">
      <TopBar title={t('safety')} showBack={true} />

      <main className="safety-screen__content">
        {/* Section 1: Share My Trip */}
        <section className="safety-screen__section" aria-label={t('safety_tools')}>
          <div className="safety-card" onClick={handleShareTrip} role="button" tabIndex={0}>
            <div className="safety-card__icon-box">
              <i className="bi bi-share" aria-hidden="true" />
            </div>
            <div className="safety-card__info">
              <h2 className="safety-card__title">{t('share_trip')}</h2>
              <p className="safety-card__sub">{t('share_trip_sub')}</p>
            </div>
            <i className="bi bi-chevron-right safety-card__arrow" aria-hidden="true" />
          </div>
        </section>

        {/* Section 2: Helplines */}
        <section className="safety-screen__section" aria-label={t('helplines')}>
          <h2 className="safety-screen__section-title">{t('helplines')}</h2>
          <div className="safety-screen__helplines-list">
            {helplineList.map((line) => (
              <a
                key={line.id}
                href={`tel:${line.tel}`}
                className="safety-helpline-row"
                aria-label={`${line.label} - ${line.number}`}
              >
                <div className="safety-helpline-row__left">
                  <div className="safety-helpline-row__icon">
                    <i className="bi bi-telephone-fill" aria-hidden="true" />
                  </div>
                  <span className="safety-helpline-row__label">{line.label}</span>
                </div>
                <div className="safety-helpline-row__badge">
                  <i className="bi bi-telephone-outbound" aria-hidden="true" />
                  <span>{t('call_now')}</span>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Section 3: SOS Emergency */}
        <section className="safety-screen__sos-section" aria-label={t('sos_emergency')}>
          <button
            type="button"
            className="safety-screen__sos-btn"
            aria-label={t('sos_emergency')}
          >
            <i className="bi bi-shield-exclamation safety-screen__sos-icon" aria-hidden="true" />
            <span className="safety-screen__sos-text">{t('sos_emergency')}</span>
          </button>
          <p className="safety-screen__sos-warning">{t('sos_warning')}</p>
        </section>
      </main>
    </div>
  );
}

export default Safety;
