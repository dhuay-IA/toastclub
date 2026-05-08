import { findVrSessionByCode } from "../models/vrSessionModel.js";
import { findUserById, listUsersForAdminReport } from "../models/userModel.js";
import pool from "../config/db.js";

const parseJsonColumn = (value) => {
  if (!value) return null;
  if (typeof value === "object") return value;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const listAgentStudents = async (_req, res) => {
  const users = await listUsersForAdminReport();

  return res.status(200).json({
    success: true,
    data: users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      firstSeenAt: user.created_at,
      lastSeenAt: user.last_session_at ?? user.updated_at,
      totalSessions: Number(user.total_sessions ?? 0),
    })),
  });
};

export const getAgentSessionByCode = async (req, res) => {
  const sessionCode = String(req.params.sessionCode || "").trim().toUpperCase();

  if (!sessionCode) {
    return res.status(400).json({
      success: false,
      message: "El codigo de sesion es obligatorio.",
    });
  }

  const session = await findVrSessionByCode(sessionCode);

  if (!session) {
    return res.status(404).json({
      success: false,
      message: "No se encontro una sesion con ese codigo.",
    });
  }

  const user = await findUserById(session.user_id);
  const metadata = parseJsonColumn(session.metadata_json) ?? {};
  const result = parseJsonColumn(session.result_json) ?? null;

  return res.status(200).json({
    success: true,
    data: {
      id: String(session.id),
      userId: session.user_id,
      studentName: user?.name ?? "Alumno no disponible",
      studentEmail: user?.email ?? "",
      sessionCode: session.session_code,
      mode: session.vr_app === "presentation" ? "presentation" : "improvisation",
      difficulty: metadata.difficulty ?? "medium",
      status: session.status,
      audioUrl: session.video_url,
      videoUrl: session.video_url,
      createdAt: session.created_at,
      scheduledAt: metadata.scheduledAt,
      fileName: metadata.fileName,
      slideCount: metadata.slideCount,
      textTitle: metadata.textTitle,
      promptWord: metadata.promptWord,
      textPrompt: metadata.textPrompt,
      selectedTags: Array.isArray(metadata.selectedTags) ? metadata.selectedTags : [],
      duration: metadata.duration ?? metadata.totalMinutes ?? null,
      feedback: result?.feedback ?? null,
    },
  });
};

const serializeAgentSession = (session) => {
  const metadata = parseJsonColumn(session.metadata_json) ?? {};
  const result = parseJsonColumn(session.result_json) ?? null;

  return {
    id: String(session.id),
    userId: session.user_id,
    studentName: session.name,
    studentEmail: session.email,
    sessionCode: session.session_code,
    mode: session.vr_app === "presentation" ? "presentation" : "improvisation",
    difficulty: metadata.difficulty ?? "medium",
    status: session.status,
    audioUrl: session.video_url,
    videoUrl: session.video_url,
    createdAt: session.created_at,
    scheduledAt: metadata.scheduledAt,
    fileName: metadata.fileName,
    slideCount: metadata.slideCount,
    textTitle: metadata.textTitle,
    promptWord: metadata.promptWord,
    textPrompt: metadata.textPrompt,
    selectedTags: Array.isArray(metadata.selectedTags) ? metadata.selectedTags : [],
    duration: metadata.duration ?? metadata.totalMinutes ?? null,
    feedback: result?.feedback ?? null,
  };
};

export const listAgentSessions = async (req, res) => {
  const [sessions] = await pool.execute(
    `SELECT s.id,
            s.user_id,
            u.email,
            u.name,
            s.session_code,
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
     INNER JOIN users u ON u.id = s.user_id
     WHERE JSON_UNQUOTE(JSON_EXTRACT(s.metadata_json, '$.assignedByStaffId')) = ?
       AND JSON_UNQUOTE(JSON_EXTRACT(s.metadata_json, '$.assignedByStaffRole')) = 'agent'
     ORDER BY s.id DESC
     LIMIT 100`,
    [String(req.user.id)]
  );

  return res.status(200).json({
    success: true,
    data: sessions.map(serializeAgentSession),
  });
};
