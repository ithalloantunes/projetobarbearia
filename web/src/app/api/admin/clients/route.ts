import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateRequest } from "@/lib/auth-server";
import { mapApiError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";

const querySchema = z.object({
  q: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional()
});

export async function GET(request: Request) {
  const auth = await authenticateRequest(request, { roles: ["ADMIN"] });
  if (auth instanceof NextResponse) {
    return auth;
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    q: searchParams.get("q") ?? undefined,
    status: searchParams.get("status") ?? undefined
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Parametros invalidos." }, { status: 400 });
  }

  const query = parsed.data.q?.trim().toLowerCase();

  try {
    const clients = await prisma.user.findMany({
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
            date: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ clients });
  } catch (error) {
    const apiError = mapApiError(error, "Erro ao listar clientes.");
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}
