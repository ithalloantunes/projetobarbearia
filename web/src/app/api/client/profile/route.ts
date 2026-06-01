import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateRequest } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { mapApiError } from "@/lib/api-error";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  validatePasswordPolicy
} from "@/lib/password-policy";

const updateProfileSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  phone: z
    .string()
    .trim()
    .max(20)
    .optional()
    .transform((value) => (value ? value.replace(/\D/g, "") : undefined)),
  email: z.string().email().optional(),
  currentPassword: z.string().min(1).optional(),
  newPassword: z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH).optional()
});

export async function GET(request: Request) {
  const auth = await authenticateRequest(request, { roles: ["CLIENT"] });
  if (auth instanceof NextResponse) {
    return auth;
  }

  return NextResponse.json({
    user: {
      id: auth.user.id,
      name: auth.user.name,
      email: auth.user.email,
      phone: auth.user.phone,
      role: auth.user.role,
      status: auth.user.status
    }
  });
}

export async function PATCH(request: Request) {
  const auth = await authenticateRequest(request, { roles: ["CLIENT"] });
  if (auth instanceof NextResponse) {
    return auth;
  }

  const payload = await request.json();
  const parsed = updateProfileSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados invalidos.", details: parsed.error.flatten() }, { status: 400 });
  }

  const {
    name,
    phone,
    email,
    currentPassword,
    newPassword
  } = parsed.data;

  if (newPassword && !currentPassword) {
    return NextResponse.json(
      { error: "Informe a senha atual para definir uma nova senha." },
      { status: 400 }
    );
  }
  if (newPassword) {
    const passwordPolicy = validatePasswordPolicy(newPassword);
    if (!passwordPolicy.valid) {
      return NextResponse.json({ error: passwordPolicy.message }, { status: 400 });
    }
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: auth.user.id }
    });

    if (!existingUser) {
      return NextResponse.json({ error: "Usuario nao encontrado." }, { status: 404 });
    }

    let passwordHash: string | undefined;
    if (newPassword && currentPassword) {
      const validPassword = await bcrypt.compare(currentPassword, existingUser.passwordHash);
      if (!validPassword) {
        return NextResponse.json({ error: "Senha atual invalida." }, { status: 401 });
      }
      passwordHash = await bcrypt.hash(newPassword, 10);
    }

    const updated = await prisma.user.update({
      where: { id: auth.user.id },
      data: {
        ...(name ? { name } : {}),
        ...(phone !== undefined ? { phone: phone || null } : {}),
        ...(email ? { email: email.toLowerCase() } : {}),
        ...(passwordHash ? { passwordHash } : {})
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true
      }
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    const apiError = mapApiError(error, "Erro ao atualizar perfil.");
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}
