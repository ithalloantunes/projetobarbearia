import { spawn } from "node:child_process";
import { setTimeout as wait } from "node:timers/promises";

const port = Number(process.env.SENTRY_SMOKE_PORT || 3015);
const baseUrl = process.env.SENTRY_SMOKE_BASE_URL || `http://127.0.0.1:${port}`;
const timeoutMs = 30_000;

const smokeEnv = {
  ...process.env,
  DATABASE_URL:
    process.env.DATABASE_URL ||
    "mysql://barbersaas:barbersaas@127.0.0.1:3307/barbersaas",
  SESSION_SECRET:
    process.env.SESSION_SECRET || "sentry-smoke-session-secret-0123456789abcdef",
  APP_BASE_URL: process.env.APP_BASE_URL || baseUrl,
  SENTRY_DSN:
    process.env.SENTRY_DSN ||
    "https://examplePublicKey@o0.ingest.sentry.io/0",
  NEXT_PUBLIC_SENTRY_DSN:
    process.env.NEXT_PUBLIC_SENTRY_DSN ||
    "https://examplePublicKey@o0.ingest.sentry.io/0",
  SENTRY_ENVIRONMENT: process.env.SENTRY_ENVIRONMENT || "homolog",
  SENTRY_TRACES_SAMPLE_RATE: process.env.SENTRY_TRACES_SAMPLE_RATE || "0.2",
  SENTRY_RELEASE: process.env.SENTRY_RELEASE || "barbersaas-smoke-local",
  SENTRY_REQUIRED: process.env.SENTRY_REQUIRED || "true"
};

function startServerProcess(portNumber) {
  if (process.platform === "win32") {
    return spawn(`npm.cmd run start -- -p ${portNumber}`, {
      cwd: process.cwd(),
      stdio: "inherit",
      shell: true,
      env: smokeEnv
    });
  }

  return spawn("npm", ["run", "start", "--", "-p", String(portNumber)], {
    cwd: process.cwd(),
    stdio: "inherit",
    shell: false,
    env: smokeEnv
  });
}

function runHealthMonitor() {
  if (process.platform === "win32") {
    return spawn("node scripts/health-alert.mjs", {
      cwd: process.cwd(),
      stdio: "inherit",
      shell: true,
      env: {
        ...smokeEnv,
        HEALTHCHECK_URL: `${baseUrl}/api/health`,
        HEALTH_REQUIRE_SENTRY_READY: "true"
      }
    });
  }

  return spawn("node", ["scripts/health-alert.mjs"], {
    cwd: process.cwd(),
    stdio: "inherit",
    shell: false,
    env: {
      ...smokeEnv,
      HEALTHCHECK_URL: `${baseUrl}/api/health`,
      HEALTH_REQUIRE_SENTRY_READY: "true"
    }
  });
}

async function killProcessTree(pid) {
  if (!pid) {
    return;
  }

  if (process.platform === "win32") {
    await new Promise((resolve) => {
      const killer = spawn("taskkill", ["/PID", String(pid), "/T", "/F"], {
        stdio: "ignore",
        shell: false
      });
      killer.on("close", () => resolve());
      killer.on("error", () => resolve());
    });
    return;
  }

  try {
    process.kill(pid, "SIGTERM");
  } catch {
    // noop
  }
}

async function waitForHealth() {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.status === 200) {
        const payload = await response.json();
        const databaseUp = payload?.checks?.database?.status === "up";
        const appOk = payload?.status === "ok";
        const sentryReady = Boolean(payload?.sentry?.ready);

        if (databaseUp && appOk && sentryReady) {
          return;
        }
      }

    } catch {
      // noop while server starts
    }
    await wait(1000);
  }
  throw new Error("Timeout aguardando subida do servidor para smoke Sentry.");
}

async function assertHealthSentryReady() {
  const response = await fetch(`${baseUrl}/api/health`);
  const payload = await response.json();
  const sentry = payload?.sentry;

  if (!sentry || typeof sentry !== "object") {
    throw new Error("Healthcheck sem bloco `sentry`.");
  }

  if (!sentry.required) {
    throw new Error("Esperado `sentry.required=true` para smoke.");
  }

  if (!sentry.ready) {
    const missing = Array.isArray(sentry.missing) ? sentry.missing.join(", ") : "";
    throw new Error(`Sentry nao pronto no healthcheck. Missing: ${missing}`);
  }

  if (Array.isArray(sentry.missing) && sentry.missing.length > 0) {
    throw new Error(`Esperado ` + "`sentry.missing`" + ` vazio no smoke.`);
  }

  console.log(
    JSON.stringify({
      event: "sentry-smoke-health-ok",
      status: response.status,
      sentry
    })
  );
}

async function assertHealthMonitorPass() {
  const monitor = runHealthMonitor();
  const exitCode = await new Promise((resolve) => monitor.on("close", resolve));

  if (exitCode !== 0) {
    throw new Error("Health monitor falhou no smoke de Sentry.");
  }
}

async function main() {
  const server = startServerProcess(port);

  try {
    await waitForHealth();
    await assertHealthSentryReady();
    await assertHealthMonitorPass();
  } finally {
    await killProcessTree(server.pid);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
