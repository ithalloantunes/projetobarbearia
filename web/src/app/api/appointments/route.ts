import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { assertSlotAvailable } from "@/lib/availability";
import { sendAppointmentNotifications } from "@/lib/notifications";

const createSchema = z
  .object({
    clientId: z.number().int().positive().optional(),
    clientEmail: z.string().email().optional(),
    barberId: z.number().int().positive(),
    serviceId: z.number().int().positive(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    time: z.string().regex(/^\d{2}:\d{2}$/),
    notes: z.string().optional()
  })
  .refine((data) => Boolean(data.clientId || data.clientEmail), {
    message: "Informe clientId ou clientEmail.",
    path: ["clientId"]
  });

const querySchema = z.object({
  barberId: z.coerce.number().int().positive().optional(),
  clientId: z.coerce.number().int().positive().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    barberId: searchParams.get("barberId") ?? undefined,
    clientId: searchParams.get("clientId") ?? undefined,
    date: searchParams.get("date") ?? undefined
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 });
  }

  const where: Record<string, unknown> = {};
  if (parsed.data.barberId) where.barberId = parsed.data.barberId;
  if (parsed.data.clientId) where.clientId = parsed.data.clientId;
  if (parsed.data.date) where.date = new Date(`${parsed.data.date}T00:00:00`);

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      barber: true,
      client: true,
      service: true
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }]
  });

  return NextResponse.json({ appointments });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = createSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
  }

  const { clientId, clientEmail, barberId, serviceId, date, time, notes } = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const [client, barber, service] = await Promise.all([
        clientId
          ? tx.user.findUnique({ where: { id: clientId } })
          : tx.user.findUnique({ where: { email: clientEmail ?? undefined } }),
        tx.barber.findUnique({ where: { id: barberId } }),
        tx.service.findUnique({ where: { id: serviceId } })
      ]);

      if (!client || !barber || !service) {
        throw new Error("Dados não encontrados.");
      }
      if (client.role !== "CLIENT") {
        throw new Error("Cliente inválido.");
      }

      const { startTime, endTime } = await assertSlotAvailable(
        {
          barberId,
          serviceId,
          date,
          time
        },
        tx
      );

      const appointment = await tx.appointment.create({
        data: {
          clientId: client.id,
          barberId,
          serviceId,
          date: new Date(`${date}T00:00:00`),
          startTime,
          endTime,
          status: "CONFIRMED",
          notes,
          price: service.price
        }
      });

      return { appointment, client, barber, service };
    });

    await sendAppointmentNotifications({
      appointment: result.appointment,
      client: result.client,
      barber: result.barber,
      service: result.service
    });

    return NextResponse.json({ appointment: result.appointment }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao criar agendamento";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
