import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { buildTimeDate, minutesToTime, parseTimeToMinutes } from "@/lib/time";
import { mapApiError } from "@/lib/api-error";
import { authenticateRequest, resolveBarberIdForUser } from "@/lib/auth-server";

const querySchema = z.object({
  barberId: z.coerce.number().int().positive().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});

const createSchema = z.object({
  barberId: z.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  durationMinutes: z.number().int().positive().max(720).optional(),
  reason: z.string().max(200).optional()
});

export async function GET(request: Request) {
  const auth = await authenticateRequest(request, { roles: ["BARBER", "ADMIN"] });
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    barberId: searchParams.get("barberId") ?? undefined,
    date: searchParams.get("date") ?? undefined,
    dateFrom: searchParams.get("dateFrom") ?? undefined,
    dateTo: searchParams.get("dateTo") ?? undefined
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Parametros invalidos." }, { status: 400 });
  }

  const { barberId, date, dateFrom, dateTo } = parsed.data;
  if (dateFrom && dateTo && dateFrom > dateTo) {
    return NextResponse.json(
      { error: "dateFrom nao pode ser maior que dateTo." },
      { status: 400 }
    );
  }

  const where: {
    barberId?: number;
    date?: Date | { gte?: Date; lte?: Date };
  } = {};

  if (auth.user.role === "ADMIN") {
    if (barberId) where.barberId = barberId;
  } else {
    const ownBarberId = await resolveBarberIdForUser({ id: auth.user.id, email: auth.user.email });
    if (!ownBarberId) {
      return NextResponse.json({ error: "Perfil de barbeiro nao encontrado." }, { status: 403 });
    }
    where.barberId = ownBarberId;
  }

  if (date) {
    where.date = new Date(`${date}T00:00:00`);
  } else if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) where.date.gte = new Date(`${dateFrom}T00:00:00`);
    if (dateTo) where.date.lte = new Date(`${dateTo}T00:00:00`);
  }

  try {
    const blocks = await prisma.block.findMany({
      where,
      include: {
        barber: true
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }]
    });

    return NextResponse.json({ blocks });
  } catch (error) {
    const apiError = mapApiError(error, "Erro ao listar bloqueios.");
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}

export async function POST(request: Request) {
  const auth = await authenticateRequest(request, { roles: ["BARBER", "ADMIN"] });
  if (auth instanceof NextResponse) {
    return auth;
  }

  const payload = await request.json();
  const parsed = createSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados invalidos", details: parsed.error.flatten() }, { status: 400 });
  }

  const { barberId, date, time, endTime, durationMinutes, reason } = parsed.data;
  let effectiveBarberId = barberId;

  if (auth.user.role === "BARBER") {
    const ownBarberId = await resolveBarberIdForUser({ id: auth.user.id, email: auth.user.email });
    if (!ownBarberId) {
      return NextResponse.json({ error: "Perfil de barbeiro nao encontrado." }, { status: 403 });
    }
    effectiveBarberId = ownBarberId;
  }

  const startMinutes = parseTimeToMinutes(time);
  const fallbackDuration = durationMinutes ?? 30;
  const computedEnd = endTime ?? minutesToTime(startMinutes + fallbackDuration);
  const endMinutes = parseTimeToMinutes(computedEnd);

  if (endMinutes <= startMinutes) {
    return NextResponse.json(
      { error: "O horario final precisa ser maior que o inicial." },
      { status: 400 }
    );
  }

  try {
    const [barber, conflict] = await Promise.all([
      prisma.barber.findUnique({ where: { id: effectiveBarberId } }),
      prisma.appointment.findFirst({
        where: {
          barberId: effectiveBarberId,
          date: new Date(`${date}T00:00:00`),
          status: { in: ["PENDING", "CONFIRMED", "COMPLETED", "NO_SHOW"] },
          startTime: { lt: buildTimeDate(computedEnd) },
          endTime: { gt: buildTimeDate(time) }
        }
      })
    ]);

    if (!barber) {
      return NextResponse.json({ error: "Barbeiro nao encontrado." }, { status: 404 });
    }
    if (conflict) {
      return NextResponse.json(
        { error: "Existe um agendamento neste intervalo." },
        { status: 400 }
      );
    }

    const block = await prisma.block.create({
      data: {
        barberId: effectiveBarberId,
        date: new Date(`${date}T00:00:00`),
        startTime: buildTimeDate(time),
        endTime: buildTimeDate(computedEnd),
        reason
      },
      include: { barber: true }
    });

    return NextResponse.json({ block }, { status: 201 });
  } catch (error) {
    const apiError = mapApiError(error, "Erro ao criar bloqueio.");
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}
