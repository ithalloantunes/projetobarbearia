import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { mapApiError } from "@/lib/api-error";
import { sendPasswordResetEmail } from "@/lib/notifications";
import { generateRawResetToken, hashResetToken } from "@/lib/reset-token";
import { consumeFixedWindowRateLimit, getRequestIp } from "@/lib/rate-limit";

const bodySchema = z.object({
  email: z.string().email()
});

function rateLimitedResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    {
      error: `Muitas tentativas de recuperacao. Tente novamente em ${retryAfterSeconds}s.`
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
  const ipLimit = consumeFixedWindowRateLimit({
    namespace: "auth:forgot-password:ip",
    key: requestIp,
    maxRequests: 8,
    windowMs: 15 * 60_000
  });

  if (!ipLimit.allowed) {
    return rateLimitedResponse(ipLimit.retryAfterSeconds);
  }

  const payload = await request.json();
  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Email invalido." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const emailLimit = consumeFixedWindowRateLimit({
    namespace: "auth:forgot-password:email",
    key: email,
    maxRequests: 3,
    windowMs: 15 * 60_000
  });

  if (!emailLimit.allowed) {
    return rateLimitedResponse(emailLimit.retryAfterSeconds);
  }

  const genericResponse = NextResponse.json({
    success: true,
    message: "Se o email existir, enviaremos um link de redefinicao."
  });

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || user.status !== "ACTIVE") {
      return genericResponse;
    }

    const rawToken = generateRawResetToken();
    const tokenHash = hashResetToken(rawToken);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt
      }
    });

    const baseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";
    const resetLink = `${baseUrl}/redefinir-senha?token=${encodeURIComponent(rawToken)}`;
    await sendPasswordResetEmail({
      to: user.email ?? email,
      name: user.name,
      resetLink
    });

    return genericResponse;
  } catch (error) {
    const apiError = mapApiError(error, "Erro ao solicitar redefinicao de senha.");
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}
