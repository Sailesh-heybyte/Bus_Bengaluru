import React, { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useSimulation } from '../../context/SimulationContext';
import { routes as mockRoutes } from '../../mock/routes';
import { stops as mockStops } from '../../mock/stops';
import './FleetMap.scss';

// Pre-compute coordinate waypoints for each route so every bus has reliable coordinates
const ROUTE_WAYPOINTS = {
  route_01: [
    [12.9172, 77.6229], // Silk Board
    [12.9350, 77.6350],
    [12.9500, 77.6500],
    [12.9650, 77.6650],
    [12.9850, 77.6700],
    [13.0000, 77.6500],
    [13.0200, 77.6200],
    [13.0358, 77.5970]  // Hebbal
  ],
  route_02: [
    [15.3647, 75.1240], // Hubballi Old BS
    [15.3850, 75.0950],
    [15.4050, 75.0650],
    [15.4250, 75.0350],
    [15.4400, 75.0100],
    [15.4589, 74.9860]  // Dharwad BRTS Terminal
  ],
  route_03: [
    [17.3297, 76.8343], // Kalaburagi Central
    [17.3220, 76.8400],
    [17.3150, 76.8480],
    [17.3080, 76.8550],
    [17.3000, 76.8600]  // Gulbarga University
  ],
  route_04: [
    [12.9776, 77.5713], // Kempegowda BS (Majestic)
    [12.8700, 77.4400],
    [12.7200, 77.2800],
    [12.6000, 77.1000],
    [12.5218, 76.8951], // Mandya
    [12.4200, 76.7800],
    [12.2958, 76.6394]  // Mysuru City BS
  ],
  route_05: [
    [12.9776, 77.5713], // Majestic
    [12.8700, 77.4400],
    [12.7200, 77.2800],
    [12.5218, 76.8951], // Mandya
    [12.2958, 76.6394]  // Mysuru City BS
  ]
};

// Custom DivIcon for Depot Fleet Map: distinct vehicle badge with registration text
function createFleetBusIcon(bus) {
  const regNum = bus.registrationNumber || bus.registration_number || bus.id;
  const isAc = (bus.busType || bus.bus_type || '').includes('AC');

  return L.divIcon({
    className: 'fleet-map__bus-icon-wrapper',
    html: `
      <div class="fleet-bus-marker ${isAc ? 'fleet-bus-marker--ac' : ''}">
        <div class="fleet-bus-marker__pulse"></div>
        <div class="fleet-bus-marker__dot">
          <i class="bi bi-bus-front"></i>
        </div>
        <div class="fleet-bus-marker__label">${regNum}</div>
      </div>
    `,
    iconSize: [80, 36],
    iconAnchor: [40, 18]
  });
}

export function FleetMap() {
  const outletCtx = useOutletContext();
  const depot = outletCtx?.depot;
  const { liveBuses } = useSimulation();

  // Compute live bus positions by interpolating their progress along route waypoints
  const busPositions = useMemo(() => {
    if (!liveBuses || liveBuses.length === 0) return [];

    return liveBuses.map((bus) => {
      const routeId = bus.routeId || bus.route_id || 'route_01';
      const waypoints = ROUTE_WAYPOINTS[routeId] || ROUTE_WAYPOINTS.route_01;
      const progress = typeof bus.progress === 'number' ? bus.progress : 0;

      const maxIndex = waypoints.length - 1;
      const segmentIndex = Math.min(Math.floor(progress), maxIndex - 1);
      const subProgress = progress - segmentIndex;

      const p1 = waypoints[segmentIndex];
      const p2 = waypoints[Math.min(segmentIndex + 1, maxIndex)];

      // Linear interpolation between the two adjacent waypoints
      const lat = p1[0] + (p2[0] - p1[0]) * Math.max(0, Math.min(1, subProgress));
      const lng = p1[1] + (p2[1] - p1[1]) * Math.max(0, Math.min(1, subProgress));

      const routeObj = mockRoutes.find((r) => r.id === routeId);

      return {
        bus,
        position: [lat, lng],
        routeNumber: routeObj ? routeObj.route_number : routeId,
        from: routeObj ? routeObj.from : '',
        to: routeObj ? routeObj.to : ''
      };
    });
  }, [liveBuses]);

  // Summary counts
  const totalFleet = liveBuses ? liveBuses.length : 0;
  const activeCount = liveBuses
    ? liveBuses.filter((b) => (b.currentStatus || b.current_status) === 'running').length
    : 0;
  const breakdownsToday = depot?.breakdownsToday ?? 0;

  return (
    <div className="fleet-map" role="region" aria-label="Fleet Map Control Room">
      {/* Floating Summary Card Overlay */}
      <div className="fleet-summary-card">
        <div className="fleet-summary-card__header">
          <span className="fleet-summary-card__title">Fleet Status</span>
          <span className="fleet-summary-card__live-badge">
            <span className="fleet-summary-card__pulse-dot" />
            Live
          </span>
        </div>

        <div className="fleet-summary-card__stats">
          <div className="fleet-summary-card__stat">
            <span className="fleet-summary-card__stat-val">{totalFleet}</span>
            <span className="fleet-summary-card__stat-lbl">Total Fleet</span>
          </div>

          <div className="fleet-summary-card__divider" />

          <div className="fleet-summary-card__stat fleet-summary-card__stat--active">
            <span className="fleet-summary-card__stat-val">{activeCount}</span>
            <span className="fleet-summary-card__stat-lbl">Active</span>
          </div>

          <div className="fleet-summary-card__divider" />

          <div className="fleet-summary-card__stat fleet-summary-card__stat--breakdowns">
            <span className="fleet-summary-card__stat-val">{breakdownsToday}</span>
            <span className="fleet-summary-card__stat-lbl">Breakdowns</span>
          </div>
        </div>
      </div>

      {/* Full-width, full-height Leaflet Map */}
      <MapContainer
        center={[14.1, 76.2]}
        zoom={7}
        scrollWheelZoom={true}
        className="fleet-map__container"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {busPositions.map(({ bus, position, routeNumber, from, to }) => (
          <Marker
            key={bus.id}
            position={position}
            icon={createFleetBusIcon(bus)}
          >
            <Popup className="fleet-map__popup">
              <div className="fleet-popup">
                <div className="fleet-popup__header">
                  <span className="fleet-popup__route">{routeNumber}</span>
                  <span className="fleet-popup__reg">
                    {bus.registrationNumber || bus.registration_number}
                  </span>
                </div>
                <div className="fleet-popup__body">
                  <div className="fleet-popup__row">
                    <span className="fleet-popup__lbl">Route:</span>
                    <span className="fleet-popup__val">{from} → {to}</span>
                  </div>
                  <div className="fleet-popup__row">
                    <span className="fleet-popup__lbl">Type:</span>
                    <span className="fleet-popup__val">{bus.busType || bus.bus_type}</span>
                  </div>
                  <div className="fleet-popup__row">
                    <span className="fleet-popup__lbl">Status:</span>
                    <span className="fleet-popup__status">
                      {bus.currentStatus || bus.current_status}
                    </span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default FleetMap;
