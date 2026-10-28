const mysql = require("mysql2/promise");
require("dotenv").config({ path: ".env.local" });

const GLA_COURSES = [
  { name: "BBA - Human Resource Management", duration: "3 Years" },
  { name: "BBA - Marketing Management", duration: "3 Years" },
  { name: "BBA - Financial Management", duration: "3 Years" },
  { name: "BBA - Banking and Insurance", duration: "3 Years" },
  { name: "BCA - Bachelor of Computer Application", duration: "3 Years" },
  { name: "B.Com - Bachelor of Commerce", duration: "3 Years" },
  { name: "MBA - Marketing Management", duration: "2 Years" },
  { name: "MBA - Human Resource Management", duration: "2 Years" },
  { name: "MBA - Finance Management", duration: "2 Years" },
  { name: "MBA - Information Technology Management", duration: "2 Years" },
  { name: "MBA - Operations Management", duration: "2 Years" },
  { name: "MBA - Banking and Financial Services", duration: "2 Years" },
  { name: "MBA - Business Analytics", duration: "2 Years" },
  { name: "MBA - Supply Chain Management", duration: "2 Years" },
  { name: "MCA - Masters of Computer Application", duration: "2 Years" },
];

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "srv1676.hstgr.io",
    user: process.env.DB_USER || "u725346955_aps",
    password: process.env.DB_PASSWORD || "Aps@2327",
    database: process.env.DB_NAME || "u725346955_aps",
    port: parseInt(process.env.DB_PORT || "3306", 10),
  });

  console.log("Connected to MySQL database.");

  // 1. Ensure GLA University exists
  const [unis] = await conn.execute("SELECT * FROM universities WHERE id = 15 OR name LIKE '%GLA%'");
  let uniId = 15;
  if (unis.length === 0) {
    const [ins] = await conn.execute(
      "INSERT INTO universities (name, location) VALUES ('GLA University', 'Mathura, Uttar Pradesh')"
    );
    uniId = ins.insertId;
    console.log(`Inserted GLA University with ID: ${uniId}`);
  } else {
    uniId = unis[0].id;
    console.log(`Found GLA University with ID: ${uniId} (${unis[0].name})`);
  }

  // 2. Remove the old placeholder generic courses (id 77-81 if unused)
  const [leadUsage] = await conn.execute("SELECT COUNT(*) as cnt FROM leads WHERE university_id = ?", [uniId]);
  if (leadUsage[0].cnt === 0) {
    await conn.execute("DELETE FROM courses WHERE university_id = ?", [uniId]);
    console.log("Cleared old placeholder courses for GLA University.");
  }

  // 3. Insert the 15 official programs
  for (const c of GLA_COURSES) {
    await conn.execute(
      "INSERT INTO courses (university_id, name, duration) VALUES (?, ?, ?)",
      [uniId, c.name, c.duration]
    );
    console.log(`Added course: ${c.name}`);
  }

  console.log("GLA University courses updated successfully!");
  await conn.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

