type RateLimitEntry = {
  count: number;
  windowResetAt: number;
  blockedUntil: number;
  violations: number;
};

type FixedWindowInput = {
  namespace: string;
  key: string;
  maxRequests: number;
  windowMs: number;
};

type AdaptiveWindowInput = FixedWindowInput & {
  baseBlockMs: number;
  maxBlockMs: number;
};

type RateLimitResult =
  | {
      allowed: true;
      retryAfterSeconds: 0;
    }
  | {
      allowed: false;
      retryAfterSeconds: number;
    };

declare global {
  // eslint-disable-next-line no-var
  var rateLimitStore: Map<string, RateLimitEntry> | undefined;
}

const store = global.rateLimitStore ?? new Map<string, RateLimitEntry>();

if (process.env.NODE_ENV !== "production") {
  global.rateLimitStore = store;
}

function toStoreKey(namespace: string, key: string) {
  return `${namespace}:${key}`;
}

function clampSeconds(milliseconds: number) {
  return Math.max(1, Math.ceil(milliseconds / 1000));
}

function readEntry(storeKey: string, windowMs: number) {
  const now = Date.now();
  const existing = store.get(storeKey);

  if (!existing) {
    const created: RateLimitEntry = {
      count: 0,
      windowResetAt: now + windowMs,
      blockedUntil: 0,
      violations: 0
    };
    store.set(storeKey, created);
    return { now, entry: created };
  }

  if (now >= existing.windowResetAt) {
    existing.count = 0;
    existing.windowResetAt = now + windowMs;
  }

  if (existing.blockedUntil > 0 && now >= existing.blockedUntil) {
    existing.blockedUntil = 0;
  }

  return { now, entry: existing };
}

export function getRequestIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}

export function resetRateLimit(namespace: string, key: string) {
  store.delete(toStoreKey(namespace, key));
}

export function consumeFixedWindowRateLimit(input: FixedWindowInput): RateLimitResult {
  const storeKey = toStoreKey(input.namespace, input.key);
  const { now, entry } = readEntry(storeKey, input.windowMs);

  if (entry.blockedUntil > now) {
    return {
      allowed: false,
      retryAfterSeconds: clampSeconds(entry.blockedUntil - now)
    };
  }

  if (entry.count >= input.maxRequests) {
    return {
      allowed: false,
      retryAfterSeconds: clampSeconds(entry.windowResetAt - now)
    };
  }

  entry.count += 1;
  return {
    allowed: true,
    retryAfterSeconds: 0
  };
}

export function consumeAdaptiveRateLimit(input: AdaptiveWindowInput): RateLimitResult {
  const storeKey = toStoreKey(input.namespace, input.key);
  const { now, entry } = readEntry(storeKey, input.windowMs);

  if (entry.blockedUntil > now) {
    return {
      allowed: false,
      retryAfterSeconds: clampSeconds(entry.blockedUntil - now)
    };
  }

  entry.count += 1;

  if (entry.count <= input.maxRequests) {
    return {
      allowed: true,
      retryAfterSeconds: 0
    };
  }

  entry.violations += 1;

  const blockMs = Math.min(input.baseBlockMs * 2 ** (entry.violations - 1), input.maxBlockMs);
  entry.blockedUntil = now + blockMs;
  entry.count = 0;
  entry.windowResetAt = now + input.windowMs;

  return {
    allowed: false,
    retryAfterSeconds: clampSeconds(blockMs)
  };
}
