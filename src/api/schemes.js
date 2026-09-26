import { mockCall } from './mockClient.js';

export function toUiShaktiRecord(record) {
  if (!record) return null;
  return {
    id: record.id,
    beneficiaryName: record.beneficiary_name,
    beneficiaryId: record.beneficiary_id,
    issuedOn: record.issued_on,
    validUntil: record.valid_until,
    expiresIn: record.expires_in,
    renewalType: record.renewal_type,
    validIn: record.valid_in,
    corporations: record.corporations || ["BMTC", "KSRTC", "NWKRTC", "KKRTC"],
    allowedServices: record.allowed_services,
    excludedServices: record.excluded_services,
    tripsThisMonth: record.trips_this_month,
    fareValueThisMonth: record.fare_value_this_month
  };
}

export function toUiStudentPass(pass) {
  if (!pass) return null;
  return {
    id: pass.id,
    studentName: pass.student_name,
    institution: pass.institution,
    classOrCourse: pass.class_or_course,
    passNumber: pass.pass_number,
    corporation: pass.corporation,
    corporations: pass.corporations || ["BMTC"],
    routeId: pass.route_id,
    routeName: pass.route_name,
    allowedServices: pass.allowed_services,
    validFrom: pass.valid_from,
    validTo: pass.valid_to,
    expiresIn: pass.expires_in,
    status: pass.status,
    issuedDigitally: pass.issued_digitally
  };
}

export async function getSchemes() {
  return await mockCall((store) => {
    const shaktiRecord = toUiShaktiRecord(store.shakti_record);
    const studentPass = toUiStudentPass(store.student_pass);
    return {
      shaktiRecord,
      studentPass
    };
  });
}

export default {
  toUiShaktiRecord,
  toUiStudentPass,
  getSchemes
};
