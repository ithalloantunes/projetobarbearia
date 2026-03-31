import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, getSessionCookieOptions } from "@/lib/auth-session";

function clearSessionCookie(request: Request, response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    ...getSessionCookieOptions(request, 0)
  });
}

export async function POST(request: Request) {
  const response = NextResponse.json({ success: true });
  clearSessionCookie(request, response);
  return response;
}
