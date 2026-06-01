import { beforeEach, describe, expect, it, vi } from "vitest";

const findUniqueMock = vi.fn();
const userUpdateMock = vi.fn();
const tokenUpdateMock = vi.fn();
const tokenDeleteManyMock = vi.fn();
const transactionMock = vi.fn();
const consumeFixedWindowRateLimitMock = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    emailVerificationToken: {
      findUnique: findUniqueMock,
      update: tokenUpdateMock,
      deleteMany: tokenDeleteManyMock
    },
    user: {
      update: userUpdateMock
    },
    $transaction: transactionMock
  }
}));

vi.mock("@/lib/rate-limit", () => ({
  consumeFixedWindowRateLimit: consumeFixedWindowRateLimitMock,
  getRequestIp: vi.fn(() => "127.0.0.1")
}));

describe("POST /api/auth/verify-email", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consumeFixedWindowRateLimitMock.mockReturnValue({
      allowed: true,
      retryAfterSeconds: 0
    });
    userUpdateMock.mockResolvedValue({});
    tokenUpdateMock.mockResolvedValue({});
    tokenDeleteManyMock.mockResolvedValue({ count: 1 });
    transactionMock.mockResolvedValue([]);
  });

  it("returns success and activates user for a valid token", async () => {
    findUniqueMock.mockResolvedValue({
      id: 10,
      userId: 1,
      usedAt: null,
      expiresAt: new Date(Date.now() + 60_000)
    });

    const { POST } = await import("@/app/api/auth/verify-email/route");
    const request = new Request("http://localhost/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: "a".repeat(32) })
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(transactionMock).toHaveBeenCalledTimes(1);
    expect(userUpdateMock).toHaveBeenCalledTimes(1);
    expect(tokenUpdateMock).toHaveBeenCalledTimes(1);
    expect(tokenDeleteManyMock).toHaveBeenCalledTimes(1);
  });

  it("rejects expired token", async () => {
    findUniqueMock.mockResolvedValue({
      id: 11,
      userId: 2,
      usedAt: null,
      expiresAt: new Date(Date.now() - 60_000)
    });

    const { POST } = await import("@/app/api/auth/verify-email/route");
    const request = new Request("http://localhost/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: "b".repeat(32) })
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toContain("invalido");
  });
});
