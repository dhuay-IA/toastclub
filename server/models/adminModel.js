import pool from "../config/db.js";

const buildStudentFilter = (studentIds) => {
  if (!studentIds.length) {
    return {
      clause: "1 = 0",
      params: [],
    };
  }

  return {
    clause: `user_id IN (${studentIds.map(() => "?").join(", ")})`,
    params: studentIds,
  };
};

export const listAdminReportSessions = async ({ limit = 100 }) => {
  const boundedLimit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 500) : 100;
  const [rows] = await pool.execute(
    `SELECT recent_sessions.id,
            recent_sessions.user_id,
            u.email,
            u.name,
            recent_sessions.vr_app,
            recent_sessions.scenario_key,
            recent_sessions.status,
            recent_sessions.metadata_json,
            recent_sessions.result_json,
            recent_sessions.video_url,
            recent_sessions.started_at,
            recent_sessions.ended_at,
            recent_sessions.created_at,
            recent_sessions.updated_at
     FROM (
       SELECT s.id,
            s.user_id,
            s.vr_app,
            s.scenario_key,
            s.status,
            s.metadata_json,
            s.result_json,
            s.video_url,
            s.started_at,
            s.ended_at,
            s.created_at,
            s.updated_at
       FROM vr_sessions s
       ORDER BY s.id DESC
       LIMIT ${boundedLimit}
     ) recent_sessions
     INNER JOIN users u ON u.id = recent_sessions.user_id
     WHERE u.role <> 'admin'
     ORDER BY recent_sessions.id DESC
     LIMIT ${boundedLimit}`
  );

  return rows;
};

const countSessions = async ({ studentIds, extraWhere = "", params = [] }) => {
  const studentFilter = buildStudentFilter(studentIds);
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS total
     FROM vr_sessions
     WHERE ${studentFilter.clause}
     ${extraWhere}`,
    [...studentFilter.params, ...params]
  );

  return Number(rows[0]?.total ?? 0);
};

export const getAdminReportMetrics = async ({ studentIds }) => ({
  total_sessions: await countSessions({ studentIds }),
  improvisation_sessions: await countSessions({
    studentIds,
    extraWhere: "AND vr_app = ?",
    params: ["improvisation"],
  }),
  presentation_sessions: await countSessions({
    studentIds,
    extraWhere: "AND vr_app = ?",
    params: ["presentation"],
  }),
  canceled_sessions: await countSessions({
    studentIds,
    extraWhere: "AND status = ?",
    params: ["canceled"],
  }),
  audio_sessions: await countSessions({
    studentIds,
    extraWhere: "AND video_url IS NOT NULL AND video_url <> ''",
  }),
  feedback_sessions: await countSessions({
    studentIds,
    extraWhere:
      "AND JSON_EXTRACT(result_json, '$.feedback.confidence') IS NOT NULL",
  }),
  recent_sessions: await countSessions({
    studentIds,
    extraWhere: "AND created_at >= DATE_SUB(CURRENT_TIMESTAMP, INTERVAL 7 DAY)",
  }),
  easy_sessions: await countSessions({
    studentIds,
    extraWhere: "AND JSON_UNQUOTE(JSON_EXTRACT(metadata_json, '$.difficulty')) = ?",
    params: ["easy"],
  }),
  medium_sessions: await countSessions({
    studentIds,
    extraWhere: "AND JSON_UNQUOTE(JSON_EXTRACT(metadata_json, '$.difficulty')) = ?",
    params: ["medium"],
  }),
  hard_sessions: await countSessions({
    studentIds,
    extraWhere: "AND JSON_UNQUOTE(JSON_EXTRACT(metadata_json, '$.difficulty')) = ?",
    params: ["hard"],
  }),
});

export const buildAdminMetricsFromRecentSessions = (sessions) => {
  const metrics = {
    total_sessions: sessions.length,
    improvisation_sessions: 0,
    presentation_sessions: 0,
    canceled_sessions: 0,
    audio_sessions: 0,
    feedback_sessions: 0,
    recent_sessions: 0,
    easy_sessions: 0,
    medium_sessions: 0,
    hard_sessions: 0,
  };
  const recentCutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;

  sessions.forEach((session) => {
    if (session.vr_app === "improvisation") metrics.improvisation_sessions += 1;
    if (session.vr_app === "presentation") metrics.presentation_sessions += 1;
    if (session.status === "canceled") metrics.canceled_sessions += 1;
    if (session.video_url) metrics.audio_sessions += 1;
    if (new Date(session.created_at).getTime() >= recentCutoff) {
      metrics.recent_sessions += 1;
    }

    try {
      const metadata = session.metadata_json ? JSON.parse(session.metadata_json) : {};
      if (metadata.difficulty === "easy") metrics.easy_sessions += 1;
      if (metadata.difficulty === "medium") metrics.medium_sessions += 1;
      if (metadata.difficulty === "hard") metrics.hard_sessions += 1;
    } catch {
      metrics.medium_sessions += 1;
    }

    try {
      const result = session.result_json ? JSON.parse(session.result_json) : {};
      if (result.feedback?.confidence) metrics.feedback_sessions += 1;
    } catch {
      // Ignore malformed result JSON in fallback metrics.
    }
  });

  return metrics;
};
