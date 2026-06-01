import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { mapApiError } from "@/lib/api-error";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  validatePasswordPolicy
} from "@/lib/password-policy";
import { consumeFixedWindowRateLimit, getRequestIp } from "@/lib/rate-limit";

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
    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        phone: phone || null,
        passwordHash,
        role: "CLIENT",
        status: "ACTIVE"
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

    return NextResponse.json(
      {
        user,
        requiresEmailVerification: false,
        message: "Conta criada com sucesso. Voce ja pode entrar."
      },
      { status: 201 }
    );
  } catch (error) {
    const apiError = mapApiError(error, "Erro ao cadastrar usuario.");
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}
