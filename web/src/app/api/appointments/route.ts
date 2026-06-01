import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { assertSlotAvailableForServices } from "@/lib/availability";
import { sendAppointmentNotifications } from "@/lib/notifications";
import { mapApiError } from "@/lib/api-error";
import { authenticateRequest, resolveBarberIdForUser } from "@/lib/auth-server";
import {
  getRequestLogContext,
  logRequestFailure,
  logRequestStart,
  logRequestSuccess
} from "@/lib/logger";

const appointmentStatusSchema = z.enum([
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELED",
  "NO_SHOW"
]);

const createSchema = z.object({
  clientId: z.number().int().positive().optional(),
  clientEmail: z.string().email().optional(),
  barberId: z.number().int().positive(),
  serviceId: z.number().int().positive().optional(),
  serviceIds: z.array(z.number().int().positive()).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  notes: z.string().optional()
}).refine((data) => Boolean(data.serviceId || (data.serviceIds && data.serviceIds.length > 0)), {
  message: "Informe serviceId ou serviceIds.",
  path: ["serviceId"]
});

const querySchema = z.object({
  barberId: z.coerce.number().int().positive().optional(),
  clientId: z.coerce.number().int().positive().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: appointmentStatusSchema.optional()
});

function withRequestId(response: NextResponse, requestId: string) {
  response.headers.set("x-request-id", requestId);
  return response;
}

