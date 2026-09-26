import React, { useState, useEffect } from 'react';
import TopBar from '../../components/TopBar';
import LoadingRow from '../../components/LoadingRow';
import EmptyState from '../../components/EmptyState';
import Sheet from '../../components/Sheet';
import { getSupportData, raiseComplaint } from '../../api/complaints';
import { useDebouncedLoading } from '../../hooks/useDebouncedLoading';
import { useLanguage } from '../../context/LanguageContext';
import './Complaints.scss';

export function Complaints() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('complaints'); // 'complaints' | 'lost_found'
  const [data, setData] = useState({ complaints: [], lostFound: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Form state
  const [formCategory, setFormCategory] = useState('rash_driving');
  const [formDescription, setFormDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showLoading = useDebouncedLoading(isLoading, 200);

  const loadData = () => {
    setIsLoading(true);
    getSupportData().then((res) => {
      setData(res);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenSheet = () => {
    setFormCategory('rash_driving');
    setFormDescription('');
    setIsSheetOpen(true);
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formDescription.trim()) return;

    setIsSubmitting(true);
    await raiseComplaint({
      category: formCategory,
      description: formDescription.trim()
    });
    setIsSubmitting(false);
    setIsSheetOpen(false);
    // Re-fetch data immediately so the newly added complaint is displayed
    loadData();
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

  const getStatusLabel = (status) => {
    switch (status) {
      case 'submitted':
        return t('status_submitted');
      case 'in_review':
        return t('status_in_review');
      case 'resolved':
        return t('status_resolved');
      case 'closed':
        return t('status_closed');
      case 'found':
        return t('status_found');
      case 'reported':
        return t('status_reported');
      default:
        return status;
    }
  };

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'rash_driving':
        return t('rash_driving');
      case 'overcharging':
        return t('overcharging');
      case 'crew_behaviour':
        return t('crew_behaviour');
      case 'cleanliness':
        return t('cleanliness');
      case 'other':
        return t('other');
      default:
        return cat;
    }
  };

  return (
    <div className="complaints-screen">
      <TopBar title={t('complaints')} showBack={true} />

      <main className="complaints-screen__content">
        {/* 2-Segment Switcher */}
        <div className="complaints-screen__tabs" role="tablist" aria-label={t('complaints')}>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'complaints'}
            className={`complaints-screen__tab-btn ${
              activeTab === 'complaints' ? 'complaints-screen__tab-btn--active' : ''
            }`}
            onClick={() => setActiveTab('complaints')}
          >
            {t('complaints')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'lost_found'}
            className={`complaints-screen__tab-btn ${
              activeTab === 'lost_found' ? 'complaints-screen__tab-btn--active' : ''
            }`}
            onClick={() => setActiveTab('lost_found')}
          >
            {t('lost_and_found')}
          </button>
        </div>

        {showLoading ? (
          <div className="complaints-screen__skeletons" aria-busy="true">
            <LoadingRow />
            <LoadingRow />
            <LoadingRow />
          </div>
        ) : activeTab === 'complaints' ? (
          /* Complaints Tab Content */
          <div className="complaints-screen__tab-pane">
            <button
              type="button"
              className="complaints-screen__raise-btn"
              onClick={handleOpenSheet}
              aria-label={t('raise_complaint')}
            >
              <i className="bi bi-plus-circle-fill" aria-hidden="true" />
              <span>{t('raise_complaint')}</span>
            </button>

            {data.complaints.length === 0 ? (
              <EmptyState
                icon="bi-chat-left-text"
                title={t('no_complaints')}
                description={t('no_complaints_desc')}
                actionText={t('raise_complaint')}
                actionIcon="bi-plus-circle"
                onAction={handleOpenSheet}
              />
            ) : (
              <ul className="complaints-screen__list" role="list">
                {data.complaints.map((item) => (
                  <li key={item.id} className="complaint-card">
                    <div className="complaint-card__header">
                      <span className="complaint-card__number">{item.complaintNumber}</span>
                      <span className={`complaint-card__status complaint-card__status--${item.status}`}>
                        {getStatusLabel(item.status)}
                      </span>
                    </div>

                    <div className="complaint-card__meta">
                      <span className="complaint-card__category">{getCategoryLabel(item.category)}</span>
                      <span className="complaint-card__date">{formatDate(item.raisedAt)}</span>
                    </div>

                    <p className="complaint-card__desc">{item.description}</p>

                    {item.resolutionNote && (
                      <div className="complaint-card__resolution">
                        <span className="complaint-card__resolution-label">{t('resolution')}:</span>
                        <span className="complaint-card__resolution-text">{item.resolutionNote}</span>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          /* Lost & Found Tab Content */
          <div className="complaints-screen__tab-pane">
            {data.lostFound.length === 0 ? (
              <EmptyState
                icon="bi-box-seam"
                title={t('no_lost_found')}
                description={t('no_lost_found_desc')}
              />
            ) : (
              <ul className="complaints-screen__list" role="list">
                {data.lostFound.map((item) => {
                  const isFound = item.status === 'found';

                  return (
                    <li key={item.id} className="lostfound-card">
                      <div className="lostfound-card__header">
                        <div className="lostfound-card__item-title">
                          <i className="bi bi-box-seam" aria-hidden="true" />
                          <span>{item.itemDescription}</span>
                        </div>
                        <span className={`lostfound-card__status lostfound-card__status--${item.status}`}>
                          {getStatusLabel(item.status)}
                        </span>
                      </div>

                      <div className="lostfound-card__details">
                        <div className="lostfound-card__detail-row">
                          <span className="lostfound-card__label">{t('lost_date')}:</span>
                          <span className="lostfound-card__val">{formatDate(item.lostOn)}</span>
                        </div>

                        {item.depot && (
                          <div className="lostfound-card__detail-row">
                            <span className="lostfound-card__label">{t('depot')}:</span>
                            <span className="lostfound-card__val">{item.depot}</span>
                          </div>
                        )}
                      </div>

                      {isFound && item.contactDepotPhone && (
                        <a
                          href={`tel:${item.contactDepotPhone}`}
                          className="lostfound-card__contact-btn"
                          aria-label={`${t('contact_depot')}: ${item.contactDepotPhone}`}
                        >
                          <i className="bi bi-telephone-outbound-fill" aria-hidden="true" />
                          <span>{t('contact_depot')}</span>
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </main>

      {/* Raise Complaint Bottom Sheet */}
      <Sheet
        isOpen={isSheetOpen}
        onClose={handleCloseSheet}
        title={t('raise_complaint')}
      >
        <form className="complaint-form" onSubmit={handleSubmit}>
          <div className="complaint-form__group">
            <label className="complaint-form__label" htmlFor="complaint-category">
              {t('category')}
            </label>
            <select
              id="complaint-category"
              className="complaint-form__select"
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
            >
              <option value="rash_driving">{t('rash_driving')}</option>
              <option value="overcharging">{t('overcharging')}</option>
              <option value="crew_behaviour">{t('crew_behaviour')}</option>
              <option value="cleanliness">{t('cleanliness')}</option>
              <option value="other">{t('other')}</option>
            </select>
          </div>

          <div className="complaint-form__group">
            <label className="complaint-form__label" htmlFor="complaint-desc">
              {t('description')}
            </label>
            <textarea
              id="complaint-desc"
              className="complaint-form__textarea"
              placeholder={t('describe_issue_placeholder')}
              rows={4}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="complaint-form__submit-btn"
            disabled={isSubmitting || !formDescription.trim()}
          >
            {t('submit')}
          </button>
        </form>
      </Sheet>
    </div>
  );
}

export default Complaints;
