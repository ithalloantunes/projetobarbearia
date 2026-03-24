import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateRequest } from "@/lib/auth-server";
import { mapApiError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";

const querySchema = z.object({
  q: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  tier: z.enum(["ALL", "CLASSIC", "SILVER", "GOLD", "BLACK"]).optional()
});

function tierFromSpent(totalSpent: number) {
  if (totalSpent >= 3000) return "BLACK";
  if (totalSpent >= 1600) return "GOLD";
  if (totalSpent >= 700) return "SILVER";
  return "CLASSIC";
}

export async function GET(request: Request) {
  const auth = await authenticateRequest(request, { roles: ["ADMIN"] });
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    q: searchParams.get("q") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    tier: searchParams.get("tier") ?? undefined
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Parametros invalidos." }, { status: 400 });
  }

  const query = parsed.data.q?.trim();

  try {
    const rawClients = await prisma.user.findMany({
      where: {
        role: "CLIENT",
        ...(parsed.data.status ? { status: parsed.data.status } : {}),
        ...(query
          ? {
              OR: [
                { name: { contains: query } },
                { email: { contains: query } },
                { phone: { contains: query } }
              ]
            }
          : {})
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        appointments: {
          select: {
            id: true,
            status: true,
            date: true,
            price: true,
            service: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const clients = rawClients
      .map((client) => {
        const completedAppointments = client.appointments.filter((item) => item.status === "COMPLETED");
        const totalSpent = completedAppointments.reduce((acc, item) => acc + Number(item.price), 0);
        const lastAppointmentAt =
          [...client.appointments]
            .sort((a, b) => b.date.getTime() - a.date.getTime())[0]
            ?.date ?? null;
        const tier = tierFromSpent(totalSpent);

        return {
          ...client,
          stats: {
            totalAppointments: client.appointments.length,
            completedAppointments: completedAppointments.length,
            totalSpent: Number(totalSpent.toFixed(2)),
            lastAppointmentAt,
            tier
          }
        };
      })
      .filter((client) => (parsed.data.tier && parsed.data.tier !== "ALL" ? client.stats.tier === parsed.data.tier : true));

    return NextResponse.json({ clients });
  } catch (error) {
    const apiError = mapApiError(error, "Erro ao listar clientes.");
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}
