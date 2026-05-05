import pool from "../config/db.js";

const buildSessionCode = (sessionId) =>
  `VR-${String(sessionId).padStart(6, "0")}`;

const buildPendingSessionCode = () =>
  `PENDING-${Date.now()}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

export const createVrSession = async ({ userId, vrApp, scenarioKey, metadata }) => {
  const [result] = await pool.execute(
    `INSERT INTO vr_sessions (user_id, session_code, vr_app, scenario_key, status, metadata_json)
     VALUES (?, ?, ?, ?, 'active', ?)`,
    [
      userId,
      buildPendingSessionCode(),
      vrApp,
      scenarioKey,
      JSON.stringify(metadata ?? null),
    ]
  );

  await pool.execute(
    `UPDATE vr_sessions
     SET session_code = ?
     WHERE id = ?`,
    [buildSessionCode(result.insertId), result.insertId]
  );

  return findVrSessionById(result.insertId);
};

export const findVrSessionById = async (sessionId) => {
  const [rows] = await pool.execute(
    `SELECT id, user_id, session_code, vr_app, scenario_key, status, metadata_json, result_json,
            video_url, video_uploaded_at, started_at, ended_at, created_at, updated_at
     FROM vr_sessions
     WHERE id = ?
     LIMIT 1`,
    [sessionId]
  );

  return rows[0] ?? null;
};

export const findVrSessionByIdForUser = async ({ sessionId, userId }) => {
  const [rows] = await pool.execute(
    `SELECT id, user_id, session_code, vr_app, scenario_key, status, metadata_json, result_json,
            video_url, video_uploaded_at, started_at, ended_at, created_at, updated_at
     FROM vr_sessions
     WHERE id = ? AND user_id = ?
     LIMIT 1`,
    [sessionId, userId]
  );

  return rows[0] ?? null;
};

export const findActiveVrSessionByCode = async (sessionCode) => {
  const [rows] = await pool.execute(
    `SELECT id, user_id, session_code, vr_app, scenario_key, status, metadata_json, result_json,
            video_url, video_uploaded_at, started_at, ended_at, created_at, updated_at
     FROM vr_sessions
     WHERE session_code = ? AND status = 'active'
     LIMIT 1`,
    [sessionCode]
  );

  return rows[0] ?? null;
};

export const findVrSessionByCode = async (sessionCode) => {
  const [rows] = await pool.execute(
    `SELECT id, user_id, session_code, vr_app, scenario_key, status, metadata_json, result_json,
            video_url, video_uploaded_at, started_at, ended_at, created_at, updated_at
     FROM vr_sessions
     WHERE session_code = ?
     LIMIT 1`,
    [sessionCode]
  );

  return rows[0] ?? null;
};

export const listVrSessionsByUser = async ({ userId, limit = 10 }) => {
  const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.min(limit, 50)) : 10;

  const [rows] = await pool.execute(
    `SELECT id, user_id, session_code, vr_app, scenario_key, status, metadata_json, result_json,
            video_url, video_uploaded_at, started_at, ended_at, created_at, updated_at
     FROM vr_sessions
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT ${safeLimit}`,
    [userId]
  );

  return rows;
};

export const attachVideoToVrSession = async ({ sessionId, videoUrl }) => {
  await pool.execute(
    `UPDATE vr_sessions
     SET video_url = ?,
         video_uploaded_at = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [videoUrl, sessionId]
  );

  return findVrSessionById(sessionId);
};

export const completeVrSession = async ({ sessionId, userId, result }) => {
  await pool.execute(
    `UPDATE vr_sessions
     SET status = 'completed',
         result_json = ?,
         ended_at = CURRENT_TIMESTAMP,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND user_id = ?`,
    [JSON.stringify(result ?? null), sessionId, userId]
  );

  return findVrSessionByIdForUser({ sessionId, userId });
};

export const saveVrSessionFeedback = async ({ sessionId, userId, result }) => {
  await pool.execute(
    `UPDATE vr_sessions
     SET result_json = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND user_id = ?`,
    [JSON.stringify(result ?? null), sessionId, userId]
  );

  return findVrSessionByIdForUser({ sessionId, userId });
};

export const cancelVrSession = async ({ sessionId, userId }) => {
  await pool.execute(
    `UPDATE vr_sessions
     SET status = 'canceled',
         ended_at = COALESCE(ended_at, CURRENT_TIMESTAMP),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND user_id = ?`,
    [sessionId, userId]
  );

  return findVrSessionByIdForUser({ sessionId, userId });
};
