export const tickets = [
  {
    id: "tic_01",
    ticket_number: "TKT-1001",
    route_id: "route_01",
    from_stop_id: "stop_01",
    to_stop_id: "stop_08",
    fare_amount: 35,
    payment_method: "upi",
    ticket_type: "single",
    status: "active",
    issued_at: "2026-09-25T16:00:00Z",
    valid_until: "2026-09-25T18:00:00Z",
    qr_payload: "demo-qr-123"
  },
  {
    id: "tic_02",
    ticket_number: "TKT-1002",
    route_id: "route_04",
    from_stop_id: "stop_20",
    to_stop_id: "stop_26",
    fare_amount: 140,
    payment_method: "ncmc",
    ticket_type: "single",
    status: "used",
    issued_at: "2026-09-24T09:30:00Z",
    valid_until: "2026-09-24T12:30:00Z",
    qr_payload: "demo-qr-1002"
  },
  {
    id: "tic_03",
    ticket_number: "TKT-1003",
    route_id: "route_02",
    from_stop_id: "stop_09",
    to_stop_id: "stop_14",
    fare_amount: 25,
    payment_method: "upi",
    ticket_type: "single",
    status: "used",
    issued_at: "2026-09-23T14:15:00Z",
    valid_until: "2026-09-23T16:15:00Z",
    qr_payload: "demo-qr-1003"
  },
  {
    id: "tic_04",
    ticket_number: "TKT-1004",
    route_id: "route_01",
    from_stop_id: "stop_01",
    to_stop_id: "stop_04",
    fare_amount: 20,
    payment_method: "ncmc",
    ticket_type: "single",
    status: "used",
    issued_at: "2026-09-22T17:45:00Z",
    valid_until: "2026-09-22T19:45:00Z",
    qr_payload: "demo-qr-1004"
  }
];

export default tickets;
