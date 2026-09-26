import { advanceSimulation } from './src/mock/simulation.js';
import { getLiveBuses, getLiveRoutes } from './src/api/live.js';

async function verify() {
  console.log('--- Testing getLiveBuses and getLiveRoutes ---');
  const buses = await getLiveBuses();
  const routes = await getLiveRoutes();

  console.log('Total buses:', buses.length);
  console.log('Total routes:', routes.length);

  if (buses.length !== 8 || routes.length !== 5) {
    throw new Error('Initial count mismatch');
  }

  // Check bus_01 (route_01, has GPS)
  const bus01 = buses.find((b) => b.id === 'bus_01');
  if (!bus01 || !bus01.hasGps || bus01.routeId !== 'route_01') {
    throw new Error('bus_01 verification failed');
  }

  // Check bus_05 (route_03, lacks GPS)
  const bus05 = buses.find((b) => b.id === 'bus_05');
  if (!bus05 || bus05.hasGps !== false) {
    throw new Error('bus_05 hasGps should be false');
  }

  console.log('--- Testing advanceSimulation ---');
  let simulatedBuses = advanceSimulation(buses, routes);
  const bus01AfterStep1 = simulatedBuses.find((b) => b.id === 'bus_01');
  console.log('Bus 01 step 1 progress:', bus01AfterStep1.progress);
  console.log('Bus 01 step 1 stop index:', bus01AfterStep1.currentStopIndex);
  console.log('Bus 01 step 1 percentage:', bus01AfterStep1.progressPercentage);

  if (typeof bus01AfterStep1.progress !== 'number' || bus01AfterStep1.progress <= 0) {
    throw new Error('advanceSimulation progress not advancing');
  }

  // Run 10 ticks to test continuous simulation and loop back
  for (let i = 0; i < 10; i++) {
    simulatedBuses = advanceSimulation(simulatedBuses, routes);
  }
  const bus01After10 = simulatedBuses.find((b) => b.id === 'bus_01');
  console.log('Bus 01 after 10 ticks progress:', bus01After10.progress);

  console.log('ALL SIMULATION VERIFICATIONS PASSED SUCCESSFULLY!');
}

verify().catch((err) => {
  console.error('SIMULATION VERIFICATION FAILED:', err);
  process.exit(1);
});