export async function GET(request: Request) {
  const startedAt = Date.now();
  const context = getRequestLogContext(request);
  logRequestStart(context, { route: "api.appointments.get" });

  const auth = await authenticateRequest(request, { roles: ["CLIENT", "BARBER", "ADMIN"] });
  if (auth instanceof NextResponse) {
    const status = auth.status;
    if (status >= 400) {
      logRequestFailure(
        context,
        { status, durationMs: Date.now() - startedAt },
        { route: "api.appointments.get" }
      );
    }
    return withRequestId(auth, context.requestId);
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    barberId: searchParams.get("barberId") ?? undefined,
    clientId: searchParams.get("clientId") ?? undefined,
    date: searchParams.get("date") ?? undefined,
    dateFrom: searchParams.get("dateFrom") ?? undefined,
    dateTo: searchParams.get("dateTo") ?? undefined,
    status: searchParams.get("status") ?? undefined
  });

  if (!parsed.success) {
    const status = 400;
    logRequestFailure(
      context,
      { status, durationMs: Date.now() - startedAt },
      { route: "api.appointments.get", reason: "invalid_query" }
    );
    return withRequestId(NextResponse.json({ error: "Parametros invalidos" }, { status }), context.requestId);
  }

  const { barberId, clientId, date, dateFrom, dateTo, status } = parsed.data;
  if (dateFrom && dateTo && dateFrom > dateTo) {
    const status = 400;
    logRequestFailure(
      context,
      { status, durationMs: Date.now() - startedAt },
      { route: "api.appointments.get", reason: "invalid_date_range" }
    );
    return withRequestId(NextResponse.json(
      { error: "dateFrom nao pode ser maior que dateTo." },
      { status: 400 }
    ), context.requestId);
  }

  const where: Record<string, unknown> = {};

  if (auth.user.role === "ADMIN") {
    if (barberId) where.barberId = barberId;
    if (clientId) where.clientId = clientId;
  } else if (auth.user.role === "CLIENT") {
    where.clientId = auth.user.id;
  } else {
    const ownBarberId = await resolveBarberIdForUser({ id: auth.user.id, email: auth.user.email });
    if (!ownBarberId) {
      const status = 403;
      logRequestFailure(
        context,
        { status, durationMs: Date.now() - startedAt },
        { route: "api.appointments.get", reason: "missing_barber_profile" }
      );
      return withRequestId(
        NextResponse.json({ error: "Perfil de barbeiro nao encontrado." }, { status }),
        context.requestId
      );
    }
    where.barberId = ownBarberId;
  }

  if (status) where.status = status;

  if (date) {
    where.date = new Date(`${date}T00:00:00`);
  } else if (dateFrom || dateTo) {
    const dateRange: { gte?: Date; lte?: Date } = {};
    if (dateFrom) {
      dateRange.gte = new Date(`${dateFrom}T00:00:00`);
    }
    if (dateTo) {
      dateRange.lte = new Date(`${dateTo}T00:00:00`);
    }
    where.date = dateRange;
  }

  try {
    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        barber: true,
        client: true,
        service: true
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }]
    });

    const status = 200;
    logRequestSuccess(
      context,
      { status, durationMs: Date.now() - startedAt },
      { route: "api.appointments.get", count: appointments.length }
    );
    return withRequestId(NextResponse.json({ appointments }), context.requestId);
  } catch (error) {
    const apiError = mapApiError(error, "Erro ao listar agendamentos.");
    logRequestFailure(
      context,
      { status: apiError.status, durationMs: Date.now() - startedAt, error },
      { route: "api.appointments.get" }
    );
    return withRequestId(
      NextResponse.json({ error: apiError.message }, { status: apiError.status }),
      context.requestId
    );
  }
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  const context = getRequestLogContext(request);
  logRequestStart(context, { route: "api.appointments.post" });

  const auth = await authenticateRequest(request, { roles: ["CLIENT", "ADMIN"] });
  if (auth instanceof NextResponse) {
    const status = auth.status;
    if (status >= 400) {
      logRequestFailure(
        context,
        { status, durationMs: Date.now() - startedAt },
        { route: "api.appointments.post" }
      );
    }
    return withRequestId(auth, context.requestId);
  }

  const payload = await request.json();
  const parsed = createSchema.safeParse(payload);

  if (!parsed.success) {
    const status = 400;
    logRequestFailure(
      context,
      { status, durationMs: Date.now() - startedAt },
      { route: "api.appointments.post", reason: "invalid_payload" }
    );
    return withRequestId(
      NextResponse.json({ error: "Dados invalidos", details: parsed.error.flatten() }, { status }),
      context.requestId
    );
  }

  const { clientId, clientEmail, barberId, serviceId, serviceIds, date, time, notes } = parsed.data;

  const orderedServiceIds = [
    ...(serviceId ? [serviceId] : []),
    ...(serviceIds ?? [])
  ].filter((value, index, list) => list.indexOf(value) === index);

  if (orderedServiceIds.length === 0) {
    const status = 400;
    logRequestFailure(
      context,
      { status, durationMs: Date.now() - startedAt },
      { route: "api.appointments.post", reason: "missing_service" }
    );
    return withRequestId(
      NextResponse.json({ error: "Selecione ao menos um servico." }, { status }),
      context.requestId
    );
  }

  const effectiveClientId = auth.user.role === "CLIENT" ? auth.user.id : clientId;
  const effectiveClientEmail =
    auth.user.role === "CLIENT" ? auth.user.email ?? undefined : clientEmail?.toLowerCase();

  if (auth.user.role === "ADMIN" && !effectiveClientId && !effectiveClientEmail) {
    const status = 400;
    logRequestFailure(
      context,
      { status, durationMs: Date.now() - startedAt },
      { route: "api.appointments.post", reason: "missing_admin_client" }
    );
    return withRequestId(NextResponse.json(
      { error: "Informe clientId ou clientEmail para criar o agendamento." },
      { status: 400 }
    ), context.requestId);
  }

  try {
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const [client, barber, services] = await Promise.all([
        effectiveClientId
          ? tx.user.findUnique({ where: { id: effectiveClientId } })
          : tx.user.findUnique({ where: { email: effectiveClientEmail ?? undefined } }),
        tx.barber.findUnique({ where: { id: barberId } }),
        tx.service.findMany({ where: { id: { in: orderedServiceIds } } })
      ]);

      if (!client || !barber || services.length !== orderedServiceIds.length) {
        throw new Error("Dados nao encontrados.");
      }
      if (client.role !== "CLIENT") {
        throw new Error("Cliente invalido.");
      }

      const servicesById = new Map(services.map((service) => [service.id, service]));
      const orderedServices = orderedServiceIds
        .map((id) => servicesById.get(id))
        .filter((service): service is NonNullable<typeof service> => Boolean(service));
      const primaryService = orderedServices[0];
      if (!primaryService) {
        throw new Error("Servico nao encontrado.");
      }

      const { startTime, endTime } = await assertSlotAvailableForServices(
        {
          barberId,
          serviceIds: orderedServiceIds,
          date,
          time
        },
        tx
      );

      const bundleNames =
        orderedServices.length > 1
          ? orderedServices.map((service) => service.name).join(" + ")
          : null;
      const normalizedNotes = notes?.trim();
      const appointmentNotes = [normalizedNotes, bundleNames ? `Servicos combinados: ${bundleNames}` : null]
        .filter(Boolean)
        .join(" | ");

      const totalPrice = orderedServices.reduce((sum, service) => sum + Number(service.price), 0);

      const appointment = await tx.appointment.create({
        data: {
          clientId: client.id,
          barberId,
          serviceId: primaryService.id,
          date: new Date(`${date}T00:00:00`),
          startTime,
          endTime,
          status: "CONFIRMED",
          notes: appointmentNotes || undefined,
          price: totalPrice
        }
      });

      return { appointment, client, barber, service: primaryService };
    });

    await sendAppointmentNotifications({
      appointment: result.appointment,
      client: result.client,
      barber: result.barber,
      service: result.service
    });

    const status = 201;
    logRequestSuccess(
      context,
      { status, durationMs: Date.now() - startedAt },
      { route: "api.appointments.post", appointmentId: result.appointment.id }
    );
    return withRequestId(
      NextResponse.json({ appointment: result.appointment }, { status }),
      context.requestId
    );
  } catch (error) {
    const apiError = mapApiError(error, "Erro ao criar agendamento.");
    logRequestFailure(
      context,
      { status: apiError.status, durationMs: Date.now() - startedAt, error },
      { route: "api.appointments.post" }
    );
    return withRequestId(
      NextResponse.json({ error: apiError.message }, { status: apiError.status }),
      context.requestId
    );
  }
}
