import {
  buildAdminMetricsFromRecentSessions,
  getAdminReportMetrics,
  listAdminReportSessions,
} from "../models/adminModel.js";
import { listUsersForAdminReport } from "../models/userModel.js";

const parseJsonColumn = (value) => {
  if (!value) return null;
  if (typeof value === "object") return value;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
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
      sessions: sessions.map((session) => ({
        id: String(session.id),
        sessionCode: session.session_code,
        email: session.email,
        name: session.name,
        mode: session.vr_app === "presentation" ? "presentation" : "improvisation",
        difficulty: parseJsonColumn(session.metadata_json)?.difficulty ?? "medium",
        createdAt: session.created_at,
        startedAt: session.started_at,
        endedAt: session.ended_at,
        status: session.status,
        scenarioKey: session.scenario_key,
        audioUrl: session.video_url,
        videoUrl: session.video_url,
        scheduledAt: parseJsonColumn(session.metadata_json)?.scheduledAt,
        metadata: parseJsonColumn(session.metadata_json),
        result: parseJsonColumn(session.result_json),
      })),
    },
  });
};
