import { useCallback, useEffect, useMemo, useState } from "react";
import LandingPage from "@/components/LandingPage";
import LoginStep from "@/components/LoginStep";
import OTPStep from "@/components/OTPStep";
import TermsStep from "@/components/TermsStep";
import AdminReportStep from "@/components/AdminReportStep";
import AgentPanelStep from "@/components/AgentPanelStep";
import DashboardStep, {
  type SessionFeedback,
  type SessionSummary,
} from "@/components/DashboardStep";
import SessionFeedbackStep from "@/components/SessionFeedbackStep";
import ImprovisationConfigStep from "@/components/ImprovisationConfigStep";
import PresentationConfigStep from "@/components/PresentationConfigStep";
import DifficultyStep from "@/components/DifficultyStep";
import SessionReadyStep from "@/components/SessionReadyStep";
import StepTimeline from "@/components/StepTimeline";
import {
  cancelVrSession,
  getAgentSessionByCode,
  getAgentStudents,
  getAdminReport,
  getAdminUserSessions,
  getProfile,
  getVrSessions,
  saveVrSessionFeedback,
  uploadVrSessionAudioByCode,
} from "@/lib/auth";
import { createPracticeSession } from "@/lib/vr";

type FlowStep =
  | "landing"
  | "login"
  | "otp"
  | "terms"
  | "dashboard"
  | "admin-report"
  | "feedback"
  | "config-improv"
  | "config-presentation"
  | "difficulty"
  | "ready";

type SessionRecord = SessionSummary & {
  userId?: number;
  email: string;
};

type UserAccessRecord = {
  id?: number;
  email: string;
  name: string;
  firstSeenAt: string;
  lastSeenAt: string;
  totalSessions?: number;
};

type AdminReportMetrics = {
  totalStudents: number;
  totalSessions: number;
  improvisationSessions: number;
  presentationSessions: number;
  canceledSessions: number;
  audioSessions: number;
  feedbackSessions: number;
  recentSessions: number;
  difficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
};

const SESSION_KEY = "toastclub_user";
const SESSION_NAME_KEY = "toastclub_user_name";
const SESSION_TOKEN_KEY = "toastclub_token";
const SESSION_HISTORY_KEY = "toastclub_sessions";
const USER_REGISTRY_KEY = "toastclub_user_registry";

