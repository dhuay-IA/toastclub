const GAS_URL = import.meta.env.VITE_GAS_URL as string | undefined;
const API_URL = import.meta.env.VITE_API_URL as string | undefined;

export type AuthResponse = {
  success: boolean;
  message: string;
  data?: unknown;
};

export type AuthenticatedUser = {
  id?: number | string;
  email?: string;
  name?: string;
  role?: "student" | "admin";
  isVerified?: boolean;
};

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

const isConfiguredUrl = (value?: string) =>
  Boolean(value && !value.includes("YOUR_SCRIPT_ID") && !value.includes("YOUR_API_URL"));

const getAuthProvider = () => {
  if (isConfiguredUrl(API_URL)) {
    return {
      type: "api" as const,
      baseUrl: API_URL!.replace(/\/+$/, ""),
    };
  }

  if (isConfiguredUrl(GAS_URL)) {
    return {
      type: "gas" as const,
      baseUrl: GAS_URL!,
    };
  }

  throw new Error(
    "Configura VITE_API_URL o un VITE_GAS_URL válido en .env.local para usar el inicio de sesión."
  );
};

const parseApiError = async (res: Response) => {
  try {
    const data = await res.json();
    return data?.message || "No se pudo completar la solicitud.";
  } catch {
    return "No se pudo completar la solicitud.";
  }
};

async function postToApi(path: string, payload: object): Promise<AuthResponse> {
  const { baseUrl } = getAuthProvider();
  let res: Response;

  try {
    res = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    return {
      success: false,
      message:
        "No se pudo conectar con el servidor. Verifica que la API esté corriendo en " +
        `${baseUrl}.`,
    };
  }

  if (!res.ok) {
    return {
      success: false,
      message: await parseApiError(res),
    };
  }

  const data = await res.json();
  return {
    success: Boolean(data?.success),
    message: data?.message || "",
    data: data?.data,
  };
}

