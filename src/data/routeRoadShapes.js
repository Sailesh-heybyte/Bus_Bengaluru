// High-precision road geometries for all transit routes
// Each route contains turn-by-turn road waypoints along the actual highways and streets.

export const ROUTE_ROAD_WAYPOINTS = {
  // Route 1: 500D (BMTC Outer Ring Road - Silk Board to Hebbal)
  route_01: [
    { lat: 12.9172, lng: 77.6229, stopIndex: 0, name: "Central Silk Board" },
    { lat: 12.9185, lng: 77.6310 },
    { lat: 12.9205, lng: 77.6405 },
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
  ],

  // Route 4: BNG-MYS-EXP (KSRTC Karnataka Sarige - Bengaluru to Mysuru via NH 275 Expressway)
  route_04: [
    { lat: 12.9776, lng: 77.5713, stopIndex: 0, name: "Kempegowda Bus Station (Majestic)" },
    { lat: 12.9660, lng: 77.5620 },
    { lat: 12.9550, lng: 77.5450 },
    { lat: 12.9460, lng: 77.5250 },
    { lat: 12.9350, lng: 77.5100 },
    { lat: 12.9150, lng: 77.4900 },
    { lat: 12.8900, lng: 77.4650 },
    { lat: 12.8550, lng: 77.4280 },
    { lat: 12.8050, lng: 77.3850 },
    { lat: 12.7600, lng: 77.3350 },
    { lat: 12.7208, lng: 77.2799, stopIndex: 1, name: "Ramanagara" },
    { lat: 12.6950, lng: 77.2500 },
    { lat: 12.6700, lng: 77.2250 },
    { lat: 12.6517, lng: 77.2006, stopIndex: 2, name: "Channapatna" },
    { lat: 12.6280, lng: 77.1450 },
    { lat: 12.6050, lng: 77.0950 },
    { lat: 12.5841, lng: 77.0454, stopIndex: 3, name: "Maddur" },
    { lat: 12.5650, lng: 76.9950 },
    { lat: 12.5450, lng: 76.9450 },
    { lat: 12.5218, lng: 76.8951, stopIndex: 4, name: "Mandya" },
    { lat: 12.4900, lng: 76.8350 },
    { lat: 12.4550, lng: 76.7700 },
    { lat: 12.4182, lng: 76.6947, stopIndex: 5, name: "Srirangapatna" },
    { lat: 12.3850, lng: 76.6800 },
    { lat: 12.3450, lng: 76.6680 },
    { lat: 12.3250, lng: 76.6600 },
    { lat: 12.3086, lng: 76.6531, stopIndex: 6, name: "Mysuru City Bus Stand" }
  ],

  // Route 2: 200D (Hubballi - Dharwad BRTS Corridor)
  route_02: [
    { lat: 15.3647, lng: 75.1240, stopIndex: 0, name: "Hubballi Old Bus Station" },
    { lat: 15.3580, lng: 75.1320 },
    { lat: 15.3520, lng: 75.1380, stopIndex: 1, name: "Hubballi City Bus Station (CBT)" },
    { lat: 15.3480, lng: 75.1420 },
    { lat: 15.3440, lng: 75.1450, stopIndex: 2, name: "SSS Hubballi Junction Railway Station" },
    { lat: 15.3580, lng: 75.1300 },
    { lat: 15.3780, lng: 75.1100, stopIndex: 3, name: "Unkal Cross" },
    { lat: 15.3950, lng: 75.0850 },
    { lat: 15.4180, lng: 75.0520, stopIndex: 4, name: "SDM Medical College" },
    { lat: 15.4400, lng: 75.0200 },
    { lat: 15.4589, lng: 74.9860, stopIndex: 5, name: "Dharwad BRTS Terminal" }
  ],

  // Route 3: KLB-3 (Kalaburagi Central Bus Stand to Gulbarga University)
  route_03: [
    { lat: 17.3297, lng: 76.8343, stopIndex: 0, name: "Kalaburagi Central Bus Stand" },
    { lat: 17.3340, lng: 76.8310 },
    { lat: 17.3360, lng: 76.8290, stopIndex: 1, name: "Kalaburagi Railway Station" },
    { lat: 17.3345, lng: 76.8350 },
    { lat: 17.3320, lng: 76.8400, stopIndex: 2, name: "Jagat Circle" },
    { lat: 17.3250, lng: 76.8450 },
    { lat: 17.3190, lng: 76.8480, stopIndex: 3, name: "Sedam Road Cross" },
    { lat: 17.3080, lng: 76.8500 },
    { lat: 17.2970, lng: 76.8520, stopIndex: 4, name: "Gulbarga University" }
  ],

  // Route 5: MDY-BSL-1 (Mandya Bus Stand to Basaralu)
  route_05: [
    { lat: 12.5218, lng: 76.8951, stopIndex: 0, name: "Mandya Bus Stand" },
    { lat: 12.5520, lng: 76.9100 },
    { lat: 12.5850, lng: 76.9200, stopIndex: 1, name: "Keragodu" },
    { lat: 12.6100, lng: 76.9120 },
    { lat: 12.6320, lng: 76.9050, stopIndex: 2, name: "Chikkabasur Cross" },
    { lat: 12.6700, lng: 76.8650 },
    { lat: 12.7100, lng: 76.8200, stopIndex: 3, name: "Basaralu" }
  ]
};

// Generate high-density road path (interpolating smoothly between curve waypoints)
export function getRouteRoadPath(routeId, stops = [], stepsBetween = 8) {
  const waypoints = ROUTE_ROAD_WAYPOINTS[routeId];

  // If we have explicit road waypoints for this route, build high-density path
  if (waypoints && waypoints.length > 0) {
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

  // Fallback: If no explicit road waypoints, build path connecting valid stops with dense road segments
  const validStops = (stops || []).filter(
    (s) => typeof s.latitude === 'number' && typeof s.longitude === 'number'
  );

  const densePath = [];
  const stopIndexToRoadIndex = {};

  for (let i = 0; i < validStops.length; i++) {
    const current = validStops[i];
    const currentIndex = densePath.length;
    stopIndexToRoadIndex[i] = currentIndex;
    densePath.push({ lat: current.latitude, lng: current.longitude });

    if (i < validStops.length - 1) {
      const next = validStops[i + 1];
      for (let s = 1; s < stepsBetween; s++) {
        const fraction = s / stepsBetween;
        densePath.push({
          lat: current.latitude + (next.latitude - current.latitude) * fraction,
          lng: current.longitude + (next.longitude - current.longitude) * fraction
        });
      }
    }
  }

  return { densePath, stopIndexToRoadIndex };
}
