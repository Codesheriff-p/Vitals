import "server-only";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { SessionUser, UserRole } from "@/types/auth";

const COOKIE_NAME = "hms_token";
const TOKEN_TTL = "8h";

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set. Add it to .env.local.");
  return secret;
}

export function signToken(user: SessionUser): string {
  return jwt.sign(user, getSecret(), { expiresIn: TOKEN_TTL });
}

export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, getSecret()) as SessionUser;
  } catch {
    return null;
  }
}

/** Reads and verifies the session cookie. Returns null when absent/invalid — never throws. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/** For Server Actions/Route Handlers issuing a session after successful login. */
export async function setSessionCookie(user: SessionUser) {
  const store = await cookies();
  store.set(COOKIE_NAME, signToken(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours, matches TOKEN_TTL
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export function hasRole(user: SessionUser | null, roles: UserRole[]): boolean {
  return !!user && roles.includes(user.role);
}

/** For Server Components/pages: redirects to /login when there is no session. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** For Server Components/pages/Server Actions: enforces role membership, redirecting to a 403 page otherwise. */
export async function requireRole(roles: UserRole[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect("/forbidden");
  return user;
}
