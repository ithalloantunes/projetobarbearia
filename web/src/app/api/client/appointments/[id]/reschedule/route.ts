import type { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { assertSlotAvailable } from "@/lib/availability";
import { authenticateRequest } from "@/lib/auth-server";
import { mapApiError } from "@/lib/api-error";
import { sendAppointmentNotifications } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

const paramsSchema = z.object({
  id: z.coerce.number().int().positive()
});

const bodySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/)
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request, { roles: ["CLIENT"] });
  if (auth instanceof NextResponse) {
    return auth;
  }

  const params = await context.params;
  const parsedParams = paramsSchema.safeParse(params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: "ID invalido." }, { status: 400 });
  }

  const payload = await request.json();
  const parsedBody = bodySchema.safeParse(payload);
  if (!parsedBody.success) {
    return NextResponse.json({ error: "Dados invalidos." }, { status: 400 });
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

    return NextResponse.json({ appointment: result });
  } catch (error) {
    const apiError = mapApiError(error, "Erro ao remarcar agendamento.");
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}
