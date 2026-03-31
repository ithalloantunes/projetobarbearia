export const SESSION_COOKIE_NAME = "barbersaas_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

export type SessionRole = "CLIENT" | "BARBER" | "ADMIN";

export type SessionPayload = {
  userId: number;
  role: SessionRole;
  exp: number;
};

export type SessionCookieOptions = {
  path: string;
  httpOnly: boolean;
  sameSite: "lax";
  secure: boolean;
  maxAge: number;
};

const ROLE_SET = new Set<SessionRole>(["CLIENT", "BARBER", "ADMIN"]);

let devSessionSecret: string | null = null;

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET?.trim();
  if (secret) {
    return secret;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET nao configurado.");
  }
  if (!devSessionSecret) {
    devSessionSecret = crypto.randomUUID();
    console.warn("SESSION_SECRET nao configurado. Usando chave temporaria para desenvolvimento.");
  }
  return devSessionSecret;
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(base64Url: string) {
  const padded = base64Url + "=".repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function encodeJsonToBase64Url(value: unknown) {
  const json = JSON.stringify(value);
  return bytesToBase64Url(new TextEncoder().encode(json));
}

function decodeJsonFromBase64Url<T>(value: string): T | null {
  try {
    const bytes = base64UrlToBytes(value);
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

async function sign(value: string) {
  const secretBytes = new TextEncoder().encode(getSessionSecret());
  const key = await crypto.subtle.importKey(
    "raw",
    secretBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return bytesToBase64Url(new Uint8Array(signature));
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return mismatch === 0;
}

export async function createSessionToken(input: {
  userId: number;
  role: SessionRole;
  maxAgeSeconds?: number;
}) {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    userId: input.userId,
    role: input.role,
    exp: now + (input.maxAgeSeconds ?? SESSION_MAX_AGE_SECONDS)
  };

  const encodedPayload = encodeJsonToBase64Url(payload);
  const signature = await sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

function normalizePayload(value: unknown): SessionPayload | null {
  if (!value || typeof value !== "object") return null;
  const payload = value as Record<string, unknown>;
  if (typeof payload.userId !== "number" || !Number.isInteger(payload.userId) || payload.userId <= 0) {
    return null;
  }
  if (typeof payload.role !== "string" || !ROLE_SET.has(payload.role as SessionRole)) {
    return null;
  }
  if (typeof payload.exp !== "number" || !Number.isInteger(payload.exp)) {
    return null;
  }

  return {
    userId: payload.userId,
    role: payload.role as SessionRole,
    exp: payload.exp
  };
}

export async function verifySessionToken(token: string) {
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = await sign(encodedPayload);
  if (!safeEqual(signature, expectedSignature)) {
    return null;
  }

  const parsedPayload = decodeJsonFromBase64Url<unknown>(encodedPayload);
  const payload = normalizePayload(parsedPayload);
  if (!payload) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp <= now) {
    return null;
  }

  return payload;
}

export function roleHomePath(role: SessionRole) {
  if (role === "ADMIN") return "/admin";
  if (role === "BARBER") return "/barbeiro";
  return "/cliente";
}

export function getSessionCookieOptions(
  request?: Request,
  maxAgeSeconds: number = SESSION_MAX_AGE_SECONDS
): SessionCookieOptions {
  let isHttpsRequest = false;
  if (request) {
    try {
      isHttpsRequest = new URL(request.url).protocol === "https:";
    } catch {
      isHttpsRequest = false;
    }
  }

  return {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" || isHttpsRequest,
    maxAge: maxAgeSeconds
  };
}

export function readCookieValue(cookieHeader: string | null | undefined, cookieName: string) {
  if (!cookieHeader) return null;

  const chunks = cookieHeader.split(";");
  for (const chunk of chunks) {
    const [key, ...valueParts] = chunk.trim().split("=");
    if (key === cookieName) {
      return decodeURIComponent(valueParts.join("="));
    }
  }
  return null;
}

export async function sessionFromCookieHeader(cookieHeader: string | null | undefined) {
  const token = readCookieValue(cookieHeader, SESSION_COOKIE_NAME);
  if (!token) return null;
  return verifySessionToken(token);
}
