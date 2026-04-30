import { findAgentSessionByCode, listAgentSessions } from "../models/agentModel.js";
import { createVrSession } from "../models/vrSessionModel.js";
import { findUserById, listStudentsForAgent } from "../models/userModel.js";

const parseJsonColumn = (value) => {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const serializeAgentSession = (session) => ({
  id: String(session.id),
  userId: session.user_id,
  email: session.email,
  name: session.name,
  sessionCode: session.session_code,
  mode: session.vr_app === "presentation" ? "presentation" : "improvisation",
  scenarioKey: session.scenario_key,
  status: session.status,
  metadata: parseJsonColumn(session.metadata_json),
  videoUrl: session.video_url,
  videoUploadedAt: session.video_uploaded_at,
  startedAt: session.started_at,
  endedAt: session.ended_at,
  createdAt: session.created_at,
  updatedAt: session.updated_at,
});

export const listAgentUsers = async (_req, res) => {
  const users = await listStudentsForAgent();

  return res.status(200).json({
    success: true,
    data: users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      firstSeenAt: user.created_at,
      lastSeenAt: user.updated_at,
    })),
  });
};

export const getAgentSessions = async (req, res) => {
  const sessions = await listAgentSessions({
    limit: Number(req.query.limit || 100),
  });

  return res.status(200).json({
    success: true,
    data: sessions.map(serializeAgentSession),
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

  const session = await findAgentSessionByCode(sessionCode);

  if (!session) {
    return res.status(404).json({
      success: false,
      message: "No se encontro una sesion con ese codigo.",
    });
  }

  return res.status(200).json({
    success: true,
    data: serializeAgentSession(session),
  });
};

export const createAgentGroupSession = async (req, res) => {
  const { userIds, vrApp, difficulty, duration, totalMinutes, textTitle, fileName } = req.body;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Selecciona al menos un usuario.",
    });
  }

  const uniqueUserIds = [...new Set(userIds.map((value) => Number(value)).filter(Boolean))];

  if (uniqueUserIds.length === 0 || uniqueUserIds.length > 30) {
    return res.status(400).json({
      success: false,
      message: "Selecciona entre 1 y 30 usuarios validos.",
    });
  }

  const normalizedVrApp = vrApp === "presentation" ? "presentation" : "improvisation";
  const normalizedDifficulty = ["easy", "medium", "hard"].includes(difficulty)
    ? difficulty
    : "medium";
  const scenarioKey =
    normalizedVrApp === "presentation" ? "presentation-agent" : "improvisation-agent";
  const groupId = `AGENT-${Date.now()}`;
  const createdSessions = [];

  for (const userId of uniqueUserIds) {
    const user = await findUserById(userId);

    if (!user || user.role !== "student") {
      continue;
    }

    const session = await createVrSession({
      userId,
      vrApp: normalizedVrApp,
      scenarioKey,
      metadata: {
        difficulty: normalizedDifficulty,
        duration: Number(duration) || undefined,
        totalMinutes: Number(totalMinutes) || undefined,
        textTitle: textTitle?.trim() || undefined,
        fileName: fileName?.trim() || undefined,
        groupId,
        createdByAgentId: req.user.id,
        createdByAgentEmail: req.user.email,
      },
    });

    createdSessions.push({
      ...session,
      email: user.email,
      name: user.name,
    });
  }

  return res.status(201).json({
    success: true,
    message: "Sesiones creadas correctamente.",
    data: createdSessions.map(serializeAgentSession),
  });
};
