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
