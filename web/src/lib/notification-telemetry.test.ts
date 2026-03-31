import { describe, expect, it } from "vitest";
import {
  getNotificationTelemetrySnapshot,
  recordNotificationMetric
} from "./notification-telemetry";

describe("notification-telemetry", () => {
  it("records outcomes per channel", () => {
    recordNotificationMetric("email", "sent");
    recordNotificationMetric("email", "failed", "smtp error");
    recordNotificationMetric("whatsapp", "mocked");

    const snapshot = getNotificationTelemetrySnapshot();
    const email = snapshot.channels.find((channel) => channel.channel === "email");
    const whatsapp = snapshot.channels.find((channel) => channel.channel === "whatsapp");

    expect(email).toBeDefined();
    expect(whatsapp).toBeDefined();
    expect(email?.sent).toBeGreaterThanOrEqual(1);
    expect(email?.failed).toBeGreaterThanOrEqual(1);
    expect(email?.lastOutcome).toBe("failed");
    expect(email?.lastError).toBe("smtp error");
    expect(whatsapp?.mocked).toBeGreaterThanOrEqual(1);
  });
});
