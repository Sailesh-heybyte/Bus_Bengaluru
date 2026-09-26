import { mockCall } from './mockClient.js';

export function toUiLeg(apiLeg) {
  if (!apiLeg) return null;

  if (apiLeg.type === 'interchange') {
    return {
      type: apiLeg.type,
      location: apiLeg.location,
      waitMins: apiLeg.wait_mins
    };
  }

  return {
    type: apiLeg.type,
    routeNumber: apiLeg.route_number,
    from: apiLeg.from,
    to: apiLeg.to,
    durationMins: apiLeg.duration_mins
  };
}

export function toUiPlan(apiPlan) {
  if (!apiPlan) return null;

  return {
    id: apiPlan.id,
    fromQuery: apiPlan.from_query,
    toQuery: apiPlan.to_query,
    totalDurationMins: apiPlan.total_duration_mins,
    totalFare: apiPlan.total_fare,
    legs: (apiPlan.legs || []).map(toUiLeg)
  };
}

export async function getTripPlan(from, to) {
  const plan = await mockCall((store) => {
    return store.planned_trips && store.planned_trips.length > 0
      ? store.planned_trips[0]
      : null;
  });

  return toUiPlan(plan);
}

export default {
  toUiLeg,
  toUiPlan,
  getTripPlan
};
