import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

if (!dsn) {
  console.error("SENTRY_DSN nao definido. Abortei o envio do evento de teste.");
  process.exit(1);
}

Sentry.init({
  dsn,
  enabled: true,
  environment: process.env.SENTRY_ENVIRONMENT || "homolog",
  release: process.env.SENTRY_RELEASE || "barbersaas-test-event",
  tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? "0")
});

Sentry.captureMessage("SENTRY_TEST_EVENT", "warning");

Sentry.flush(5000)
  .then((flushed) => {
    if (!flushed) {
      console.error("Evento nao foi confirmado pelo Sentry dentro do timeout.");
      process.exit(1);
    }
    console.log("Evento de teste enviado ao Sentry.");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });

