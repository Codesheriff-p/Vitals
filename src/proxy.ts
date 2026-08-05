import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

const COOKIE_NAME = "hms_token";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/") return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const user = token ? verifyToken(token) : null;

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Protect everything except the marketing landing page, the login/signup
// pages (and their sub-steps, e.g. /signup/verify), static assets, and the
// favicon. Those pages re-check the session themselves and redirect
// signed-in users to /dashboard.
// Individual pages/Server Actions still re-check the session and role — this
// is a first line of defense, not the only one.
export const config = {
  matcher: ["/((?!login|signup|api/auth|_next/static|_next/image|favicon.ico).*)"],
};
