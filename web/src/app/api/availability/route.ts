import { NextResponse } from "next/server";
import { z } from "zod";
import { getAvailableSlots } from "@/lib/availability";
import { mapApiError } from "@/lib/api-error";

const querySchema = z.object({
  barberId: z.coerce.number().int().positive(),
  serviceId: z.coerce.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    barberId: searchParams.get("barberId"),
    serviceId: searchParams.get("serviceId"),
    date: searchParams.get("date")
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Parametros invalidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const slots = await getAvailableSlots(parsed.data);
    return NextResponse.json(slots);
  } catch (error) {
    const apiError = mapApiError(error, "Erro ao buscar disponibilidade.");
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}
