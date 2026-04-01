type SentryStatus = {
  required: boolean;
  ready: boolean;
  configured: boolean;
  missing: string[];
  environment: string | null;
  release: string | null;
  tracesSampleRate: number;
};

function parseBooleanEnv(value: string | undefined): boolean | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }
  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }
  return null;
}

function parseTraceSampleRate(input: string | undefined): number {
  const parsed = Number(input ?? "0");
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
    return 0;
  }
  return parsed;
}

export function getSentryStatus(): SentryStatus {
  const dsn = process.env.SENTRY_DSN?.trim() || process.env.NEXT_PUBLIC_SENTRY_DSN?.trim() || "";
  const environment = process.env.SENTRY_ENVIRONMENT?.trim() || null;
  const release = process.env.SENTRY_RELEASE?.trim() || null;
  const configured = dsn.length > 0;
  const forcedRequired = parseBooleanEnv(process.env.SENTRY_REQUIRED);
  const required = forcedRequired ?? process.env.NODE_ENV === "production";
  const missing: string[] = [];

  if (required && !configured) {
    missing.push("SENTRY_DSN");
  }
  if (required && !environment) {
    missing.push("SENTRY_ENVIRONMENT");
  }

  return {
    required,
    ready: missing.length === 0,
    configured,
    missing,
    environment,
    release,
    tracesSampleRate: parseTraceSampleRate(process.env.SENTRY_TRACES_SAMPLE_RATE)
  };
}

