// High-density road coordinates along Bengaluru Outer Ring Road (NH 44 / ORR)
// from Central Silk Board to Hebbal via Marathahalli, KR Puram, Tin Factory, and Manyata
export const ROUTE_500D_ROAD_WAYPOINTS = [
  { lat: 12.9172, lng: 77.6229, stopIndex: 0, name: "Central Silk Board" },
  { lat: 12.9190, lng: 77.6340 },
  { lat: 12.9215, lng: 77.6430 },
  { lat: 12.9238, lng: 77.6515 },
  { lat: 12.9248, lng: 77.6610 },
  { lat: 12.9254, lng: 77.6713, stopIndex: 1, name: "Sarjapura Ring Road Junction" },
  { lat: 12.9268, lng: 77.6830 },
  { lat: 12.9310, lng: 77.6885 },
  { lat: 12.9360, lng: 77.6934, stopIndex: 2, name: "Kadubeesanahalli" },
  { lat: 12.9430, lng: 77.6970 },
  { lat: 12.9490, lng: 77.6995 },
  { lat: 12.9562, lng: 77.7011, stopIndex: 3, name: "Marathahalli Bridge" },
  { lat: 12.9660, lng: 77.6990 },
  { lat: 12.9750, lng: 77.6970 },
  { lat: 12.9840, lng: 77.6930 },
  { lat: 12.9910, lng: 77.6875 },
  { lat: 12.9972, lng: 77.6806, stopIndex: 4, name: "KR Puram Railway Station" },
  { lat: 13.0010, lng: 77.6730 },
  { lat: 13.0035, lng: 77.6644, stopIndex: 5, name: "Tin Factory" },
  { lat: 13.0075, lng: 77.6580 },
  { lat: 13.0110, lng: 77.6530 },
  { lat: 13.0180, lng: 77.6470 },
  { lat: 13.0245, lng: 77.6410 },
  { lat: 13.0290, lng: 77.6360 },
  { lat: 13.0360, lng: 77.6290 },
  { lat: 13.0425, lng: 77.6240 },
  { lat: 13.0450, lng: 77.6204, stopIndex: 6, name: "Manyata Tech Park" },
  { lat: 13.0435, lng: 77.6150 },
  { lat: 13.0420, lng: 77.6100 },
  { lat: 13.0395, lng: 77.6040 },
  { lat: 13.0375, lng: 77.6000 },
  { lat: 13.0358, lng: 77.5970, stopIndex: 7, name: "Hebbal" }
];

// Helper to generate a densely interpolated path (every ~50 meters) along waypoints
export function generateDenseRoadPath(waypoints = ROUTE_500D_ROAD_WAYPOINTS, stepsBetween = 6) {
  const densePath = [];
  const stopIndexToRoadIndex = {};

  for (let i = 0; i < waypoints.length; i++) {
    const current = waypoints[i];
    const currentIndex = densePath.length;

    if (typeof current.stopIndex === 'number') {
      stopIndexToRoadIndex[current.stopIndex] = currentIndex;
    }

    densePath.push({ lat: current.lat, lng: current.lng });

    if (i < waypoints.length - 1) {
      const next = waypoints[i + 1];
      for (let s = 1; s < stepsBetween; s++) {
        const fraction = s / stepsBetween;
        densePath.push({
          lat: current.lat + (next.lat - current.lat) * fraction,
          lng: current.lng + (next.lng - current.lng) * fraction
        });
      }
    }
  }

  return { densePath, stopIndexToRoadIndex };
}
