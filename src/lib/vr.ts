import { createVrSession } from "./auth";

export type SessionMode = "improvisation" | "presentation";
export type SessionDifficulty = "easy" | "medium" | "hard";

const createLocalSessionCode = () =>
  Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, "0");

export async function createPracticeSession(params: {
  token?: string;
  mode: SessionMode;
  difficulty: SessionDifficulty;
  fileName?: string;
  totalMinutes?: number;
  slideCount?: number;
  slideImages?: string[];
  textTitle?: string;
  duration?: number;
}) {
  const {
    token,
    mode,
    difficulty,
    fileName,
    totalMinutes,
    slideCount,
    slideImages,
    textTitle,
    duration,
  } = params;

  if (!token) {
    const sessionCode = createLocalSessionCode();
    return {
      success: true,
      sessionCode,
      sessionId: sessionCode,
      createdAt: new Date().toISOString(),
      audioUrl: null,
      videoUrl: null,
      source: "local" as const,
    };
  }

  const scenarioKey =
    mode === "presentation" ? "presentation-upload" : "improvisation-teleprompter";

  const res = await createVrSession(token, {
    vrApp: mode,
    scenarioKey,
    metadata: {
      difficulty,
      duration,
      totalMinutes,
      fileName,
      slideCount,
      slideImages,
      textTitle,
    },
  });

  if (!res.success) {
    return {
      success: false,
      message: res.message || "No se pudo crear la sesion VR.",
    };
  }

  const session = res.data as
    | {
        id?: number;
        sessionCode?: string;
        createdAt?: string;
        audioUrl?: string | null;
        videoUrl?: string | null;
      }
    | undefined;

  const sessionCode = session?.sessionCode;

  if (!sessionCode) {
    return {
      success: false,
      message: "La API respondio sin sessionCode.",
    };
  }

  return {
    success: true,
    sessionId: session?.id ? String(session.id) : sessionCode,
    sessionCode,
    createdAt: session?.createdAt || new Date().toISOString(),
    audioUrl: session?.audioUrl ?? session?.videoUrl ?? null,
    videoUrl: session?.videoUrl ?? null,
    source: "api" as const,
  };
}
