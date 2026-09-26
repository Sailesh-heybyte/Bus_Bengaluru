import { mockCall } from './mockClient.js';

export function toUiComplaint(c) {
  if (!c) return null;
  return {
    id: c.id,
    complaintNumber: c.complaint_number,
    category: c.category,
    description: c.description,
    busRegistration: c.bus_registration,
    routeId: c.route_id,
    status: c.status,
    resolutionNote: c.resolution_note,
    raisedAt: c.raised_at
  };
}

export function toUiLostFound(item) {
  if (!item) return null;
  return {
    id: item.id,
    itemDescription: item.item_description,
    busRegistration: item.bus_registration,
    routeId: item.route_id,
    lostOn: item.lost_on,
    depot: item.depot,
    status: item.status,
    contactDepotPhone: item.contact_depot_phone
  };
}

export async function getSupportData() {
  return await mockCall((store) => {
    const rawComplaints = store.complaints || [];
    const rawLostFound = store.lost_found || [];

    const complaints = rawComplaints.map(toUiComplaint);
    const lostFound = rawLostFound.map(toUiLostFound);

    return {
      complaints,
      lostFound
    };
  });
}

export async function raiseComplaint({ category, description }) {
  return await mockCall((store) => {
    if (!store.complaints) {
      store.complaints = [];
    }

    const currentYear = new Date().getFullYear();
    const nextSeq = String(store.complaints.length + 1).padStart(4, '0');
    const complaintNumber = `CMP-${currentYear}-${nextSeq}`;

    const newRecord = {
      id: `cmp_${Date.now()}`,
      complaint_number: complaintNumber,
      category: category || 'other',
      description: description || '',
      status: 'submitted',
      raised_at: new Date().toISOString()
    };

    // Add to top of list for immediate visibility
    store.complaints.unshift(newRecord);
    return true;
  });
}

export default {
  toUiComplaint,
  toUiLostFound,
  getSupportData,
  raiseComplaint
};
