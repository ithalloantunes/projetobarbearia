import { NextResponse } from "next/server";
import { authenticateRequest, resolveBarberIdForUser } from "@/lib/auth-server";
import { roleHomePath } from "@/lib/auth-session";

export async function GET(request: Request) {
  const auth = await authenticateRequest(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const barberId =
    auth.user.role === "BARBER"
      ? await resolveBarberIdForUser({ id: auth.user.id, email: auth.user.email })
      : null;

  return NextResponse.json({
    user: auth.user,
    barberId,
    redirectTo: roleHomePath(auth.user.role)
  });
}
