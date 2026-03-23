import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateRequest } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { mapApiError } from "@/lib/api-error";

const querySchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELED", "NO_SHOW"]).optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
});

export async function GET(request: Request) {
  const auth = await authenticateRequest(request, { roles: ["CLIENT"] });
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    status: searchParams.get("status") ?? undefined,
    dateFrom: searchParams.get("dateFrom") ?? undefined,
    dateTo: searchParams.get("dateTo") ?? undefined
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Parametros invalidos." }, { status: 400 });
  }

  const { status, dateFrom, dateTo } = parsed.data;

  if (dateFrom && dateTo && dateFrom > dateTo) {
    return NextResponse.json({ error: "dateFrom nao pode ser maior que dateTo." }, { status: 400 });
  }

  const where: {
    clientId: number;
    status?: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELED" | "NO_SHOW";
    date?: { gte?: Date; lte?: Date };
  } = {
    clientId: auth.user.id
  };

  if (status) {
    where.status = status;
  }

  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) where.date.gte = new Date(`${dateFrom}T00:00:00`);
    if (dateTo) where.date.lte = new Date(`${dateTo}T00:00:00`);
  }

  try {
    const [appointments, summaryRaw] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          barber: true,
          service: true,
          payment: true
        },
        orderBy: [{ date: "desc" }, { startTime: "desc" }]
      }),
      prisma.appointment.groupBy({
        by: ["status"],
        where: { clientId: auth.user.id },
        _count: { _all: true }
      })
    ]);

    const summary = {
      total: appointments.length,
      pending: 0,
      confirmed: 0,
      completed: 0,
      canceled: 0,
      noShow: 0
    };

    for (const row of summaryRaw) {
      if (row.status === "PENDING") summary.pending = row._count._all;
      if (row.status === "CONFIRMED") summary.confirmed = row._count._all;
      if (row.status === "COMPLETED") summary.completed = row._count._all;
      if (row.status === "CANCELED") summary.canceled = row._count._all;
      if (row.status === "NO_SHOW") summary.noShow = row._count._all;
    }

    return NextResponse.json({ appointments, summary });
  } catch (error) {
    const apiError = mapApiError(error, "Erro ao carregar agendamentos do cliente.");
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}
