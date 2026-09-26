import realRoadData from '../data/realRoadGeometries.json';

/**
 * Returns the exact 100% real asphalt road geometry (turn-by-turn coordinates)
 * for a given route.
 */
export function getExactRoadGeometry(routeId, stops = []) {
  if (realRoadData && realRoadData[routeId]) {
    return {
      densePath: realRoadData[routeId].path,
      stopIndexToRoadIndex: realRoadData[routeId].stopIndexToRoadIndex,
    };
  }

  // Fallback for any unknown route: connect stops directly
  const validStops = (stops || []).filter(
    (s) => typeof s.latitude === 'number' && typeof s.longitude === 'number'
  );

  return {
    densePath: validStops.map((s) => ({ lat: s.latitude, lng: s.longitude })),
    stopIndexToRoadIndex: Object.fromEntries(validStops.map((_, i) => [i, i])),
  };
}

export default getExactRoadGeometry;
