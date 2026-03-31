import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createSessionToken,
  getSessionCookieOptions,
  readCookieValue,
  roleHomePath,
  verifySessionToken
} from "@/lib/auth-session";

describe("auth session", () => {
  beforeEach(() => {
    vi.stubEnv("SESSION_SECRET", "test-session-secret");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("creates and verifies signed tokens", async () => {
    const token = await createSessionToken({ userId: 123, role: "CLIENT", maxAgeSeconds: 60 });
    const payload = await verifySessionToken(token);

    expect(payload).not.toBeNull();
    expect(payload?.userId).toBe(123);
    expect(payload?.role).toBe("CLIENT");
  });

  it("rejects tampered tokens", async () => {
    const token = await createSessionToken({ userId: 10, role: "ADMIN", maxAgeSeconds: 60 });
    const tampered = `${token}invalid`;
    const payload = await verifySessionToken(tampered);
    expect(payload).toBeNull();
  });

  it("extracts cookie values from header", () => {
    const header = "foo=bar; barbersaas_session=session-token; path=/";
    expect(readCookieValue(header, "barbersaas_session")).toBe("session-token");
    expect(readCookieValue(header, "missing")).toBeNull();
  });

  it("resolves role home paths", () => {
    expect(roleHomePath("ADMIN")).toBe("/admin");
    expect(roleHomePath("BARBER")).toBe("/barbeiro");
    expect(roleHomePath("CLIENT")).toBe("/cliente");
  });

  it("uses secure cookies in production and https requests", () => {
    vi.stubEnv("NODE_ENV", "development");
    const httpOptions = getSessionCookieOptions(new Request("http://localhost:3000"));
    const httpsOptions = getSessionCookieOptions(new Request("https://example.com"));

    expect(httpOptions.secure).toBe(false);
    expect(httpsOptions.secure).toBe(true);

    vi.stubEnv("NODE_ENV", "production");
    const prodOptions = getSessionCookieOptions(new Request("http://localhost:3000"));
    expect(prodOptions.secure).toBe(true);
  });
});
