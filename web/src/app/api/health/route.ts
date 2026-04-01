import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getRequestLogContext,
  logRequestFailure,
  logRequestStart,
  logRequestSuccess
} from "@/lib/logger";
import { getEnvStatus } from "@/lib/env";
import { getTelemetrySnapshot } from "@/lib/telemetry";
import { getNotificationTelemetrySnapshot } from "@/lib/notification-telemetry";
import { getSentryStatus } from "@/lib/sentry-status";

export async function GET(request: Request) {
  const startedAt = Date.now();
  const context = getRequestLogContext(request);
  logRequestStart(context, { route: "api.health" });
  const envStatus = getEnvStatus();
  const sentryStatus = getSentryStatus();

  let databaseStatus: "up" | "down" = "up";
  let databaseLatencyMs = 0;
  let databaseError: string | null = null;

  try {
    const dbStartedAt = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    databaseLatencyMs = Date.now() - dbStartedAt;
  } catch (error) {
    databaseStatus = "down";
    databaseLatencyMs = Date.now() - startedAt;
    databaseError = error instanceof Error ? error.message : "Erro desconhecido.";
  }

  const payload = {
    status:
      databaseStatus === "up" && envStatus.ok && sentryStatus.ready ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    env: envStatus,
    sentry: sentryStatus,
    checks: {
      database: {
        status: databaseStatus,
        latencyMs: databaseLatencyMs,
        error: databaseError
      }
    },
    telemetry: getTelemetrySnapshot(),
    notifications: getNotificationTelemetrySnapshot(),
    responseTimeMs: Date.now() - startedAt
  };

  const status = databaseStatus === "up" ? 200 : 503;
  const response = NextResponse.json(payload, {
    status: databaseStatus === "up" ? 200 : 503
  });
  response.headers.set("x-request-id", context.requestId);

  if (status >= 500) {
    logRequestFailure(
      context,
      { status, durationMs: payload.responseTimeMs, error: databaseError },
      { route: "api.health" }
    );
  } else {
    logRequestSuccess(
      context,
      { status, durationMs: payload.responseTimeMs },
      { route: "api.health" }
    );
  }

  return response;
}
