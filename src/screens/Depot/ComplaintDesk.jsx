import React, { useState, useEffect } from 'react';
import LoadingRow from '../../components/LoadingRow';
import EmptyState from '../../components/EmptyState';
import { getDepotComplaints } from '../../api/depot';
import { useDebouncedLoading } from '../../hooks/useDebouncedLoading';
import './ComplaintDesk.scss';

export function ComplaintDesk() {
  const [complaints, setComplaints] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const showLoading = useDebouncedLoading(isLoading, 200);

  useEffect(() => {
    setIsLoading(true);
    getDepotComplaints().then((data) => {
      setComplaints(data);
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

  const formatCategory = (cat) => {
    if (!cat) return '-';
    return cat
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const formatStatus = (st) => {
    if (!st) return '-';
    return st
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  const totalCount = complaints.length;
  const inReviewCount = complaints.filter((c) => c.status === 'in_review').length;
  const resolvedCount = complaints.filter((c) => c.status === 'resolved' || c.status === 'closed').length;

  return (
    <div className="complaint-desk-screen" role="region" aria-label="Depot Complaint Desk">
      {/* Top Header */}
      <div className="complaint-desk-screen__header">
        <div className="complaint-desk-screen__titles">
          <h2 className="complaint-desk-screen__title">Passenger Grievance Desk</h2>
          <p className="complaint-desk-screen__subtitle">
            Logged passenger complaints across depot operations and vehicle lines
          </p>
        </div>

        <div className="complaint-desk-screen__counters">
          <div className="desk-counter">
            <span className="desk-counter__val">{totalCount}</span>
            <span className="desk-counter__lbl">Total Logged</span>
          </div>
          <div className="desk-counter desk-counter--review">
            <span className="desk-counter__val">{inReviewCount}</span>
            <span className="desk-counter__lbl">In Review</span>
          </div>
          <div className="desk-counter desk-counter--resolved">
            <span className="desk-counter__val">{resolvedCount}</span>
            <span className="desk-counter__lbl">Resolved / Closed</span>
          </div>
        </div>
      </div>

      {/* Desktop Data Table */}
      <div className="complaint-desk-screen__table-wrapper">
        {showLoading ? (
          <div style={{ padding: '24px' }}>
            <LoadingRow count={3} height="52px" />
          </div>
        ) : complaints.length === 0 ? (
          <EmptyState
            icon="bi-clipboard-check"
            title="No Complaints Recorded"
            description="All passenger grievances have been addressed or resolved across current depot logs."
          />
        ) : (
          <table className="desk-table">
            <thead>
              <tr>
                <th>Complaint #</th>
                <th>Route / Bus</th>
                <th>Category</th>
                <th>Description</th>
                <th>Status</th>
                <th>Raised At</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((item) => (
                <tr key={item.id} className="desk-table__row">
                  <td className="desk-table__num">{item.complaintNumber}</td>
                  <td className="desk-table__route-bus">
                    <span className="desk-table__route-badge">{item.routeNumber}</span>
                    <span className="desk-table__bus-reg">{item.busRegistration}</span>
                  </td>
                  <td>
                    <span className="desk-table__category-tag">{formatCategory(item.category)}</span>
                  </td>
                  <td className="desk-table__desc">
                    <p className="desk-table__desc-text">{item.description}</p>
                    {item.resolutionNote && (
                      <span className="desk-table__res-note">
                        <strong>Resolution:</strong> {item.resolutionNote}
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`desk-status-pill desk-status-pill--${item.status}`}>
                      {formatStatus(item.status)}
                    </span>
                  </td>
                  <td className="desk-table__date">{formatDate(item.raisedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default ComplaintDesk;
