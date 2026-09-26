import { mockCall } from './mockClient.js';

export function toUiDepot(d) {
  if (!d) return null;
  return {
    id: d.id,
    name: d.name,
    corporation: d.corporation,
    district: d.district,
    breakdownsToday: typeof d.breakdowns_today === 'number' ? d.breakdowns_today : 0
  };
}

export async function getDepotInfo() {
  return await mockCall((store) => {
    return toUiDepot(store.depot);
  });
}

export async function getSosQueue() {
  return await mockCall((store) => {
    const rawEvents = store.sos_events || [];
    const buses = store.buses || [];
    const routes = store.routes || [];

    return rawEvents.map((evt) => {
      const bus = buses.find((b) => b.id === evt.bus_id);
      const route = routes.find((r) => r.id === evt.route_id);

      return {
        id: evt.id,
        busId: evt.bus_id,
        busRegistration: bus ? bus.registration_number : evt.bus_id,
        routeId: evt.route_id,
        routeNumber: route ? route.route_number : evt.route_id,
        stopId: evt.stop_id,
        raisedAt: evt.raised_at,
        status: evt.status,
        passengerName: evt.passenger_name,
        location: evt.location
      };
    });
  });
}

export async function resolveSosEvent(id) {
  return await mockCall((store) => {
    const events = store.sos_events || [];
    const target = events.find((e) => e.id === id);
    if (target) {
      target.status = 'resolved';
      return true;
    }
    return false;
  });
}

export async function getDepotComplaints() {
  return await mockCall((store) => {
    const rawComplaints = store.complaints || [];
    const routes = store.routes || [];

    return rawComplaints.map((c) => {
      const route = routes.find((r) => r.id === c.route_id);
      return {
        id: c.id,
        complaintNumber: c.complaint_number,
        category: c.category,
        description: c.description,
        busRegistration: c.bus_registration || '-',
        routeId: c.route_id,
        routeNumber: route ? route.route_number : (c.route_id || '-'),
        status: c.status,
        resolutionNote: c.resolution_note,
        raisedAt: c.raised_at
      };
    });
  });
}

export async function getDepotTimetables() {
  return await mockCall((store) => {
    const rawTt = store.timetables || [];
    const routes = store.routes || [];

    return rawTt.map((tt) => {
      const route = routes.find((r) => r.id === tt.route_id);
      return {
        id: tt.id,
        routeId: tt.route_id,
        routeNumber: route ? route.route_number : tt.route_id,
        from: route ? route.from : '',
        to: route ? route.to : '',
        corporation: route ? route.corporation : '',
        direction: tt.direction,
        departures: [...(tt.departures || [])]
      };
    });
  });
}

export default {
  toUiDepot,
  getDepotInfo,
  getSosQueue,
  resolveSosEvent,
  getDepotComplaints,
  getDepotTimetables
};
