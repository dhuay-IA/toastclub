import pool from "../config/db.js";

export const listAgentSessions = async ({ limit = 100 }) => {
  const boundedLimit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 300) : 100;
  const [rows] = await pool.execute(
    `SELECT s.id,
            s.user_id,
            u.email,
            u.name,
            s.session_code,
            s.vr_app,
            s.scenario_key,
            s.status,
            s.metadata_json,
            s.video_url,
            s.video_uploaded_at,
            s.started_at,
            s.ended_at,
            s.created_at,
            s.updated_at
     FROM vr_sessions s
     INNER JOIN users u ON u.id = s.user_id
     WHERE u.role = 'student'
     ORDER BY s.created_at DESC
     LIMIT ?`,
    [boundedLimit]
  );

  return rows;
};

export const findAgentSessionByCode = async (sessionCode) => {
  const [rows] = await pool.execute(
    `SELECT s.id,
            s.user_id,
            u.email,
            u.name,
            s.session_code,
            s.vr_app,
            s.scenario_key,
            s.status,
            s.metadata_json,
            s.video_url,
            s.video_uploaded_at,
            s.started_at,
            s.ended_at,
            s.created_at,
            s.updated_at
     FROM vr_sessions s
     INNER JOIN users u ON u.id = s.user_id
     WHERE s.session_code = ?
       AND u.role = 'student'
     LIMIT 1`,
    [sessionCode]
  );

  return rows[0] ?? null;
};
