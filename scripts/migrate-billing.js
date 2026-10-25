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

async function runMigration() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  console.log("Connected to database...");

  // 1. Check & add columns to users table
  const [cols] = await conn.query("SHOW COLUMNS FROM users");
  const colNames = cols.map((c) => c.Field);

  if (!colNames.includes("billing_access")) {
    console.log("Adding billing_access column to users...");
    await conn.query("ALTER TABLE users ADD COLUMN billing_access BOOLEAN NOT NULL DEFAULT FALSE");
  }

  if (!colNames.includes("billing_password_hash")) {
    console.log("Adding billing_password_hash column to users...");
    await conn.query("ALTER TABLE users ADD COLUMN billing_password_hash VARCHAR(255) NULL");
  }

  // 2. Create invoices table
  console.log("Creating invoices table if not exists...");
  await conn.query(`
    CREATE TABLE IF NOT EXISTS invoices (
      id INT PRIMARY KEY AUTO_INCREMENT,
      unit_id INT NOT NULL,
      invoice_number VARCHAR(100) NOT NULL,
      invoice_date DATE NOT NULL,
      invoice_month VARCHAR(20) NOT NULL,
      invoice_year INT NOT NULL,
      amount DECIMAL(12, 2) NOT NULL,
      signed_by VARCHAR(255) NOT NULL,
      file_url TEXT NOT NULL,
      file_key VARCHAR(500) NOT NULL,
      file_name VARCHAR(255) NOT NULL,
      file_size INT NULL,
      status ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
      admin_remarks TEXT NULL,
      reviewed_by INT NULL,
      reviewed_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_unit_id (unit_id),
      INDEX idx_status (status),
      INDEX idx_month_year (invoice_month, invoice_year),
      FOREIGN KEY (unit_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
    )
  `);

  // 3. Create billing_notifications table
  console.log("Creating billing_notifications table if not exists...");
  await conn.query(`
    CREATE TABLE IF NOT EXISTS billing_notifications (
      id INT PRIMARY KEY AUTO_INCREMENT,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      type ENUM('announcement', 'instruction', 'reminder', 'alert') NOT NULL DEFAULT 'announcement',
      created_by INT NOT NULL,
      target_all_units BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // 4. Create billing_notification_recipients table
  console.log("Creating billing_notification_recipients table if not exists...");
  await conn.query(`
    CREATE TABLE IF NOT EXISTS billing_notification_recipients (
      id INT PRIMARY KEY AUTO_INCREMENT,
      notification_id INT NOT NULL,
      unit_id INT NOT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      read_at TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (notification_id) REFERENCES billing_notifications(id) ON DELETE CASCADE,
      FOREIGN KEY (unit_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE KEY unique_notif_unit (notification_id, unit_id),
      INDEX idx_unit_read (unit_id, is_read)
    )
  `);

  console.log("Migration completed successfully!");
  await conn.end();
}

runMigration().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
