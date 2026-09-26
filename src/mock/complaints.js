export const complaints = [
  {
    id: "cmp_01",
    complaint_number: "CMP-2026-0001",
    category: "rash_driving",
    description: "Bus did not slow down at the stop.",
    bus_registration: "KA-01 F 9011",
    route_id: "route_01",
    status: "submitted",
    raised_at: "2026-09-24T10:00:00Z"
  },
  {
    id: "cmp_02",
    complaint_number: "CMP-2026-0002",
    category: "overcharging",
    description: "Charged 5 rupees extra.",
    status: "in_review",
    raised_at: "2026-09-23T14:30:00Z"
  },
  {
    id: "cmp_03",
    complaint_number: "CMP-2026-0003",
    category: "crew_behaviour",
    description: "Rude behaviour.",
    status: "resolved",
    resolution_note: "Crew warned.",
    raised_at: "2026-09-20T09:15:00Z"
  },
  {
    id: "cmp_04",
    complaint_number: "CMP-2026-0004",
    category: "cleanliness",
    description: "Dirty seats.",
    status: "closed",
    raised_at: "2026-09-10T11:00:00Z"
  }
];

export default complaints;
