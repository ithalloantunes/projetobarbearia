import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { mapApiError } from "@/lib/api-error";
import { hashResetToken } from "@/lib/reset-token";

const bodySchema = z.object({
  token: z.string().min(20),
  password: z.string().min(6).max(72)
});

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados invalidos." }, { status: 400 });
  }

  const { token, password } = parsed.data;

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
