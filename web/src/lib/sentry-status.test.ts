import { afterEach, describe, expect, it } from "vitest";
import { getSentryStatus } from "@/lib/sentry-status";

const originalEnv = { ...process.env };

function setEnv(values: Record<string, string | undefined>) {
  Object.assign(process.env, values);
}

function restoreEnv() {
  for (const key of Object.keys(process.env)) {
    if (!(key in originalEnv)) {
      delete process.env[key];
    }
  }
  for (const [key, value] of Object.entries(originalEnv)) {
    process.env[key] = value;
  }
}

afterEach(() => {
  restoreEnv();
});

describe("getSentryStatus", () => {
  it("does not require Sentry by default in non-production", () => {
    setEnv({ NODE_ENV: "development" });
    delete process.env.SENTRY_DSN;
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;
    delete process.env.SENTRY_ENVIRONMENT;
    delete process.env.SENTRY_REQUIRED;

    const status = getSentryStatus();

    expect(status.required).toBe(false);
    expect(status.ready).toBe(true);
    expect(status.missing).toEqual([]);
  });

  it("requires DSN and environment in production", () => {
    setEnv({ NODE_ENV: "production" });
    delete process.env.SENTRY_DSN;
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;
    delete process.env.SENTRY_ENVIRONMENT;
    delete process.env.SENTRY_REQUIRED;

    const status = getSentryStatus();

    expect(status.required).toBe(true);
    expect(status.ready).toBe(false);
    expect(status.missing).toEqual(["SENTRY_DSN", "SENTRY_ENVIRONMENT"]);
  });

  it("accepts forced requirement and detects ready state", () => {
    setEnv({
      NODE_ENV: "development",
      SENTRY_REQUIRED: "true",
      SENTRY_DSN: "https://examplePublicKey@o0.ingest.sentry.io/0",
      SENTRY_ENVIRONMENT: "homolog",
      SENTRY_TRACES_SAMPLE_RATE: "0.5",
      SENTRY_RELEASE: "barbersaas@1.0.0"
    });

    const status = getSentryStatus();

    expect(status.required).toBe(true);
    expect(status.ready).toBe(true);
    expect(status.configured).toBe(true);
    expect(status.environment).toBe("homolog");
    expect(status.release).toBe("barbersaas@1.0.0");
    expect(status.tracesSampleRate).toBe(0.5);
  });
});
