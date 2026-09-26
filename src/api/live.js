import { mockCall } from './mockClient.js';
import { toUiRoute } from './routes.js';

export function toUiBus(apiBus) {
  return {
    id: apiBus.id,
    registrationNumber: apiBus.registration_number,
    corporation: apiBus.corporation,
    busType: apiBus.bus_type,
    routeId: apiBus.route_id,
    capacity: apiBus.capacity,
    hasGps: apiBus.has_gps,
    isAccessible: apiBus.is_accessible,
    currentStatus: apiBus.current_status,
    currentStopIndex:
      typeof apiBus.current_stop_index === 'number'
        ? apiBus.current_stop_index
        : undefined,
    progress:
      typeof apiBus.progress === 'number' ? apiBus.progress : undefined,
    progressPercentage:
      typeof apiBus.progress_percentage === 'number'
        ? apiBus.progress_percentage
        : undefined
  };
}

export async function getLiveBuses() {
  const rawBuses = await mockCall((store) => store.buses);
  return rawBuses.map(toUiBus);
}

export async function getLiveRoutes() {
  const rawRoutes = await mockCall((store) => store.routes);
  return rawRoutes.map(toUiRoute);
}

export default {
  toUiBus,
  getLiveBuses,
  getLiveRoutes
};
