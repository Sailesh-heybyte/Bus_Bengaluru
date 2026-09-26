import React, { useState, useRef, useEffect, useCallback } from 'react';
import './SwipeableStopsSheet.scss';

export function SwipeableStopsSheet({
  route,
  stops = [],
  liveBuses = [],
  onStopClick,
  onBack,
  isSaved,
  onToggleSave,
}) {
  // Snap modes: 'peek' (~130px), 'half' (52%), 'expanded' (92%)
  const [sheetState, setSheetState] = useState('half');
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const startYRef = useRef(0);
  const currentYRef = useRef(0);
  const sheetRef = useRef(null);

  // Height percentages based on state
  const getSheetHeight = () => {
    switch (sheetState) {
      case 'peek':
        return 130; // px
      case 'expanded':
        return window.innerHeight * 0.92;
      case 'half':
      default:
        return window.innerHeight * 0.52;
    }
  };

  const handleTouchStart = (e) => {
    startYRef.current = e.touches[0].clientY;
    currentYRef.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startYRef.current;
    currentYRef.current = currentY;

    // Negative deltaY means dragging upwards (expanding)
    // Positive deltaY means dragging downwards (collapsing)
    setDragOffset(deltaY);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const deltaY = currentYRef.current - startYRef.current;
    const threshold = 60; // Minimum drag to trigger snap change

    if (deltaY < -threshold) {
      // Swiped UP
      if (sheetState === 'peek') setSheetState('half');
      else if (sheetState === 'half') setSheetState('expanded');
    } else if (deltaY > threshold) {
      // Swiped DOWN
      if (sheetState === 'expanded') setSheetState('half');
      else if (sheetState === 'half') setSheetState('peek');
    }

    setDragOffset(0);
  };

  // Toggle state on handle click
  const handleToggleSnap = () => {
    if (sheetState === 'expanded') setSheetState('half');
    else if (sheetState === 'half') setSheetState('expanded');
    else setSheetState('half');
  };

  // Map buses by their nearest stop index to render on the timeline
  const busesByStopIndex = useMemoBusPositions(stops, liveBuses);

  const computedHeight = Math.max(
    130,
    Math.min(window.innerHeight * 0.94, getSheetHeight() - dragOffset)
  );

  return (
    <div
      ref={sheetRef}
      className={`swipeable-stops-sheet swipeable-stops-sheet--${sheetState} ${
        isDragging ? 'swipeable-stops-sheet--dragging' : ''
      }`}
      style={{
        height: `${computedHeight}px`,
      }}
    >
      {/* Drag Handle Bar */}
      <div
        className="swipeable-stops-sheet__handle-wrapper"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleToggleSnap}
      >
        <div className="swipeable-stops-sheet__handle-pill" />
      </div>

      {/* Header (Route Info + Kebab Menu) */}
      <div className="swipeable-stops-sheet__header">
        {sheetState === 'expanded' && (
          <button
            type="button"
            className="swipeable-stops-sheet__back-arrow"
            onClick={onBack}
            aria-label="Back"
          >
            <i className="bi bi-arrow-left" />
          </button>
        )}

        <div className="swipeable-stops-sheet__title-col">
          <h1 className="swipeable-stops-sheet__route-num">
            {route?.routeNumber || route?.route_number || 'Route'}
          </h1>
          <p className="swipeable-stops-sheet__destination">
            To {route?.to || 'Destination'}
          </p>
        </div>

        <div className="swipeable-stops-sheet__actions">
          <button
            type="button"
            className="swipeable-stops-sheet__kebab-btn"
            onClick={() => setShowMenu(!showMenu)}
            aria-label="Route options"
          >
            <i className="bi bi-three-dots-vertical" />
          </button>

          {showMenu && (
            <div className="swipeable-stops-sheet__menu-dropdown">
              <button
                type="button"
                className="swipeable-stops-sheet__menu-item"
                onClick={() => {
                  if (onToggleSave) onToggleSave();
                  setShowMenu(false);
                }}
              >
                <i className={`bi ${isSaved ? 'bi-heart-fill' : 'bi-heart'}`} />
                <span>{isSaved ? 'Saved in Favorites' : 'Save Route'}</span>
              </button>
              <button
                type="button"
                className="swipeable-stops-sheet__menu-item"
                onClick={() => {
                  navigator.clipboard?.writeText?.(window.location.href);
                  alert('Route link copied to clipboard!');
                  setShowMenu(false);
                }}
              >
                <i className="bi bi-share" />
                <span>Share Route</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="swipeable-stops-sheet__divider" />

      {/* Scrollable Stops Timeline */}
      <div className="swipeable-stops-sheet__content">
        <ul className="swipeable-stops-sheet__timeline">
          {stops.map((stop, index) => {
            const isFirst = index === 0;
            const isLast = index === stops.length - 1;
            const activeBusHere = busesByStopIndex.get(index);

            return (
              <li
                key={stop.id || index}
                className={`swipeable-stops-sheet__stop-item ${
                  isFirst ? 'swipeable-stops-sheet__stop-item--first' : ''
                } ${isLast ? 'swipeable-stops-sheet__stop-item--last' : ''}`}
                onClick={() => onStopClick && onStopClick(stop.id)}
              >
                {/* Track Column with Circle Nodes or Bus Badge */}
                <div className="swipeable-stops-sheet__track-col">
                  {/* Track vertical line */}
                  <div className="swipeable-stops-sheet__track-line" />

                  {/* If a live bus is at this stop: render blue bus badge notation */}
                  {activeBusHere ? (
                    <div
                      className="swipeable-stops-sheet__bus-badge-marker"
                      title={`Bus ${activeBusHere.registrationNumber}`}
                    >
                      <i className="bi bi-bus-front-fill" />
                      <div className="swipeable-stops-sheet__bus-pointer" />
                    </div>
                  ) : (
                    /* Hollow Circle Node */
                    <div className="swipeable-stops-sheet__stop-circle" />
                  )}
                </div>

                {/* Stop Name & Metadata */}
                <div className="swipeable-stops-sheet__stop-info">
                  <span className="swipeable-stops-sheet__stop-name">
                    {stop.name}
                  </span>
                  {activeBusHere && (
                    <span className="swipeable-stops-sheet__live-tag">
                      <i className="bi bi-broadcast" /> Live • {activeBusHere.registrationNumber?.split(' ').pop()}
                      {index < stops.length - 1 && (
                        <span className="swipeable-stops-sheet__next-direction">
                          {' '}→ {stops[index + 1]?.name}
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

// Helper hook to map active buses to their current stop index
function useMemoBusPositions(stops, liveBuses) {
  return React.useMemo(() => {
    const map = new Map();
    if (!liveBuses || liveBuses.length === 0 || !stops || stops.length === 0) {
      return map;
    }

    liveBuses.forEach((bus) => {
      const progress =
        typeof bus.progress === 'number'
          ? bus.progress
          : (bus.currentStopIndex ?? 0);
      const stopIndex = Math.min(
        stops.length - 1,
        Math.max(0, Math.floor(progress))
      );
      map.set(stopIndex, bus);
    });

    return map;
  }, [stops, liveBuses]);
}

export default SwipeableStopsSheet;
