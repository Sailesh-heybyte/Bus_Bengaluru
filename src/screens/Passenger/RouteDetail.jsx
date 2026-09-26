import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRouteDetail } from '../../api/routes';
import { checkSavedStatus, toggleSavedRoute } from '../../api/user';
import { useDebouncedLoading } from '../../hooks/useDebouncedLoading';
import { useLanguage } from '../../context/LanguageContext';
import { useSimulation } from '../../context/SimulationContext';
import { useNetwork } from '../../hooks/useNetwork';
import OfflineStrip from '../../components/OfflineStrip';
import MapboxRouteMap from '../../components/MapboxRouteMap';
import SwipeableStopsSheet from '../../components/SwipeableStopsSheet';
import './RouteDetail.scss';

export function RouteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { liveBuses } = useSimulation();
  const { isOnline } = useNetwork();

  const [routeDetail, setRouteDetail] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const showLoading = useDebouncedLoading(isLoading, 200);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      getRouteDetail(id),
      checkSavedStatus(id, 'route')
    ]).then(([data, savedStatus]) => {
      setRouteDetail(data);
      setIsSaved(savedStatus);
      setIsLoading(false);
    });
  }, [id]);

  const handleToggleSaved = () => {
    toggleSavedRoute(id).then((newStatus) => {
      setIsSaved(newStatus);
    });
  };

  // Filter running buses for this route
  const activeBuses = liveBuses.filter((b) => {
    const routeMatch = (b.routeId || b.route_id) === id;
    const isRunning = (b.currentStatus || b.current_status) === 'running';
    return routeMatch && isRunning;
  });

  // Track the primary active bus for synchronized live tracking
  const trackedBuses = activeBuses.length > 0 ? [activeBuses[0]] : [];

  const handleStopClick = (stopId) => {
    navigate(`/stop/${stopId}`);
  };

  return (
    <div className="route-detail route-detail--live">
      {!isOnline && routeDetail && (
        <div className="route-detail__offline-bar">
          <OfflineStrip stops={routeDetail.stops} />
        </div>
      )}

      {showLoading ? (
        <div className="route-detail__loading-overlay" aria-busy="true">
          <div className="route-detail__spinner" />
          <span>{t('loading')}...</span>
        </div>
      ) : (
        routeDetail && (
          <>
            {/* Full Screen Mapbox Layer */}
            <MapboxRouteMap
              routeId={id}
              stops={routeDetail.stops}
              liveBuses={trackedBuses}
              onBack={() => navigate(-1)}
            />

            {/* Interactive Swipeable Bottom Sheet */}
            <SwipeableStopsSheet
              route={routeDetail.route}
              stops={routeDetail.stops}
              liveBuses={trackedBuses}
              onStopClick={handleStopClick}
              onBack={() => navigate(-1)}
              isSaved={isSaved}
              onToggleSave={handleToggleSaved}
            />
          </>
        )
      )}
    </div>
  );
}

export default RouteDetail;
