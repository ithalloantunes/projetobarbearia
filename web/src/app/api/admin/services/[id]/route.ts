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
  description: z.string().max(300).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  price: z.number().positive().optional(),
  durationMinutes: z.number().int().positive().max(480).optional(),
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
    const service = await prisma.service.update({
      where: { id: parsedParams.data.id },
      data: parsed.data
    });
    return NextResponse.json({ service });
  } catch (error) {
    const apiError = mapApiError(error, "Erro ao atualizar servico.");
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}

export async function DELETE(
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
    await prisma.service.delete({
      where: { id: parsedParams.data.id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    const apiError = mapApiError(error, "Erro ao remover servico.");
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}
