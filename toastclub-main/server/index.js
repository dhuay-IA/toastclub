import { promises as fs } from "fs";
import path from "path";
import app from "./app.js";
import pool from "./config/db.js";

const port = Number(process.env.PORT || process.env.API_PORT || 4000);

const initializeDatabase = async () => {
  const schemaPath = path.resolve("server/models/schema.sql");
  const schema = await fs.readFile(schemaPath, "utf8");
  const statements = schema
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await pool.query(statement);
  }

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS role ENUM('student', 'admin') NOT NULL DEFAULT 'student'
    AFTER password_hash
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS otp_send_count TINYINT UNSIGNED NOT NULL DEFAULT 0
    AFTER otp_expires_at
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS password_reset_code VARCHAR(6) DEFAULT NULL
    AFTER otp_send_count
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS password_reset_expires_at DATETIME DEFAULT NULL
    AFTER password_reset_code
  `);

  await pool.query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS password_reset_send_count TINYINT UNSIGNED NOT NULL DEFAULT 0
    AFTER password_reset_expires_at
  `);

  await pool.query(`
    ALTER TABLE vr_sessions
    ADD COLUMN IF NOT EXISTS session_code VARCHAR(32) DEFAULT NULL
    AFTER user_id
  `);

  await pool.query(`
    UPDATE vr_sessions
    SET session_code = CONCAT('VR-', LPAD(id, 6, '0'))
    WHERE session_code IS NULL OR session_code = ''
  `);

  const [sessionCodeIndexes] = await pool.query(`
    SHOW INDEX FROM vr_sessions
    WHERE Key_name = 'vr_sessions_session_code_unique'
  `);

  if (!Array.isArray(sessionCodeIndexes) || sessionCodeIndexes.length === 0) {
    await pool.query(`
      ALTER TABLE vr_sessions
      ADD UNIQUE INDEX vr_sessions_session_code_unique (session_code)
    `);
  }

  await pool.query(`
    ALTER TABLE vr_sessions
    MODIFY COLUMN session_code VARCHAR(32) NOT NULL
  `);

  const configuredAdmins = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  if (configuredAdmins.length > 0) {
    const placeholders = configuredAdmins.map(() => "?").join(", ");
    await pool.query(
      `UPDATE users
       SET role = 'admin'
       WHERE LOWER(email) IN (${placeholders})`,
      configuredAdmins
    );
  }
};

await initializeDatabase();

app.listen(port, () => {
  console.log(`VR training API listening on port ${port}`);
});
