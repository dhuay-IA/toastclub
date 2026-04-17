import pool from "../config/db.js";

export const listAdminReportSessions = async ({ limit = 100 }) => {
  const boundedLimit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 500) : 100;
  const [rows] = await pool.execute(
    `SELECT s.id,
            s.user_id,
            u.email,
            u.name,
            s.vr_app,
            s.scenario_key,
            s.status,
            s.metadata_json,
            s.result_json,
            s.started_at,
            s.ended_at,
            s.created_at,
            s.updated_at
     FROM vr_sessions s
     INNER JOIN users u ON u.id = s.user_id
     WHERE u.role <> 'admin'
     ORDER BY s.created_at DESC
     LIMIT ?`,
    [boundedLimit]
  );

  return rows;
};
