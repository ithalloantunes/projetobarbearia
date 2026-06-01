import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { mapApiError } from "@/lib/api-error";
import { hashResetToken } from "@/lib/reset-token";
import { consumeFixedWindowRateLimit, getRequestIp } from "@/lib/rate-limit";

const bodySchema = z.object({
  token: z.string().min(20)
});

function rateLimitedResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    {
      error: `Muitas tentativas de verificacao. Tente novamente em ${retryAfterSeconds}s.`
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfterSeconds)
      }
    }
  );
}

export async function POST(request: Request) {
  const requestIp = getRequestIp(request);
  const rateLimit = consumeFixedWindowRateLimit({
    namespace: "auth:verify-email:ip",
    key: requestIp,
    maxRequests: 20,
    windowMs: 15 * 60_000
  });

  if (!rateLimit.allowed) {
    return rateLimitedResponse(rateLimit.retryAfterSeconds);
  }

  const payload = await request.json();
  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Token invalido." }, { status: 400 });
  }

  try {
    const tokenHash = hashResetToken(parsed.data.token);
    const entry = await prisma.emailVerificationToken.findUnique({
      where: { tokenHash }
    });

    if (!entry || entry.usedAt || entry.expiresAt.getTime() < Date.now()) {
      return NextResponse.json({ error: "Link invalido ou expirado." }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: entry.userId },
        data: { status: "ACTIVE" }
      }),
      prisma.emailVerificationToken.update({
        where: { id: entry.id },
        data: { usedAt: new Date() }
      }),
      prisma.emailVerificationToken.deleteMany({
        where: {
          userId: entry.userId,
          id: { not: entry.id }
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      message: "Email confirmado com sucesso. Sua conta esta ativa."
    });
  } catch (error) {
    const apiError = mapApiError(error, "Erro ao verificar email.");
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}
