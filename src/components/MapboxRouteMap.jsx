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
  const startMarkerRef = useRef(null);
  const busMarkersRef = useRef(new Map());

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
    const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';
    mapboxgl.accessToken = token;

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
      zoom: 12,
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    map.on('load', () => {
      map.resize();
      setMapLoaded(true);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

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
        renderRouteAndStops();
      });
    }
  };

  // Fit camera bounds to the route
  const fitRouteBounds = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const points =
      roadPathData.densePath.length > 0 ? roadPathData.densePath : validStops;
    if (points.length < 2) return;

    const bounds = new mapboxgl.LngLatBounds();
    points.forEach((p) => {
      const lng = p.lng || p.longitude;
      const lat = p.lat || p.latitude;
      if (typeof lng === 'number' && typeof lat === 'number') {
        bounds.extend([lng, lat]);
      }
    });

    map.resize();
    map.fitBounds(bounds, {
      padding: { top: 80, bottom: 280, left: 40, right: 40 },
      maxZoom: 14.5,
      duration: 800,
    });
  }, [roadPathData, validStops]);

  // Render the GeoJSON road line layer AND native stop circle layer
  const renderRouteAndStops = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const coordinates = roadPathData.densePath.map((p) => [p.lng, p.lat]);
    if (coordinates.length < 2) return;

    // 1. Route Polyline Layer
    const lineGeoJson = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates,
      },
    };

    if (map.getLayer('route-line-casing')) map.removeLayer('route-line-casing');
    if (map.getLayer('route-line-main')) map.removeLayer('route-line-main');
    if (map.getSource('route-line-source')) map.removeSource('route-line-source');

    map.addSource('route-line-source', {
      type: 'geojson',
      data: lineGeoJson,
    });

    // White outline casing
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
        'line-opacity': 0.9,
      },
    });

    // Solid black navigation line
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

    // 2. Native WebGL Stop Circle Layer (Zero CSS alignment bugs)
    const { densePath, stopIndexToRoadIndex } = roadPathData;
    const stopFeatures = validStops.map((stop, index) => {
      const roadIdx = stopIndexToRoadIndex[index];
      const pos =
        typeof roadIdx === 'number' && densePath[roadIdx]
          ? [densePath[roadIdx].lng, densePath[roadIdx].lat]
          : [stop.longitude, stop.latitude];

      return {
        type: 'Feature',
        properties: {
          id: stop.id,
          name: stop.name,
          stopCode: stop.stopCode || stop.stop_code || '',
        },
        geometry: {
          type: 'Point',
          coordinates: pos,
        },
      };
    });

    const stopsGeoJson = {
      type: 'FeatureCollection',
      features: stopFeatures,
    };

    if (map.getLayer('stops-layer')) map.removeLayer('stops-layer');
    if (map.getSource('stops-source')) map.removeSource('stops-source');

    map.addSource('stops-source', {
      type: 'geojson',
      data: stopsGeoJson,
    });

    map.addLayer({
      id: 'stops-layer',
      type: 'circle',
      source: 'stops-source',
      paint: {
        'circle-radius': 5.5,
        'circle-color': '#FFFFFF',
        'circle-stroke-color': '#111827',
        'circle-stroke-width': 2.5,
      },
    });

    // Click on stop opens popup
    map.on('click', 'stops-layer', (e) => {
      const feature = e.features?.[0];
      if (!feature) return;

      const coordinates = feature.geometry.coordinates.slice();
      const { name, stopCode } = feature.properties;

      new mapboxgl.Popup({ offset: 12 })
        .setLngLat(coordinates)
        .setHTML(`
          <div style="font-family: -apple-system, sans-serif; font-size: 13px; font-weight: 600; color: #111;">
            ${name}
            <div style="font-size: 11px; font-weight: 400; color: #666; margin-top: 2px;">
              ${stopCode}
            </div>
          </div>
        `)
        .addTo(map);
    });

    // 3. Start Terminal Badge at Origin Stop
    if (startMarkerRef.current) {
      startMarkerRef.current.remove();
      startMarkerRef.current = null;
    }

    if (stopFeatures.length > 0) {
      const startCoord = stopFeatures[0].geometry.coordinates;
      const startBadgeEl = document.createElement('div');
      startBadgeEl.className = 'mapbox-route-map__start-badge';
      startBadgeEl.innerText = 'Start';

      startMarkerRef.current = new mapboxgl.Marker({
        element: startBadgeEl,
        anchor: 'bottom',
        offset: [0, -8],
      })
        .setLngLat(startCoord)
        .addTo(map);
    }
  }, [roadPathData, validStops]);

  // Update Route and Stops when mapLoaded or roadPathData changes
  useEffect(() => {
    if (!mapLoaded) return;
    renderRouteAndStops();
    fitRouteBounds();
  }, [mapLoaded, roadPathData, renderRouteAndStops, fitRouteBounds]);

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
