import { NextResponse } from "next/server";
import { z } from "zod";
import { getAvailableSlotsForServices } from "@/lib/availability";
import { mapApiError } from "@/lib/api-error";

const querySchema = z.object({
  barberId: z.coerce.number().int().positive(),
  serviceId: z.coerce.number().int().positive().optional(),
  serviceIds: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    barberId: searchParams.get("barberId"),
    serviceId: searchParams.get("serviceId") ?? undefined,
    serviceIds: searchParams.get("serviceIds") ?? undefined,
    date: searchParams.get("date")
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Parametros invalidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const serviceIdsFromQuery = (parsed.data.serviceIds || "")
      .split(",")
      .map((value) => Number(value.trim()))
      .filter((value) => Number.isInteger(value) && value > 0);

    const serviceIds = [
      ...(parsed.data.serviceId ? [parsed.data.serviceId] : []),
      ...serviceIdsFromQuery
    ].filter((value, index, list) => list.indexOf(value) === index);

    if (serviceIds.length === 0) {
      return NextResponse.json(
        { error: "Parametros invalidos", details: { serviceId: ["Obrigatorio"] } },
        { status: 400 }
      );
    }

    const slots = await getAvailableSlotsForServices({
      barberId: parsed.data.barberId,
      serviceIds,
      date: parsed.data.date
    });
    return NextResponse.json(slots);
  } catch (error) {
    const apiError = mapApiError(error, "Erro ao buscar disponibilidade.");
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}
