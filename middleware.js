/**
 * middleware.js — Route protection by role.
 * Runs on the edge before any page render.
 */
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import { ROLE_HOME } from "@/config/roles";

// Map route prefix → required role
const PROTECTED_ROUTES = {
  "/admin":      "admin",
  "/center":     "center",
  "/subcenter":  "subcenter",
};

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  // Determine if this path requires a specific role
  const requiredRole = Object.entries(PROTECTED_ROUTES).find(([prefix]) =>
    pathname.startsWith(prefix)
  )?.[1];

  // No protection needed for this path
  if (!requiredRole) return NextResponse.next();

  // Not authenticated → redirect to login
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Wrong role → redirect to their own home
  if (token.role !== requiredRole) {
    const home = ROLE_HOME[token.role] ?? "/login";
    return NextResponse.redirect(new URL(home, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/center/:path*", "/subcenter/:path*"],
};
