import { getAdminReportMetrics, listAdminReportSessions } from "../models/adminModel.js";
import { listUsersForAdminReport } from "../models/userModel.js";

const parseJsonColumn = (value) => {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

export const getAdminReport = async (req, res) => {
  const users = await listUsersForAdminReport();
  const metrics = await getAdminReportMetrics();
  const sessions = await listAdminReportSessions({
    limit: Number(req.query.limit || 100),
  });

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
        email: session.email,
        name: session.name,
        mode: session.vr_app === "presentation" ? "presentation" : "improvisation",
        difficulty: parseJsonColumn(session.metadata_json)?.difficulty ?? "medium",
        createdAt: session.created_at,
        startedAt: session.started_at,
        endedAt: session.ended_at,
        status: session.status,
        scenarioKey: session.scenario_key,
        scheduledAt: parseJsonColumn(session.metadata_json)?.scheduledAt,
        metadata: parseJsonColumn(session.metadata_json),
        result: parseJsonColumn(session.result_json),
      })),
    },
  });
};
