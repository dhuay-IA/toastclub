import {
  attachVideoToVrSession,
  cancelVrSession,
  completeVrSession,
  createVrSession,
  findActiveVrSessionByCode,
  findVrSessionByCode,
  findVrSessionByIdForUser,
  listVrSessionsByUser,
} from "../models/vrSessionModel.js";
import { promises as fs } from "fs";
import path from "path";

const parseJsonColumn = (value) => {
  if (!value) return null;

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const serializeSession = (session) => ({
  id: session.id,
  userId: session.user_id,
  sessionCode: session.session_code,
  vrApp: session.vr_app,
  scenarioKey: session.scenario_key,
  status: session.status,
  metadata: parseJsonColumn(session.metadata_json),
  result: parseJsonColumn(session.result_json),
  videoUrl: session.video_url,
  audioUrl: session.video_url,
  videoUploadedAt: session.video_uploaded_at,
  startedAt: session.started_at,
  endedAt: session.ended_at,
  createdAt: session.created_at,
  updatedAt: session.updated_at,
});

const getPublicApiBaseUrl = (req) => {
  const configuredBaseUrl =
    process.env.PUBLIC_API_BASE_URL ||
    process.env.VR_API_BASE_URL ||
    process.env.API_BASE_URL;

  if (configuredBaseUrl?.trim()) {
    return configuredBaseUrl.replace(/\/+$/, "");
  }

  return `${req.protocol}://${req.get("host")}`;
};

const ensureMediaUploadDir = async () => {
  const uploadDir = path.resolve("server/uploads/vr");
  await fs.mkdir(uploadDir, { recursive: true });
  return uploadDir;
};

const getUploadedMediaFile = (req) =>
  req.file ?? req.files?.audio?.[0] ?? req.files?.video?.[0] ?? null;

const getSafeMediaExtension = (file) => {
  const originalExtension = path.extname(file?.originalname || "").toLowerCase();
  const allowedExtensions = new Set([
    ".mp3",
    ".wav",
    ".m4a",
    ".aac",
    ".ogg",
    ".webm",
    ".mp4",
    ".mov",
    ".m4v",
  ]);

  if (allowedExtensions.has(originalExtension)) {
    return originalExtension;
  }

  switch (file?.mimetype) {
    case "audio/mpeg":
      return ".mp3";
    case "audio/wav":
    case "audio/x-wav":
      return ".wav";
    case "audio/mp4":
    case "audio/x-m4a":
      return ".m4a";
    case "audio/aac":
      return ".aac";
    case "audio/ogg":
      return ".ogg";
    case "audio/webm":
    case "video/webm":
      return ".webm";
    case "video/quicktime":
      return ".mov";
    default:
      return ".mp3";
  }
};

export const getVrAccess = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      token: req.headers.authorization?.split(" ")[1] ?? null,
      user: req.user,
      apiBaseUrl: process.env.VR_API_BASE_URL || null,
      recommendedFlow: {
        startSessionEndpoint: "/api/vr/session",
        listSessionsEndpoint: "/api/vr/sessions",
        completeSessionEndpoint: "/api/vr/session/:sessionId/complete",
        vrPackageByCodeEndpoint: "/api/vr/session-code/:sessionCode/package",
        uploadAudioByCodeEndpoint: "/api/vr/session-code/:sessionCode/audio",
        uploadVideoByCodeEndpoint: "/api/vr/session-code/:sessionCode/video",
      },
    },
  });
};

export const startVrSession = async (req, res) => {
  const { vrApp, scenarioKey, metadata } = req.body;

  if (!vrApp || !scenarioKey) {
    return res.status(400).json({
      success: false,
      message: "vrApp and scenarioKey are required.",
    });
  }

  const session = await createVrSession({
    userId: req.user.id,
    vrApp: String(vrApp).trim(),
    scenarioKey: String(scenarioKey).trim(),
    metadata: metadata ?? null,
  });

  return res.status(201).json({
    success: true,
    message: "VR session created successfully.",
    data: serializeSession(session),
  });
};

const shouldRequireVrAppKey = () => Boolean(process.env.VR_APP_SHARED_SECRET?.trim());

const validateVrAppAccess = (req, res) => {
  if (!shouldRequireVrAppKey()) {
    return true;
  }

  const sharedKey = req.headers["x-vr-app-key"];

  if (sharedKey !== process.env.VR_APP_SHARED_SECRET) {
    res.status(401).json({
      success: false,
      message: "Invalid VR app key.",
    });
    return false;
  }

  return true;
};

