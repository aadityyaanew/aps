/**
 * leads.repo.js — Raw SQL queries for the leads table.
 */
import { query, queryOne, execute } from "@/lib/db";

const BASE_SELECT = `
  SELECT
    l.id, l.student_name, l.email, l.phone,
    l.lead_type, l.status, l.adm_status, l.notes,
    l.created_at, l.updated_at,
    l.center_id, l.subcenter_id,
    u.name AS university_name,
    co.name AS course_name,
    c.name  AS center_name,
    sc.name AS subcenter_name
  FROM leads l
  LEFT JOIN universities u  ON u.id  = l.university_id
  LEFT JOIN courses co      ON co.id = l.course_id
  LEFT JOIN users c         ON c.id  = l.center_id
  LEFT JOIN users sc        ON sc.id = l.subcenter_id
`;

/** Get ALL leads — admin view */
export async function findAll({ status, centerId, limit = 50, offset = 0 } = {}) {
  const conditions = [];
  const params = [];
  if (status)   { conditions.push("l.status = ?");    params.push(status);   }
  if (centerId) { conditions.push("l.center_id = ?"); params.push(centerId); }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  return query(`${BASE_SELECT} ${where} ORDER BY l.created_at DESC LIMIT ? OFFSET ?`, [...params, limit, offset]);
}

/** Get leads for a specific center (includes subcenter leads) */
export async function findByCenter(centerId, { status, limit = 50, offset = 0 } = {}) {
  const params = [centerId];
  let statusClause = "";
  if (status) { statusClause = "AND l.status = ?"; params.push(status); }
  return query(
    `${BASE_SELECT} WHERE l.center_id = ? ${statusClause} ORDER BY l.created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
}

/** Get leads for a specific subcenter */
export async function findBySubcenter(subcenterId, { status, limit = 50, offset = 0 } = {}) {
  const params = [subcenterId];
  let statusClause = "";
  if (status) { statusClause = "AND l.status = ?"; params.push(status); }
  return query(
    `${BASE_SELECT} WHERE l.subcenter_id = ? ${statusClause} ORDER BY l.created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
}

/** Find a single lead by ID */
export async function findById(id) {
  return queryOne(`${BASE_SELECT} WHERE l.id = ? LIMIT 1`, [id]);
}

/** Check for duplicate lead by phone + center */
export async function findDuplicate(phone, centerId) {
  return queryOne(
    `SELECT id FROM leads WHERE phone = ? AND center_id = ? LIMIT 1`,
    [phone, centerId]
  );
}

/** Create a new lead */
export async function createLead({ studentName, email, phone, universityId, courseId, centerId, subcenterId, leadType, notes }) {
  const result = await execute(
    `INSERT INTO leads (student_name, email, phone, university_id, course_id, center_id, subcenter_id, lead_type, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [studentName, email ?? null, phone, universityId ?? null, courseId ?? null, centerId, subcenterId ?? null, leadType ?? "primary", notes ?? null]
  );
  return result.insertId;
}

/** Update lead status */
export async function updateStatus(id, status) {
  return execute(`UPDATE leads SET status=?, updated_at=NOW() WHERE id=?`, [status, id]);
}

/** Update ADM status */
export async function updateAdmStatus(id, admStatus) {
  return execute(`UPDATE leads SET adm_status=?, updated_at=NOW() WHERE id=?`, [admStatus, id]);
}

/** Full lead update */
export async function updateLead(id, { studentName, email, phone, universityId, courseId, status, admStatus, notes }) {
  return execute(
    `UPDATE leads SET student_name=?, email=?, phone=?, university_id=?, course_id=?,
     status=?, adm_status=?, notes=?, updated_at=NOW() WHERE id=?`,
    [studentName, email ?? null, phone, universityId ?? null, courseId ?? null, status, admStatus, notes ?? null, id]
  );
}

/** Count stats for dashboard */
export async function countStats(centerId = null) {
  const where = centerId ? "WHERE center_id = ?" : "";
  const params = centerId ? [centerId] : [];
  return queryOne(
    `SELECT
       COUNT(*) AS total,
       SUM(lead_type='primary')   AS primary_leads,
       SUM(lead_type='secondary') AS secondary_leads,
       SUM(status='admitted')     AS admitted,
       SUM(status='rejected')     AS rejected
     FROM leads ${where}`,
    params
  );
}
