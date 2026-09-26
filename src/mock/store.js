import { routes } from './routes.js';
import { stops } from './stops.js';
import { buses } from './buses.js';
import { arrivals } from './arrivals.js';
import { user, saved_routes, saved_stops } from './user.js';
import { notices } from './notices.js';
import { timetables } from './timetables.js';
import { planned_trips } from './trips.js';
import { alerts, stop_alerts } from './alerts.js';
import { tickets } from './tickets.js';
import { passes } from './passes.js';
import { shakti_record, student_pass } from './schemes.js';
import { complaints } from './complaints.js';
import { lost_found } from './lostFound.js';
import { depot } from './depot.js';
import { sos_events } from './sos.js';

export const store = {
  routes: [...routes],
  stops: [...stops],
  buses: [...buses],
  arrivals: [...arrivals],
  user: { ...user },
  saved_routes: [...saved_routes],
  saved_stops: [...saved_stops],
  notices: [...notices],
  timetables: [...timetables],
  planned_trips: [...planned_trips],
  alerts: [...alerts],
  stop_alerts: [...stop_alerts],
  tickets: [...tickets],
  passes: [...passes],
  shakti_record: { ...shakti_record },
  student_pass: { ...student_pass },
  complaints: [...complaints],
  lost_found: [...lost_found],
  depot: { ...depot },
  sos_events: [...sos_events]
};

export default store;
