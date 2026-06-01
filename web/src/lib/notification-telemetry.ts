type NotificationChannel = "email" | "whatsapp";
type NotificationOutcome = "sent" | "failed" | "skipped" | "mocked";

type ChannelMetrics = {
  total: number;
  sent: number;
  failed: number;
  skipped: number;
  mocked: number;
  lastOutcome: NotificationOutcome;
  lastSeenAt: string;
  lastError: string | null;
};

type NotificationMetricStore = Record<NotificationChannel, ChannelMetrics>;

const defaultChannelMetrics = (): ChannelMetrics => ({
  total: 0,
  sent: 0,
  failed: 0,
  skipped: 0,
  mocked: 0,
  lastOutcome: "skipped",
  lastSeenAt: new Date(0).toISOString(),
  lastError: null
});

declare global {
  // eslint-disable-next-line no-var
  var notificationTelemetryStore: NotificationMetricStore | undefined;
}

const store =
  global.notificationTelemetryStore ?? {
    email: defaultChannelMetrics(),
    whatsapp: defaultChannelMetrics()
  };

if (process.env.NODE_ENV !== "production") {
  global.notificationTelemetryStore = store;
}

export function recordNotificationMetric(
  channel: NotificationChannel,
  outcome: NotificationOutcome,
  errorMessage?: string
) {
  const metric = store[channel];
  metric.total += 1;
  metric[outcome] += 1;
  metric.lastOutcome = outcome;
  metric.lastSeenAt = new Date().toISOString();
  metric.lastError =
    outcome === "failed" ? errorMessage || "Falha desconhecida." : null;
}

export function getNotificationTelemetrySnapshot() {
  const channels = (Object.keys(store) as NotificationChannel[]).map((channel) => {
    const metric = store[channel];
    const successCount = metric.sent + metric.mocked;

    return {
      channel,
      total: metric.total,
      sent: metric.sent,
      failed: metric.failed,
      skipped: metric.skipped,
      mocked: metric.mocked,
      successRate:
        metric.total > 0 ? Number((successCount / metric.total).toFixed(4)) : 0,
      lastOutcome: metric.lastOutcome,
      lastSeenAt: metric.lastSeenAt,
      lastError: metric.lastError
    };
  });

  const totals = channels.reduce(
    (accumulator, metric) => {
      accumulator.total += metric.total;
      accumulator.sent += metric.sent;
      accumulator.failed += metric.failed;
      accumulator.skipped += metric.skipped;
      accumulator.mocked += metric.mocked;
      return accumulator;
    },
    { total: 0, sent: 0, failed: 0, skipped: 0, mocked: 0 }
  );

  const successCount = totals.sent + totals.mocked;

  return {
    totals: {
      ...totals,
      successRate:
        totals.total > 0 ? Number((successCount / totals.total).toFixed(4)) : 0
    },
    channels
  };
}
