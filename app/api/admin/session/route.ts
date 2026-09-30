import { NextResponse } from "next/server";
import { getAdmin } from "@/server/auth/session";

const HINT = "pf_admin";

function hintCookie(response: NextResponse, on: boolean) {
  response.cookies.set(HINT, on ? "1" : "", {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: false, // read by the client only to decide whether to load the editor
    maxAge: on ? 60 * 60 * 24 * 14 : 0,
  });
  return response;
}

/**
 * GET  → { admin: boolean } and keeps the non-secret "load the editor" hint cookie in sync.
 * The hint grants nothing: every admin action re-checks the session and role on the server.
 */
export async function GET(request: Request) {
  const admin = await getAdmin(request.headers);
  const response = NextResponse.json(
    admin ? { admin: true, name: admin.name, email: admin.email } : { admin: false },
    { headers: { "Cache-Control": "no-store" } },
  );
  return hintCookie(response, Boolean(admin));
}

export async function DELETE() {
  return hintCookie(NextResponse.json({ ok: true }), false);
}
