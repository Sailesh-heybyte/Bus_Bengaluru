import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ROUTES_CONFIG = [
  {
    id: 'route_01',
    name: '500D',
    stops: [
      { lat: 12.9172, lng: 77.6229 }, // Central Silk Board
      { lat: 12.9254, lng: 77.6713 }, // Sarjapura Ring Road Junction
      { lat: 12.9360, lng: 77.6934 }, // Kadubeesanahalli
      { lat: 12.9562, lng: 77.7011 }, // Marathahalli Bridge
      { lat: 12.9972, lng: 77.6806 }, // KR Puram Railway Station
      { lat: 13.0035, lng: 77.6644 }, // Tin Factory
      { lat: 13.0450, lng: 77.6204 }, // Manyata Tech Park
      { lat: 13.0358, lng: 77.5970 }  // Hebbal
    ]
  },
  {
    id: 'route_04',
    name: 'BNG-MYS-EXP',
    stops: [
      { lat: 12.9776, lng: 77.5713 }, // Kempegowda Bus Station (Majestic)
      { lat: 12.7208, lng: 77.2799 }, // Ramanagara
      { lat: 12.6517, lng: 77.2006 }, // Channapatna
      { lat: 12.5841, lng: 77.0454 }, // Maddur
      { lat: 12.5218, lng: 76.8951 }, // Mandya
      { lat: 12.4182, lng: 76.6947 }, // Srirangapatna
      { lat: 12.3086, lng: 76.6531 }  // Mysuru City Bus Stand
    ]
  },
  {
    id: 'route_02',
    name: '200D',
    stops: [
      { lat: 15.3647, lng: 75.1240 },
      { lat: 15.3520, lng: 75.1380 },
      { lat: 15.3440, lng: 75.1450 },
      { lat: 15.3780, lng: 75.1100 },
      { lat: 15.4180, lng: 75.0520 },
      { lat: 15.4589, lng: 74.9860 }
    ]
  },
  {
    id: 'route_03',
    name: 'KLB-3',
    stops: [
      { lat: 17.3297, lng: 76.8343 },
      { lat: 17.3360, lng: 76.8290 },
      { lat: 17.3320, lng: 76.8400 },
      { lat: 17.3190, lng: 76.8480 },
      { lat: 17.2970, lng: 76.8520 }
    ]
  },
  {
    id: 'route_05',
    name: 'MDY-BSL-1',
    stops: [
      { lat: 12.5218, lng: 76.8951 },
      { lat: 12.5850, lng: 76.9200 },
      { lat: 12.6320, lng: 76.9050 },
      { lat: 12.7100, lng: 76.8200 }
    ]
  }
];

async function fetchRouteRoad(route) {
  const coordString = route.stops.map(s => `${s.lng},${s.lat}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson`;

  console.log(`Fetching road geometry for ${route.name} (${route.id})...`);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${route.id}: ${res.statusText}`);
  }
  const data = await res.json();
  if (!data.routes || data.routes.length === 0) {
    throw new Error(`No route found for ${route.id}`);
  }

  // Raw coordinates [lng, lat]
  const rawCoords = data.routes[0].geometry.coordinates;
  const path = rawCoords.map(([lng, lat]) => ({
    lat: parseFloat(lat.toFixed(6)),
    lng: parseFloat(lng.toFixed(6))
  }));

  // Map each stop index to the closest point in the road path
  const stopIndexToRoadIndex = {};
  route.stops.forEach((stop, sIdx) => {
    let minDist = Infinity;
    let closestIdx = 0;
    path.forEach((pt, pIdx) => {
      const d = Math.hypot(pt.lat - stop.lat, pt.lng - stop.lng);
      if (d < minDist) {
        minDist = d;
        closestIdx = pIdx;
      }
    });
    stopIndexToRoadIndex[sIdx] = closestIdx;
  });

  return {
    path,
    stopIndexToRoadIndex,
    distanceMeters: data.routes[0].distance,
    durationSeconds: data.routes[0].duration
  };
}

async function main() {
  const result = {};
  for (const route of ROUTES_CONFIG) {
    try {
      const roadData = await fetchRouteRoad(route);
      result[route.id] = roadData;
      console.log(`✓ ${route.name}: ${roadData.path.length} road coordinates mapped.`);
    } catch (err) {
      console.error(`✗ Error fetching ${route.name}:`, err.message);
    }
  }

  const outDir = path.join(__dirname, '..', 'src', 'data');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outPath = path.join(outDir, 'realRoadGeometries.json');
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), 'utf-8');
  console.log(`\nSuccessfully saved all real road geometries to ${outPath}!`);
}

main();
