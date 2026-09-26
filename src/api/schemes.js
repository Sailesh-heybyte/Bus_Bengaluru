import { mockCall } from './mockClient.js';

export function toUiShaktiRecord(record) {
  if (!record) return null;
  return {
    id: record.id,
    beneficiaryName: record.beneficiary_name,
    beneficiaryId: record.beneficiary_id,
    issuedOn: record.issued_on,
    validIn: record.valid_in,
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
    routeId: pass.route_id,
    validFrom: pass.valid_from,
    validTo: pass.valid_to,
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
