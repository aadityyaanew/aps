/**
 * universities.repo.js — Courses and universities lookup queries.
 */
import { query, queryOne, execute } from "@/lib/db";

export async function findAllUniversities() {
  return query(`SELECT id, name, location, website FROM universities ORDER BY name ASC`);
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
