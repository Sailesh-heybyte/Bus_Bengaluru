export const planned_trips = [
  {
    id: "pt_01",
    from_query: "Majestic",
    to_query: "Hebbal",
    total_duration_mins: 75,
    total_fare: 40,
    legs: [
      {
        type: "ride",
        route_number: "K-1",
        from: "Majestic",
        to: "Central Silk Board",
        duration_mins: 35
      },
      {
        type: "interchange",
        location: "Central Silk Board",
        wait_mins: 10
      },
      {
        type: "ride",
        route_number: "500D",
        from: "Central Silk Board",
        to: "Hebbal",
        duration_mins: 30
      }
    ]
  }
];

export default planned_trips;
