import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateRequest } from "@/lib/auth-server";
import { mapApiError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(300).optional(),
  imageUrl: z.string().url().optional(),
  price: z.number().positive(),
  durationMinutes: z.number().int().positive().max(480),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional()
});

export async function GET(request: Request) {
  const auth = await authenticateRequest(request, { roles: ["ADMIN"] });
  if (auth instanceof NextResponse) {
    return auth;
  }

  try {
    const services = await prisma.service.findMany({
      orderBy: { name: "asc" }
    });

    return NextResponse.json({ services });
  } catch (error) {
    const apiError = mapApiError(error, "Erro ao listar servicos.");
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

  const { name, description, imageUrl, price, durationMinutes, status } = parsed.data;

  try {
    const service = await prisma.service.create({
      data: {
        name,
        description,
        imageUrl,
        price,
        durationMinutes,
        status: status ?? "ACTIVE"
      }
    });

    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    const apiError = mapApiError(error, "Erro ao criar servico.");
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}
