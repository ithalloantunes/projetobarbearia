import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { mapApiError } from "@/lib/api-error";
import { authenticateRequest, resolveBarberIdForUser } from "@/lib/auth-server";
import { sendAppointmentCanceledNotification } from "@/lib/notifications";
import {
  getRequestLogContext,
  logRequestFailure,
  logRequestStart,
  logRequestSuccess
} from "@/lib/logger";

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

function withRequestId(response: NextResponse, requestId: string) {
  response.headers.set("x-request-id", requestId);
  return response;
}

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
  const startedAt = Date.now();
  const logContext = getRequestLogContext(request);
  logRequestStart(logContext, { route: "api.appointments.patch" });

  const auth = await authenticateRequest(request, { roles: ["CLIENT", "BARBER", "ADMIN"] });
  if (auth instanceof NextResponse) {
    const status = auth.status;
    if (status >= 400) {
      logRequestFailure(
        logContext,
        { status, durationMs: Date.now() - startedAt },
        { route: "api.appointments.patch" }
      );
    }
    return withRequestId(auth, logContext.requestId);
  }

  const params = await context.params;
  const parsedParams = paramsSchema.safeParse(params);
  if (!parsedParams.success) {
    const status = 400;
    logRequestFailure(
      logContext,
      { status, durationMs: Date.now() - startedAt },
      { route: "api.appointments.patch", reason: "invalid_id" }
    );
    return withRequestId(NextResponse.json({ error: "ID invalido." }, { status }), logContext.requestId);
  }

  const body = await request.json();
  const parsedBody = updateSchema.safeParse(body);
  if (!parsedBody.success) {
    const status = 400;
    logRequestFailure(
      logContext,
      { status, durationMs: Date.now() - startedAt },
      { route: "api.appointments.patch", reason: "invalid_payload" }
    );
    return withRequestId(NextResponse.json(
      { error: "Payload invalido.", details: parsedBody.error.flatten() },
      { status: 400 }
    ), logContext.requestId);
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
      const status = 404;
      logRequestFailure(
        logContext,
        { status, durationMs: Date.now() - startedAt },
        { route: "api.appointments.patch", reason: "not_found" }
      );
      return withRequestId(
        NextResponse.json({ error: "Agendamento nao encontrado." }, { status }),
        logContext.requestId
      );
    }

    if (auth.user.role === "CLIENT") {
      if (current.clientId !== auth.user.id) {
        const status = 403;
        logRequestFailure(
          logContext,
          { status, durationMs: Date.now() - startedAt },
          { route: "api.appointments.patch", reason: "client_forbidden" }
        );
        return withRequestId(
          NextResponse.json({ error: "Sem permissao para alterar este agendamento." }, { status }),
          logContext.requestId
        );
      }
      if (parsedBody.data.notes) {
        const status = 403;
        logRequestFailure(
          logContext,
          { status, durationMs: Date.now() - startedAt },
          { route: "api.appointments.patch", reason: "client_cannot_edit_notes" }
        );
        return withRequestId(
          NextResponse.json({ error: "Cliente nao pode editar observacoes do atendimento." }, { status }),
          logContext.requestId
        );
      }
      if (parsedBody.data.status !== "CANCELED") {
        const status = 403;
        logRequestFailure(
          logContext,
          { status, durationMs: Date.now() - startedAt },
          { route: "api.appointments.patch", reason: "client_only_cancel" }
        );
        return withRequestId(NextResponse.json(
          { error: "Cliente pode apenas cancelar o proprio agendamento." },
          { status: 403 }
        ), logContext.requestId);
      }
    }

    if (auth.user.role === "BARBER") {
      const ownBarberId = await resolveBarberIdForUser({ id: auth.user.id, email: auth.user.email });
      if (!ownBarberId || current.barberId !== ownBarberId) {
        const status = 403;
        logRequestFailure(
          logContext,
          { status, durationMs: Date.now() - startedAt },
          { route: "api.appointments.patch", reason: "barber_forbidden" }
        );
        return withRequestId(
          NextResponse.json({ error: "Sem permissao para alterar este agendamento." }, { status }),
          logContext.requestId
        );
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

    const status = 200;
    logRequestSuccess(
      logContext,
      { status, durationMs: Date.now() - startedAt },
      { route: "api.appointments.patch", appointmentId: appointment.id }
    );
    return withRequestId(NextResponse.json({ appointment }), logContext.requestId);
  } catch (error) {
    const apiError = mapApiError(error, "Erro ao atualizar status do agendamento.");
    logRequestFailure(
      logContext,
      { status: apiError.status, durationMs: Date.now() - startedAt, error },
      { route: "api.appointments.patch" }
    );
    return withRequestId(
      NextResponse.json({ error: apiError.message }, { status: apiError.status }),
      logContext.requestId
    );
  }
}
