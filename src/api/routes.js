import { mockCall } from './mockClient.js';
import { toUiStop } from './stops.js';

export function toUiRoute(apiRoute) {
  return {
    id: apiRoute.id,
    routeNumber: apiRoute.route_number,
    corporation: apiRoute.corporation,
    district: apiRoute.district,
    areaType: apiRoute.area_type,
    from: apiRoute.from,
    to: apiRoute.to,
    distanceKm: apiRoute.distance_km,
    stopCount: apiRoute.stop_count,
    headway: apiRoute.headway,
    baseFare: apiRoute.base_fare,
    maxFare: apiRoute.max_fare,
    stopIds: apiRoute.stop_ids
  };
}

export async function searchRoutes(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const matchingRoutes = await mockCall((store) => {
    return store.routes.filter((route) =>
      route.route_number.toLowerCase().includes(q)
    );
  });

  return matchingRoutes.map(toUiRoute);
}

export async function searchPlaceToPlace(fromQuery, toQuery) {
  const qFrom = fromQuery.trim().toLowerCase();
  const qTo = toQuery.trim().toLowerCase();

  if (!qFrom && !qTo) return [];

  const matchingRoutes = await mockCall((store) => {
    return store.routes.filter((route) => {
      const routeFrom = route.from.toLowerCase();
      const routeTo = route.to.toLowerCase();

      const direct =
        (qFrom ? routeFrom.includes(qFrom) : true) &&
        (qTo ? routeTo.includes(qTo) : true);

      const reverse =
        (qFrom ? routeTo.includes(qFrom) : true) &&
        (qTo ? routeFrom.includes(qTo) : true);

      return direct || reverse;
    });
  });

  return matchingRoutes.map(toUiRoute);
}

export async function getRouteDetail(id) {
  const result = await mockCall((store) => {
    const route = store.routes.find((r) => r.id === id);
    if (!route) return null;

    const stops = route.stop_ids.map((stopId) =>
      store.stops.find((s) => s.id === stopId)
    );

    const timetable = store.timetables.find((t) => t.route_id === id);
    const departures = timetable ? timetable.departures : [];

    return {
      route,
      stops,
      departures
    };
  });

  if (!result) return null;

  const uiRoute = toUiRoute(result.route);
  const uiStops = result.stops.map(toUiStop);
  const departures = result.departures;
  const lastBus = departures.length > 0 ? departures[departures.length - 1] : '';

  return {
    route: uiRoute,
    stops: uiStops,
    departures,
    lastBus
  };
}

export default {
  toUiRoute,
  searchRoutes,
  searchPlaceToPlace,
  getRouteDetail
};
