import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
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
}
