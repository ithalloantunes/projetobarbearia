import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { mapApiError } from "@/lib/api-error";
import { sendEmailVerificationEmail } from "@/lib/notifications";
import { generateRawResetToken, hashResetToken } from "@/lib/reset-token";
import { consumeFixedWindowRateLimit, getRequestIp } from "@/lib/rate-limit";

const EMAIL_VERIFICATION_TTL_MS = 1000 * 60 * 60 * 24;

const bodySchema = z.object({
  email: z.string().email()
});

function rateLimitedResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    {
      error: `Muitas tentativas de reenvio. Tente novamente em ${retryAfterSeconds}s.`
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
    namespace: "auth:resend-verification:ip",
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
    namespace: "auth:resend-verification:email",
    key: email,
    maxRequests: 3,
    windowMs: 15 * 60_000
  });

  if (!emailLimit.allowed) {
    return rateLimitedResponse(emailLimit.retryAfterSeconds);
  }

  const genericResponse = NextResponse.json({
    success: true,
    message: "Se a conta existir e ainda nao estiver ativa, enviaremos um novo link."
  });

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true
      }
    });

    if (!user || !user.email || user.role !== "CLIENT" || user.status === "ACTIVE") {
      return genericResponse;
    }

    const rawToken = generateRawResetToken();
    const tokenHash = hashResetToken(rawToken);
    const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS);

    await prisma.$transaction([
      prisma.emailVerificationToken.deleteMany({
        where: {
          userId: user.id,
          usedAt: null
        }
      }),
      prisma.emailVerificationToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt
        }
      })
    ]);

    const baseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";
    const verificationLink = `${baseUrl}/verificar-email?token=${encodeURIComponent(rawToken)}`;

    try {
      await sendEmailVerificationEmail({
        to: user.email,
        name: user.name,
        verificationLink
      });
    } catch (sendError) {
      console.error("Falha ao reenviar email de verificacao:", sendError);
    }

    return genericResponse;
  } catch (error) {
    const apiError = mapApiError(error, "Erro ao reenviar verificacao.");
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}
