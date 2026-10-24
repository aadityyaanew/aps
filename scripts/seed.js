/**
 * scripts/seed.js
 * Run from terminal: node scripts/seed.js
 * Automatically connects using .env.local and executes schema.sql + seed.sql
 */
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

// Load .env.local manually
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const [key, ...values] = trimmed.split("=");
    if (key && values.length > 0) {
      process.env[key.trim()] = values.join("=").trim();
    }
  });
}

async function runSeed() {
  const host = process.env.DB_HOST || "localhost";
  const port = parseInt(process.env.DB_PORT || "3306");
  const user = process.env.DB_USER || "root";
  const password = process.env.DB_PASSWORD || "";
  const database = process.env.DB_NAME || "u725346955_aps";

  console.log(`Connecting to MySQL database [${database}] at ${host}:${port}...`);

  let connection;
  try {
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database,
      multipleStatements: true,
    });
    console.log("Connected successfully!");

    // Execute schema.sql
    const schemaSql = fs.readFileSync(path.join(__dirname, "..", "database", "schema.sql"), "utf-8");
    console.log("Running database/schema.sql...");
    await connection.query(schemaSql);
    console.log("Schema created / verified.");

    // Execute seed.sql
    const seedSql = fs.readFileSync(path.join(__dirname, "..", "database", "seed.sql"), "utf-8");
    console.log("Running database/seed.sql...");
    await connection.query(seedSql);
    console.log("Seed data inserted successfully!");

    console.log("\n=================================");
    console.log("LOGIN CREDENTIALS CREATED:");
    console.log("Admin:     admin@comparedegree.com     / password123");
    console.log("Center:    center@comparedegree.com    / password123");
    console.log("Subcenter: subcenter@comparedegree.com / password123");
    console.log("=================================\n");
  } catch (error) {
    console.error("Seeding error:", error.message);
    if (error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT") {
      console.log("\nTip: If connecting to Hostinger remotely, ensure Hostinger Remote MySQL allows your IP.");
    }
  } finally {
    if (connection) await connection.end();
  }
}

runSeed();
