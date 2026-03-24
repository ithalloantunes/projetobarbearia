import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { AppointmentStatus } from "@prisma/client";
import { mapApiError } from "@/lib/api-error";
import { authenticateRequest } from "@/lib/auth-server";

const BILLABLE_STATUSES: AppointmentStatus[] = ["CONFIRMED", "COMPLETED"];
const ACTIVE_STATUSES: AppointmentStatus[] = ["PENDING", "CONFIRMED", "COMPLETED", "NO_SHOW"];

function toMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(date: Date) {
  return date
    .toLocaleDateString("pt-BR", { month: "short" })
    .replace(".", "")
    .toUpperCase();
}

function monthStart(base: Date, monthOffset = 0) {
  return new Date(base.getFullYear(), base.getMonth() + monthOffset, 1);
}

function growth(current: number, previous: number) {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
}

function sumPrice(values: Array<{ price: unknown }>) {
  return values.reduce((acc, item) => acc + Number(item.price), 0);
}

export async function GET(request: Request) {
  const auth = await authenticateRequest(request, { roles: ["ADMIN"] });
  if (auth instanceof NextResponse) {
    return auth;
  }

  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const currentMonthStart = monthStart(now, 0);
    const nextMonthStart = monthStart(now, 1);
    const previousMonthStart = monthStart(now, -1);
    const seriesStart = monthStart(now, -5);

    const [
      currentMonthRevenueRows,
      previousMonthRevenueRows,
      currentMonthClientsCount,
      previousMonthClientsCount,
      todayAppointmentsCount,
      previousMonthAppointmentsCount,
      currentMonthAppointmentsCount,
      revenueSeriesRows,
      upcomingAppointments,
      pendingAppointmentsToday,
      overduePayments
    ] = await Promise.all([
      prisma.appointment.findMany({
        where: {
          date: { gte: currentMonthStart, lt: nextMonthStart },
          status: { in: BILLABLE_STATUSES }
        },
        select: { price: true }
      }),
      prisma.appointment.findMany({
        where: {
          date: { gte: previousMonthStart, lt: currentMonthStart },
          status: { in: BILLABLE_STATUSES }
        },
        select: { price: true }
      }),
      prisma.user.count({
        where: {
          role: "CLIENT",
          createdAt: { gte: currentMonthStart, lt: nextMonthStart }
        }
      }),
      prisma.user.count({
        where: {
          role: "CLIENT",
          createdAt: { gte: previousMonthStart, lt: currentMonthStart }
        }
      }),
      prisma.appointment.count({
        where: {
          date: today,
          status: { in: ACTIVE_STATUSES }
        }
      }),
      prisma.appointment.count({
        where: {
          date: { gte: previousMonthStart, lt: currentMonthStart },
          status: { in: ACTIVE_STATUSES }
        }
      }),
      prisma.appointment.count({
        where: {
          date: { gte: currentMonthStart, lt: nextMonthStart },
          status: { in: ACTIVE_STATUSES }
        }
      }),
      prisma.appointment.findMany({
        where: {
          date: { gte: seriesStart, lt: nextMonthStart },
          status: { in: BILLABLE_STATUSES }
        },
        select: {
          date: true,
          price: true
        }
      }),
      prisma.appointment.findMany({
        where: {
          date: { gte: today },
          status: { in: ["PENDING", "CONFIRMED"] }
        },
        include: {
          client: true,
          barber: true,
          service: true
        },
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
        take: 12
      }),
      prisma.appointment.count({
        where: {
          date: today,
          status: "PENDING"
        }
      }),
      prisma.payment.count({
        where: {
          status: "PENDING"
        }
      })
    ]);

    const revenueMonth = sumPrice(currentMonthRevenueRows);
    const revenuePreviousMonth = sumPrice(previousMonthRevenueRows);

    const revenueByMonth = new Map<string, number>();
    for (const row of revenueSeriesRows) {
      const key = toMonthKey(row.date);
      revenueByMonth.set(key, (revenueByMonth.get(key) ?? 0) + Number(row.price));
    }

    const revenueSeries = Array.from({ length: 6 }, (_, index) => {
      const date = monthStart(now, -5 + index);
      const key = toMonthKey(date);
      return {
        key,
        label: monthLabel(date),
        value: Number((revenueByMonth.get(key) ?? 0).toFixed(2))
      };
    });

    return NextResponse.json({
      summary: {
        revenueMonth: Number(revenueMonth.toFixed(2)),
        newClientsMonth: currentMonthClientsCount,
        appointmentsToday: todayAppointmentsCount,
        pendingToday: pendingAppointmentsToday,
        openPayments: overduePayments
      },
      trends: {
        revenue: Number(growth(revenueMonth, revenuePreviousMonth).toFixed(1)),
        newClients: Number(growth(currentMonthClientsCount, previousMonthClientsCount).toFixed(1)),
        appointments: Number(growth(currentMonthAppointmentsCount, previousMonthAppointmentsCount).toFixed(1))
      },
      revenueSeries,
      upcomingAppointments,
      alerts: [
        ...(pendingAppointmentsToday > 0
          ? [
              {
                level: "warning",
                title: `${pendingAppointmentsToday} atendimentos pendentes hoje`,
                action: "Validar confirmacoes da agenda."
              }
            ]
          : []),
        ...(overduePayments > 0
          ? [
              {
                level: "warning",
                title: `${overduePayments} pagamentos em aberto`,
                action: "Conciliar caixa e registrar baixas."
              }
            ]
          : [])
      ]
    });
  } catch (error) {
    const apiError = mapApiError(error, "Erro ao carregar metricas.");
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}
