const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

// Load .env.local
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

async function migrate() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  console.log("Altering leads table columns...");
  await conn.query(`
    ALTER TABLE leads 
    MODIFY COLUMN lead_type VARCHAR(50) NOT NULL DEFAULT 'Under Review',
    MODIFY COLUMN status VARCHAR(50) NOT NULL DEFAULT 'New Lead',
    MODIFY COLUMN adm_status VARCHAR(50) NOT NULL DEFAULT 'Pending'
  `);

  await conn.query("UPDATE leads SET lead_type = 'Primary' WHERE lead_type = 'primary'");
  await conn.query("UPDATE leads SET lead_type = 'Duplicate' WHERE lead_type = 'secondary'");
  await conn.query("UPDATE leads SET status = 'New Lead' WHERE status IN ('new', 'contacted', 'application_submitted')");
  await conn.query("UPDATE leads SET status = 'Admission Approved' WHERE status = 'admitted'");
  await conn.query("UPDATE leads SET status = 'Admission Rejected' WHERE status = 'rejected'");
  await conn.query("UPDATE leads SET adm_status = 'Pending' WHERE adm_status = 'pending'");
  await conn.query("UPDATE leads SET adm_status = 'Approved' WHERE adm_status = 'approved'");
  await conn.query("UPDATE leads SET adm_status = 'Rejected' WHERE adm_status = 'rejected'");

  console.log("Migration successful!");
  const [cols] = await conn.query("SHOW COLUMNS FROM leads");
  console.log(cols.map((c) => ({ Field: c.Field, Type: c.Type, Default: c.Default })));
  await conn.end();
}

migrate().catch((e) => console.error(e));
