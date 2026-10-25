/**
 * universities.repo.js — Courses and universities lookup queries.
 */
import { query, queryOne, execute } from "@/lib/db";

export async function findAllUniversities() {
  return query(`
    SELECT u.id, u.name, u.location, u.website,
           COUNT(c.id) AS course_count
    FROM universities u
    LEFT JOIN courses c ON c.university_id = u.id
    GROUP BY u.id
    ORDER BY u.name ASC
  `);
}

export async function findUniversityById(id) {
  return queryOne(`SELECT * FROM universities WHERE id = ? LIMIT 1`, [id]);
}

export async function createUniversity({ name, location, website }) {
  const result = await execute(
    `INSERT INTO universities (name, location, website) VALUES (?, ?, ?)`,
    [name, location ?? null, website ?? null]
  );
  return result.insertId;
}

export async function updateUniversity(id, { name, location, website }) {
  await execute(
    `UPDATE universities SET name=?, location=?, website=?, created_at=created_at WHERE id=?`,
    [name, location ?? null, website ?? null, id]
  );
}

export async function deleteUniversity(id) {
  await execute(`UPDATE leads SET university_id = NULL, course_id = NULL WHERE university_id = ?`, [id]);
  await execute(`DELETE FROM courses WHERE university_id = ?`, [id]);
  await execute(`DELETE FROM universities WHERE id = ?`, [id]);
}

export async function findCoursesByUniversity(universityId) {
  return query(
    `SELECT id, name, duration, fees FROM courses WHERE university_id = ? ORDER BY name ASC`,
    [universityId]
  );
}

export async function findCourseById(id) {
  return queryOne(`SELECT * FROM courses WHERE id = ? LIMIT 1`, [id]);
}

export async function createCourse({ universityId, name, duration, fees }) {
  const result = await execute(
    `INSERT INTO courses (university_id, name, duration, fees) VALUES (?, ?, ?, ?)`,
    [universityId, name, duration ?? null, fees ?? null]
  );
  return result.insertId;
}

export async function updateCourse(id, { name, duration, fees }) {
  await execute(
    `UPDATE courses SET name=?, duration=?, fees=? WHERE id=?`,
    [name, duration ?? null, fees ?? null, id]
  );
}

export async function deleteCourse(id) {
  await execute(`UPDATE leads SET course_id = NULL WHERE course_id = ?`, [id]);
  await execute(`DELETE FROM courses WHERE id = ?`, [id]);
}
