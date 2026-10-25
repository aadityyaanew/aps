/**
 * auth.service.js — Authentication business logic.
 * Handles password hashing, verification, user lookup for NextAuth.
 */
import bcrypt from "bcryptjs";
import { findByEmail } from "@/repositories/users.repo";

const SALT_ROUNDS = 10;

/** Hash a plain-text password */
export async function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

/** Verify a plain password against a stored hash */
export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

/**
 * Authenticate a user by email + password.
 * Returns the user object (without password_hash) or null.
 */
export async function authenticateUser(email, password) {
  const user = await findByEmail(email);
  if (!user) return null;
  if (!user.is_active) return null;

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) return null;

  // Strip sensitive field before returning
  const { password_hash, ...safeUser } = user;
  return safeUser;
}

/**
 * Change password for any authenticated user.
 */
export async function changePassword(userId, currentPassword, newPassword) {
  if (!currentPassword || !newPassword) {
    throw new Error("Both current and new password are required.");
  }
  if (newPassword.length < 6) {
    throw new Error("New password must be at least 6 characters long.");
  }

  const { findByIdWithPassword, updateUserPassword } = await import("@/repositories/users.repo");
  const user = await findByIdWithPassword(userId);
  if (!user) {
    throw new Error("User not found.");
  }

  const isValid = await verifyPassword(currentPassword, user.password_hash);
  if (!isValid) {
    throw new Error("Current password is incorrect.");
  }

  const newHash = await hashPassword(newPassword);
  await updateUserPassword(userId, newHash);
  return { success: true };
}

/**
 * Update user's own profile and credentials (e.g. for Super Admin or any user)
 */
export async function updateProfile(userId, { name, email, phone, organization_name, password }) {
  const { updateUserDetails } = await import("@/repositories/users.repo");
  let passwordHash = undefined;

  if (password && password.trim()) {
    if (password.trim().length < 6) {
      throw new Error("Password must be at least 6 characters long.");
    }
    passwordHash = await hashPassword(password.trim());
  }

  await updateUserDetails(userId, {
    name,
    email,
    phone,
    organization_name,
    passwordHash,
  });

  return { success: true };
}
