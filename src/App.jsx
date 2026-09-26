import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { SimulationProvider } from './context/SimulationContext';
import Splash from './screens/Splash';
import Onboarding from './screens/Onboarding';
import Home from './screens/Passenger/Home';
import Search from './screens/Passenger/Search';
import StopDetail from './screens/Passenger/StopDetail';
import RouteDetail from './screens/Passenger/RouteDetail';
import TripPlanner from './screens/Passenger/TripPlanner';
import Saved from './screens/Passenger/Saved';
import Alerts from './screens/Passenger/Alerts';
import Tickets from './screens/Passenger/Tickets';
import More from './screens/Passenger/More';
import Schemes from './screens/Passenger/Schemes';
import Safety from './screens/Passenger/Safety';
import Complaints from './screens/Passenger/Complaints';
import Settings from './screens/Passenger/Settings';
import BottomNav from './components/BottomNav';
import DepotLayout from './screens/Depot';
import FleetMap from './screens/Depot/FleetMap';
import SOSQueue from './screens/Depot/SOSQueue';
import ComplaintDesk from './screens/Depot/ComplaintDesk';
import DepotTimetables from './screens/Depot/DepotTimetables';

function PassengerLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Onboarding />;
  }

  return (
    <div className="passenger-layout">
      <Outlet />
      <BottomNav />
    </div>
  );
}

export function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <LanguageProvider>
        <Splash />
      </LanguageProvider>
    );
  }

  return (
    <HashRouter>
      <AuthProvider>
        <LanguageProvider>
          <SimulationProvider>
          <Routes>
            {/* Passenger App (Mobile-first) */}
            <Route element={<PassengerLayout />}>
              <Route index element={<Home />} />
              <Route path="search" element={<Search />} />
              <Route path="stop/:id" element={<StopDetail />} />
              <Route path="route/:id" element={<RouteDetail />} />
              <Route path="planner" element={<TripPlanner />} />
              <Route path="saved" element={<Saved />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="tickets" element={<Tickets />} />
              <Route path="more" element={<More />} />
              <Route path="schemes" element={<Schemes />} />
              <Route path="safety" element={<Safety />} />
              <Route path="complaints" element={<Complaints />} />
              <Route path="settings" element={<Settings />} />
              <Route path="account" element={<Settings />} />
            </Route>

            {/* Depot Control Room (Desktop Dashboard) */}
            <Route path="depot" element={<DepotLayout />}>
              <Route index element={<FleetMap />} />
              <Route path="sos" element={<SOSQueue />} />
              <Route path="complaints" element={<ComplaintDesk />} />
              <Route path="timetables" element={<DepotTimetables />} />
            </Route>

            {/* Wildcard Fallback Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SimulationProvider>
      </LanguageProvider>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
