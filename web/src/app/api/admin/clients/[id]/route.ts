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
  status: z.enum(["ACTIVE", "INACTIVE"]).optional()
});

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

    return NextResponse.json({ client });
  } catch (error) {
    const apiError = mapApiError(error, "Erro ao atualizar cliente.");
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}
