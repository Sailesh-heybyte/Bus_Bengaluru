import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getLiveBuses, getLiveRoutes } from '../api/live.js';
import { advanceSimulation } from '../mock/simulation.js';
import { useInterval } from '../hooks/useInterval.js';

export const SimulationContext = createContext({
  liveBuses: []
});

export function SimulationProvider({ children }) {
  const [liveBuses, setLiveBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const routesRef = useRef([]);

  useEffect(() => {
    Promise.all([getLiveBuses(), getLiveRoutes()]).then(
      ([busesData, routesData]) => {
        setRoutes(routesData);
        routesRef.current = routesData;
        // Establish initial progress and positions
        const initializedBuses = advanceSimulation(busesData, routesData);
        setLiveBuses(initializedBuses);
        setIsInitialized(true);
      }
    );
  }, []);

  useInterval(
    () => {
      // Pause simulation when tab is hidden
      if (typeof document !== 'undefined' && document.hidden) {
        return;
      }

      setLiveBuses((prevBuses) => {
        if (!prevBuses || prevBuses.length === 0) return prevBuses;
        return advanceSimulation(
          prevBuses,
          routesRef.current.length > 0 ? routesRef.current : routes
        );
      });
    },
    isInitialized ? 3000 : null
  );

  return (
    <SimulationContext.Provider value={{ liveBuses }}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  return useContext(SimulationContext);
}

export default SimulationContext;
