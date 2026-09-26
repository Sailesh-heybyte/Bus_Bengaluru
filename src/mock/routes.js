export const routes = [
  {
    id: "route_01",
    route_number: "500D",
    corporation: "BMTC",
    district: "Bengaluru Urban",
    area_type: "city",
    from: "Central Silk Board",
    to: "Hebbal",
    distance_km: 30.2,
    stop_count: 8,
    headway: "every 10 minutes, 6am to 11pm",
    stop_ids: [
      "stop_01",
      "stop_02",
      "stop_03",
      "stop_04",
      "stop_05",
      "stop_06",
      "stop_07",
      "stop_08"
    ],
    base_fare: 5,
    max_fare: 35
  },
  {
    id: "route_02",
    route_number: "200D",
    corporation: "NWKRTC",
    district: "Dharwad",
    area_type: "city",
    from: "Hubballi Old Bus Station",
    to: "Dharwad BRTS Terminal",
    distance_km: 22.5,
    stop_count: 6,
    headway: "every 4 minutes peak, every 15 to 25 off-peak",
    service: "Chigari, all-stops",
    stop_ids: [
      "stop_09",
      "stop_10",
      "stop_11",
      "stop_12",
      "stop_13",
      "stop_14"
    ],
    base_fare: 10,
    max_fare: 25
  },
  {
    id: "route_03",
    route_number: "KLB-3",
    corporation: "KKRTC",
    district: "Kalaburagi",
    area_type: "city",
    from: "Kalaburagi Central Bus Stand",
    to: "Gulbarga University",
    distance_km: 9,
    stop_count: 5,
    headway: "every 20 minutes, 6am to 9pm",
    stop_ids: [
      "stop_15",
      "stop_16",
      "stop_17",
      "stop_18",
      "stop_19"
    ],
    base_fare: 7,
    max_fare: 20
  },
  {
    id: "route_04",
    route_number: "BNG-MYS-EXP",
    corporation: "KSRTC",
    district: "multiple: Bengaluru Urban, Ramanagara, Mandya, Mysuru",
    area_type: "intercity",
    from: "Kempegowda Bus Station, Bengaluru",
    to: "Mysuru City Bus Stand",
    distance_km: 145,
    stop_count: 7,
    service: "Karnataka Sarige",
    headway: "every 30 minutes",
    stop_ids: [
      "stop_20",
      "stop_21",
      "stop_22",
      "stop_23",
      "stop_24",
      "stop_25",
      "stop_26"
    ],
    base_fare: 120,
    max_fare: 160
  },
  {
    id: "route_05",
    route_number: "MDY-BSL-1",
    corporation: "KSRTC",
    district: "Mandya",
    area_type: "village",
    from: "Mandya Bus Stand",
    to: "Basaralu",
    distance_km: 24,
    stop_count: 4,
    trips_per_day: 3,
    stop_ids: [
      "stop_27",
      "stop_28",
      "stop_29",
      "stop_30"
    ],
    base_fare: 15,
    max_fare: 35
  }
];

export default routes;
