/**
 * users.repo.js — Raw SQL queries for the users table.
 * No business logic here. Called by services only.
 */
import { query, queryOne, execute } from "@/lib/db";

/** Find a user by email (for auth) */
export async function findByEmail(email) {
  return queryOne(
    `SELECT id, name, email, password_hash, role, phone,
            organization_name, address, parent_center_id, is_active
     FROM users WHERE email = ? LIMIT 1`,
    [email]
  );
}

/** Find a user by ID */
export async function findById(id) {
  return queryOne(
    `SELECT id, name, email, role, phone, organization_name,
            address, parent_center_id, billing_access,
            (billing_password_hash IS NOT NULL) AS has_billing_password,
            is_active, created_at
     FROM users WHERE id = ? LIMIT 1`,
    [id]
  );
}

/** Find a user with password_hash by ID (for password verification) */
export async function findByIdWithPassword(id) {
  return queryOne(
    `SELECT id, name, email, password_hash, billing_password_hash, billing_access, role, phone, organization_name,
            address, parent_center_id, is_active, created_at
     FROM users WHERE id = ? LIMIT 1`,
    [id]
  );
}

/** Get all centers (role = 'center') */
export async function findAllCenters() {
  return query(
    `SELECT u.id, u.name, u.email, u.phone, u.organization_name,
            u.address, u.billing_access, (u.billing_password_hash IS NOT NULL) AS has_billing_password,
            u.is_active, u.created_at,
            COUNT(s.id) AS subcenter_count
     FROM users u
     LEFT JOIN users s ON s.parent_center_id = u.id AND s.role = 'subcenter'
     WHERE u.role = 'center'
     GROUP BY u.id
     ORDER BY u.created_at DESC`
  );
}

/** Set unit billing access (grant or revoke) */
export async function setUnitBillingAccess(id, billingAccess) {
  return execute(`UPDATE users SET billing_access = ?, updated_at = NOW() WHERE id = ?`, [Boolean(billingAccess), id]);
}

/** Set or reset unit billing password */
export async function setUnitBillingPassword(id, passwordHash) {
  return execute(`UPDATE users SET billing_password_hash = ?, updated_at = NOW() WHERE id = ?`, [passwordHash, id]);
}

/** Get all subcenters optionally filtered by parent center */
export async function findAllSubcenters(centerIdFilter = null) {
  const sql = `
    SELECT u.id, u.name, u.email, u.phone, u.organization_name,
           u.is_active, u.parent_center_id, u.created_at,
           c.name AS center_name,
           COUNT(l.id) AS lead_count
    FROM users u
    LEFT JOIN users c ON c.id = u.parent_center_id
    LEFT JOIN leads l ON l.subcenter_id = u.id
    WHERE u.role = 'subcenter'
    ${centerIdFilter ? "AND u.parent_center_id = ?" : ""}
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `;
  return query(sql, centerIdFilter ? [centerIdFilter] : []);
}

/** Create a new user (center or subcenter) */
export async function createUser({ name, email, passwordHash, role, phone, organization_name, address, parent_center_id }) {
  const result = await execute(
    `INSERT INTO users (name, email, password_hash, role, phone, organization_name, address, parent_center_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, email, passwordHash, role, phone ?? null, organization_name ?? null, address ?? null, parent_center_id ?? null]
  );
  return result.insertId;
}

/** Flexible user details & credentials updater */
export async function updateUserDetails(id, { name, email, phone, organization_name, address, parent_center_id, is_active, passwordHash }) {
  const updates = [];
  const params = [];

  if (name !== undefined) {
    updates.push("name = ?");
    params.push(name);
  }
  if (email !== undefined) {
    updates.push("email = ?");
    params.push(email);
  }
  if (phone !== undefined) {
    updates.push("phone = ?");
    params.push(phone ?? null);
  }
  if (organization_name !== undefined) {
    updates.push("organization_name = ?");
    params.push(organization_name ?? null);
  }
  if (address !== undefined) {
    updates.push("address = ?");
    params.push(address ?? null);
  }
  if (parent_center_id !== undefined) {
    updates.push("parent_center_id = ?");
    params.push(parent_center_id ? parseInt(parent_center_id, 10) : null);
  }
  if (is_active !== undefined) {
    updates.push("is_active = ?");
    params.push(Boolean(is_active));
  }
  if (passwordHash) {
    updates.push("password_hash = ?");
    params.push(passwordHash);
  }

  if (updates.length === 0) return { affectedRows: 0 };

  updates.push("updated_at = NOW()");
  params.push(id);

  return execute(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, params);
}

/** Update user password hash directly */
export async function updateUserPassword(id, passwordHash) {
  return execute(`UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?`, [passwordHash, id]);
}

/** Set user active status (deactivate / activate) without affecting any leads */
export async function setUserActive(id, isActive) {
  return execute(`UPDATE users SET is_active = ?, updated_at = NOW() WHERE id = ?`, [Boolean(isActive), id]);
}

/** Update center / subcenter details (legacy helper) */
export async function updateUser(id, { name, phone, organization_name, address, is_active }) {
  return updateUserDetails(id, { name, phone, organization_name, address, is_active });
}

/** Soft delete (deactivate) a center */
export async function deactivateUser(id) {
  return setUserActive(id, false);
}

/** Hard delete a center (cascades to leads/subcenters via FK) */
export async function deleteUser(id) {
  return execute(`DELETE FROM users WHERE id=?`, [id]);
}
