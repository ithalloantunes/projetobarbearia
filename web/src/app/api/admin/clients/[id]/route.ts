import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateRequest } from "@/lib/auth-server";
import { mapApiError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";

const paramsSchema = z.object({
  id: z.coerce.number().int().positive()
});

const updateSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  email: z.string().email().optional(),
  phone: z.string().trim().max(20).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  note: z.string().max(500).optional().nullable()
});

const CLIENT_NOTES_KEY = "client_notes";

function parseNotes(value: string | null | undefined) {
  if (!value) return {} as Record<string, string>;
  try {
    const parsed = JSON.parse(value) as Record<string, string>;
    return parsed ?? {};
  } catch {
    return {} as Record<string, string>;
  }
}

function tierFromSpent(totalSpent: number) {
  if (totalSpent >= 3000) return "BLACK";
  if (totalSpent >= 1600) return "GOLD";
  if (totalSpent >= 700) return "SILVER";
  return "CLASSIC";
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request, { roles: ["ADMIN"] });
  if (auth instanceof NextResponse) {
    return auth;
  }

  const params = await context.params;
  const parsedParams = paramsSchema.safeParse(params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: "ID invalido." }, { status: 400 });
  }

  try {
    const [client, notesSetting] = await Promise.all([
      prisma.user.findUnique({
        where: { id: parsedParams.data.id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          status: true,
          role: true,
          createdAt: true,
          appointments: {
            include: {
              service: { select: { name: true } },
              barber: { select: { name: true } }
            },
            orderBy: [{ date: "desc" }, { startTime: "desc" }],
            take: 30
          }
        }
      }),
      prisma.appSetting.findUnique({ where: { key: CLIENT_NOTES_KEY } })
    ]);

    if (!client || client.role !== "CLIENT") {
      return NextResponse.json({ error: "Cliente nao encontrado." }, { status: 404 });
    }

    const completed = client.appointments.filter((item) => item.status === "COMPLETED");
    const totalSpent = completed.reduce((acc, item) => acc + Number(item.price), 0);
    const notesMap = parseNotes(notesSetting?.value);
    const { role: _role, ...clientWithoutRole } = client;

    return NextResponse.json({
      client: {
        ...clientWithoutRole,
        stats: {
          totalAppointments: client.appointments.length,
          completedAppointments: completed.length,
          totalSpent: Number(totalSpent.toFixed(2)),
          tier: tierFromSpent(totalSpent),
          lastAppointmentAt: client.appointments[0]?.date ?? null
        },
        note: notesMap[String(client.id)] ?? ""
      }
    });
  } catch (error) {
    const apiError = mapApiError(error, "Erro ao carregar cliente.");
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request, { roles: ["ADMIN"] });
  if (auth instanceof NextResponse) {
    return auth;
  }

  const params = await context.params;
  const parsedParams = paramsSchema.safeParse(params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: "ID invalido." }, { status: 400 });
  }

  const payload = await request.json();
  const parsed = updateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados invalidos.", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { id: parsedParams.data.id },
      select: { id: true, role: true }
    });

    if (!existing || existing.role !== "CLIENT") {
      return NextResponse.json({ error: "Cliente nao encontrado." }, { status: 404 });
    }

    const client = await prisma.user.update({
      where: { id: parsedParams.data.id },
      data: {
        ...(parsed.data.name ? { name: parsed.data.name } : {}),
        ...(parsed.data.email ? { email: parsed.data.email.toLowerCase() } : {}),
        ...(parsed.data.phone ? { phone: parsed.data.phone.replace(/\D/g, "") } : {}),
        ...(parsed.data.status ? { status: parsed.data.status } : {})
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true
      }
    });

    if (parsed.data.note !== undefined) {
      const notesSetting = await prisma.appSetting.findUnique({ where: { key: CLIENT_NOTES_KEY } });
      const notesMap = parseNotes(notesSetting?.value);
      if (parsed.data.note === null || parsed.data.note === "") {
        delete notesMap[String(parsedParams.data.id)];
      } else {
        notesMap[String(parsedParams.data.id)] = parsed.data.note;
      }

      await prisma.appSetting.upsert({
        where: { key: CLIENT_NOTES_KEY },
        update: { value: JSON.stringify(notesMap) },
        create: { key: CLIENT_NOTES_KEY, value: JSON.stringify(notesMap) }
      });
    }

    return NextResponse.json({ client });
  } catch (error) {
    const apiError = mapApiError(error, "Erro ao atualizar cliente.");
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}
