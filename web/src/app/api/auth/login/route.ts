import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { mapApiError } from "@/lib/api-error";
import {
  SESSION_COOKIE_NAME,
  createSessionToken,
  getSessionCookieOptions,
  roleHomePath
} from "@/lib/auth-session";
import {
  consumeAdaptiveRateLimit,
  getRequestIp,
  resetRateLimit
} from "@/lib/rate-limit";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

function rateLimitedResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    {
      error: `Muitas tentativas de login. Tente novamente em ${retryAfterSeconds}s.`
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
  const ipLimit = consumeAdaptiveRateLimit({
    namespace: "auth:login:ip",
    key: requestIp,
    maxRequests: 12,
    windowMs: 60_000,
    baseBlockMs: 60_000,
    maxBlockMs: 15 * 60_000
  });

  if (!ipLimit.allowed) {
    return rateLimitedResponse(ipLimit.retryAfterSeconds);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Requisicao invalida." }, { status: 400 });
  }
  const parsed = loginSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Credenciais invalidas." }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const { password } = parsed.data;

  const emailLimit = consumeAdaptiveRateLimit({
    namespace: "auth:login:email",
    key: email,
    maxRequests: 8,
    windowMs: 60_000,
    baseBlockMs: 60_000,
    maxBlockMs: 15 * 60_000
  });

  if (!emailLimit.allowed) {
    return rateLimitedResponse(emailLimit.retryAfterSeconds);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ error: "Email ou senha invalidos." }, { status: 401 });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return NextResponse.json({ error: "Email ou senha invalidos." }, { status: 401 });
    }

    let userStatus = user.status;

    if (userStatus !== "ACTIVE") {
      if (user.role !== "CLIENT") {
        return NextResponse.json({ error: "Conta inativa. Fale com o suporte." }, { status: 403 });
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { status: "ACTIVE" }
      });
      userStatus = "ACTIVE";
    }

    resetRateLimit("auth:login:email", email);
    resetRateLimit("auth:login:ip", requestIp);

    const token = await createSessionToken({
      userId: user.id,
      role: user.role
    });

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: userStatus
      },
      redirectTo: roleHomePath(user.role)
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      ...getSessionCookieOptions(request)
    });

    return response;
  } catch (error) {
    const apiError = mapApiError(error, "Erro ao realizar login.");
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}
