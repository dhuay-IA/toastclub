import { createVrSession } from "./auth";

export type SessionMode = "improvisation" | "presentation";
export type SessionDifficulty = "easy" | "medium" | "hard";

const createLocalSessionCode = () =>
  `LOCAL-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

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
      createdAt: new Date().toISOString(),
      videoUrl: `https://videos.toastclub.app/session/${sessionCode}`,
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
        sessionCode?: string;
        createdAt?: string;
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
    sessionCode,
    createdAt: session?.createdAt || new Date().toISOString(),
    videoUrl: `https://videos.toastclub.app/session/${sessionCode}`,
    source: "api" as const,
  };
}
