import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { loadGoogleMaps } from '../utils/googleMapsLoader';
import './GoogleRouteMap.scss';

// Calculate bearing in degrees between two lat/lng coordinates
function computeBearing(startLat, startLng, destLat, destLng) {
  const startLatRad = (startLat * Math.PI) / 180;
  const startLngRad = (startLng * Math.PI) / 180;
  const destLatRad = (destLat * Math.PI) / 180;
  const destLngRad = (destLng * Math.PI) / 180;

  const y = Math.sin(destLngRad - startLngRad) * Math.cos(destLatRad);
  const x =
    Math.cos(startLatRad) * Math.sin(destLatRad) -
    Math.sin(startLatRad) * Math.cos(destLatRad) * Math.cos(destLngRad - startLngRad);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

// Generate an SVG data URI for a directional circular bus marker
function createBusSvg(heading = 0, isSelected = false) {
  const size = 44;
  const center = size / 2;
  const radius = 16;
  const primaryColor = isSelected ? '#000000' : '#1976D2';

  // Pointer tip coordinates oriented at angle heading (0 deg = North)
  const rad = ((heading - 90) * Math.PI) / 180;
  const pointerLength = 21;
  const tipX = center + Math.cos(rad) * pointerLength;
  const tipY = center + Math.sin(rad) * pointerLength;

  const baseRad1 = ((heading - 90 + 28) * Math.PI) / 180;
  const baseRad2 = ((heading - 90 - 28) * Math.PI) / 180;
  const base1X = center + Math.cos(baseRad1) * (radius - 1);
  const base1Y = center + Math.sin(baseRad1) * (radius - 1);
  const base2X = center + Math.cos(baseRad2) * (radius - 1);
  const base2Y = center + Math.sin(baseRad2) * (radius - 1);

  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-opacity="0.3"/>
        </filter>
      </defs>
      <!-- Directional pointer triangle -->
      <polygon points="${tipX},${tipY} ${base1X},${base1Y} ${base2X},${base2Y}" fill="${primaryColor}" />
      <!-- Main circular badge -->
      <circle cx="${center}" cy="${center}" r="${radius}" fill="${primaryColor}" stroke="#FFFFFF" stroke-width="2.5" filter="url(#shadow)"/>
      <!-- Bus Silhouette Icon in Center -->
      <g transform="translate(${center - 8}, ${center - 8}) scale(0.67)" fill="#FFFFFF">
        <path d="M4 16c0 .88.39 1.67 1 2.22V20a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h8v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
      </g>
    </svg>
  `;

  return {
    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
    scaledSize: new window.google.maps.Size(size, size),
    anchor: new window.google.maps.Point(center, center),
  };
}

export function GoogleRouteMap({
  stops = [],
  liveBuses = [],
  onBack,
  onRecenter,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const polylineRef = useRef(null);
  const stopMarkersRef = useRef([]);
  const busMarkersRef = useRef(new Map());
  const infoWindowRef = useRef(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // Filter valid stops with latitude & longitude
  const validStops = useMemo(() => {
    return (stops || []).filter(
      (s) =>
        typeof s.latitude === 'number' &&
        typeof s.longitude === 'number' &&
        !isNaN(s.latitude) &&
        !isNaN(s.longitude)
    );
  }, [stops]);

  // Initialize Map
  useEffect(() => {
    let isMounted = true;

    loadGoogleMaps()
      .then((googleMaps) => {
        if (!isMounted || !mapContainerRef.current) return;

        if (!mapInstanceRef.current) {
          const center =
            validStops.length > 0
              ? { lat: validStops[0].latitude, lng: validStops[0].longitude }
              : { lat: 12.9716, lng: 77.5946 };

          const map = new googleMaps.Map(mapContainerRef.current, {
            center,
            zoom: 13,
            disableDefaultUI: true,
            zoomControl: false,
            gestureHandling: 'greedy',
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }],
              },
              {
                featureType: 'transit',
                elementType: 'labels.icon',
                stylers: [{ visibility: 'off' }],
              },
              {
                featureType: 'road',
                elementType: 'geometry',
                stylers: [{ lightness: 10 }],
              },
            ],
          });

          mapInstanceRef.current = map;
          infoWindowRef.current = new googleMaps.InfoWindow();
          setMapLoaded(true);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Google Maps load error:', err);
          setLoadError(err.message);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [validStops]);

  // Recenter / fit bounds
  const fitRouteBounds = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.google || validStops.length === 0) return;

    const bounds = new window.google.maps.LatLngBounds();
    validStops.forEach((stop) => {
      bounds.extend({ lat: stop.latitude, lng: stop.longitude });
    });
    map.fitBounds(bounds, { top: 70, bottom: 260, left: 40, right: 40 });
  }, [validStops]);

  // Update Route Polyline with Directional Arrows
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded || !window.google || validStops.length < 2) return;

    // Remove existing polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    const path = validStops.map((s) => ({
      lat: s.latitude,
      lng: s.longitude,
    }));

    // Repeating directional arrow symbol
    const lineSymbol = {
      path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      scale: 2.2,
      strokeColor: '#FFFFFF',
      fillColor: '#1A1D20',
      fillOpacity: 1,
      strokeWeight: 1,
    };

    const polyline = new window.google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#1A1D20',
      strokeOpacity: 0.95,
      strokeWeight: 4.5,
      icons: [
        {
          icon: lineSymbol,
          offset: '25px',
          repeat: '80px',
        },
      ],
      map,
    });

    polylineRef.current = polyline;
    fitRouteBounds();
  }, [mapLoaded, validStops, fitRouteBounds]);

  // Update Stop Markers (Circles + Start Badge)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded || !window.google) return;

    // Clear old stop markers
    stopMarkersRef.current.forEach((m) => m.setMap(null));
    stopMarkersRef.current = [];

    validStops.forEach((stop, index) => {
      const isStart = index === 0;

      // Circle stop icon
      const stopMarker = new window.google.maps.Marker({
        position: { lat: stop.latitude, lng: stop.longitude },
        map,
        title: stop.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: '#FFFFFF',
          fillOpacity: 1,
          strokeColor: '#1A1D20',
          strokeWeight: 2.5,
        },
        zIndex: 5,
      });

      // "Start" badge label for the first terminal
      if (isStart) {
        const startBadge = new window.google.maps.Marker({
          position: { lat: stop.latitude, lng: stop.longitude },
          map,
          icon: {
            url:
              'data:image/svg+xml;charset=UTF-8,' +
              encodeURIComponent(`
                <svg width="46" height="24" viewBox="0 0 46 24" xmlns="http://www.w3.org/2000/svg">
                  <rect width="46" height="22" rx="4" fill="#000000" />
                  <text x="23" y="15" fill="#FFFFFF" font-family="-apple-system, sans-serif" font-size="11" font-weight="700" text-anchor="middle">Start</text>
                </svg>
              `),
            scaledSize: new window.google.maps.Size(46, 24),
            anchor: new window.google.maps.Point(23, 30),
          },
          zIndex: 6,
        });
        stopMarkersRef.current.push(startBadge);
      }

      stopMarker.addListener('click', () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.setContent(`
            <div style="font-family: -apple-system, sans-serif; padding: 4px 6px;">
              <strong style="font-size: 13px; color: #111;">${stop.name}</strong>
              <div style="font-size: 11px; color: #666; margin-top: 2px;">${stop.stopCode || stop.stop_code || ''}</div>
            </div>
          `);
          infoWindowRef.current.open(map, stopMarker);
        }
      });

      stopMarkersRef.current.push(stopMarker);
    });
  }, [mapLoaded, validStops]);

  // Update Live Bus Markers with Interpolated Positions and Heading
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded || !window.google || validStops.length < 2) return;

    const currentMarkers = busMarkersRef.current;
    const activeBusIds = new Set();

    (liveBuses || []).forEach((bus, busIdx) => {
      activeBusIds.add(bus.id);

      const progress =
        typeof bus.progress === 'number'
          ? bus.progress
          : bus.currentStopIndex ?? 0;

      const fromIndex = Math.min(
        Math.floor(progress),
        validStops.length - 1
      );
      const toIndex = Math.min(
        fromIndex + 1,
        validStops.length - 1
      );
      const fraction = progress - fromIndex;

      const fromStop = validStops[fromIndex];
      const toStop = validStops[toIndex];

      if (!fromStop || !toStop) return;

      // Interpolate lat & lng
      const currentLat =
        fromStop.latitude + (toStop.latitude - fromStop.latitude) * fraction;
      const currentLng =
        fromStop.longitude + (toStop.longitude - fromStop.longitude) * fraction;

      // Compute heading bearing in degrees
      const heading = computeBearing(
        fromStop.latitude,
        fromStop.longitude,
        toStop.latitude,
        toStop.longitude
      );

      const isSelected = busIdx === 0; // Primary active bus styling
      const icon = createBusSvg(heading, isSelected);

      let marker = currentMarkers.get(bus.id);
      if (!marker) {
        marker = new window.google.maps.Marker({
          position: { lat: currentLat, lng: currentLng },
          map,
          title: `Bus ${bus.registrationNumber || bus.id}`,
          icon,
          zIndex: 20,
        });

        marker.addListener('click', () => {
          map.panTo({ lat: currentLat, lng: currentLng });
          map.setZoom(16);
        });

        currentMarkers.set(bus.id, marker);
      } else {
        marker.setPosition({ lat: currentLat, lng: currentLng });
        marker.setIcon(icon);
      }
    });

    // Clean up markers of removed buses
    for (const [id, marker] of currentMarkers.entries()) {
      if (!activeBusIds.has(id)) {
        marker.setMap(null);
        currentMarkers.delete(id);
      }
    }
  }, [mapLoaded, validStops, liveBuses]);

  return (
    <div className="google-route-map">
      <div ref={mapContainerRef} className="google-route-map__canvas" />

      {/* Floating Back Button (Top Left) */}
      <button
        type="button"
        className="google-route-map__back-btn"
        onClick={onBack}
        aria-label="Go back"
      >
        <i className="bi bi-arrow-left" />
      </button>

      {/* Floating Recenter / GPS Button (Bottom Right) */}
      <button
        type="button"
        className="google-route-map__recenter-btn"
        onClick={() => {
          fitRouteBounds();
          if (onRecenter) onRecenter();
        }}
        aria-label="Recenter map"
      >
        <i className="bi bi-crosshair" />
      </button>

      {loadError && (
        <div className="google-route-map__error-banner">
          <i className="bi bi-exclamation-triangle-fill" />
          <span>Map load notice: {loadError}</span>
        </div>
      )}
    </div>
  );
}

export default GoogleRouteMap;
