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
            address, parent_center_id, is_active, created_at
     FROM users WHERE id = ? LIMIT 1`,
    [id]
  );
}

/** Get all centers (role = 'center') */
export async function findAllCenters() {
  return query(
    `SELECT u.id, u.name, u.email, u.phone, u.organization_name,
            u.address, u.is_active, u.created_at,
            COUNT(s.id) AS subcenter_count
     FROM users u
     LEFT JOIN users s ON s.parent_center_id = u.id AND s.role = 'subcenter'
     WHERE u.role = 'center'
     GROUP BY u.id
     ORDER BY u.created_at DESC`
  );
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

/** Update center / subcenter details */
export async function updateUser(id, { name, phone, organization_name, address, is_active }) {
  return execute(
    `UPDATE users SET name=?, phone=?, organization_name=?, address=?, is_active=?, updated_at=NOW()
     WHERE id=?`,
    [name, phone ?? null, organization_name ?? null, address ?? null, is_active ?? true, id]
  );
}

/** Soft delete (deactivate) a center */
export async function deactivateUser(id) {
  return execute(`UPDATE users SET is_active=FALSE, updated_at=NOW() WHERE id=?`, [id]);
}

/** Hard delete a center (cascades to leads/subcenters via FK) */
export async function deleteUser(id) {
  return execute(`DELETE FROM users WHERE id=?`, [id]);
}
