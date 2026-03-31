import { beforeEach, describe, expect, it, vi } from "vitest";

const authenticateRequestMock = vi.fn();
const resolveBarberIdForUserMock = vi.fn();
const findUniqueMock = vi.fn();
const updateMock = vi.fn();
const sendAppointmentCanceledNotificationMock = vi.fn();

vi.mock("@/lib/auth-server", () => ({
  authenticateRequest: authenticateRequestMock,
  resolveBarberIdForUser: resolveBarberIdForUserMock
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    appointment: {
      findUnique: findUniqueMock,
      update: updateMock
    }
  }
}));

vi.mock("@/lib/notifications", () => ({
  sendAppointmentCanceledNotification: sendAppointmentCanceledNotificationMock
}));

describe("/api/appointments/[id] PATCH", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("blocks client from editing notes", async () => {
    authenticateRequestMock.mockResolvedValue({
      user: {
        id: 20,
        role: "CLIENT",
        email: "cliente@example.com"
      }
    });

    findUniqueMock.mockResolvedValue({
      id: 100,
      clientId: 20,
      barberId: 2
    });

    const { PATCH } = await import("@/app/api/appointments/[id]/route");
    const response = await PATCH(
      new Request("http://localhost/api/appointments/100", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: "Nao posso editar isso" })
      }),
      { params: Promise.resolve({ id: "100" }) }
    );

    const payload = await response.json();
    expect(response.status).toBe(403);
    expect(payload.error).toContain("nao pode editar observacoes");
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("allows client to cancel own appointment and sends notification", async () => {
    authenticateRequestMock.mockResolvedValue({
      user: {
        id: 20,
        role: "CLIENT",
        email: "cliente@example.com"
      }
    });

    findUniqueMock.mockResolvedValue({
      id: 101,
      clientId: 20,
      barberId: 2
    });

    updateMock.mockResolvedValue({
      id: 101,
      status: "CANCELED",
      client: { id: 20, name: "Cliente" },
      barber: { id: 2, name: "Barbeiro" },
      service: { id: 3, name: "Corte" },
      payment: null
    });

    const { PATCH } = await import("@/app/api/appointments/[id]/route");
    const response = await PATCH(
      new Request("http://localhost/api/appointments/101", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELED" })
      }),
      { params: Promise.resolve({ id: "101" }) }
    );

    const payload = await response.json();
    expect(response.status).toBe(200);
    expect(payload.appointment.id).toBe(101);
    expect(sendAppointmentCanceledNotificationMock).toHaveBeenCalledTimes(1);
  });
});
