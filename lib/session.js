import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Get the current server session.
 * Import this instead of calling getServerSession directly in every file.
 * @returns {Promise<import("next-auth").Session | null>}
 */
export async function getSession() {
  return getServerSession(authOptions);
}

/**
 * Get the current user from the session.
 * Returns null if not authenticated.
 * @returns {Promise<{id: number, name: string, email: string, role: string} | null>}
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

/**
 * Assert the user is logged in with one of the allowed roles.
 * Returns { user } on success or { error } string on failure.
 * @param {string[]} roles
 */
export async function requireRole(...roles) {
  const user = await getCurrentUser();
  if (!user) return { error: "unauthenticated" };
  if (!roles.includes(user.role)) return { error: "forbidden" };
  return { user };
}
