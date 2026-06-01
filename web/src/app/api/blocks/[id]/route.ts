import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { mapApiError } from "@/lib/api-error";
import { authenticateRequest, resolveBarberIdForUser } from "@/lib/auth-server";

const paramsSchema = z.object({
  id: z.coerce.number().int().positive()
});

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request, { roles: ["BARBER", "ADMIN"] });
  if (auth instanceof NextResponse) {
    return auth;
  }

  const params = await context.params;
  const parsedParams = paramsSchema.safeParse(params);

  if (!parsedParams.success) {
    return NextResponse.json({ error: "ID invalido." }, { status: 400 });
  }

  try {
    if (auth.user.role === "BARBER") {
      const ownBarberId = await resolveBarberIdForUser({ id: auth.user.id, email: auth.user.email });
      if (!ownBarberId) {
        return NextResponse.json({ error: "Perfil de barbeiro nao encontrado." }, { status: 403 });
      }

      const block = await prisma.block.findUnique({
        where: { id: parsedParams.data.id },
        select: { id: true, barberId: true }
      });

      if (!block || block.barberId !== ownBarberId) {
        return NextResponse.json({ error: "Sem permissao para remover este bloqueio." }, { status: 403 });
      }
    }

    await prisma.block.delete({
      where: { id: parsedParams.data.id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    const apiError = mapApiError(error, "Erro ao remover bloqueio.");
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}
