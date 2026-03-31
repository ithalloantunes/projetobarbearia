import { NextResponse } from "next/server";
import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sessionFromCookieHeader, type SessionPayload } from "@/lib/auth-session";

type AuthenticatedUser = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  status: "ACTIVE" | "INACTIVE";
};

type AuthContext = {
  session: SessionPayload;
  user: AuthenticatedUser;
};

type AuthOptions = {
  roles?: UserRole[];
};

export async function authenticateRequest(
  request: Request,
  options?: AuthOptions
): Promise<AuthContext | NextResponse> {
  const session = await sessionFromCookieHeader(request.headers.get("cookie"));
  if (!session) {
    return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      status: true
    }
  });

  if (!user || user.status !== "ACTIVE" || user.role !== session.role) {
    return NextResponse.json({ error: "Sessao invalida." }, { status: 401 });
  }

  if (options?.roles && !options.roles.includes(user.role)) {
    return NextResponse.json({ error: "Sem permissao." }, { status: 403 });
  }

  return { session, user };
}

export async function resolveBarberIdForUser(user: { id: number; email: string | null }) {
  const byUserId = await prisma.barber.findFirst({
    where: {
      status: "ACTIVE",
      userId: user.id
    },
    select: { id: true }
  });

  if (byUserId) {
    return byUserId.id;
  }

  if (!user.email) {
    return null;
  }

  const byEmail = await prisma.barber.findFirst({
    where: {
      status: "ACTIVE",
      email: user.email.toLowerCase()
    },
    select: { id: true }
  });

  return byEmail?.id ?? null;
}
