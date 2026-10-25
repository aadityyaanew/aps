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

import { findById } from "@/repositories/users.repo";

/**
 * Get the current user from the session.
 * Verifies active status in DB. Returns null if not authenticated or inactive.
 * @returns {Promise<{id: number, name: string, email: string, role: string} | null>}
 */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.user?.id) return null;

  try {
    const dbUser = await findById(session.user.id);
    if (!dbUser || !dbUser.is_active) return null;
    return {
      ...session.user,
      name:              dbUser.name,
      email:             dbUser.email,
      phone:             dbUser.phone,
      organizationName:  dbUser.organization_name,
      parentCenterId:    dbUser.parent_center_id,
      isActive:          dbUser.is_active,
    };
  } catch (err) {
    // Fallback to session user if DB check fails transiently
    return session.user;
  }
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
