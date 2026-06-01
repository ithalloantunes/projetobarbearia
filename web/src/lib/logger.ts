type LogLevel = "info" | "warn" | "error";

type LogMeta = Record<string, unknown> | undefined;
import { recordRouteMetric } from "./telemetry";

function sanitizeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message
    };
  }
  return error;
}

function writeLog(level: LogLevel, message: string, meta?: LogMeta) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(meta ? { meta } : {})
  };
  const line = JSON.stringify(entry);

  if (level === "error") {
    console.error(line);
    return;
  }
  if (level === "warn") {
    console.warn(line);
    return;
  }
  console.log(line);
}

export function getRequestIdFromHeaders(headers: Headers) {
  const incoming = headers.get("x-request-id")?.trim();
  if (incoming) {
    return incoming;
  }
  return crypto.randomUUID();
}

export function getRequestLogContext(request: Request) {
  return {
    requestId: getRequestIdFromHeaders(request.headers),
    method: request.method,
    path: new URL(request.url).pathname
  };
}

export function logRequestStart(
  context: { requestId: string; method: string; path: string },
  meta?: LogMeta
) {
  writeLog("info", "request.start", {
    requestId: context.requestId,
    method: context.method,
    path: context.path,
    ...meta
  });
}

export function logRequestSuccess(
  context: { requestId: string; method: string; path: string },
  params: { status: number; durationMs: number },
  meta?: LogMeta
) {
  const route = typeof meta?.route === "string" ? meta.route : null;
  if (route) {
    recordRouteMetric(route, params.status, params.durationMs);
  }

  writeLog("info", "request.success", {
    requestId: context.requestId,
    method: context.method,
    path: context.path,
    status: params.status,
    durationMs: params.durationMs,
    ...meta
  });
}

export function logRequestFailure(
  context: { requestId: string; method: string; path: string },
  params: { status: number; durationMs: number; error?: unknown },
  meta?: LogMeta
) {
  const route = typeof meta?.route === "string" ? meta.route : null;
  if (route) {
    recordRouteMetric(route, params.status, params.durationMs);
  }

  writeLog("error", "request.failure", {
    requestId: context.requestId,
    method: context.method,
    path: context.path,
    status: params.status,
    durationMs: params.durationMs,
    ...(params.error ? { error: sanitizeError(params.error) } : {}),
    ...meta
  });
}
