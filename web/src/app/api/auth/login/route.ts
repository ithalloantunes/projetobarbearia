import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { mapApiError } from "@/lib/api-error";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  roleHomePath
} from "@/lib/auth-session";

const secureCookie = (process.env.APP_BASE_URL ?? "").startsWith("https://");

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = loginSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Credenciais invalidas." }, { status: 400 });
  }

  const { email, password } = parsed.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return NextResponse.json({ error: "Email ou senha invalidos." }, { status: 401 });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return NextResponse.json({ error: "Email ou senha invalidos." }, { status: 401 });
    }

    if (user.status !== "ACTIVE") {
      return NextResponse.json({ error: "Conta inativa. Fale com o suporte." }, { status: 403 });
    }

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
        status: user.status
      },
      redirectTo: roleHomePath(user.role)
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: secureCookie,
      maxAge: SESSION_MAX_AGE_SECONDS
    });

    return response;
  } catch (error) {
    const apiError = mapApiError(error, "Erro ao realizar login.");
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}
