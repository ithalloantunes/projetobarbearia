import { describe, expect, it } from "vitest";
import { getTelemetrySnapshot, recordRouteMetric } from "@/lib/telemetry";

describe("telemetry", () => {
  it("records request counts, error rate and average duration", () => {
    recordRouteMetric("api.test", 200, 120);
    recordRouteMetric("api.test", 500, 80);

    const snapshot = getTelemetrySnapshot();
    const route = snapshot.routes.find((item) => item.route === "api.test");

    expect(route).toBeDefined();
    expect(route?.totalRequests).toBeGreaterThanOrEqual(2);
    expect(route?.errorRequests).toBeGreaterThanOrEqual(1);
    expect(route?.avgDurationMs).toBeGreaterThan(0);
  });
});