async function getFromApi<T>(path: string, token: string): Promise<AuthResponse> {
  const { baseUrl, type } = getAuthProvider();

  if (type !== "api") {
    throw new Error("Esta operación requiere VITE_API_URL.");
  }

  let res: Response;

  try {
    res = await fetch(`${baseUrl}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    return {
      success: false,
      message:
        "No se pudo conectar con el servidor. Verifica que la API esté corriendo en " +
        `${baseUrl}.`,
    };
  }

  const payload = (await res.json().catch(() => ({}))) as ApiEnvelope<T>;

  if (!res.ok) {
    return {
      success: false,
      message: payload?.message || "No se pudo completar la solicitud.",
    };
  }

  return {
    success: Boolean(payload?.success),
    message: payload?.message || "",
    data: payload?.data,
  };
}

async function postToAuthenticatedApi<T>(
  path: string,
  token: string,
  payload: object
): Promise<AuthResponse> {
  const { baseUrl, type } = getAuthProvider();

  if (type !== "api") {
    throw new Error("Esta operación requiere VITE_API_URL.");
  }

  let res: Response;

  try {
    res = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    return {
      success: false,
      message:
        "No se pudo conectar con el servidor. Verifica que la API esté corriendo en " +
        `${baseUrl}.`,
    };
  }

  const responsePayload = (await res.json().catch(() => ({}))) as ApiEnvelope<T>;

  if (!res.ok) {
    return {
      success: false,
      message: responsePayload?.message || "No se pudo completar la solicitud.",
    };
  }

  return {
    success: Boolean(responsePayload?.success),
    message: responsePayload?.message || "",
    data: responsePayload?.data,
  };
}

async function postToGas(payload: object): Promise<AuthResponse> {
  const { baseUrl } = getAuthProvider();
  const res = await fetch(baseUrl, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  return JSON.parse(text);
}

export function sendOTP(email: string, name?: string) {
  const provider = getAuthProvider();

  if (provider.type === "api") {
    return postToApi("/api/send-otp", { email, name: name ?? "" });
  }

  return postToGas({ action: "sendOTP", email, name: name ?? "" });
}

export function verifyOTP(email: string, code: string) {
  const provider = getAuthProvider();

  if (provider.type === "api") {
    return postToApi("/api/verify-otp", { email, otp: code });
  }

  return postToGas({ action: "verifyOTP", email, code });
}

export function registerUser(email: string, name: string, password: string) {
  const provider = getAuthProvider();

  if (provider.type !== "api") {
    throw new Error("El registro con contraseña requiere VITE_API_URL.");
  }

  return postToApi("/api/register", { email, name, password });
}

export function loginUser(email: string, password: string) {
  const provider = getAuthProvider();

  if (provider.type !== "api") {
    throw new Error("El inicio de sesión con contraseña requiere VITE_API_URL.");
  }

  return postToApi("/api/login", { email, password });
}

export function requestPasswordReset(email: string) {
  const provider = getAuthProvider();

  if (provider.type !== "api") {
    throw new Error("La recuperación de contraseña requiere VITE_API_URL.");
  }

  return postToApi("/api/forgot-password", { email });
}

export function resetPassword(email: string, code: string, password: string) {
  const provider = getAuthProvider();

  if (provider.type !== "api") {
    throw new Error("La recuperación de contraseña requiere VITE_API_URL.");
  }

  return postToApi("/api/reset-password", { email, code, password });
}

export function getProfile(token: string) {
  return getFromApi<{ id: number; email: string; name: string; role: "student" | "admin" }>(
    "/api/profile",
    token
  );
}

export function getAdminReport(token: string) {
  return getFromApi<{
    users: Array<{
      id: number;
      email: string;
      name: string;
      role: "student" | "admin";
      firstSeenAt: string;
      lastSeenAt: string;
      totalSessions: number;
    }>;
    sessions: Array<{
      id: string;
      email: string;
      name: string;
      mode: "improvisation" | "presentation";
      difficulty: "easy" | "medium" | "hard";
      scheduledAt?: string;
      createdAt: string;
      status?: "active" | "completed" | "canceled";
      metadata?: {
        scheduledAt?: string;
      } | null;
    }>;
  }>("/api/admin/report", token);
}

export function getVrSessions(token: string) {
  return getFromApi<
    Array<{
      id: number;
      userId: number;
      sessionCode: string;
      vrApp: "presentation" | "improvisation";
      scenarioKey: string;
      status: "active" | "completed" | "canceled";
      metadata: {
        difficulty?: "easy" | "medium" | "hard";
        duration?: number;
        totalMinutes?: number;
        fileName?: string;
        slideCount?: number;
        slideImages?: string[];
        textTitle?: string;
        promptWord?: string;
        textPrompt?: string;
        selectedTags?: string[];
        scheduledAt?: string;
      } | null;
      result: unknown;
      audioUrl?: string | null;
      videoUrl?: string | null;
      videoUploadedAt?: string | null;
      createdAt: string;
      updatedAt: string;
      startedAt: string;
      endedAt?: string | null;
    }>
  >("/api/vr/sessions", token);
}

export function createVrSession(
  token: string,
  payload: {
    vrApp: "presentation" | "improvisation";
    scenarioKey: string;
    metadata: {
      difficulty: "easy" | "medium" | "hard";
      duration?: number;
      totalMinutes?: number;
      fileName?: string;
      slideCount?: number;
      slideImages?: string[];
      textTitle?: string;
      promptWord?: string;
      textPrompt?: string;
      selectedTags?: string[];
      scheduledAt?: string;
    };
  }
) {
  return postToAuthenticatedApi<{
    id: number;
    sessionCode: string;
    vrApp: "presentation" | "improvisation";
    scenarioKey: string;
    status: "active" | "completed" | "canceled";
    metadata: {
      difficulty: "easy" | "medium" | "hard";
      duration?: number;
      totalMinutes?: number;
      fileName?: string;
      slideCount?: number;
      slideImages?: string[];
      textTitle?: string;
      promptWord?: string;
      textPrompt?: string;
      selectedTags?: string[];
      scheduledAt?: string;
    } | null;
    audioUrl?: string | null;
    videoUrl?: string | null;
    createdAt: string;
  }>("/api/vr/session", token, payload);
}

export function cancelVrSession(token: string, sessionId: string) {
  return postToAuthenticatedApi<{
    id: number;
    sessionCode: string;
    vrApp: "presentation" | "improvisation";
    scenarioKey: string;
    status: "active" | "completed" | "canceled";
    createdAt: string;
  }>(`/api/vr/session/${sessionId}/cancel`, token, {});
}

export function saveVrSessionFeedback(
  token: string,
  sessionId: string,
  feedback: {
    confidence: string;
    audienceReaction: string;
    improvement: string;
    notes: string;
  }
) {
  return postToAuthenticatedApi<{
    id: number;
    sessionCode: string;
    status: "active" | "completed" | "canceled";
    result?: {
      feedback?: typeof feedback;
      feedbackUpdatedAt?: string;
    } | null;
    updatedAt: string;
  }>(`/api/vr/session/${sessionId}/feedback`, token, { feedback });
}
