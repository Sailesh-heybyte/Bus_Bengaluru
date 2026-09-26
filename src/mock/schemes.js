export const shakti_record = {
  id: "shk_01",
  beneficiary_name: "Lakshmi",
  beneficiary_id: "SHK-KA-000001",
  issued_on: "2024-01-15T00:00:00Z",
  valid_in: "All 4 Corporations",
  excluded_services: "AC and premium services",
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
  route_id: "route_01",
  valid_from: "2025-06-01T00:00:00Z",
  valid_to: "2026-05-31T23:59:59Z",
  status: "active",
  issued_digitally: true
};

export default {
  shakti_record,
  student_pass
};
