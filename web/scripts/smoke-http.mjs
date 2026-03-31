import { spawn } from "node:child_process";
import { setTimeout as wait } from "node:timers/promises";

const port = Number(process.env.SMOKE_PORT || 3011);
const baseUrl = `http://localhost:${port}`;
const timeoutMs = 30_000;
const smokeEnv = {
  ...process.env,
  DATABASE_URL:
    process.env.DATABASE_URL ||
    "mysql://root:root@127.0.0.1:3306/barbersaas",
  SESSION_SECRET:
    process.env.SESSION_SECRET || "smoke-session-secret-0123456789abcdef",
  APP_BASE_URL: process.env.APP_BASE_URL || baseUrl
};

const endpoints = [
  { path: "/", allowed: [200] },
  { path: "/entrar", allowed: [200, 307, 308] },
  { path: "/agendar", allowed: [307, 308] },
  { path: "/api/health", allowed: [200, 503] },
  { path: "/api/services", allowed: [200, 503] },
  { path: "/api/barbers", allowed: [200, 503] },
  { path: "/api/auth/session", allowed: [401] }
];

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
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.status === 200 || response.status === 503) {
        return;
      }
    } catch {
      // noop while server starts
    }
    await wait(1000);
  }
  throw new Error("Timeout aguardando subida do servidor para smoke.");
}

async function checkEndpoint(path, allowedStatuses) {
  const target = `${baseUrl}${path}`;
  try {
    const response = await fetch(target, { redirect: "manual" });
    const status = response.status;
    if (!allowedStatuses.includes(status)) {
      return { ok: false, target, status };
    }
    return { ok: true, target, status };
  } catch {
    return { ok: false, target, status: "NO_RESPONSE" };
  }
}

async function main() {
  const server = startServerProcess(port);

  try {
    await waitForHealth();

    let failures = 0;
    for (const endpoint of endpoints) {
      const result = await checkEndpoint(endpoint.path, endpoint.allowed);
      if (result.ok) {
        console.log(`OK ${result.status} ${result.target}`);
      } else {
        failures += 1;
        console.error(`ERR ${result.status} ${result.target}`);
      }
    }

    if (failures > 0) {
      throw new Error(`Smoke HTTP falhou em ${failures} endpoint(s).`);
    }
  } finally {
    await killProcessTree(server.pid);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
