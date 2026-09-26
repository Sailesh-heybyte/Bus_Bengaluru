import { mockCall } from './mockClient.js';

export function toUiTicket(t, routes = [], stops = []) {
  if (!t) return null;
  const route = routes.find((r) => r.id === t.route_id);
  const fromStop = stops.find((s) => s.id === t.from_stop_id);
  const toStop = stops.find((s) => s.id === t.to_stop_id);

  return {
    id: t.id,
    ticketNumber: t.ticket_number,
    routeId: t.route_id,
    routeNumber: route ? route.route_number : t.route_id,
    fromStopId: t.from_stop_id,
    fromStopName: fromStop ? fromStop.name : t.from_stop_id,
    toStopId: t.to_stop_id,
    toStopName: toStop ? toStop.name : t.to_stop_id,
    fareAmount: t.fare_amount,
    paymentMethod: t.payment_method,
    ticketType: t.ticket_type,
    status: t.status,
    issuedAt: t.issued_at,
    validUntil: t.valid_until,
    qrPayload: t.qr_payload
  };
}

export function toUiPass(p) {
  if (!p) return null;
  return {
    id: p.id,
    passNumber: p.pass_number,
    passType: p.pass_type,
    corporation: p.corporation,
    zoneOrRoute: p.zone_or_route,
    validFrom: p.valid_from,
    validTo: p.valid_to,
    status: p.status,
    fareSavedTotal: p.fare_saved_total
  };
}

export async function getTicketsAndPasses() {
  return await mockCall((store) => {
    const rawTickets = store.tickets || [];
    const rawPasses = store.passes || [];
    const routes = store.routes || [];
    const stops = store.stops || [];

    const tickets = rawTickets.map((t) => toUiTicket(t, routes, stops));
    const passes = rawPasses.map((p) => toUiPass(p));

    return { tickets, passes };
  });
}

export default {
  toUiTicket,
  toUiPass,
  getTicketsAndPasses
};
