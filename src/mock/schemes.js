export const shakti_record = {
  id: "shk_01",
  beneficiary_name: "Lakshmi",
  beneficiary_id: "SHK-KA-000001",
  issued_on: "2024-01-15T00:00:00Z",
  valid_until: "2026-12-31T23:59:59Z",
  expires_in: "Expires in 15 months (Dec 31, 2026)",
  renewal_type: "Lifetime Free Annual Renewal",
  valid_in: "All 4 Corporations",
  corporations: ["BMTC", "KSRTC", "NWKRTC", "KKRTC"],
  allowed_services: "Ordinary & Express City / Suburban / Rural (Non-AC)",
  excluded_services: "AC & Premium Volvo / Vayu Vajra",
  trips_this_month: 12,
  fare_value_this_month: 240
};

export const student_pass = {
  id: "stu_01",
  student_name: "Rahul",
  institution: "Govt Science College",
  class_or_course: "BSc 2nd Year",
  pass_number: "STU-KA-000001",
  corporation: "BMTC",
  corporations: ["BMTC"],
  route_id: "route_01",
  route_name: "Corridor 500D (Central Silk Board ⟷ Hebbal)",
  allowed_services: "Ordinary & City Buses (All BMTC Routes)",
  valid_from: "2025-06-01T00:00:00Z",
  valid_to: "2026-05-31T23:59:59Z",
  expires_in: "Expires in 8 months (May 31, 2026)",
  status: "active",
  issued_digitally: true
};

export default {
  shakti_record,
  student_pass
};
