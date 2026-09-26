import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getExactRoadGeometry } from '../utils/routeGeometry';
import './MapboxRouteMap.scss';

// Available Mapbox Vector Styles
const MAP_STYLES = [
  { id: 'navigation', name: 'Navigation (Chalo)', url: 'mapbox://styles/mapbox/navigation-day-v1', icon: 'bi-compass' },
  { id: 'streets', name: 'Mapbox Streets', url: 'mapbox://styles/mapbox/streets-v12', icon: 'bi-map' },
  { id: 'light', name: 'Light Transit', url: 'mapbox://styles/mapbox/light-v11', icon: 'bi-sun' },
  { id: 'dark', name: 'Dark Mode', url: 'mapbox://styles/mapbox/dark-v11', icon: 'bi-moon' },
  { id: 'outdoors', name: 'Outdoors', url: 'mapbox://styles/mapbox/outdoors-v12', icon: 'bi-tree' },
];

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

export function MapboxRouteMap({
  routeId,
  stops = [],
  liveBuses = [],
  onBack,
  onRecenter,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const stopMarkersRef = useRef([]);
  const busMarkersRef = useRef(new Map());
  const arrowMarkersRef = useRef([]);

  const [activeStyle, setActiveStyle] = useState('navigation');
  const [showStyleMenu, setShowStyleMenu] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Filter valid stops
  const validStops = useMemo(() => {
    return (stops || []).filter(
      (s) =>
        typeof s.latitude === 'number' &&
        typeof s.longitude === 'number' &&
        !isNaN(s.latitude) &&
        !isNaN(s.longitude)
    );
  }, [stops]);

  // Exact 100% real asphalt road geometry for this route
  const roadPathData = useMemo(() => {
    return getExactRoadGeometry(routeId, validStops);
  }, [routeId, validStops]);

  // Initialize Mapbox Map
  useEffect(() => {
    const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    if (!token) {
      console.warn('Missing VITE_MAPBOX_ACCESS_TOKEN in .env');
    }

    mapboxgl.accessToken = token || '';

    if (!mapContainerRef.current) return;

    const initialCenter =
      validStops.length > 0
        ? [validStops[0].longitude, validStops[0].latitude]
        : [77.5946, 12.9716];

    const currentStyleUrl =
      MAP_STYLES.find((s) => s.id === activeStyle)?.url ||
      'mapbox://styles/mapbox/navigation-day-v1';

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: currentStyleUrl,
      center: initialCenter,
      zoom: 13,
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    map.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []); // Run once on mount

  // Switch style when activeStyle changes
  const handleSelectStyle = (styleId) => {
    setActiveStyle(styleId);
    setShowStyleMenu(false);
    const map = mapInstanceRef.current;
    if (!map) return;
    const styleObj = MAP_STYLES.find((s) => s.id === styleId);
    if (styleObj) {
      map.setStyle(styleObj.url);
      map.once('style.load', () => {
        // Re-add layers after style load
        renderRouteLayers();
      });
    }
  };

  // Fit bounds to the route
  const fitRouteBounds = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const points =
      roadPathData.densePath.length > 0 ? roadPathData.densePath : validStops;
    if (points.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();
    points.forEach((p) => {
      bounds.extend([p.lng || p.longitude, p.lat || p.latitude]);
    });

    map.fitBounds(bounds, {
      padding: { top: 70, bottom: 270, left: 40, right: 40 },
      maxZoom: 14.5,
      duration: 1000,
    });
  }, [roadPathData, validStops]);

  // Render the GeoJSON road line layer
  const renderRouteLayers = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const coordinates = roadPathData.densePath.map((p) => [p.lng, p.lat]);
    if (coordinates.length < 2) return;

    const geojsonData = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates,
      },
    };

    // Remove existing layer and source if present
    if (map.getLayer('route-line-casing')) map.removeLayer('route-line-casing');
    if (map.getLayer('route-line-main')) map.removeLayer('route-line-main');
    if (map.getSource('route-line-source')) map.removeSource('route-line-source');

    map.addSource('route-line-source', {
      type: 'geojson',
      data: geojsonData,
    });

    // White outline casing for crisp contrast
    map.addLayer({
      id: 'route-line-casing',
      type: 'line',
      source: 'route-line-source',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#FFFFFF',
        'line-width': 8,
        'line-opacity': 0.85,
      },
    });

    // Main solid black navigation route line
    map.addLayer({
      id: 'route-line-main',
      type: 'line',
      source: 'route-line-source',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#111827',
        'line-width': 5.5,
        'line-opacity': 0.95,
      },
    });

    // Render repeating directional arrow markers along the road line
    arrowMarkersRef.current.forEach((m) => m.remove());
    arrowMarkersRef.current = [];

    const step = Math.max(12, Math.floor(roadPathData.densePath.length / 18));
    for (let i = step; i < roadPathData.densePath.length - 2; i += step) {
      const p1 = roadPathData.densePath[i];
      const p2 = roadPathData.densePath[i + 1];
      if (!p1 || !p2) continue;

      const bearing = computeBearing(p1.lat, p1.lng, p2.lat, p2.lng);
      const arrowEl = document.createElement('div');
      arrowEl.className = 'mapbox-route-map__direction-arrow';
      arrowEl.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
          <polygon points="7,2 12,11 7,8.5 2,11" fill="#FFFFFF" stroke="#111827" stroke-width="1.2" />
        </svg>
      `;

      const marker = new mapboxgl.Marker({
        element: arrowEl,
        rotationAlignment: 'map',
        pitchAlignment: 'map',
        rotation: bearing,
      })
        .setLngLat([p1.lng, p1.lat])
        .addTo(map);

      arrowMarkersRef.current.push(marker);
    }
  }, [roadPathData]);

  // Update Route Line when roadPathData or mapLoaded changes
  useEffect(() => {
    if (!mapLoaded) return;
    renderRouteLayers();
    fitRouteBounds();
  }, [mapLoaded, roadPathData, renderRouteLayers, fitRouteBounds]);

  // Render Stop Markers (Circles + Start Badge) snapped to the road
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    stopMarkersRef.current.forEach((m) => m.remove());
    stopMarkersRef.current = [];

    const { densePath, stopIndexToRoadIndex } = roadPathData;

    validStops.forEach((stop, index) => {
      const isStart = index === 0;
      const roadIdx = stopIndexToRoadIndex[index];
      const pos =
        typeof roadIdx === 'number' && densePath[roadIdx]
          ? [densePath[roadIdx].lng, densePath[roadIdx].lat]
          : [stop.longitude, stop.latitude];

      const el = document.createElement('div');
      el.className = 'mapbox-route-map__stop-marker';
      el.innerHTML = `
        ${
          isStart
            ? `<div class="mapbox-route-map__start-badge">Start</div>`
            : ''
        }
        <div class="mapbox-route-map__stop-circle"></div>
      `;

      const popup = new mapboxgl.Popup({ offset: 12, closeButton: false }).setHTML(`
        <div style="font-family: -apple-system, sans-serif; font-size: 13px; font-weight: 600; color: #111;">
          ${stop.name}
          <div style="font-size: 11px; font-weight: 400; color: #666; margin-top: 2px;">
            ${stop.stopCode || stop.stop_code || ''}
          </div>
        </div>
      `);

      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'center',
      })
        .setLngLat(pos)
        .setPopup(popup)
        .addTo(map);

      stopMarkersRef.current.push(marker);
    });
  }, [mapLoaded, validStops, roadPathData]);

  // Render Live Directional Bus Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    const { densePath, stopIndexToRoadIndex } = roadPathData;
    if (densePath.length < 2) return;

    const currentMarkers = busMarkersRef.current;
    const activeBusIds = new Set();

    (liveBuses || []).forEach((bus) => {
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

      const startRoadIdx = stopIndexToRoadIndex[fromStopIdx] ?? 0;
      const endRoadIdx =
        stopIndexToRoadIndex[toStopIdx] ??
        Math.min(densePath.length - 1, startRoadIdx + 10);

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

      const heading = nextCoord
        ? computeBearing(
            currentCoord.lat,
            currentCoord.lng,
            nextCoord.lat,
            nextCoord.lng
          )
        : 0;

      let marker = currentMarkers.get(bus.id);

      if (!marker) {
        // Create custom Mapbox Bus Marker Element
        const busEl = document.createElement('div');
        busEl.className = 'mapbox-route-map__bus-marker';
        busEl.innerHTML = `
          <div class="mapbox-route-map__bus-circle">
            <i class="bi bi-bus-front-fill"></i>
            <div class="mapbox-route-map__bus-pointer"></div>
          </div>
        `;

        marker = new mapboxgl.Marker({
          element: busEl,
          rotationAlignment: 'map',
          pitchAlignment: 'map',
          rotation: heading,
          anchor: 'center',
        })
          .setLngLat([currentCoord.lng, currentCoord.lat])
          .addTo(map);

        currentMarkers.set(bus.id, marker);
      } else {
        marker.setLngLat([currentCoord.lng, currentCoord.lat]);
        marker.setRotation(heading);
      }
    });

    for (const [id, marker] of currentMarkers.entries()) {
      if (!activeBusIds.has(id)) {
        marker.remove();
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
    if (marker) {
      const lngLat = marker.getLngLat();
      map.flyTo({
        center: lngLat,
        zoom: 15.5,
        pitch: 25,
        duration: 900,
        essential: true,
      });
    } else {
      fitRouteBounds();
    }

    if (onRecenter) onRecenter();
  }, [liveBuses, fitRouteBounds, onRecenter]);

  return (
    <div className="mapbox-route-map">
      <div ref={mapContainerRef} className="mapbox-route-map__canvas" />

      {/* Floating Back Button (Top Left) */}
      <button
        type="button"
        className="mapbox-route-map__back-btn"
        onClick={onBack}
        aria-label="Go back"
      >
        <i className="bi bi-arrow-left" />
      </button>

      {/* Floating Style Switcher (Top Right) */}
      <div className="mapbox-route-map__style-picker">
        <button
          type="button"
          className="mapbox-route-map__style-btn"
          onClick={() => setShowStyleMenu(!showStyleMenu)}
          aria-label="Change map style"
        >
          <i className="bi bi-palette-fill" />
        </button>

        {showStyleMenu && (
          <div className="mapbox-route-map__style-menu">
            <div className="mapbox-route-map__style-menu-header">Map Style</div>
            {MAP_STYLES.map((style) => (
              <button
                key={style.id}
                type="button"
                className={`mapbox-route-map__style-option ${
                  activeStyle === style.id
                    ? 'mapbox-route-map__style-option--active'
                    : ''
                }`}
                onClick={() => handleSelectStyle(style.id)}
              >
                <i className={`bi ${style.icon}`} />
                <span>{style.name}</span>
                {activeStyle === style.id && <i className="bi bi-check2" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Floating Recenter / GPS Button (Bottom Right) */}
      <button
        type="button"
        className="mapbox-route-map__recenter-btn"
        onClick={handleRecenterBus}
        aria-label="Recenter on live bus"
      >
        <i className="bi bi-crosshair" />
      </button>
    </div>
  );
}

export default MapboxRouteMap;
