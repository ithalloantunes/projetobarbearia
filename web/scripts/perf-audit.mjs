import { spawn } from "node:child_process";
import { setTimeout as wait } from "node:timers/promises";
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import lighthouse from "lighthouse";
import * as chromeLauncher from "chrome-launcher";

const port = Number(process.env.PERF_PORT || 3014);
const baseUrl = process.env.PERF_BASE_URL || `http://127.0.0.1:${port}`;
const reportDir = process.env.PERF_REPORT_DIR || "perf-reports";
const timeoutMs = 60_000;
const skipBuild = process.env.PERF_SKIP_BUILD === "1";
const useExternalServer = Boolean(process.env.PERF_BASE_URL);

const perfEnv = {
  ...process.env,
  DATABASE_URL:
    process.env.DATABASE_URL ||
    "mysql://barbersaas:barbersaas@localhost:3307/barbersaas",
  SESSION_SECRET:
    process.env.SESSION_SECRET || "perf-session-secret-0123456789abcdef",
  APP_BASE_URL: process.env.APP_BASE_URL || baseUrl
};

const targets = [
  { path: "/", name: "home" },
  { path: "/entrar", name: "entrar" },
  { path: "/cadastrar", name: "cadastrar" },
  { path: "/termos-de-uso", name: "termos" },
  { path: "/politica-privacidade", name: "privacidade" }
];

function startProcess(command, args, options) {
  const useShell = process.platform === "win32";
  return spawn(command, args, { stdio: "inherit", shell: useShell, ...options });
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
      // noop
    }
    await wait(1000);
  }
  throw new Error("Timeout aguardando subida do servidor para perf audit.");
}

function sanitizeName(name) {
  return name.replace(/[^a-z0-9_-]+/gi, "-").toLowerCase();
}

async function runLighthouse(url, chromePort, name) {
  const result = await lighthouse(url, {
    port: chromePort,
    output: "json",
    onlyCategories: ["performance"],
    logLevel: "info"
  });

  const score = Math.round((result.lhr.categories.performance.score || 0) * 100);
  const reportPath = `${reportDir}/${sanitizeName(name)}.json`;
  await writeFile(reportPath, result.report);

  console.log(`PERF ${name}: ${score}`);
}

async function ensureBuild() {
  if (skipBuild) {
    return;
  }

  const command = process.platform === "win32" ? "npm.cmd" : "npm";
  const args = ["run", "build"];
  const build = startProcess(command, args, { env: perfEnv });

  const exitCode = await new Promise((resolve) => build.on("close", resolve));
  if (exitCode !== 0) {
    throw new Error("Falha no build para perf audit.");
  }
}

async function run() {
  if (!existsSync(reportDir)) {
    await mkdir(reportDir, { recursive: true });
  }

  await ensureBuild();

  const command = process.platform === "win32" ? "npm.cmd" : "npm";
  const args = ["run", "start", "--", "-p", String(port)];
  const server = useExternalServer
    ? null
    : startProcess(command, args, { env: perfEnv });

  try {
    await waitForHealth();

    let chromePath = process.env.CHROME_PATH;
    if (!chromePath) {
      try {
        const { chromium } = await import("@playwright/test");
        chromePath = chromium.executablePath();
      } catch {
        chromePath = undefined;
      }
    }

    const chrome = await chromeLauncher.launch({
      chromePath,
      chromeFlags: ["--headless", "--no-sandbox"]
    });

    try {
      for (const target of targets) {
        await runLighthouse(`${baseUrl}${target.path}`, chrome.port, target.name);
      }
    } finally {
      try {
        await chrome.kill();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (process.platform === "win32") {
          console.warn(
            `WARN: chrome cleanup failed on Windows, continuing. Details: ${message}`
          );
        } else {
          throw error;
        }
      }
    }
  } finally {
    if (server?.pid) {
      await killProcessTree(server.pid);
    }
  }
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
