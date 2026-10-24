import mysql from "mysql2/promise";

// Singleton connection pool — reused across hot reloads in dev
const globalForDb = globalThis;

if (!globalForDb._mysqlPool) {
  globalForDb._mysqlPool = mysql.createPool({
    host:               process.env.DB_HOST     || "localhost",
    port:               parseInt(process.env.DB_PORT || "3306"),
    user:               process.env.DB_USER     || "root",
    password:           process.env.DB_PASSWORD || "",
    database:           process.env.DB_NAME     || "compare_degree_aps",
    waitForConnections: true,
    connectionLimit:    10,
    queueLimit:         0,
  });
}

/** @type {import("mysql2/promise").Pool} */
const pool = globalForDb._mysqlPool;

/**
 * Execute a SQL query with optional parameters.
 * @param {string} sql
 * @param {any[]} [params]
 * @returns {Promise<any[]>}
 */
export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

/**
 * Execute a single-row SELECT query.
 * Returns the first row or null.
 * @param {string} sql
 * @param {any[]} [params]
 * @returns {Promise<any | null>}
 */
export async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] ?? null;
}

/**
 * Execute an INSERT / UPDATE / DELETE query.
 * Returns the ResultSetHeader (insertId, affectedRows, etc.)
 * @param {string} sql
 * @param {any[]} [params]
 * @returns {Promise<import("mysql2").ResultSetHeader>}
 */
export async function execute(sql, params = []) {
  const [result] = await pool.execute(sql, params);
  return result;
}

export default pool;
