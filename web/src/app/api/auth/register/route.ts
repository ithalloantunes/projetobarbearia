import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { mapApiError } from "@/lib/api-error";
import { sendEmailVerificationEmail } from "@/lib/notifications";
import { generateRawResetToken, hashResetToken } from "@/lib/reset-token";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  validatePasswordPolicy
} from "@/lib/password-policy";
import { consumeFixedWindowRateLimit, getRequestIp } from "@/lib/rate-limit";

const EMAIL_VERIFICATION_TTL_MS = 1000 * 60 * 60 * 24;

const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z
    .string()
    .trim()
    .max(20)
    .optional()
    .transform((value) => (value ? value.replace(/\D/g, "") : undefined)),
  password: z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH)
});

function rateLimitedResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    {
      error: `Muitas tentativas de cadastro. Tente novamente em ${retryAfterSeconds}s.`
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
    namespace: "auth:register:ip",
    key: requestIp,
    maxRequests: 10,
    windowMs: 10 * 60_000
  });

  if (!rateLimit.allowed) {
    return rateLimitedResponse(rateLimit.retryAfterSeconds);
  }

  const payload = await request.json();
  const parsed = registerSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados invalidos.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, email, phone, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();
  const passwordPolicy = validatePasswordPolicy(password);
  if (!passwordPolicy.valid) {
    return NextResponse.json({ error: passwordPolicy.message }, { status: 400 });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const rawVerificationToken = generateRawResetToken();
    const verificationTokenHash = hashResetToken(rawVerificationToken);
    const verificationExpiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS);

    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name,
          email: normalizedEmail,
          phone: phone || null,
          passwordHash,
          role: "CLIENT",
          status: "INACTIVE"
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
          createdAt: true
        }
      });

      await tx.emailVerificationToken.create({
        data: {
          userId: createdUser.id,
          tokenHash: verificationTokenHash,
          expiresAt: verificationExpiresAt
        }
      });

      return createdUser;
    });

    const baseUrl = process.env.APP_BASE_URL ?? "http://localhost:3000";
    const verificationLink = `${baseUrl}/verificar-email?token=${encodeURIComponent(rawVerificationToken)}`;

    let emailSent = true;
    try {
      await sendEmailVerificationEmail({
        to: normalizedEmail,
        name: user.name,
        verificationLink
      });
    } catch (sendError) {
      emailSent = false;
      console.error("Falha ao enviar email de verificacao:", sendError);
    }

    return NextResponse.json(
      {
        user,
        requiresEmailVerification: true,
        message: emailSent
          ? "Conta criada. Enviamos um link para ativar seu acesso."
          : "Conta criada, mas nao foi possivel enviar o email agora. Solicite um novo link."
      },
      { status: 201 }
    );
  } catch (error) {
    const apiError = mapApiError(error, "Erro ao cadastrar usuario.");
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}
