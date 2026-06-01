import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mapApiError } from "@/lib/api-error";

export async function GET() {
  try {
    const barbers = await prisma.barber.findMany({
      where: { status: "ACTIVE" },
      orderBy: { name: "asc" },
      include: {
        services: {
          include: {
            service: true
          }
        }
      }
    });

    return NextResponse.json({ barbers });
  } catch (error) {
    const apiError = mapApiError(error, "Erro ao listar barbeiros.");
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}
