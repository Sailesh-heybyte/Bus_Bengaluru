import { mockCall } from './mockClient.js';
import { toUiStop } from './stops.js';

export function toUiUser(apiUser) {
  return {
    id: apiUser.id,
    name: apiUser.name,
    nameKn: apiUser.name_kn,
    phone: apiUser.phone,
    homeStopId: apiUser.home_stop_id,
    preferredLanguage: apiUser.preferred_language,
    isShaktiBeneficiary: apiUser.is_shakti_beneficiary,
    isStudent: apiUser.is_student
  };
}

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
    headway: apiRoute.headway
  };
}

export function toUiNotice(apiNotice) {
  return {
    id: apiNotice.id,
    type: apiNotice.type,
    routeId: apiNotice.route_id,
    message: apiNotice.message,
    messageKn: apiNotice.message_kn,
    createdAt: apiNotice.created_at,
    expiresAt: apiNotice.expires_at
  };
}

export async function getHomeData() {
  const data = await mockCall((store) => {
    const user = store.user;
    const savedRoutes = store.saved_routes.map((routeId) =>
      store.routes.find((r) => r.id === routeId)
    );
    const nearbyStops = store.stops.slice(0, 3);
    const notices = store.notices;

    return {
      user,
      savedRoutes,
      nearbyStops,
      notices
    };
  });

  return {
    user: toUiUser(data.user),
    savedRoutes: data.savedRoutes.map(toUiRoute),
    nearbyStops: data.nearbyStops.map(toUiStop),
    notices: data.notices.map(toUiNotice)
  };
}

export default {
  toUiUser,
  toUiRoute,
  toUiNotice,
  getHomeData
};
