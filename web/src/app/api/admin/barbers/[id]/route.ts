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

const paramsSchema = z.object({
  id: z.coerce.number().int().positive()
});

const updateSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  specialty: z.string().max(120).optional().nullable(),
  email: z.string().email().optional().nullable(),
  phone: z.string().trim().max(20).optional().nullable(),
  photoUrl: z.string().url().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  password: z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH).optional(),
  serviceIds: z.array(z.number().int().positive()).optional()
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request, { roles: ["ADMIN"] });
  if (auth instanceof NextResponse) {
    return auth;
  }

  const params = await context.params;
  const parsedParams = paramsSchema.safeParse(params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: "ID invalido." }, { status: 400 });
  }

  const payload = await request.json();
  const parsed = updateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados invalidos.", details: parsed.error.flatten() }, { status: 400 });
  }
  if (parsed.data.password) {
    const passwordPolicy = validatePasswordPolicy(parsed.data.password);
    if (!passwordPolicy.valid) {
      return NextResponse.json({ error: passwordPolicy.message }, { status: 400 });
    }
  }

  const barberId = parsedParams.data.id;

  try {
    const barber = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const current = await tx.barber.findUnique({
        where: { id: barberId },
        include: { user: true }
      });

      if (!current) {
        throw new Error("Barbeiro nao encontrado.");
      }

      const updateData: Prisma.BarberUpdateInput = {};
      if (parsed.data.name) updateData.name = parsed.data.name;
      if (parsed.data.specialty !== undefined) updateData.specialty = parsed.data.specialty;
      if (parsed.data.email !== undefined) updateData.email = parsed.data.email?.toLowerCase() ?? null;
      if (parsed.data.phone !== undefined) updateData.phone = parsed.data.phone;
      if (parsed.data.photoUrl !== undefined) updateData.photoUrl = parsed.data.photoUrl;
      if (parsed.data.status) updateData.status = parsed.data.status;

      const updatedBarber = await tx.barber.update({
        where: { id: barberId },
        data: updateData
      });

      if (current.userId) {
        const userData: Prisma.UserUpdateInput = {};
        if (parsed.data.name) userData.name = parsed.data.name;
        if (parsed.data.email !== undefined) userData.email = parsed.data.email?.toLowerCase() ?? null;
        if (parsed.data.phone !== undefined) {
          userData.phone = parsed.data.phone ? parsed.data.phone.replace(/\D/g, "") : null;
        }
        if (parsed.data.status) userData.status = parsed.data.status;
        if (parsed.data.password) {
          userData.passwordHash = await bcrypt.hash(parsed.data.password, 10);
        }
        if (Object.keys(userData).length > 0) {
          await tx.user.update({
            where: { id: current.userId },
            data: userData
          });
        }
      }

      if (parsed.data.serviceIds) {
        await tx.barberService.deleteMany({ where: { barberId } });
        if (parsed.data.serviceIds.length > 0) {
          await tx.barberService.createMany({
            data: parsed.data.serviceIds.map((serviceId) => ({ barberId, serviceId })),
            skipDuplicates: true
          });
        }
      }

      return tx.barber.findUnique({
        where: { id: updatedBarber.id },
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
        }
      });
    });

    return NextResponse.json({ barber });
  } catch (error) {
    const apiError = mapApiError(error, "Erro ao atualizar barbeiro.");
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateRequest(request, { roles: ["ADMIN"] });
  if (auth instanceof NextResponse) {
    return auth;
  }

  const params = await context.params;
  const parsedParams = paramsSchema.safeParse(params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: "ID invalido." }, { status: 400 });
  }

  try {
    const barber = await prisma.barber.findUnique({
      where: { id: parsedParams.data.id },
      include: { user: true }
    });
    if (!barber) {
      return NextResponse.json({ error: "Barbeiro nao encontrado." }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.barber.update({
        where: { id: barber.id },
        data: { status: "INACTIVE" }
      });
      if (barber.userId) {
        await tx.user.update({
          where: { id: barber.userId },
          data: { status: "INACTIVE" }
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const apiError = mapApiError(error, "Erro ao remover barbeiro.");
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}
