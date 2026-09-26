import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './RouteMap.scss';

// Component to dynamically fit map bounds to valid stops
function MapBoundsUpdater({ bounds }) {
  const map = useMap();

  useEffect(() => {
    if (bounds && bounds.length > 0) {
      if (bounds.length === 1) {
        map.setView(bounds[0], 13);
      } else {
        map.fitBounds(bounds, { padding: [36, 36], maxZoom: 14 });
      }
    }
  }, [map, bounds]);

  return null;
}

// Custom DivIcon for Stops: small $kb-surface circle with $kb-primary border
const stopIcon = L.divIcon({
  className: 'route-map__stop-icon-wrapper',
  html: '<span class="route-map__stop-circle"></span>',
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

// Custom DivIcon for Live Buses: amber $kb-accent dot with registration badge
function createBusIcon(bus) {
  const badgeText = bus.registrationNumber
    ? bus.registrationNumber.split(' ').pop()
    : bus.id;

  return L.divIcon({
    className: 'route-map__bus-icon-wrapper',
    html: `
      <div class="route-map__bus-marker">
        <div class="route-map__bus-dot"></div>
        <span class="route-map__bus-badge">${badgeText}</span>
      </div>
    `,
    iconSize: [44, 20],
    iconAnchor: [8, 10]
  });
}

export function RouteMap({ stops = [], liveBuses = [] }) {
  // Filter route stops to only those with valid latitude and longitude
  const validStops = useMemo(() => {
    return (stops || [])
      .map((stop, index) => ({ ...stop, originalIndex: index }))
      .filter(
        (stop) =>
          typeof stop.latitude === 'number' &&
          typeof stop.longitude === 'number' &&
          !isNaN(stop.latitude) &&
          !isNaN(stop.longitude)
      );
  }, [stops]);

  // Coordinates for the connecting polyline
  const polylinePositions = useMemo(() => {
    return validStops.map((s) => [s.latitude, s.longitude]);
  }, [validStops]);

  // Center point calculation
  const defaultCenter = useMemo(() => {
    if (validStops.length > 0) {
      return [validStops[0].latitude, validStops[0].longitude];
    }
    return [12.9716, 77.5946]; // Fallback to Bengaluru center
  }, [validStops]);

  // Snap live buses to the nearest valid stop based on their progress index
  const busMarkers = useMemo(() => {
    if (validStops.length === 0 || !liveBuses || liveBuses.length === 0) {
      return [];
    }

    const coordsCount = {};

    return liveBuses.map((bus) => {
      const progress =
        typeof bus.progress === 'number'
          ? bus.progress
          : (bus.currentStopIndex ?? 0);

      // Find nearest valid stop by original stop index
      let nearest = validStops[0];
      let minDiff = Math.abs(validStops[0].originalIndex - progress);

      for (let i = 1; i < validStops.length; i++) {
        const diff = Math.abs(validStops[i].originalIndex - progress);
        if (diff < minDiff) {
          minDiff = diff;
          nearest = validStops[i];
        }
      }

      // Handle duplicate bus markers on the same stop with slight visual separation
      const key = `${nearest.latitude},${nearest.longitude}`;
      const count = coordsCount[key] || 0;
      coordsCount[key] = count + 1;

      const latOffset = count > 0 ? (count % 2 === 1 ? 0.00035 : -0.00035) * Math.ceil(count / 2) : 0;
      const lngOffset = count > 0 ? 0.00035 * Math.ceil(count / 2) : 0;

      return {
        bus,
        position: [nearest.latitude + latOffset, nearest.longitude + lngOffset],
        nearestStopName: nearest.name
      };
    });
  }, [validStops, liveBuses]);

  return (
    <div className="route-map" role="region" aria-label="Route Map">
      <MapContainer
        center={defaultCenter}
        zoom={11}
        scrollWheelZoom={false}
        className="route-map__container"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Dynamic Bounds Auto-Fitter */}
        {polylinePositions.length > 0 && (
          <MapBoundsUpdater bounds={polylinePositions} />
        )}

        {/* 4px Polyline colored $kb-primary connecting valid stops */}
        {polylinePositions.length >= 2 && (
          <Polyline
            positions={polylinePositions}
            pathOptions={{
              color: '#851313',
              weight: 4,
              opacity: 0.9,
              lineCap: 'round',
              lineJoin: 'round'
            }}
          />
        )}

        {/* Stop Markers */}
        {validStops.map((stop) => (
          <Marker
            key={stop.id}
            position={[stop.latitude, stop.longitude]}
            icon={stopIcon}
            title={stop.name}
          />
        ))}

        {/* Live Simulated Bus Markers */}
        {busMarkers.map(({ bus, position, nearestStopName }) => (
          <Marker
            key={bus.id}
            position={position}
            icon={createBusIcon(bus)}
            title={`Live Bus ${bus.registrationNumber} (near ${nearestStopName})`}
          />
        ))}
      </MapContainer>
    </div>
  );
}

export default RouteMap;
