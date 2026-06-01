import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateRequest } from "@/lib/auth-server";
import { mapApiError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";

const querySchema = z.object({
  period: z.enum(["7d", "30d", "90d", "12m"]).optional(),
  format: z.enum(["json", "csv"]).optional()
});

function monthStart(base: Date, offset = 0) {
  return new Date(base.getFullYear(), base.getMonth() + offset, 1);
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function startDateFromPeriod(now: Date, period: "7d" | "30d" | "90d" | "12m") {
  const date = new Date(now);
  if (period === "7d") date.setDate(now.getDate() - 7);
  if (period === "30d") date.setDate(now.getDate() - 30);
  if (period === "90d") date.setDate(now.getDate() - 90);
  if (period === "12m") date.setMonth(now.getMonth() - 12);
  return date;
}

function daysBetween(start: Date, end: Date) {
  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
}

function buildCsv(rows: Array<Record<string, string | number>>) {
  if (rows.length === 0) return "id,data,horario,status,cliente,barbeiro,servico,valor\n";
  const headers = Object.keys(rows[0]);
  const body = rows.map((row) =>
    headers
      .map((header) => {
        const value = String(row[header] ?? "");
        const escaped = value.replace(/"/g, '""');
        return `"${escaped}"`;
      })
      .join(",")
  );
  return [headers.join(","), ...body].join("\n");
}

export async function GET(request: Request) {
  const auth = await authenticateRequest(request, { roles: ["ADMIN"] });
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { searchParams } = new URL(request.url);
  const parsedQuery = querySchema.safeParse({
    period: searchParams.get("period") ?? undefined,
    format: searchParams.get("format") ?? undefined
  });
  if (!parsedQuery.success) {
    return NextResponse.json({ error: "Parametros invalidos." }, { status: 400 });
  }

  const period = parsedQuery.data.period ?? "30d";
  const format = parsedQuery.data.format ?? "json";

  try {
    const now = new Date();
    const periodStart = startDateFromPeriod(now, period);
    const seriesStart = monthStart(now, -5);
    const nextMonthStart = monthStart(now, 1);

    const [appointments, monthlyRows] = await Promise.all([
      prisma.appointment.findMany({
        where: {
          date: { gte: periodStart, lte: now }
        },
        include: {
          service: { select: { name: true } },
          barber: { select: { name: true } },
          client: { select: { name: true } }
        }
      }),
      prisma.appointment.findMany({
        where: {
          date: { gte: seriesStart, lt: nextMonthStart },
          status: { in: ["CONFIRMED", "COMPLETED"] }
        },
        select: {
          date: true,
          price: true
        }
      })
    ]);

    const billable = appointments.filter((item) => item.status === "CONFIRMED" || item.status === "COMPLETED");
    const revenue = billable.reduce((sum, item) => sum + Number(item.price), 0);
    const totalAppointments = appointments.length;
    const completedCount = appointments.filter((item) => item.status === "COMPLETED").length;
    const noShowCount = appointments.filter((item) => item.status === "NO_SHOW").length;
    const canceledCount = appointments.filter((item) => item.status === "CANCELED").length;
    const confirmedCount = appointments.filter((item) => item.status === "CONFIRMED").length;
    const averageTicket = totalAppointments > 0 ? revenue / totalAppointments : 0;

    const elapsedDays = daysBetween(periodStart, now);
    const periodDays = period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 365;
    const projectedRevenue = (revenue / elapsedDays) * periodDays;

    const uniqueClients = new Set(appointments.map((item) => item.clientId)).size;
    const clientCounter = new Map<number, number>();
    for (const appointment of appointments) {
      clientCounter.set(appointment.clientId, (clientCounter.get(appointment.clientId) ?? 0) + 1);
    }
    const retainedClients = Array.from(clientCounter.values()).filter((count) => count > 1).length;
    const retentionRate = uniqueClients > 0 ? (retainedClients / uniqueClients) * 100 : 0;

    const serviceMap = new Map<string, { name: string; count: number; revenue: number }>();
    for (const appointment of appointments) {
      const key = appointment.service.name;
      const current = serviceMap.get(key) ?? { name: key, count: 0, revenue: 0 };
      current.count += 1;
      if (appointment.status === "CONFIRMED" || appointment.status === "COMPLETED") {
        current.revenue += Number(appointment.price);
      }
      serviceMap.set(key, current);
    }

    const teamMap = new Map<
      string,
      { name: string; count: number; completed: number; noShow: number; revenue: number }
    >();
    for (const appointment of appointments) {
      const key = appointment.barber.name;
      const current = teamMap.get(key) ?? { name: key, count: 0, completed: 0, noShow: 0, revenue: 0 };
      current.count += 1;
      if (appointment.status === "COMPLETED") current.completed += 1;
      if (appointment.status === "NO_SHOW") current.noShow += 1;
      if (appointment.status === "CONFIRMED" || appointment.status === "COMPLETED") {
        current.revenue += Number(appointment.price);
      }
      teamMap.set(key, current);
    }

    const teamPerformance = Array.from(teamMap.values())
      .map((item) => {
        const quality = item.count > 0 ? item.completed / item.count : 0;
        const rating = Math.max(3.5, Math.min(5, 4.1 + quality * 0.9 - item.noShow * 0.05));
        return {
          name: item.name,
          count: item.count,
          revenue: Number(item.revenue.toFixed(2)),
          rating: Number(rating.toFixed(1)),
          reviews: Math.max(0, item.completed * 3 - item.noShow)
        };
      })
      .sort((a, b) => b.revenue - a.revenue);

    const monthlySeriesMap = new Map<string, number>();
    for (const row of monthlyRows) {
      const key = monthKey(row.date);
      monthlySeriesMap.set(key, (monthlySeriesMap.get(key) ?? 0) + Number(row.price));
    }

    const monthlyRevenue = Array.from({ length: 6 }, (_, index) => {
      const date = monthStart(now, -5 + index);
      const key = monthKey(date);
      const label = date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "").toUpperCase();
      return { key, label, value: Number((monthlySeriesMap.get(key) ?? 0).toFixed(2)) };
    });

    const exportRows = appointments
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .map((appointment) => ({
        id: appointment.id,
        data: appointment.date.toISOString().slice(0, 10),
        horario: appointment.startTime.toISOString().slice(11, 16),
        status: appointment.status,
        cliente: appointment.client.name,
        barbeiro: appointment.barber.name,
        servico: appointment.service.name,
        valor: Number(appointment.price).toFixed(2)
      }));

    if (format === "csv") {
      const csv = buildCsv(exportRows);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="relatorio-${period}.csv"`
        }
      });
    }

    return NextResponse.json({
      period,
      summary: {
        totalAppointments,
        noShowCount,
        canceledCount,
        completedCount,
        confirmedCount,
        revenue: Number(revenue.toFixed(2)),
        projectedRevenue: Number(projectedRevenue.toFixed(2)),
        averageTicket: Number(averageTicket.toFixed(2)),
        retentionRate: Number(retentionRate.toFixed(1))
      },
      topServices: Array.from(serviceMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 6)
        .map((item) => ({
          ...item,
          revenue: Number(item.revenue.toFixed(2))
        })),
      teamPerformance,
      monthlyRevenue,
      exportRowsCount: exportRows.length
    });
  } catch (error) {
    const apiError = mapApiError(error, "Erro ao carregar relatorios.");
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}
