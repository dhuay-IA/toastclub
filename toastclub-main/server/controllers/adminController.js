import { listAdminReportSessions } from "../models/adminModel.js";
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
  const sessions = await listAdminReportSessions({
    limit: Number(req.query.limit || 100),
  });

  const sessionCountByUserId = new Map();
  sessions.forEach((session) => {
    sessionCountByUserId.set(
      session.user_id,
      (sessionCountByUserId.get(session.user_id) ?? 0) + 1
    );
  });

  return res.status(200).json({
    success: true,
    data: {
      users: users.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        firstSeenAt: user.created_at,
        lastSeenAt: user.updated_at,
        totalSessions: sessionCountByUserId.get(user.id) ?? 0,
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
        metadata: parseJsonColumn(session.metadata_json),
        result: parseJsonColumn(session.result_json),
      })),
    },
  });
};
