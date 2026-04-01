const healthUrl = process.env.HEALTHCHECK_URL?.trim();
const webhookUrl = process.env.ALERT_WEBHOOK_URL?.trim();
const errorRateThreshold = Number(process.env.HEALTH_ERROR_RATE_THRESHOLD || 0.2);
const requireSentryReady = String(process.env.HEALTH_REQUIRE_SENTRY_READY || "")
  .trim()
  .toLowerCase() === "true";

if (!healthUrl) {
  console.error("HEALTHCHECK_URL nao definido.");
  process.exit(1);
}

async function sendWebhookAlert(message, details) {
  if (!webhookUrl) {
    return;
  }

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: message,
        details
      })
    });
  } catch (error) {
    console.error("Falha ao enviar alerta para webhook:", error);
  }
}

async function main() {
  const startedAt = Date.now();
  let response;
  let payload = null;

  try {
    response = await fetch(healthUrl, {
      headers: { "x-request-id": `health-monitor-${Date.now()}` }
    });
    payload = await response.json();
  } catch (error) {
    await sendWebhookAlert("Healthcheck indisponivel", {
      healthUrl,
      error: error instanceof Error ? error.message : String(error)
    });
    throw new Error("Falha ao consultar healthcheck.");
  }

  const responseTimeMs = Date.now() - startedAt;
  const status = response.status;
  const appStatus = payload?.status;
  const telemetryErrorRate = Number(payload?.telemetry?.totals?.errorRate ?? 0);
  const sentryReady = Boolean(payload?.sentry?.ready ?? true);
  const sentryRequired = Boolean(payload?.sentry?.required ?? false);
  const sentryMissing = Array.isArray(payload?.sentry?.missing) ? payload.sentry.missing : [];

  console.log(
    JSON.stringify({
      event: "health-monitor",
      healthUrl,
      status,
      appStatus,
      telemetryErrorRate,
      sentryRequired,
      sentryReady,
      sentryMissing,
      responseTimeMs,
      timestamp: new Date().toISOString()
    })
  );

  const degraded = status >= 500 || appStatus === "degraded";
  const highErrorRate = telemetryErrorRate > errorRateThreshold;
  const sentryNotReady = requireSentryReady && sentryRequired && !sentryReady;

  if (degraded || highErrorRate || sentryNotReady) {
    await sendWebhookAlert("Alerta de saude da aplicacao", {
      healthUrl,
      status,
      appStatus,
      telemetryErrorRate,
      errorRateThreshold,
      sentryRequired,
      sentryReady,
      sentryMissing,
      requireSentryReady,
      responseTimeMs,
      timestamp: new Date().toISOString()
    });

    if (degraded) {
      throw new Error("Healthcheck degradado.");
    }
    if (highErrorRate) {
      throw new Error(
        `Taxa de erro acima do limite: ${telemetryErrorRate} > ${errorRateThreshold}.`
      );
    }
    if (sentryNotReady) {
      throw new Error(
        `Sentry obrigatorio nao pronto. Variaveis ausentes: ${sentryMissing.join(", ")}.`
      );
    }
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
