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

export const getAdminReportMetrics = async () => {
  const [rows] = await pool.execute(
    `SELECT
       COUNT(*) AS total_sessions,
       SUM(CASE WHEN s.vr_app = 'improvisation' THEN 1 ELSE 0 END) AS improvisation_sessions,
       SUM(CASE WHEN s.vr_app = 'presentation' THEN 1 ELSE 0 END) AS presentation_sessions,
       SUM(CASE WHEN s.status = 'canceled' THEN 1 ELSE 0 END) AS canceled_sessions,
       SUM(CASE WHEN s.video_url IS NOT NULL AND s.video_url <> '' THEN 1 ELSE 0 END) AS audio_sessions,
       SUM(CASE
         WHEN JSON_EXTRACT(s.result_json, '$.feedback.confidence') IS NOT NULL
          AND JSON_EXTRACT(s.result_json, '$.feedback.audienceReaction') IS NOT NULL
          AND JSON_EXTRACT(s.result_json, '$.feedback.improvement') IS NOT NULL
         THEN 1 ELSE 0 END
       ) AS feedback_sessions,
       SUM(CASE WHEN s.created_at >= DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 7 DAY) THEN 1 ELSE 0 END) AS recent_sessions,
       SUM(CASE WHEN JSON_UNQUOTE(JSON_EXTRACT(s.metadata_json, '$.difficulty')) = 'easy' THEN 1 ELSE 0 END) AS easy_sessions,
       SUM(CASE WHEN JSON_UNQUOTE(JSON_EXTRACT(s.metadata_json, '$.difficulty')) = 'medium' THEN 1 ELSE 0 END) AS medium_sessions,
       SUM(CASE WHEN JSON_UNQUOTE(JSON_EXTRACT(s.metadata_json, '$.difficulty')) = 'hard' THEN 1 ELSE 0 END) AS hard_sessions
     FROM vr_sessions s
     INNER JOIN users u ON u.id = s.user_id
     WHERE u.role <> 'admin'`
  );

  return rows[0] ?? {};
};
