import mysql from "mysql2/promise";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, "../.env.local") });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Test conexión
pool.getConnection()
  .then(conn => {
    console.log("✅ Conectado a MySQL");
    conn.release();
  })
  .catch(err => {
    console.error("❌ Error DB:", err);
  });

export default pool;
