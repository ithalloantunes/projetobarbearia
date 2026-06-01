import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateRequest } from "@/lib/auth-server";
import { mapApiError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  appointmentId: z.number().int().positive(),
  method: z.string().min(2).max(40),
  status: z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]).default("PAID")
});

export async function GET(request: Request) {
  const auth = await authenticateRequest(request, { roles: ["ADMIN"] });
  if (auth instanceof NextResponse) {
    return auth;
  }

  try {
    const payments = await prisma.payment.findMany({
      include: {
        appointment: {
          include: {
            client: true,
            barber: true,
            service: true
          }
        }
      },
      orderBy: { id: "desc" },
      take: 100
    });

    return NextResponse.json({ payments });
  } catch (error) {
    const apiError = mapApiError(error, "Erro ao listar pagamentos.");
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}

export async function POST(request: Request) {
  const auth = await authenticateRequest(request, { roles: ["ADMIN"] });
  if (auth instanceof NextResponse) {
    return auth;
  }

  const payload = await request.json();
  const parsed = createSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados invalidos.", details: parsed.error.flatten() }, { status: 400 });
  }

  const { appointmentId, method, status } = parsed.data;

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId }
    });
    if (!appointment) {
      return NextResponse.json({ error: "Agendamento nao encontrado." }, { status: 404 });
    }

    const payment = await prisma.payment.upsert({
      where: { appointmentId },
      create: {
        appointmentId,
        amount: appointment.price,
        method,
        status,
        paidAt: status === "PAID" ? new Date() : null
      },
      update: {
        method,
        status,
        paidAt: status === "PAID" ? new Date() : null
      },
      include: {
        appointment: {
          include: {
            client: true,
            barber: true,
            service: true
          }
        }
      }
    });

    return NextResponse.json({ payment });
  } catch (error) {
    const apiError = mapApiError(error, "Erro ao registrar pagamento.");
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}
