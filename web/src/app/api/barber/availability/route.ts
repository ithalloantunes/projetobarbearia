import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateRequest, resolveBarberIdForUser } from "@/lib/auth-server";
import { mapApiError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import { buildTimeDate, parseTimeToMinutes } from "@/lib/time";

const querySchema = z.object({
  barberId: z.coerce.number().int().positive().optional()
});

const rangeSchema = z.object({
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/)
});

const updateSchema = z.object({
  barberId: z.number().int().positive().optional(),
  dayOfWeek: z.number().int().min(0).max(6),
  ranges: z.array(rangeSchema).max(4)
});

export async function GET(request: Request) {
  const auth = await authenticateRequest(request, { roles: ["BARBER", "ADMIN"] });
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    barberId: searchParams.get("barberId") ?? undefined
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Parametros invalidos." }, { status: 400 });
  }

  try {
    let effectiveBarberId: number | null = parsed.data.barberId ?? null;
    if (auth.user.role === "BARBER") {
      effectiveBarberId = await resolveBarberIdForUser({ id: auth.user.id, email: auth.user.email });
      if (!effectiveBarberId) {
        return NextResponse.json({ error: "Perfil de barbeiro nao encontrado." }, { status: 403 });
      }
    }

    if (!effectiveBarberId) {
      return NextResponse.json({ error: "Informe barberId." }, { status: 400 });
    }

    const availability = await prisma.availability.findMany({
      where: { barberId: effectiveBarberId },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }]
    });

    return NextResponse.json({ availability, barberId: effectiveBarberId });
  } catch (error) {
    const apiError = mapApiError(error, "Erro ao carregar disponibilidade.");
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}

export async function PUT(request: Request) {
  const auth = await authenticateRequest(request, { roles: ["BARBER", "ADMIN"] });
  if (auth instanceof NextResponse) {
    return auth;
  }

  const payload = await request.json();
  const parsed = updateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados invalidos.", details: parsed.error.flatten() }, { status: 400 });
  }

  const { dayOfWeek, ranges } = parsed.data;

  try {
    let effectiveBarberId: number | null = parsed.data.barberId ?? null;
    if (auth.user.role === "BARBER") {
      effectiveBarberId = await resolveBarberIdForUser({ id: auth.user.id, email: auth.user.email });
      if (!effectiveBarberId) {
        return NextResponse.json({ error: "Perfil de barbeiro nao encontrado." }, { status: 403 });
      }
    }
    if (!effectiveBarberId) {
      return NextResponse.json({ error: "Informe barberId." }, { status: 400 });
    }

    for (const range of ranges) {
      const start = parseTimeToMinutes(range.startTime);
      const end = parseTimeToMinutes(range.endTime);
      if (end <= start) {
        return NextResponse.json(
          { error: "Intervalo invalido: horario final deve ser maior que inicial." },
          { status: 400 }
        );
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.availability.deleteMany({
        where: {
          barberId: effectiveBarberId,
          dayOfWeek
        }
      });

      if (ranges.length > 0) {
        await tx.availability.createMany({
          data: ranges.map((range) => ({
            barberId: effectiveBarberId,
            dayOfWeek,
            startTime: buildTimeDate(range.startTime),
            endTime: buildTimeDate(range.endTime)
          })),
          skipDuplicates: true
        });
      }
    });

    const availability = await prisma.availability.findMany({
      where: { barberId: effectiveBarberId },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }]
    });

    return NextResponse.json({ availability, barberId: effectiveBarberId });
  } catch (error) {
    const apiError = mapApiError(error, "Erro ao atualizar disponibilidade.");
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}
