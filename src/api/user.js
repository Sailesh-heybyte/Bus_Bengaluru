import { mockCall } from './mockClient.js';
import { toUiRoute } from './routes.js';
import { toUiStop } from './stops.js';

export async function getSavedItems() {
  const result = await mockCall((store) => {
    const rawRoutes = (store.saved_routes || [])
      .map((id) => store.routes.find((r) => r.id === id))
      .filter(Boolean);

    const rawStops = (store.saved_stops || [])
      .map((id) => store.stops.find((s) => s.id === id))
      .filter(Boolean);

    return {
      routes: rawRoutes,
      stops: rawStops
    };
  });

  return {
    savedRoutes: result.routes.map(toUiRoute),
    savedStops: result.stops.map(toUiStop)
  };
}

export async function toggleSavedRoute(routeId) {
  return await mockCall((store) => {
    if (!store.saved_routes) {
      store.saved_routes = [];
    }

    const index = store.saved_routes.indexOf(routeId);
    if (index > -1) {
      store.saved_routes.splice(index, 1);
      return false;
    } else {
      store.saved_routes.push(routeId);
      return true;
    }
  });
}

export async function toggleSavedStop(stopId) {
  return await mockCall((store) => {
    if (!store.saved_stops) {
      store.saved_stops = [];
    }

    const index = store.saved_stops.indexOf(stopId);
    if (index > -1) {
      store.saved_stops.splice(index, 1);
      return false;
    } else {
      store.saved_stops.push(stopId);
      return true;
    }
  });
}

export async function checkSavedStatus(id, type) {
  return await mockCall((store) => {
    if (type === 'route' || type === 'routes') {
      return (store.saved_routes || []).includes(id);
    }
    if (type === 'stop' || type === 'stops') {
      return (store.saved_stops || []).includes(id);
    }
    return false;
  });
}

export default {
  getSavedItems,
  toggleSavedRoute,
  toggleSavedStop,
  checkSavedStatus
};
