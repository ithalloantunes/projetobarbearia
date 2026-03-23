import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth-server";
import { mapApiError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";

function monthStart(base: Date, offset = 0) {
  return new Date(base.getFullYear(), base.getMonth() + offset, 1);
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export async function GET(request: Request) {
  const auth = await authenticateRequest(request, { roles: ["ADMIN"] });
  if (auth instanceof NextResponse) {
    return auth;
  }

  try {
    const now = new Date();
    const currentMonthStart = monthStart(now);
    const nextMonthStart = monthStart(now, 1);
    const seriesStart = monthStart(now, -5);

    const [appointments, services, barbers, monthlyRows] = await Promise.all([
      prisma.appointment.findMany({
        where: {
          date: { gte: currentMonthStart, lt: nextMonthStart }
        },
        include: {
          service: true,
          barber: true
        }
      }),
      prisma.service.findMany(),
      prisma.barber.findMany({ where: { status: "ACTIVE" } }),
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

    const totalAppointments = appointments.length;
    const noShowCount = appointments.filter((item) => item.status === "NO_SHOW").length;
    const canceledCount = appointments.filter((item) => item.status === "CANCELED").length;
    const completedCount = appointments.filter((item) => item.status === "COMPLETED").length;
    const confirmedCount = appointments.filter((item) => item.status === "CONFIRMED").length;
    const revenue = appointments
      .filter((item) => item.status === "CONFIRMED" || item.status === "COMPLETED")
      .reduce((sum, item) => sum + Number(item.price), 0);

    const serviceMap = new Map<number, { name: string; count: number; revenue: number }>();
    for (const service of services) {
      serviceMap.set(service.id, { name: service.name, count: 0, revenue: 0 });
    }
    for (const appointment of appointments) {
      const entry = serviceMap.get(appointment.serviceId);
      if (!entry) continue;
      entry.count += 1;
      if (appointment.status === "CONFIRMED" || appointment.status === "COMPLETED") {
        entry.revenue += Number(appointment.price);
      }
    }

    const barberMap = new Map<number, { name: string; count: number; revenue: number }>();
    for (const barber of barbers) {
      barberMap.set(barber.id, { name: barber.name, count: 0, revenue: 0 });
    }
    for (const appointment of appointments) {
      const entry = barberMap.get(appointment.barberId);
      if (!entry) continue;
      entry.count += 1;
      if (appointment.status === "CONFIRMED" || appointment.status === "COMPLETED") {
        entry.revenue += Number(appointment.price);
      }
    }

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

    return NextResponse.json({
      summary: {
        totalAppointments,
        noShowCount,
        canceledCount,
        completedCount,
        confirmedCount,
        revenue: Number(revenue.toFixed(2)),
        averageTicket: Number((totalAppointments > 0 ? revenue / totalAppointments : 0).toFixed(2))
      },
      topServices: Array.from(serviceMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      teamPerformance: Array.from(barberMap.values()).sort((a, b) => b.revenue - a.revenue),
      monthlyRevenue
    });
  } catch (error) {
    const apiError = mapApiError(error, "Erro ao carregar relatorios.");
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}
