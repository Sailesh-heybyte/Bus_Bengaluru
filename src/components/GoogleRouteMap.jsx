import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { loadGoogleMaps } from '../utils/googleMapsLoader';
import { getRouteRoadPath } from '../data/routeRoadShapes';
import './GoogleRouteMap.scss';

// Calculate bearing in degrees between two coordinates (0° = North, 90° = East)
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
  const primaryColor = isSelected ? '#111827' : '#1976D2';

  // Directional triangle pointer rotated by heading
  const rad = ((heading - 90) * Math.PI) / 180;
  const pointerLength = 22;
  const tipX = center + Math.cos(rad) * pointerLength;
  const tipY = center + Math.sin(rad) * pointerLength;

  const baseRad1 = ((heading - 90 + 26) * Math.PI) / 180;
  const baseRad2 = ((heading - 90 - 26) * Math.PI) / 180;
  const base1X = center + Math.cos(baseRad1) * (radius - 1);
  const base1Y = center + Math.sin(baseRad1) * (radius - 1);
  const base2X = center + Math.cos(baseRad2) * (radius - 1);
  const base2Y = center + Math.sin(baseRad2) * (radius - 1);

  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="busShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-opacity="0.35"/>
        </filter>
      </defs>
      <!-- Directional pointer triangle -->
      <polygon points="${tipX},${tipY} ${base1X},${base1Y} ${base2X},${base2Y}" fill="${primaryColor}" />
      <!-- Main circular badge -->
      <circle cx="${center}" cy="${center}" r="${radius}" fill="${primaryColor}" stroke="#FFFFFF" stroke-width="2.5" filter="url(#busShadow)"/>
      <!-- White Bus Silhouette Icon -->
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
  routeId,
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
  const [roadPathData, setRoadPathData] = useState(() =>
    getRouteRoadPath(routeId, stops, 8)
  );

  // Keep roadPathData in sync when routeId or stops change
  useEffect(() => {
    setRoadPathData(getRouteRoadPath(routeId, stops, 8));
  }, [routeId, stops]);

  // Valid stops with latitude & longitude
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

          // Try Google DirectionsService for live road overview if available
          if (validStops.length >= 2) {
            try {
              const directionsService = new googleMaps.DirectionsService();
              const origin = { lat: validStops[0].latitude, lng: validStops[0].longitude };
              const destination = {
                lat: validStops[validStops.length - 1].latitude,
                lng: validStops[validStops.length - 1].longitude,
              };
              const waypoints = validStops.slice(1, -1).map((s) => ({
                location: { lat: s.latitude, lng: s.longitude },
                stopover: true,
              }));

              directionsService.route(
                {
                  origin,
                  destination,
                  waypoints,
                  travelMode: googleMaps.TravelMode.DRIVING,
                },
                (result, status) => {
                  if (
                    isMounted &&
                    status === googleMaps.DirectionsStatus.OK &&
                    result?.routes?.[0]?.overview_path
                  ) {
                    const overviewPath = result.routes[0].overview_path.map((p) => ({
                      lat: p.lat(),
                      lng: p.lng(),
                    }));

                    // Map each stop to the closest point in the road overview
                    const newStopIndices = {};
                    validStops.forEach((stop, sIdx) => {
                      let bestDist = Infinity;
                      let bestIdx = 0;
                      overviewPath.forEach((pt, pIdx) => {
                        const d =
                          Math.hypot(pt.lat - stop.latitude, pt.lng - stop.longitude);
                        if (d < bestDist) {
                          bestDist = d;
                          bestIdx = pIdx;
                        }
                      });
                      newStopIndices[sIdx] = bestIdx;
                    });

                    setRoadPathData({
                      densePath: overviewPath,
                      stopIndexToRoadIndex: newStopIndices,
                    });
                  }
                }
              );
            } catch (dirErr) {
              console.warn('DirectionsService request skipped, using built-in road geometry:', dirErr);
            }
          }
        }
      })
      .catch((err) => {
        console.error('Google Maps load error:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [validStops]);

  // Recenter / fit bounds
  const fitRouteBounds = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.google) return;

    const bounds = new window.google.maps.LatLngBounds();
    const pointsToFit =
      roadPathData.densePath.length > 0 ? roadPathData.densePath : validStops;

    pointsToFit.forEach((pt) => {
      bounds.extend({ lat: pt.lat || pt.latitude, lng: pt.lng || pt.longitude });
    });

    // Provide comfortable padding above bottom sheet
    map.fitBounds(bounds, { top: 70, bottom: 280, left: 40, right: 40 });
  }, [roadPathData, validStops]);

  // Update Route Polyline with Road-Following Path and Directional Arrows
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded || !window.google) return;

    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }

    const path =
      roadPathData.densePath.length > 0
        ? roadPathData.densePath
        : validStops.map((s) => ({ lat: s.latitude, lng: s.longitude }));

    if (path.length < 2) return;

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
      geodesic: false, // Follow exact road points, not geodesic curve
      strokeColor: '#1A1D20',
      strokeOpacity: 0.95,
      strokeWeight: 5,
      icons: [
        {
          icon: lineSymbol,
          offset: '30px',
          repeat: '85px',
        },
      ],
      map,
    });

    polylineRef.current = polyline;
    fitRouteBounds();
  }, [mapLoaded, roadPathData, validStops, fitRouteBounds]);

  // Update Stop Markers (Circles + Start Badge) Snapped to the Road
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded || !window.google) return;

    stopMarkersRef.current.forEach((m) => m.setMap(null));
    stopMarkersRef.current = [];

    const { densePath, stopIndexToRoadIndex } = roadPathData;

    validStops.forEach((stop, index) => {
      const isStart = index === 0;

      // Get exact road coordinate for this stop
      const roadIdx = stopIndexToRoadIndex[index];
      const pos =
        typeof roadIdx === 'number' && densePath[roadIdx]
          ? { lat: densePath[roadIdx].lat, lng: densePath[roadIdx].lng }
          : { lat: stop.latitude, lng: stop.longitude };

      // Circle stop icon
      const stopMarker = new window.google.maps.Marker({
        position: pos,
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

      // "Start" badge label for origin
      if (isStart) {
        const startBadge = new window.google.maps.Marker({
          position: pos,
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
  }, [mapLoaded, validStops, roadPathData]);

  // Update Live Bus Markers strictly moving along the road coordinates
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded || !window.google) return;

    const { densePath, stopIndexToRoadIndex } = roadPathData;
    if (densePath.length < 2) return;

    const currentMarkers = busMarkersRef.current;
    const activeBusIds = new Set();

    (liveBuses || []).forEach((bus, busIdx) => {
      activeBusIds.add(bus.id);

      const progress =
        typeof bus.progress === 'number'
          ? bus.progress
          : bus.currentStopIndex ?? 0;

      const fromStopIdx = Math.min(
        Math.floor(progress),
        validStops.length - 1
      );
      const toStopIdx = Math.min(
        fromStopIdx + 1,
        validStops.length - 1
      );
      const fraction = progress - fromStopIdx;

      // Find start and end indices on the dense road path
      const startRoadIdx = stopIndexToRoadIndex[fromStopIdx] ?? 0;
      const endRoadIdx =
        stopIndexToRoadIndex[toStopIdx] ??
        Math.min(densePath.length - 1, startRoadIdx + 10);

      // Compute exact road sub-point
      const roadSubIdx = Math.round(
        startRoadIdx + (endRoadIdx - startRoadIdx) * fraction
      );
      const clampedRoadIdx = Math.max(
        0,
        Math.min(densePath.length - 1, roadSubIdx)
      );

      const currentCoord = densePath[clampedRoadIdx];
      const nextCoord =
        densePath[Math.min(densePath.length - 1, clampedRoadIdx + 1)];

      if (!currentCoord) return;

      // Compute exact road tangent bearing
      const heading = nextCoord
        ? computeBearing(
            currentCoord.lat,
            currentCoord.lng,
            nextCoord.lat,
            nextCoord.lng
          )
        : 0;

      const isSelected = busIdx === 0;
      const icon = createBusSvg(heading, isSelected);

      let marker = currentMarkers.get(bus.id);
      if (!marker) {
        marker = new window.google.maps.Marker({
          position: { lat: currentCoord.lat, lng: currentCoord.lng },
          map,
          title: `Bus ${bus.registrationNumber || bus.id}`,
          icon,
          zIndex: 25,
        });

        marker.addListener('click', () => {
          map.panTo({ lat: currentCoord.lat, lng: currentCoord.lng });
          map.setZoom(16);
        });

        currentMarkers.set(bus.id, marker);
      } else {
        marker.setPosition({ lat: currentCoord.lat, lng: currentCoord.lng });
        marker.setIcon(icon);
      }
    });

    for (const [id, marker] of currentMarkers.entries()) {
      if (!activeBusIds.has(id)) {
        marker.setMap(null);
        currentMarkers.delete(id);
      }
    }
  }, [mapLoaded, validStops, liveBuses, roadPathData]);

  // Recenter to track the primary bus smoothly on the road
  const handleRecenterBus = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map || !liveBuses || liveBuses.length === 0) {
      fitRouteBounds();
      return;
    }

    const primaryBus = liveBuses[0];
    const marker = busMarkersRef.current.get(primaryBus.id);
    if (marker && marker.getPosition()) {
      map.panTo(marker.getPosition());
      map.setZoom(15);
    } else {
      fitRouteBounds();
    }

    if (onRecenter) onRecenter();
  }, [liveBuses, fitRouteBounds, onRecenter]);

  return (
    <div className="google-route-map">
      <div ref={mapContainerRef} className="google-route-map__canvas" />

      {/* Floating Back Button */}
      <button
        type="button"
        className="google-route-map__back-btn"
        onClick={onBack}
        aria-label="Go back"
      >
        <i className="bi bi-arrow-left" />
      </button>

      {/* Floating Recenter / GPS Button */}
      <button
        type="button"
        className="google-route-map__recenter-btn"
        onClick={handleRecenterBus}
        aria-label="Recenter on live bus"
      >
        <i className="bi bi-crosshair" />
      </button>
    </div>
  );
}

export default GoogleRouteMap;
