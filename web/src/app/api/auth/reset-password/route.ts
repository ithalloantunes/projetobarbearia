import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { mapApiError } from "@/lib/api-error";
import { hashResetToken } from "@/lib/reset-token";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  validatePasswordPolicy
} from "@/lib/password-policy";
import { consumeFixedWindowRateLimit, getRequestIp } from "@/lib/rate-limit";

const bodySchema = z.object({
  token: z.string().min(20),
  password: z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH)
});

function rateLimitedResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    {
      error: `Muitas tentativas de redefinicao. Tente novamente em ${retryAfterSeconds}s.`
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
    namespace: "auth:reset-password:ip",
    key: requestIp,
    maxRequests: 10,
    windowMs: 15 * 60_000
  });

  if (!rateLimit.allowed) {
    return rateLimitedResponse(rateLimit.retryAfterSeconds);
  }

  const payload = await request.json();
  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados invalidos." }, { status: 400 });
  }

  const { token, password } = parsed.data;
  const passwordPolicy = validatePasswordPolicy(password);
  if (!passwordPolicy.valid) {
    return NextResponse.json({ error: passwordPolicy.message }, { status: 400 });
  }

  try {
    const tokenHash = hashResetToken(token);
    const entry = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true }
    });

    if (!entry || entry.usedAt || entry.expiresAt.getTime() < Date.now()) {
      return NextResponse.json({ error: "Token invalido ou expirado." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: entry.userId },
        data: { passwordHash }
      }),
      prisma.passwordResetToken.update({
        where: { id: entry.id },
        data: { usedAt: new Date() }
      }),
      prisma.passwordResetToken.deleteMany({
        where: {
          userId: entry.userId,
          id: { not: entry.id }
        }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    const apiError = mapApiError(error, "Erro ao redefinir senha.");
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}
