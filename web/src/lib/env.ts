const REQUIRED_PRODUCTION_ENV = [
  "DATABASE_URL",
  "SESSION_SECRET",
  "APP_BASE_URL"
] as const;

type EnvStatus = {
  ok: boolean;
  missing: string[];
};

let validated = false;

export function getEnvStatus(): EnvStatus {
  if (process.env.NODE_ENV !== "production") {
    return { ok: true, missing: [] };
  }

  const missing = REQUIRED_PRODUCTION_ENV.filter((name) => {
    const value = process.env[name];
    return !value || !value.trim();
  });

  return {
    ok: missing.length === 0,
    missing
  };
}

export function assertProductionEnv() {
  if (validated) {
    return;
  }

  const status = getEnvStatus();
  if (!status.ok) {
    throw new Error(`Variaveis obrigatorias ausentes: ${status.missing.join(", ")}`);
  }

  validated = true;
}