export const getVrSessionPackageByCode = async (req, res) => {
  if (!validateVrAppAccess(req, res)) {
    return;
  }

  const sessionCode = String(req.params.sessionCode || "").trim().toUpperCase();

  if (!sessionCode) {
    return res.status(400).json({
      success: false,
      message: "sessionCode is required.",
    });
  }

  const session = await findActiveVrSessionByCode(sessionCode);

  if (!session) {
    return res.status(404).json({
      success: false,
      message: "VR session not found for this code.",
    });
  }

  const metadata = parseJsonColumn(session.metadata_json) ?? {};

  return res.status(200).json({
    success: true,
    data: {
      sessionId: session.id,
      sessionCode: session.session_code,
      vrApp: session.vr_app,
      scenarioKey: session.scenario_key,
      status: session.status,
      difficulty: metadata.difficulty ?? "medium",
      duration: metadata.duration ?? metadata.totalMinutes ?? null,
      totalMinutes: metadata.totalMinutes ?? null,
      slideCount: metadata.slideCount ?? 0,
      slideImages: Array.isArray(metadata.slideImages) ? metadata.slideImages : [],
      fileName: metadata.fileName ?? null,
      textTitle: metadata.textTitle ?? null,
      scheduledAt: metadata.scheduledAt ?? null,
      createdAt: session.created_at,
      startedAt: session.started_at,
      payload: metadata,
    },
  });
};

export const listMyVrSessions = async (req, res) => {
  const limit = Number(req.query.limit || 10);
  const sessions = await listVrSessionsByUser({
    userId: req.user.id,
    limit,
  });

  return res.status(200).json({
    success: true,
    data: sessions.map(serializeSession),
  });
};

export const getMyVrSession = async (req, res) => {
  const session = await findVrSessionByIdForUser({
    sessionId: Number(req.params.sessionId),
    userId: req.user.id,
  });

  if (!session) {
    return res.status(404).json({
      success: false,
      message: "VR session not found.",
    });
  }

  return res.status(200).json({
    success: true,
    data: serializeSession(session),
  });
};

export const finishVrSession = async (req, res) => {
  const { result } = req.body;
  const sessionId = Number(req.params.sessionId);

  const existingSession = await findVrSessionByIdForUser({
    sessionId,
    userId: req.user.id,
  });

  if (!existingSession) {
    return res.status(404).json({
      success: false,
      message: "VR session not found.",
    });
  }

  const session = await completeVrSession({
    sessionId,
    userId: req.user.id,
    result: result ?? null,
  });

  return res.status(200).json({
    success: true,
    message: "VR session completed successfully.",
    data: serializeSession(session),
  });
};

export const cancelMyVrSession = async (req, res) => {
  const sessionId = Number(req.params.sessionId);

  const existingSession = await findVrSessionByIdForUser({
    sessionId,
    userId: req.user.id,
  });

  if (!existingSession) {
    return res.status(404).json({
      success: false,
      message: "VR session not found.",
    });
  }

  const session = await cancelVrSession({
    sessionId,
    userId: req.user.id,
  });

  return res.status(200).json({
    success: true,
    message: "VR session canceled successfully.",
    data: serializeSession(session),
  });
};

export const uploadVrSessionVideoByCode = async (req, res) => {
  if (!validateVrAppAccess(req, res)) {
    return;
  }

  const sessionCode = String(req.params.sessionCode || "").trim().toUpperCase();

  if (!sessionCode) {
    return res.status(400).json({
      success: false,
      message: "sessionCode is required.",
    });
  }

  const mediaFile = getUploadedMediaFile(req);

  if (!mediaFile) {
    return res.status(400).json({
      success: false,
      message: "An audio file is required.",
    });
  }

  const session = await findVrSessionByCode(sessionCode);

  if (!session) {
    return res.status(404).json({
      success: false,
      message: "VR session not found for this code.",
    });
  }

  const uploadDir = await ensureMediaUploadDir();
  const extension = getSafeMediaExtension(mediaFile);
  const fileName = `${session.session_code}-${Date.now()}${extension}`;
  const filePath = path.join(uploadDir, fileName);

  await fs.writeFile(filePath, mediaFile.buffer);

  const videoUrl = `${getPublicApiBaseUrl(req)}/uploads/vr/${fileName}`;
  const updatedSession = await attachVideoToVrSession({
    sessionId: session.id,
    videoUrl,
  });

  return res.status(200).json({
    success: true,
    message: "VR session audio uploaded successfully.",
    data: serializeSession(updatedSession),
  });
};