const formatDisplayName = (userEmail: string, explicitName?: string) => {
  if (explicitName?.trim()) return explicitName.trim();
  const localPart = userEmail.split("@")[0] ?? "Usuario";
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const getStoredUsers = () => {
  const stored = localStorage.getItem(USER_REGISTRY_KEY);
  if (!stored) return [] as UserAccessRecord[];

  try {
    return JSON.parse(stored) as UserAccessRecord[];
  } catch {
    return [] as UserAccessRecord[];
  }
};

const saveStoredUsers = (users: UserAccessRecord[]) => {
  localStorage.setItem(USER_REGISTRY_KEY, JSON.stringify(users));
};

const Index = () => {
  const [currentStep, setCurrentStep] = useState<FlowStep>("landing");
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [mode, setMode] = useState<"improvisation" | "presentation">("improvisation");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [sessionId, setSessionId] = useState("");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [sessionHistory, setSessionHistory] = useState<SessionRecord[]>([]);
  const [allSessions, setAllSessions] = useState<SessionRecord[]>([]);
  const [, setUserRegistry] = useState<UserAccessRecord[]>([]);
  const [fileName, setFileName] = useState("");
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [slideCount, setSlideCount] = useState(0);
  const [slideImages, setSlideImages] = useState<string[]>([]);
  const [textTitle, setTextTitle] = useState("");
  const [promptWord, setPromptWord] = useState("");
  const [textPrompt, setTextPrompt] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [duration, setDuration] = useState(3);
  const [scheduledAt, setScheduledAt] = useState("");
  const [otpResendCount, setOtpResendCount] = useState(0);
  const [authToken, setAuthToken] = useState("");
  const [userRole, setUserRole] = useState<"student" | "admin" | "agent">("student");
  const [adminReportUsers, setAdminReportUsers] = useState<UserAccessRecord[]>([]);
  const [adminReportSessions, setAdminReportSessions] = useState<SessionRecord[]>([]);
  const [adminReportMetrics, setAdminReportMetrics] = useState<AdminReportMetrics | null>(null);
  const [adminReportLoading, setAdminReportLoading] = useState(false);
  const [adminReportError, setAdminReportError] = useState("");
  const [adminReportRefreshKey, setAdminReportRefreshKey] = useState(0);
  const [selectedAdminStudentId, setSelectedAdminStudentId] = useState("");

  const mapApiSessionToRecord = useCallback(
    (session: {
      id: number;
      sessionCode: string;
      vrApp: "presentation" | "improvisation";
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
      status?: "active" | "completed" | "canceled";
      result?: {
        feedback?: SessionFeedback;
      } | null;
      audioUrl?: string | null;
      videoUrl?: string | null;
      createdAt: string;
    }): SessionRecord => ({
      id: String(session.id),
      sessionCode: session.sessionCode,
      email,
      mode: session.vrApp === "presentation" ? "presentation" : "improvisation",
      difficulty: session.metadata?.difficulty ?? "medium",
      status: session.status ?? "active",
      feedback: session.result?.feedback,
      createdAt: session.createdAt,
      scheduledAt: session.metadata?.scheduledAt,
      audioUrl: session.audioUrl ?? session.videoUrl ?? null,
      videoUrl: session.videoUrl ?? null,
      fileName: session.metadata?.fileName,
      totalMinutes: session.metadata?.totalMinutes,
      slideCount: session.metadata?.slideCount,
      previewImage: session.metadata?.slideImages?.[0],
      textTitle: session.metadata?.textTitle,
      promptWord: session.metadata?.promptWord,
      textPrompt: session.metadata?.textPrompt,
      selectedTags: session.metadata?.selectedTags,
      duration: session.metadata?.duration,
    }),
    [email]
  );

  useEffect(() => {
    const savedEmail = localStorage.getItem(SESSION_KEY);
    const savedName = localStorage.getItem(SESSION_NAME_KEY);
    const savedToken = localStorage.getItem(SESSION_TOKEN_KEY);
    if (savedEmail) setEmail(savedEmail);
    if (savedName) setUserName(savedName);
    if (savedToken) setAuthToken(savedToken);
  }, []);

  useEffect(() => {
    if (authToken) {
      return;
    }

    const stored = localStorage.getItem(SESSION_HISTORY_KEY);
    if (!stored) {
      setAllSessions([]);
      setSessionHistory([]);
      return;
    }

    try {
      const parsed = JSON.parse(stored) as SessionRecord[];
      const sorted = parsed.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setAllSessions(sorted);
      if (!email) {
        setSessionHistory([]);
        return;
      }

      setSessionHistory(sorted.filter((session) => session.email === email));
    } catch {
      setAllSessions([]);
      setSessionHistory([]);
    }
  }, [authToken, email]);

  useEffect(() => {
    if (!authToken || !email) {
      return;
    }

    let cancelled = false;

    void (async () => {
      const res = await getVrSessions(authToken);

      if (cancelled || !res.success) {
        return;
      }

      const sessions = ((res.data as Array<{
        id: number;
        sessionCode: string;
        vrApp: "presentation" | "improvisation";
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
        videoUrl?: string | null;
        audioUrl?: string | null;
        result?: {
          feedback?: SessionFeedback;
        } | null;
        status?: "active" | "completed" | "canceled";
        createdAt: string;
      }>) ?? []).map(mapApiSessionToRecord);

      setSessionHistory(sessions);
      setAllSessions(sessions);
    })();

    return () => {
      cancelled = true;
    };
  }, [authToken, email, mapApiSessionToRecord]);

  useEffect(() => {
    if (!authToken) {
      setUserRole("student");
      return;
    }

    let cancelled = false;

    void (async () => {
      const res = await getProfile(authToken);

      if (cancelled) return;

      if (!res.success) {
        localStorage.removeItem(SESSION_TOKEN_KEY);
        setAuthToken("");
        setUserRole("student");
        return;
      }

      const profile = res.data as
        | { email?: string; name?: string; role?: "student" | "admin" | "agent" }
        | undefined;

      setUserRole(profile?.role === "admin" || profile?.role === "agent" ? profile.role : "student");
      if (profile?.email) setEmail(profile.email);
      if (profile?.name) {
        setUserName(profile.name);
        localStorage.setItem(SESSION_NAME_KEY, profile.name);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authToken]);

  useEffect(() => {
    if (userRole !== "agent" || !authToken || currentStep !== "dashboard") {
      return;
    }

    let cancelled = false;

    void (async () => {
      const res = await getAgentStudents(authToken);

      if (cancelled || !res.success) {
        return;
      }

      const students = (res.data as UserAccessRecord[]) ?? [];
      setAdminReportUsers(students);
      setSelectedAdminStudentId((current) => current || String(students[0]?.id ?? ""));
    })();

    return () => {
      cancelled = true;
    };
  }, [authToken, currentStep, userRole]);

  useEffect(() => {
    if (
      userRole !== "admin" ||
      !authToken ||
      (currentStep !== "admin-report" && currentStep !== "dashboard")
    ) {
      return;
    }

    let cancelled = false;
    setAdminReportLoading(true);
    setAdminReportError("");

    void (async () => {
      const res = await getAdminReport(authToken);

      if (cancelled) return;

      if (!res.success) {
        setAdminReportUsers([]);
        setAdminReportSessions([]);
        setAdminReportMetrics(null);
        setAdminReportError(
          res.message || "No se pudo cargar el reporte del administrador."
        );
        setAdminReportLoading(false);
        return;
      }

      const report = res.data as
        | {
            metrics?: AdminReportMetrics;
            users?: UserAccessRecord[];
            sessions?: Array<
              SessionRecord & {
                userId?: number;
                metadata?: { scheduledAt?: string } | null;
                result?: { feedback?: SessionFeedback } | null;
              }
            >;
          }
        | undefined;

      setAdminReportMetrics(report?.metrics ?? null);
      const reportUsers = report?.users ?? [];
      setAdminReportUsers(reportUsers);
      setSelectedAdminStudentId((current) =>
        current || String(reportUsers[0]?.id ?? "")
      );
      const reportSessions = (report?.sessions ?? []).map((session) => ({
          ...session,
          scheduledAt: session.scheduledAt ?? session.metadata?.scheduledAt,
          feedback: session.feedback ?? session.result?.feedback,
        }));
      setAdminReportSessions(reportSessions);

      const expectedSessionCount = reportUsers.reduce(
        (total, user) => total + Number(user.totalSessions ?? 0),
        0
      );

      if (expectedSessionCount > reportSessions.length) {
        const userSessionResults = await Promise.allSettled(
          reportUsers
            .filter((user) => user.id && Number(user.totalSessions ?? 0) > 0)
            .map(async (user) => {
              const userSessions = await getAdminUserSessions(authToken, user.id as number);

              if (!userSessions.success) {
                return [] as SessionRecord[];
              }

              return ((userSessions.data as Array<
                SessionRecord & {
                  metadata?: { scheduledAt?: string } | null;
                  result?: { feedback?: SessionFeedback } | null;
                }
              >) ?? []).map((session) => ({
                ...session,
                scheduledAt: session.scheduledAt ?? session.metadata?.scheduledAt,
                feedback: session.feedback ?? session.result?.feedback,
              }));
            })
        );

        if (cancelled) return;

        const mergedSessions = userSessionResults
          .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        const dedupedSessions = Array.from(
          new Map(
            [...reportSessions, ...mergedSessions].map((session) => [
              session.id,
              session,
            ])
          ).values()
        ).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setAdminReportSessions(dedupedSessions);
      }
      setAdminReportLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [adminReportRefreshKey, authToken, currentStep, userRole]);

  const selectedSession = useMemo(
    () => sessionHistory.find((session) => session.id === selectedSessionId) ?? null,
    [selectedSessionId, sessionHistory]
  );

  const registerUserAccess = (userEmail: string, explicitName?: string) => {
    const normalizedEmail = userEmail.trim().toLowerCase();
    const resolvedName = formatDisplayName(normalizedEmail, explicitName);
    const now = new Date().toISOString();
    const existingUsers = getStoredUsers();
    const existingUser = existingUsers.find((user) => user.email === normalizedEmail);

    const nextUsers = existingUser
      ? existingUsers.map((user) =>
          user.email === normalizedEmail
            ? {
                ...user,
                name: resolvedName || user.name,
                lastSeenAt: now,
              }
            : user
        )
      : [
          {
            email: normalizedEmail,
            name: resolvedName,
            firstSeenAt: now,
            lastSeenAt: now,
          },
          ...existingUsers,
        ];

    saveStoredUsers(nextUsers);
    setUserRegistry(nextUsers);
  };

  const handleLoginSuccess = (
    userEmail: string,
    explicitName?: string,
    token?: string,
    role: "student" | "admin" | "agent" = "student"
  ) => {
    setOtpResendCount(0);
    setEmail(userEmail);
    setUserName(formatDisplayName(userEmail, explicitName));
    setUserRole(role);
    localStorage.setItem(SESSION_KEY, userEmail);
    localStorage.setItem(
      SESSION_NAME_KEY,
      formatDisplayName(userEmail, explicitName)
    );
    if (token) {
      setAuthToken(token);
      localStorage.setItem(SESSION_TOKEN_KEY, token);
    }
    registerUserAccess(userEmail, explicitName);
    setCurrentStep("dashboard");
  };

  const handleRegisterSuccess = (userEmail: string, explicitName: string) => {
    setEmail(userEmail);
    setUserName(formatDisplayName(userEmail, explicitName));
    setOtpResendCount(0);
    setCurrentStep("otp");
  };

  const handleOTPVerified = () => {
    setOtpResendCount(0);
    localStorage.setItem(SESSION_KEY, email);
    localStorage.setItem(SESSION_NAME_KEY, userName || formatDisplayName(email));
    registerUserAccess(email, userName || formatDisplayName(email));
    setCurrentStep("terms");
  };

  const handleTerms = () => {
    setCurrentStep("dashboard");
  };

  const handleMode = (selectedMode: "improvisation" | "presentation") => {
    setMode(selectedMode);
    setCurrentStep(
      selectedMode === "improvisation" ? "config-improv" : "config-presentation"
    );
  };

  const handleImprovConfig = (config: {
    textId: string;
    textTitle: string;
    promptWord: string;
    textPrompt: string;
    selectedTags: string[];
    duration: number;
    scheduledAt: string;
  }) => {
    setTextTitle(config.textTitle);
    setPromptWord(config.promptWord);
    setTextPrompt(config.textPrompt);
    setSelectedTags(config.selectedTags);
    setDuration(config.duration);
    setScheduledAt(config.scheduledAt);
    setCurrentStep("difficulty");
  };

  const handlePresentationConfig = (config: {
    fileName: string;
    fileSize: string;
    totalMinutes: number;
    slideCount: number;
    slideImages: string[];
    scheduledAt: string;
  }) => {
    setFileName(config.fileName);
    setTotalMinutes(config.totalMinutes);
    setSlideCount(config.slideCount);
    setSlideImages(config.slideImages);
    setScheduledAt(config.scheduledAt);
    setCurrentStep("difficulty");
  };

  const handleDifficulty = async (selectedDifficulty: "easy" | "medium" | "hard") => {
    setDifficulty(selectedDifficulty);

    const isStaffSessionCreator = userRole === "admin" || userRole === "agent";

    if (isStaffSessionCreator && !selectedAdminStudentId) {
      window.alert("Selecciona un student antes de crear la sesion.");
      setCurrentStep("dashboard");
      return;
    }

    const creation = await createPracticeSession({
      token: authToken || undefined,
      targetUserId: isStaffSessionCreator ? selectedAdminStudentId : undefined,
      mode,
      difficulty: selectedDifficulty,
      fileName,
      totalMinutes,
      slideCount,
      slideImages,
      textTitle,
      promptWord,
      textPrompt,
      selectedTags,
      duration,
      scheduledAt,
    });

    if (!creation.success) {
      window.alert(creation.message || "No se pudo crear la sesion VR.");
      return;
    }

    const newSessionId = creation.sessionCode;
    setSessionId(newSessionId);

    const newSession: SessionRecord = {
      id: creation.sessionId || newSessionId,
      sessionCode: newSessionId,
      email,
      mode,
      difficulty: selectedDifficulty,
      status: "active",
      createdAt: creation.createdAt,
      scheduledAt,
      videoUrl: creation.videoUrl ?? null,
      audioUrl: creation.audioUrl ?? creation.videoUrl ?? null,
      fileName,
      totalMinutes,
      slideCount,
      previewImage: slideImages[0],
      textTitle,
      promptWord,
      textPrompt,
      selectedTags,
      duration,
    };

    const isAdminAssignedSession = isStaffSessionCreator && Boolean(selectedAdminStudentId);

    if (authToken && !isAdminAssignedSession) {
      setSessionHistory((current) =>
        [newSession, ...current].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
      setAllSessions((current) =>
        [newSession, ...current].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
    } else if (authToken && isAdminAssignedSession) {
      setAdminReportRefreshKey((key) => key + 1);
    } else {
      const stored = localStorage.getItem(SESSION_HISTORY_KEY);
      const parsed = stored ? (JSON.parse(stored) as SessionRecord[]) : [];
      const nextHistory = [newSession, ...parsed];

      localStorage.setItem(SESSION_HISTORY_KEY, JSON.stringify(nextHistory));
      setAllSessions(
        nextHistory.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      );
      setSessionHistory(
        nextHistory
          .filter((session) => session.email === email)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      );
    }
    setCurrentStep("ready");
  };

  const handleStart = () => {
    const saved = localStorage.getItem(SESSION_KEY);
    setCurrentStep(saved ? "dashboard" : "login");
  };

  const handleOpenFeedback = (sessionIdToOpen: string) => {
    setSelectedSessionId(sessionIdToOpen);
    setCurrentStep("feedback");
  };

  const updateSessionRecord = (
    sessionIdToUpdate: string,
    updater: (session: SessionRecord) => SessionRecord
  ) => {
    const updateAndSort = (sessions: SessionRecord[]) =>
      sessions
        .map((session) => (session.id === sessionIdToUpdate ? updater(session) : session))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setAllSessions((current) => updateAndSort(current));
    setSessionHistory((current) => updateAndSort(current));

    const stored = localStorage.getItem(SESSION_HISTORY_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as SessionRecord[];
      localStorage.setItem(SESSION_HISTORY_KEY, JSON.stringify(updateAndSort(parsed)));
    }
  };

  const handleCancelSession = async (sessionIdToCancel: string) => {
    const session = sessionHistory.find((item) => item.id === sessionIdToCancel);
    if (!session || session.status === "canceled") {
      return;
    }

    const confirmed = window.confirm(
      "¿Deseas cancelar esta sesion? El codigo ya no deberia usarse si el estudiante no asistira."
    );

    if (!confirmed) {
      return;
    }

    if (authToken) {
      const res = await cancelVrSession(authToken, sessionIdToCancel);
      if (!res.success) {
        window.alert(res.message || "No se pudo cancelar la sesion.");
        return;
      }
    }

    updateSessionRecord(sessionIdToCancel, (current) => ({
      ...current,
      status: "canceled",
    }));
  };

  const handleSaveSessionFeedback = async (
    sessionIdToUpdate: string,
    feedback: SessionFeedback
  ) => {
    if (authToken) {
      const res = await saveVrSessionFeedback(authToken, sessionIdToUpdate, feedback);
      if (!res.success) {
        window.alert(res.message || "No se pudo guardar el feedback.");
        return;
      }

      updateSessionRecord(sessionIdToUpdate, (session) => ({ ...session, feedback }));
      setCurrentStep("dashboard");
      return;
    }

    updateSessionRecord(sessionIdToUpdate, (session) => ({ ...session, feedback }));
    setCurrentStep("dashboard");
  };

  const applyUploadedAudioToSession = (sessionCode: string, audioUrl: string | null) => {
    if (!audioUrl) return;

    const updateByCode = (sessions: SessionRecord[]) =>
      sessions
        .map((session) =>
          session.sessionCode === sessionCode
            ? {
                ...session,
                audioUrl,
                videoUrl: audioUrl,
              }
            : session
        )
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setSessionHistory((current) => updateByCode(current));
    setAllSessions((current) => updateByCode(current));
    setAdminReportSessions((current) => updateByCode(current));

    const stored = localStorage.getItem(SESSION_HISTORY_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as SessionRecord[];
      localStorage.setItem(SESSION_HISTORY_KEY, JSON.stringify(updateByCode(parsed)));
    }
  };

  const handleUploadSessionAudio = async (session: SessionSummary, file: File) => {
    if (!session.sessionCode) {
      window.alert("Esta sesion aun no tiene codigo para asociar el audio.");
      return;
    }

    if (!file.type.startsWith("audio/") && !/\.(mp3|wav|m4a|aac|ogg|webm)$/i.test(file.name)) {
      window.alert("Selecciona un archivo de audio valido.");
      return;
    }

    const res = await uploadVrSessionAudioByCode(session.sessionCode, file, authToken || undefined);

    if (!res.success) {
      window.alert(res.message || "No se pudo subir el audio.");
      return;
    }

    const uploadedSession = res.data as
      | {
          sessionCode?: string;
          audioUrl?: string | null;
          videoUrl?: string | null;
        }
      | undefined;
    const uploadedAudioUrl = uploadedSession?.audioUrl ?? uploadedSession?.videoUrl ?? null;

    applyUploadedAudioToSession(uploadedSession?.sessionCode ?? session.sessionCode, uploadedAudioUrl);

    if (userRole === "admin" || userRole === "agent") {
      setAdminReportRefreshKey((key) => key + 1);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_NAME_KEY);
    localStorage.removeItem(SESSION_TOKEN_KEY);
    setEmail("");
    setUserName("");
    setAuthToken("");
    setUserRole("student");
    setAdminReportUsers([]);
    setAdminReportSessions([]);
    setAdminReportMetrics(null);
    setAdminReportError("");
    setSelectedAdminStudentId("");
    setOtpResendCount(0);
    setSelectedSessionId(null);
    setCurrentStep("login");
  };

  const handleLoadAdminUserSessions = async (userId: number) => {
    if (!authToken) {
      throw new Error("No hay sesion de administrador activa.");
    }

    const res = await getAdminUserSessions(authToken, userId);

    if (!res.success) {
      throw new Error(res.message || "No se pudieron cargar las sesiones del alumno.");
    }

    return ((res.data as Array<
      SessionRecord & {
        metadata?: { scheduledAt?: string } | null;
        result?: { feedback?: SessionFeedback } | null;
      }
    >) ?? []).map((session) => ({
      ...session,
      scheduledAt: session.scheduledAt ?? session.metadata?.scheduledAt,
      feedback: session.feedback ?? session.result?.feedback,
    }));
  };

  const handleLookupAgentSession = async (code: string) => {
    if (!authToken) {
      throw new Error("No hay sesion de agent activa.");
    }

    const res = await getAgentSessionByCode(authToken, code);

    if (!res.success) {
      throw new Error(res.message || "No se pudo validar el codigo.");
    }

    return res.data as {
      id: string;
      userId: number;
      studentName: string;
      studentEmail: string;
      sessionCode: string;
      mode: "improvisation" | "presentation";
      difficulty: "easy" | "medium" | "hard";
      status: "active" | "completed" | "canceled";
      audioUrl?: string | null;
      videoUrl?: string | null;
      createdAt: string;
      scheduledAt?: string;
      fileName?: string;
      slideCount?: number;
      textTitle?: string;
      promptWord?: string;
      duration?: number | null;
    };
  };

  const handleUploadAudioByCode = async (code: string, file: File) => {
    await handleUploadSessionAudio(
      {
        id: code,
        sessionCode: code,
        mode: "improvisation",
        difficulty: "medium",
        createdAt: new Date().toISOString(),
      },
      file
    );
  };

  const adminUsers = adminReportUsers;
  const isCurrentUserAdmin = userRole === "admin";
  const isCurrentUserAgent = userRole === "agent";
  const isStaffSessionCreator = isCurrentUserAdmin || isCurrentUserAgent;
  const adminSessions = adminReportSessions;

  if (currentStep === "landing") {
    return <LandingPage onStart={handleStart} />;
  }

  const showTimeline =
    currentStep !== "login" &&
    currentStep !== "dashboard" &&
    currentStep !== "feedback" &&
    currentStep !== "admin-report";
  const isFirstSessionFlow =
    sessionHistory.length === 0 &&
    (currentStep === "otp" ||
      currentStep === "terms" ||
      currentStep === "config-improv" ||
      currentStep === "config-presentation" ||
      currentStep === "difficulty" ||
      currentStep === "ready");
  const timelineVariant = isFirstSessionFlow ? "full" : "remaining";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-30%] left-[-10%] w-[60%] h-[60%] rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, #660000, transparent)" }}
        />
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-[0.03]"
          style={{ background: "radial-gradient(circle, #007cd8, transparent)" }}
        />
      </div>

      {showTimeline && (
        <StepTimeline currentStep={currentStep} variant={timelineVariant} />
      )}

      <div className="flex-1 flex flex-col justify-center relative z-10">
        {currentStep === "login" && (
          <LoginStep
            onLoginSuccess={handleLoginSuccess}
            onRegisterSuccess={handleRegisterSuccess}
          />
        )}
        {currentStep === "otp" && (
          <OTPStep
            email={email}
            onComplete={handleOTPVerified}
            resendCount={otpResendCount}
            onResendSuccess={() => setOtpResendCount((count) => count + 1)}
            onBack={() => {
              setOtpResendCount(0);
              setCurrentStep("login");
            }}
          />
        )}
        {currentStep === "terms" && (
          <TermsStep
            onComplete={handleTerms}
            onBack={() => setCurrentStep("otp")}
          />
        )}
        {currentStep === "dashboard" && (
          isCurrentUserAgent ? (
            <AgentPanelStep
              agentName={userName || formatDisplayName(email)}
              students={adminUsers}
              selectedStudentId={selectedAdminStudentId}
              onSelectStudent={setSelectedAdminStudentId}
              onCreateSession={handleMode}
              onLookupSession={handleLookupAgentSession}
              onUploadAudioByCode={handleUploadAudioByCode}
              onLogout={handleLogout}
            />
          ) : (
            <DashboardStep
              userName={userName || formatDisplayName(email)}
              onSelectMode={handleMode}
              onLogout={handleLogout}
              onOpenFeedback={handleOpenFeedback}
              onCancelSession={handleCancelSession}
              onUploadAudio={handleUploadSessionAudio}
              onOpenAdminReport={isCurrentUserAdmin ? () => setCurrentStep("admin-report") : undefined}
              sessionSummary={sessionHistory[0] ?? null}
              sessionHistory={sessionHistory}
              isAdmin={isCurrentUserAdmin}
            />
          )
        )}
        {currentStep === "admin-report" && isCurrentUserAdmin && (
          <AdminReportStep
            adminName={userName || formatDisplayName(email)}
            users={adminUsers}
            sessions={adminSessions}
            metrics={adminReportMetrics}
            isLoading={adminReportLoading}
            error={adminReportError}
            dataSourceLabel="base real"
            onLoadUserSessions={handleLoadAdminUserSessions}
            onUploadAudio={handleUploadSessionAudio}
            onRefresh={() => setAdminReportRefreshKey((key) => key + 1)}
            onBack={() => setCurrentStep("dashboard")}
            onLogout={handleLogout}
          />
        )}
        {currentStep === "feedback" && selectedSession && (
          <SessionFeedbackStep
            session={selectedSession}
            onBack={() => setCurrentStep("dashboard")}
            onSave={handleSaveSessionFeedback}
          />
        )}
        {currentStep === "config-improv" && (
          <ImprovisationConfigStep
            onComplete={handleImprovConfig}
            onBack={() => setCurrentStep("dashboard")}
            isAdmin={isStaffSessionCreator}
            adminUsers={adminUsers}
            selectedAdminStudentId={selectedAdminStudentId}
            onSelectAdminStudent={setSelectedAdminStudentId}
          />
        )}
        {currentStep === "config-presentation" && (
          <PresentationConfigStep
            onComplete={handlePresentationConfig}
            onBack={() => setCurrentStep("dashboard")}
            isAdmin={isStaffSessionCreator}
            adminUsers={adminUsers}
            selectedAdminStudentId={selectedAdminStudentId}
            onSelectAdminStudent={setSelectedAdminStudentId}
          />
        )}
        {currentStep === "difficulty" && (
          <DifficultyStep
            onComplete={handleDifficulty}
            onBack={() =>
              setCurrentStep(
                mode === "improvisation" ? "config-improv" : "config-presentation"
              )
            }
          />
        )}
        {currentStep === "ready" && (
          <SessionReadyStep
            sessionCode={sessionId}
            mode={mode}
            difficulty={difficulty}
            fileName={fileName}
            totalMinutes={totalMinutes}
            slideCount={slideCount}
            slideImages={slideImages}
            textTitle={textTitle}
            promptWord={promptWord}
            textPrompt={textPrompt}
            selectedTags={selectedTags}
            duration={duration}
            scheduledAt={scheduledAt}
            onBackToDashboard={() => setCurrentStep("dashboard")}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
