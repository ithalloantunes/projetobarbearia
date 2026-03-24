import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE_NAME,
  roleHomePath,
  type SessionRole,
  verifySessionToken
} from "@/lib/auth-session";

type AccessRule = {
  pathPrefix: string;
  roles: SessionRole[];
};

const PAGE_RULES: AccessRule[] = [
  { pathPrefix: "/cliente", roles: ["CLIENT"] },
  { pathPrefix: "/agendar", roles: ["CLIENT", "ADMIN"] },
  { pathPrefix: "/barbeiro", roles: ["BARBER", "ADMIN"] },
  { pathPrefix: "/admin", roles: ["ADMIN"] }
];

const API_RULES: AccessRule[] = [
  { pathPrefix: "/api/client", roles: ["CLIENT"] },
  { pathPrefix: "/api/appointments", roles: ["CLIENT", "BARBER", "ADMIN"] },
  { pathPrefix: "/api/barber/availability", roles: ["BARBER", "ADMIN"] },
  { pathPrefix: "/api/blocks", roles: ["BARBER", "ADMIN"] },
  { pathPrefix: "/api/admin", roles: ["ADMIN"] },
  { pathPrefix: "/api/auth/session", roles: ["CLIENT", "BARBER", "ADMIN"] }
];

function findRule(pathname: string, rules: AccessRule[]) {
  return rules.find((rule) => pathname === rule.pathPrefix || pathname.startsWith(`${rule.pathPrefix}/`));
}

function isAuthFormPath(pathname: string) {
  return pathname === "/entrar" || pathname === "/cadastrar";
}

function unauthenticatedApiResponse() {
  return NextResponse.json({ error: "Nao autenticado." }, { status: 401 });
}

function forbiddenApiResponse() {
  return NextResponse.json({ error: "Sem permissao." }, { status: 403 });
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const apiRule = findRule(pathname, API_RULES);
  const pageRule = findRule(pathname, PAGE_RULES);
  const activeRule = apiRule ?? pageRule;

  const rawToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = rawToken ? await verifySessionToken(rawToken) : null;

  if (activeRule) {
    if (!session) {
      if (apiRule) {
        return unauthenticatedApiResponse();
      }
      const loginUrl = new URL("/entrar", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!activeRule.roles.includes(session.role)) {
      if (apiRule) {
        return forbiddenApiResponse();
      }
      return NextResponse.redirect(new URL(roleHomePath(session.role), request.url));
    }
  }

  if (isAuthFormPath(pathname) && session) {
    return NextResponse.redirect(new URL(roleHomePath(session.role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/agendar/:path*",
    "/cliente/:path*",
    "/admin/:path*",
    "/barbeiro/:path*",
    "/entrar",
    "/cadastrar",
    "/api/client/:path*",
    "/api/barber/availability",
    "/api/admin/:path*",
    "/api/appointments/:path*",
    "/api/blocks/:path*",
    "/api/auth/session"
  ]
};
