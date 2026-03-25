import { beforeEach, describe, expect, it, vi } from "vitest";

const authenticateRequestMock = vi.fn();
const resolveBarberIdForUserMock = vi.fn();
const findManyMock = vi.fn();
const transactionMock = vi.fn();
const assertSlotAvailableMock = vi.fn();
const sendAppointmentNotificationsMock = vi.fn();

vi.mock("@/lib/auth-server", () => ({
  authenticateRequest: authenticateRequestMock,
  resolveBarberIdForUser: resolveBarberIdForUserMock
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    appointment: {
      findMany: findManyMock
    },
    $transaction: transactionMock
  }
}));

vi.mock("@/lib/availability", () => ({
  assertSlotAvailable: assertSlotAvailableMock
}));

vi.mock("@/lib/notifications", () => ({
  sendAppointmentNotifications: sendAppointmentNotificationsMock
}));

describe("/api/appointments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("blocks admin creation without clientId/clientEmail", async () => {
    authenticateRequestMock.mockResolvedValue({
      user: {
        id: 1,
        role: "ADMIN",
        email: "admin@example.com"
      }
    });

    const { POST } = await import("@/app/api/appointments/route");
    const request = new Request("http://localhost/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        barberId: 2,
        serviceId: 3,
        date: "2026-05-01",
        time: "10:00"
      })
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toContain("Informe clientId ou clientEmail");
  });

  it("creates appointment for authenticated client", async () => {
    authenticateRequestMock.mockResolvedValue({
      user: {
        id: 7,
        role: "CLIENT",
        email: "cliente@example.com"
      }
    });

    const txMock = {
      user: {
        findUnique: vi.fn().mockResolvedValue({
          id: 7,
          role: "CLIENT",
          name: "Cliente Teste",
          email: "cliente@example.com"
        })
      },
      barber: {
        findUnique: vi.fn().mockResolvedValue({
          id: 2,
          name: "Barbeiro Teste"
        })
      },
      service: {
        findUnique: vi.fn().mockResolvedValue({
          id: 3,
          name: "Corte",
          price: "45.00"
        })
      },
      appointment: {
        create: vi.fn().mockResolvedValue({
          id: 99,
          clientId: 7,
          barberId: 2,
          serviceId: 3
        })
      }
    };

    transactionMock.mockImplementation(async (callback: (tx: unknown) => unknown) => callback(txMock));
    assertSlotAvailableMock.mockResolvedValue({
      startTime: new Date("1970-01-01T10:00:00"),
      endTime: new Date("1970-01-01T10:45:00")
    });

    const { POST } = await import("@/app/api/appointments/route");
    const request = new Request("http://localhost/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        barberId: 2,
        serviceId: 3,
        date: "2026-05-01",
        time: "10:00"
      })
    });

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.appointment.id).toBe(99);
    expect(sendAppointmentNotificationsMock).toHaveBeenCalledTimes(1);
  });

  it("rejects invalid date range query", async () => {
    authenticateRequestMock.mockResolvedValue({
      user: {
        id: 1,
        role: "ADMIN",
        email: "admin@example.com"
      }
    });

    const { GET } = await import("@/app/api/appointments/route");
    const response = await GET(
      new Request(
        "http://localhost/api/appointments?dateFrom=2026-05-10&dateTo=2026-05-01"
      )
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toContain("dateFrom");
    expect(findManyMock).not.toHaveBeenCalled();
  });
});
