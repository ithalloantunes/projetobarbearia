import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { authenticateRequest } from "@/lib/auth-server";
import { mapApiError } from "@/lib/api-error";
import { prisma } from "@/lib/prisma";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  validatePasswordPolicy
} from "@/lib/password-policy";

const createSchema = z.object({
  name: z.string().min(2).max(120),
  specialty: z.string().max(120).optional(),
  email: z.string().email().optional(),
  phone: z.string().trim().max(20).optional(),
  photoUrl: z.string().url().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  createLogin: z.boolean().optional(),
  password: z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH).optional()
});

export async function GET(request: Request) {
  const auth = await authenticateRequest(request, { roles: ["ADMIN"] });
  if (auth instanceof NextResponse) {
    return auth;
  }

  try {
    const barbers = await prisma.barber.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            role: true
          }
        },
        services: {
          include: { service: true }
        }
      },
      orderBy: { name: "asc" }
    });

    return NextResponse.json({ barbers });
  } catch (error) {
    const apiError = mapApiError(error, "Erro ao listar equipe.");
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}

export async function POST(request: Request) {
  const auth = await authenticateRequest(request, { roles: ["ADMIN"] });
  if (auth instanceof NextResponse) {
    return auth;
  }

  const payload = await request.json();
  const parsed = createSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados invalidos.", details: parsed.error.flatten() }, { status: 400 });
  }

  const {
    name,
    specialty,
    email,
    phone,
    photoUrl,
    status,
    createLogin,
    password
  } = parsed.data;

  if (createLogin && (!email || !password)) {
    return NextResponse.json(
      { error: "Email e senha sao obrigatorios para criar login do barbeiro." },
      { status: 400 }
    );
  }
  if (createLogin && password) {
    const passwordPolicy = validatePasswordPolicy(password);
    if (!passwordPolicy.valid) {
      return NextResponse.json({ error: passwordPolicy.message }, { status: 400 });
    }
  }

  try {
    const barber = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      let userId: number | undefined;
      if (createLogin && email && password) {
        const normalizedEmail = email.toLowerCase();
        const existing = await tx.user.findUnique({ where: { email: normalizedEmail } });
        if (existing && existing.role !== "BARBER") {
          throw new Error("Este email ja pertence a outro perfil.");
        }

        if (existing) {
          userId = existing.id;
        } else {
          const passwordHash = await bcrypt.hash(password, 10);
          const createdUser = await tx.user.create({
            data: {
              name,
              email: normalizedEmail,
              phone: phone ? phone.replace(/\D/g, "") : null,
              passwordHash,
              role: "BARBER",
              status: status ?? "ACTIVE"
            }
          });
          userId = createdUser.id;
        }
      }

      return tx.barber.create({
        data: {
          name,
          specialty,
          email: email?.toLowerCase(),
          phone,
          photoUrl,
          status: status ?? "ACTIVE",
          ...(userId ? { userId } : {})
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              status: true,
              role: true
            }
          }
        }
      });
    });

    return NextResponse.json({ barber }, { status: 201 });
  } catch (error) {
    const apiError = mapApiError(error, "Erro ao criar barbeiro.");
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}
