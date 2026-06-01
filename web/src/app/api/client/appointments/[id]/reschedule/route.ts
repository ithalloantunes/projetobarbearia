import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { assertSlotAvailable } from "@/lib/availability";
import { authenticateRequest } from "@/lib/auth-server";
import { mapApiError } from "@/lib/api-error";
import { sendAppointmentNotifications } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import {
  getRequestLogContext,
  logRequestFailure,
  logRequestStart,
  logRequestSuccess
} from "@/lib/logger";

const paramsSchema = z.object({
  id: z.coerce.number().int().positive()
});

const bodySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/)
});

function withRequestId(response: NextResponse, requestId: string) {
  response.headers.set("x-request-id", requestId);
  return response;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const startedAt = Date.now();
  const logContext = getRequestLogContext(request);
  logRequestStart(logContext, { route: "api.client.appointments.reschedule" });

  const auth = await authenticateRequest(request, { roles: ["CLIENT"] });
  if (auth instanceof NextResponse) {
    const status = auth.status;
    if (status >= 400) {
      logRequestFailure(
        logContext,
        { status, durationMs: Date.now() - startedAt },
        { route: "api.client.appointments.reschedule" }
      );
    }
    return withRequestId(auth, logContext.requestId);
  }

  const params = await context.params;
  const parsedParams = paramsSchema.safeParse(params);
  if (!parsedParams.success) {
    const status = 400;
    logRequestFailure(
      logContext,
      { status, durationMs: Date.now() - startedAt },
      { route: "api.client.appointments.reschedule", reason: "invalid_id" }
    );
    return withRequestId(NextResponse.json({ error: "ID invalido." }, { status }), logContext.requestId);
  }

  const payload = await request.json();
  const parsedBody = bodySchema.safeParse(payload);
  if (!parsedBody.success) {
    const status = 400;
    logRequestFailure(
      logContext,
      { status, durationMs: Date.now() - startedAt },
      { route: "api.client.appointments.reschedule", reason: "invalid_payload" }
    );
    return withRequestId(NextResponse.json({ error: "Dados invalidos." }, { status }), logContext.requestId);
  }

  const { date, time } = parsedBody.data;

  try {
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const current = await tx.appointment.findUnique({
        where: { id: parsedParams.data.id },
        include: {
          client: true,
          barber: true,
          service: true
        }
      });

      if (!current) {
        throw new Error("Agendamento nao encontrado.");
      }

      if (current.clientId !== auth.user.id) {
        throw new Error("Sem permissao para remarcar este agendamento.");
      }

      if (current.status === "COMPLETED" || current.status === "CANCELED") {
        throw new Error("Apenas agendamentos ativos podem ser remarcados.");
      }

      const slot = await assertSlotAvailable(
        {
          barberId: current.barberId,
          serviceId: current.serviceId,
          date,
          time,
          excludeAppointmentId: current.id
        },
        tx
      );

      const updated = await tx.appointment.update({
        where: { id: current.id },
        data: {
          date: new Date(`${date}T00:00:00`),
          startTime: slot.startTime,
          endTime: slot.endTime,
          status: "CONFIRMED"
        },
        include: {
          client: true,
          barber: true,
          service: true
        }
      });

      return updated;
    });

    await sendAppointmentNotifications({
      appointment: result,
      client: result.client,
      barber: result.barber,
      service: result.service,
      mode: "rescheduled"
    });

    const status = 200;
    logRequestSuccess(
      logContext,
      { status, durationMs: Date.now() - startedAt },
      { route: "api.client.appointments.reschedule", appointmentId: result.id }
    );
    return withRequestId(NextResponse.json({ appointment: result }), logContext.requestId);
  } catch (error) {
    const apiError = mapApiError(error, "Erro ao remarcar agendamento.");
    logRequestFailure(
      logContext,
      { status: apiError.status, durationMs: Date.now() - startedAt, error },
      { route: "api.client.appointments.reschedule" }
    );
    return withRequestId(
      NextResponse.json({ error: apiError.message }, { status: apiError.status }),
      logContext.requestId
    );
  }
}
