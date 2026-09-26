import { mockCall } from './mockClient.js';

export function toUiStop(apiStop) {
  return {
    id: apiStop.id,
    name: apiStop.name,
    nameKn: apiStop.name_kn,
    corporation: apiStop.corporation,
    district: apiStop.district,
    stopCode: apiStop.stop_code,
    areaType: apiStop.area_type,
    latitude: apiStop.latitude,
    longitude: apiStop.longitude,
    hasShelter: apiStop.has_shelter,
    isTerminal: apiStop.is_terminal
  };
}

export function toUiArrival(apiArrival, apiRoute) {
  return {
    id: apiArrival.id,
    routeId: apiRoute.id,
    routeNumber: apiRoute.route_number,
    destination: apiRoute.to,
    expectedMinutes: apiArrival.expected_minutes,
    status: apiArrival.status,
    delayMinutes: apiArrival.delay_minutes || 0
  };
}

export async function getStop(id) {
  const stop = await mockCall((store) => store.stops.find((s) => s.id === id));
  return toUiStop(stop);
}

export async function getArrivals(stopId) {
  const arrivalsWithRoutes = await mockCall((store) => {
    const arrivals = store.arrivals.filter((a) => a.stop_id === stopId);
    return arrivals.map((arrival) => {
      const route = store.routes.find((r) => r.id === arrival.route_id);
      return { arrival, route };
    });
  });

  return arrivalsWithRoutes.map(({ arrival, route }) => toUiArrival(arrival, route));
}

export async function searchStops(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const matchingStops = await mockCall((store) => {
    return store.stops.filter((stop) => {
      const nameMatch = stop.name.toLowerCase().includes(q);
      const nameKnMatch = stop.name_kn.toLowerCase().includes(q);
      const codeMatch = stop.stop_code.toLowerCase().includes(q);
      return nameMatch || nameKnMatch || codeMatch;
    });
  });

  return matchingStops.map(toUiStop);
}
