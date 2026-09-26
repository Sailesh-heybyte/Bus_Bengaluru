const DEFAULT_INITIAL_PROGRESS = {
  bus_01: 1.0,
  bus_02: 4.5,
  bus_03: 1.2,
  bus_04: 3.5,
  bus_05: 1.0,
  bus_06: 2.0,
  bus_07: 4.8,
  bus_08: 1.0
};

export function advanceSimulation(buses, routes) {
  if (!buses || !Array.isArray(buses)) return [];

  const routeMap = new Map();
  if (routes && Array.isArray(routes)) {
    routes.forEach((route) => {
      routeMap.set(route.id, route);
    });
  }

  return buses.map((bus) => {
    const route = routeMap.get(bus.route_id || bus.routeId);
    const stopCount = route && (route.stop_ids || route.stopIds)
      ? (route.stop_ids || route.stopIds).length
      : 8;

    const maxProgress = Math.max(1, stopCount - 1);

    const isInitial = typeof bus.progress !== 'number';
    let currentProgress = isInitial
      ? (DEFAULT_INITIAL_PROGRESS[bus.id] ?? 0.5)
      : bus.progress;

    // Advance by 0.2 stops every 3-second tick (keep initial progress on first mount)
    let nextProgress = isInitial ? currentProgress : currentProgress + 0.2;
    if (nextProgress >= maxProgress) {
      nextProgress = 0.0;
    }

    const currentStopIndex = Math.min(
      stopCount - 1,
      Math.floor(nextProgress)
    );
    const progressPercentage = Math.round(
      (nextProgress / maxProgress) * 100
    );

    return {
      ...bus,
      progress: parseFloat(nextProgress.toFixed(3)),
      current_stop_index: currentStopIndex,
      currentStopIndex,
      progress_percentage: progressPercentage,
      progressPercentage
    };
  });
}

export default advanceSimulation;
