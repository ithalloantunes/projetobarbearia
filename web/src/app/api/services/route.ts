import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mapApiError } from "@/lib/api-error";

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      where: { status: "ACTIVE" },
      orderBy: { name: "asc" }
    });

    return NextResponse.json({ services });
  } catch (error) {
    const apiError = mapApiError(error, "Erro ao listar servicos.");
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}
