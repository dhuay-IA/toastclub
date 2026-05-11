import {
  buildAdminMetricsFromRecentSessions,
  getAdminReportMetrics,
  listAdminReportSessions,
} from "../models/adminModel.js";
import { listVrSessionsByUser } from "../models/vrSessionModel.js";
import {
  findVrSessionById,
  updateVrSessionMetadata,
  updateVrSessionStatus,
} from "../models/vrSessionModel.js";
import { findUserById, listUsersForAdminReport } from "../models/userModel.js";

const parseJsonColumn = (value) => {
  if (!value) return null;
  if (typeof value === "object") return value;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const allowedOperationalStatuses = new Set([
  "scheduled",
  "active",
  "in_progress",
  "completed",
  "canceled",
  "no_show",
]);

const serializeAdminSession = (session) => {
  const metadata = parseJsonColumn(session.metadata_json);

  return {
    id: String(session.id),
    userId: session.user_id,
    sessionCode: session.session_code,
    email: session.email,
    name: session.name,
    mode: session.vr_app === "presentation" ? "presentation" : "improvisation",
    difficulty: metadata?.difficulty ?? "medium",
    createdAt: session.created_at,
    startedAt: session.started_at,
    endedAt: session.ended_at,
    status: session.status,
    scenarioKey: session.scenario_key,
    audioUrl: session.video_url,
    videoUrl: session.video_url,
    scheduledAt: metadata?.scheduledAt,
    metadata,
    result: parseJsonColumn(session.result_json),
  };
};

export const getAdminReport = async (req, res) => {
  const users = await listUsersForAdminReport();
  let sessions = [];
  let sessionsError = "";

  try {
    sessions = await listAdminReportSessions({
      limit: Number(req.query.limit || 100),
    });
  } catch (error) {
    sessionsError = error?.message || "No se pudieron cargar las sesiones.";
    console.warn("Admin sessions fallback:", sessionsError);
  }

  const studentIds = users.map((user) => user.id);
  let metrics = buildAdminMetricsFromRecentSessions(sessions);
  let metricsIsFallback = true;

  try {
    metrics = await getAdminReportMetrics({ studentIds });
    metricsIsFallback = false;
  } catch (error) {
    console.warn("Admin metrics fallback:", error?.message || error);
  }

  return res.status(200).json({
    success: true,
    data: {
      metrics: {
        totalStudents: users.length,
        totalSessions: Number(metrics.total_sessions ?? 0),
        improvisationSessions: Number(metrics.improvisation_sessions ?? 0),
        presentationSessions: Number(metrics.presentation_sessions ?? 0),
        canceledSessions: Number(metrics.canceled_sessions ?? 0),
        audioSessions: Number(metrics.audio_sessions ?? 0),
        feedbackSessions: Number(metrics.feedback_sessions ?? 0),
        recentSessions: Number(metrics.recent_sessions ?? 0),
        difficulty: {
          easy: Number(metrics.easy_sessions ?? 0),
          medium: Number(metrics.medium_sessions ?? 0),
          hard: Number(metrics.hard_sessions ?? 0),
        },
      },
      metricsIsFallback,
      sessionsError,
      users: users.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        firstSeenAt: user.created_at,
        lastSeenAt: user.last_session_at ?? user.updated_at,
        totalSessions: Number(user.total_sessions ?? 0),
      })),
      sessions: sessions.map(serializeAdminSession),
    },
  });
};

export const getAdminUserSessions = async (req, res) => {
  const userId = Number(req.params.userId);

  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({
      success: false,
      message: "El alumno seleccionado no es valido.",
    });
  }

  const user = await findUserById(userId);

  if (!user || user.role === "admin") {
    return res.status(404).json({
      success: false,
      message: "No se encontro un alumno valido.",
    });
  }

  const sessions = await listVrSessionsByUser({ userId, limit: 100 });

  return res.status(200).json({
    success: true,
    data: sessions.map((session) =>
      serializeAdminSession({
        ...session,
        email: user.email,
        name: user.name,
      })
    ),
  });
};

export const updateAdminSessionStatus = async (req, res) => {
  const sessionId = Number(req.params.sessionId);
  const status = String(req.body.status || "").trim();

  if (!Number.isInteger(sessionId) || sessionId <= 0 || !allowedOperationalStatuses.has(status)) {
    return res.status(400).json({
      success: false,
      message: "Estado de sesion no valido.",
    });
  }

  const session = await updateVrSessionStatus({ sessionId, status });

  if (!session) {
    return res.status(404).json({
      success: false,
      message: "No se encontro la sesion.",
    });
  }

  const user = await findUserById(session.user_id);

  return res.status(200).json({
    success: true,
    data: serializeAdminSession({
      ...session,
      email: user?.email ?? "",
      name: user?.name ?? "",
    }),
  });
};

export const rescheduleAdminSession = async (req, res) => {
  const sessionId = Number(req.params.sessionId);
  const scheduledAt = String(req.body.scheduledAt || "").trim();

  if (!Number.isInteger(sessionId) || sessionId <= 0 || !scheduledAt) {
    return res.status(400).json({
      success: false,
      message: "Fecha de reprogramacion no valida.",
    });
  }

  const existingSession = await findVrSessionById(sessionId);

  if (!existingSession) {
    return res.status(404).json({
      success: false,
      message: "No se encontro la sesion.",
    });
  }

  const metadata = {
    ...(parseJsonColumn(existingSession.metadata_json) ?? {}),
    scheduledAt,
    rescheduledAt: new Date().toISOString(),
    rescheduledById: req.user.id,
    rescheduledByRole: req.user.role,
  };
  const session = await updateVrSessionMetadata({ sessionId, metadata });
  const user = await findUserById(session.user_id);

  return res.status(200).json({
    success: true,
    data: serializeAdminSession({
      ...session,
      email: user?.email ?? "",
      name: user?.name ?? "",
    }),
  });
};
