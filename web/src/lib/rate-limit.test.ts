import { afterEach, describe, expect, it, vi } from "vitest";
import {
  consumeAdaptiveRateLimit,
  consumeFixedWindowRateLimit,
  resetRateLimit
} from "@/lib/rate-limit";

describe("rate limit", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("enforces fixed window limits and resets after window", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));

    const namespace = "test:fixed";
    const key = "ip:1";

    const first = consumeFixedWindowRateLimit({
      namespace,
      key,
      maxRequests: 2,
      windowMs: 1000
    });
    const second = consumeFixedWindowRateLimit({
      namespace,
      key,
      maxRequests: 2,
      windowMs: 1000
    });
    const blocked = consumeFixedWindowRateLimit({
      namespace,
      key,
      maxRequests: 2,
      windowMs: 1000
    });

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(blocked.allowed).toBe(false);

    vi.advanceTimersByTime(1100);

    const afterWindow = consumeFixedWindowRateLimit({
      namespace,
      key,
      maxRequests: 2,
      windowMs: 1000
    });
    expect(afterWindow.allowed).toBe(true);
    resetRateLimit(namespace, key);
  });

  it("applies adaptive blocks after repeated violations", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));

    const namespace = "test:adaptive";
    const key = "email:test@example.com";

    consumeAdaptiveRateLimit({
      namespace,
      key,
      maxRequests: 1,
      windowMs: 60_000,
      baseBlockMs: 1000,
      maxBlockMs: 10_000
    });

    const blocked = consumeAdaptiveRateLimit({
      namespace,
      key,
      maxRequests: 1,
      windowMs: 60_000,
      baseBlockMs: 1000,
      maxBlockMs: 10_000
    });

    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);

    vi.advanceTimersByTime(1500);

    const allowedAgain = consumeAdaptiveRateLimit({
      namespace,
      key,
      maxRequests: 1,
      windowMs: 60_000,
      baseBlockMs: 1000,
      maxBlockMs: 10_000
    });

    expect(allowedAgain.allowed).toBe(true);
    resetRateLimit(namespace, key);
  });
});
