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

async function clean() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  // Clear leads
  await conn.query("DELETE FROM leads");
  await conn.query("ALTER TABLE leads AUTO_INCREMENT = 1");

  // Insert 5 clean sample leads with the exact new values
  await conn.query(`
    INSERT INTO leads (student_name, email, phone, university_id, course_id, center_id, subcenter_id, lead_type, status, adm_status) VALUES
    ('Ravi Teja',   'ravi@example.com',  '9000000001', 1, 1, 2, 3, 'Primary',      'New Lead',                     'Pending'),
    ('Pooja Singh', 'pooja@example.com', '9000000002', 2, 3, 2, 3, 'Under Review', 'Fees Collected',               'Pending'),
    ('Aman Khan',   'aman@example.com',  '9000000003', 3, 5, 2, 3, 'Duplicate',    'Docs Under Review/Incomplete', 'Approved'),
    ('Neha Gupta',  'neha@example.com',  '9000000004', 4, 7, 2, 3, 'Primary',      'Admission Approved',           'Approved'),
    ('Vikas Nair',  'vikas@example.com', '9000000005', 1, 2, 2, NULL, 'Under Review', 'Refund Initiated',          'Refunded')
  `);

  console.log("Cleaned and re-inserted cleanly.");
  const [rows] = await conn.query("SELECT id, student_name, lead_type, status, adm_status FROM leads");
  console.table(rows);
  await conn.end();
}

clean().catch((e) => console.error(e));
