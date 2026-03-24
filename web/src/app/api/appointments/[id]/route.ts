import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { mapApiError } from "@/lib/api-error";
import { authenticateRequest, resolveBarberIdForUser } from "@/lib/auth-server";
import { sendAppointmentCanceledNotification } from "@/lib/notifications";

const paramsSchema = z.object({
  id: z.coerce.number().int().positive()
});

const updateSchema = z
  .object({
    status: z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELED", "NO_SHOW"]).optional(),
    notes: z.string().max(500).optional()
  })
  .refine((value) => value.status !== undefined || value.notes !== undefined, {
    message: "Informe ao menos um campo para atualizar."
  });

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request, { roles: ["CLIENT", "BARBER", "ADMIN"] });
  if (auth instanceof NextResponse) {
    return auth;
  }

  const params = await context.params;
  const parsedParams = paramsSchema.safeParse(params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: "ID invalido." }, { status: 400 });
  }

  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: parsedParams.data.id },
      include: {
        client: true,
        barber: true,
        service: true,
        payment: true
      }
    });

    if (!appointment) {
      return NextResponse.json({ error: "Agendamento nao encontrado." }, { status: 404 });
    }

    if (auth.user.role === "CLIENT" && appointment.clientId !== auth.user.id) {
      return NextResponse.json({ error: "Sem permissao para acessar este agendamento." }, { status: 403 });
    }

    if (auth.user.role === "BARBER") {
      const ownBarberId = await resolveBarberIdForUser({ id: auth.user.id, email: auth.user.email });
      if (!ownBarberId || appointment.barberId !== ownBarberId) {
        return NextResponse.json({ error: "Sem permissao para acessar este agendamento." }, { status: 403 });
      }
    }

    return NextResponse.json({ appointment });
  } catch (error) {
    const apiError = mapApiError(error, "Erro ao carregar agendamento.");
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request, { roles: ["CLIENT", "BARBER", "ADMIN"] });
  if (auth instanceof NextResponse) {
    return auth;
  }

  const params = await context.params;
  const parsedParams = paramsSchema.safeParse(params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: "ID invalido." }, { status: 400 });
  }

  const body = await request.json();
  const parsedBody = updateSchema.safeParse(body);
  if (!parsedBody.success) {
    return NextResponse.json(
      { error: "Payload invalido.", details: parsedBody.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const current = await prisma.appointment.findUnique({
      where: { id: parsedParams.data.id },
      select: {
        id: true,
        clientId: true,
        barberId: true
      }
    });

    if (!current) {
      return NextResponse.json({ error: "Agendamento nao encontrado." }, { status: 404 });
    }

    if (auth.user.role === "CLIENT") {
      if (current.clientId !== auth.user.id) {
        return NextResponse.json({ error: "Sem permissao para alterar este agendamento." }, { status: 403 });
      }
      if (parsedBody.data.notes) {
        return NextResponse.json({ error: "Cliente nao pode editar observacoes do atendimento." }, { status: 403 });
      }
      if (parsedBody.data.status !== "CANCELED") {
        return NextResponse.json(
          { error: "Cliente pode apenas cancelar o proprio agendamento." },
          { status: 403 }
        );
      }
    }

    if (auth.user.role === "BARBER") {
      const ownBarberId = await resolveBarberIdForUser({ id: auth.user.id, email: auth.user.email });
      if (!ownBarberId || current.barberId !== ownBarberId) {
        return NextResponse.json({ error: "Sem permissao para alterar este agendamento." }, { status: 403 });
      }
    }

    const appointment = await prisma.appointment.update({
      where: { id: parsedParams.data.id },
      data: {
        ...(parsedBody.data.status ? { status: parsedBody.data.status } : {}),
        ...(parsedBody.data.notes !== undefined ? { notes: parsedBody.data.notes } : {})
      },
      include: {
        client: true,
        barber: true,
        service: true,
        payment: true
      }
    });

    if (parsedBody.data.status === "CANCELED") {
      await sendAppointmentCanceledNotification({
        appointment,
        client: appointment.client,
        barber: appointment.barber,
        service: appointment.service
      });
    }

    return NextResponse.json({ appointment });
  } catch (error) {
    const apiError = mapApiError(error, "Erro ao atualizar status do agendamento.");
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}
