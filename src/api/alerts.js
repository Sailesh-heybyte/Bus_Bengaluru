import { mockCall } from './mockClient.js';

export function toUiAlert(apiAlert, routes = []) {
  if (!apiAlert) return null;

  const route = routes.find((r) => r.id === apiAlert.route_id);

  return {
    id: apiAlert.id,
    type: apiAlert.type,
    routeId: apiAlert.route_id,
    routeNumber: route
      ? route.route_number
      : (apiAlert.route_id === 'route_01'
        ? '500D'
        : apiAlert.route_id === 'route_04'
        ? 'BNG-MYS-EXP'
        : apiAlert.route_id),
    message: apiAlert.message,
    messageKn: apiAlert.message_kn,
    createdAt: apiAlert.created_at,
    expiresAt: apiAlert.expires_at
  };
}

export async function getAlerts() {
  return await mockCall((store) => {
    const routes = store.routes || [];
    return (store.alerts || []).map((alert) => toUiAlert(alert, routes));
  });
}

export async function createStopAlert({ stopId, routeId, minutes }) {
  return await mockCall((store) => {
    if (!store.stop_alerts) {
      store.stop_alerts = [];
    }

    const newRecord = {
      id: `sa_${Date.now()}`,
      stop_id: stopId,
      route_id: routeId,
      minutes: Number(minutes) || 5,
      created_at: new Date().toISOString()
    };

    store.stop_alerts.push(newRecord);
    return true;
  });
}

export default {
  toUiAlert,
  getAlerts,
  createStopAlert
};
