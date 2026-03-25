import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.SMOKE_PORT || 3012);
const baseURL = process.env.SMOKE_BASE_URL || `http://127.0.0.1:${port}`;
const useExternalServer = Boolean(process.env.SMOKE_BASE_URL);
const smokeEnv = {
  ...process.env,
  DATABASE_URL:
    process.env.DATABASE_URL ||
    "mysql://root:root@127.0.0.1:3306/barbersaas",
  SESSION_SECRET:
    process.env.SESSION_SECRET || "smoke-session-secret-0123456789abcdef",
  APP_BASE_URL: process.env.APP_BASE_URL || baseURL
};

export default defineConfig({
  testDir: "./e2e/smoke",
  timeout: 30_000,
  expect: {
    timeout: 10_000
  },
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure"
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ],
  webServer: useExternalServer
    ? undefined
    : {
        command: `npm run start -- -p ${port}`,
        url: `${baseURL}/`,
        env: smokeEnv,
        timeout: 120_000,
        reuseExistingServer: !process.env.CI
      }
});
