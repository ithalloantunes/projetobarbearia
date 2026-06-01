import { beforeEach, describe, expect, it, vi } from "vitest";

const authenticateRequestMock = vi.fn();
const transactionMock = vi.fn();
const assertSlotAvailableMock = vi.fn();
const sendAppointmentNotificationsMock = vi.fn();

vi.mock("@/lib/auth-server", () => ({
  authenticateRequest: authenticateRequestMock
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: transactionMock
  }
}));

vi.mock("@/lib/availability", () => ({
  assertSlotAvailable: assertSlotAvailableMock
}));

vi.mock("@/lib/notifications", () => ({
  sendAppointmentNotifications: sendAppointmentNotificationsMock
}));

describe("/api/client/appointments/[id]/reschedule POST", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid payload", async () => {
    authenticateRequestMock.mockResolvedValue({
      user: {
        id: 50,
        role: "CLIENT",
        email: "cliente@example.com"
      }
    });

    const { POST } = await import(
      "@/app/api/client/appointments/[id]/reschedule/route"
    );
    const response = await POST(
      new Request("http://localhost/api/client/appointments/1/reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: "invalid", time: "12:00" })
      }),
      { params: Promise.resolve({ id: "1" }) }
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toContain("Dados invalidos");
  });

  it("reschedules active appointment for owner client", async () => {
    authenticateRequestMock.mockResolvedValue({
      user: {
        id: 50,
        role: "CLIENT",
        email: "cliente@example.com"
      }
    });

    const txMock = {
      appointment: {
        findUnique: vi.fn().mockResolvedValue({
          id: 201,
          clientId: 50,
          barberId: 2,
          serviceId: 3,
          status: "CONFIRMED",
          client: { id: 50, name: "Cliente" },
          barber: { id: 2, name: "Barbeiro" },
          service: { id: 3, name: "Corte" }
        }),
        update: vi.fn().mockResolvedValue({
          id: 201,
          clientId: 50,
          barberId: 2,
          serviceId: 3,
          status: "CONFIRMED",
          client: { id: 50, name: "Cliente" },
          barber: { id: 2, name: "Barbeiro" },
          service: { id: 3, name: "Corte" }
        })
      }
    };

    transactionMock.mockImplementation(async (callback: (tx: unknown) => unknown) => callback(txMock));
    assertSlotAvailableMock.mockResolvedValue({
      startTime: new Date("1970-01-01T14:00:00"),
      endTime: new Date("1970-01-01T14:45:00")
    });

    const { POST } = await import(
      "@/app/api/client/appointments/[id]/reschedule/route"
    );
    const response = await POST(
      new Request("http://localhost/api/client/appointments/201/reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: "2026-05-20", time: "14:00" })
      }),
      { params: Promise.resolve({ id: "201" }) }
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.appointment.id).toBe(201);
    expect(sendAppointmentNotificationsMock).toHaveBeenCalledTimes(1);
  });
});
