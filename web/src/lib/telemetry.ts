type RouteMetric = {
  totalRequests: number;
  errorRequests: number;
  totalDurationMs: number;
  lastStatus: number;
  lastSeenAt: string;
};

declare global {
  // eslint-disable-next-line no-var
  var telemetryStore: Map<string, RouteMetric> | undefined;
}

const metrics = global.telemetryStore ?? new Map<string, RouteMetric>();

if (process.env.NODE_ENV !== "production") {
  global.telemetryStore = metrics;
}

export function recordRouteMetric(route: string, status: number, durationMs: number) {
  const existing = metrics.get(route) ?? {
    totalRequests: 0,
    errorRequests: 0,
    totalDurationMs: 0,
    lastStatus: status,
    lastSeenAt: new Date().toISOString()
  };

  existing.totalRequests += 1;
  if (status >= 400) {
    existing.errorRequests += 1;
  }
  existing.totalDurationMs += Math.max(0, Math.round(durationMs));
  existing.lastStatus = status;
  existing.lastSeenAt = new Date().toISOString();

  metrics.set(route, existing);
}

export function getTelemetrySnapshot() {
  const routes = Array.from(metrics.entries()).map(([route, metric]) => ({
    route,
    totalRequests: metric.totalRequests,
    errorRequests: metric.errorRequests,
    errorRate:
      metric.totalRequests > 0
        ? Number((metric.errorRequests / metric.totalRequests).toFixed(4))
        : 0,
    avgDurationMs:
      metric.totalRequests > 0
        ? Math.round(metric.totalDurationMs / metric.totalRequests)
        : 0,
    lastStatus: metric.lastStatus,
    lastSeenAt: metric.lastSeenAt
  }));

  const totals = routes.reduce(
    (accumulator, route) => {
      accumulator.totalRequests += route.totalRequests;
      accumulator.errorRequests += route.errorRequests;
      return accumulator;
    },
    { totalRequests: 0, errorRequests: 0 }
  );

  return {
    totals: {
      totalRequests: totals.totalRequests,
      errorRequests: totals.errorRequests,
      errorRate:
        totals.totalRequests > 0
          ? Number((totals.errorRequests / totals.totalRequests).toFixed(4))
          : 0
    },
    routes
  };
}
