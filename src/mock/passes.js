export const passes = [
  {
    id: "pass_01",
    pass_number: "PASS-1001",
    pass_type: "monthly_pass",
    corporation: "BMTC",
    zone_or_route: "Bengaluru City",
    valid_from: "2026-09-01T00:00:00Z",
    valid_to: "2026-09-30T23:59:59Z",
    status: "active",
    fare_saved_total: 450
  },
  {
    id: "pass_02",
    pass_number: "PASS-1002",
    pass_type: "weekly_pass",
    corporation: "NWKRTC",
    zone_or_route: "Hubballi-Dharwad",
    valid_from: "2026-09-19T00:00:00Z",
    valid_to: "2026-09-26T23:59:59Z",
    status: "expiring_soon",
    fare_saved_total: 120
  }
];

export default passes;
