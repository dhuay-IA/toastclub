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
  createAgentGroupSession,
  getAdminReport,
  getAgentSessions,
  getAgentUsers,
  getProfile,
  getVrSessions,
  type AgentSession,
  type AgentUser,
} from "@/lib/auth";
import { createPracticeSession } from "@/lib/vr";

type FlowStep =
  | "landing"
  | "login"
  | "otp"
  | "terms"
  | "dashboard"
  | "admin-report"
  | "agent-panel"
  | "feedback"
  | "config-improv"
  | "config-presentation"
  | "difficulty"
  | "ready";

type SessionRecord = SessionSummary & {
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
  const [duration, setDuration] = useState(3);
  const [otpResendCount, setOtpResendCount] = useState(0);
  const [authToken, setAuthToken] = useState("");
  const [userRole, setUserRole] = useState<"student" | "agent" | "admin">("student");
  const [adminReportUsers, setAdminReportUsers] = useState<UserAccessRecord[]>([]);
  const [adminReportSessions, setAdminReportSessions] = useState<SessionRecord[]>([]);
  const [adminReportLoading, setAdminReportLoading] = useState(false);
  const [adminReportError, setAdminReportError] = useState("");
  const [agentUsers, setAgentUsers] = useState<AgentUser[]>([]);
  const [agentSessions, setAgentSessions] = useState<AgentSession[]>([]);
  const [agentPanelLoading, setAgentPanelLoading] = useState(false);
  const [agentPanelError, setAgentPanelError] = useState("");

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
      } | null;
      videoUrl?: string | null;
      createdAt: string;
    }): SessionRecord => ({
      id: String(session.id),
      sessionCode: session.sessionCode,
      email,
      mode: session.vrApp === "presentation" ? "presentation" : "improvisation",
      difficulty: session.metadata?.difficulty ?? "medium",
      createdAt: session.createdAt,
      videoUrl: session.videoUrl ?? null,
      fileName: session.metadata?.fileName,
      totalMinutes: session.metadata?.totalMinutes,
      slideCount: session.metadata?.slideCount,
      previewImage: session.metadata?.slideImages?.[0],
      textTitle: session.metadata?.textTitle,
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
        } | null;
        videoUrl?: string | null;
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
        | { email?: string; name?: string; role?: "student" | "agent" | "admin" }
        | undefined;

      setUserRole(
        profile?.role === "admin" ? "admin" : profile?.role === "agent" ? "agent" : "student"
      );
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
    if (currentStep !== "admin-report" || userRole !== "admin" || !authToken) {
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
        setAdminReportError(
          res.message || "No se pudo cargar el reporte del administrador."
        );
        setAdminReportLoading(false);
        return;
      }

      const report = res.data as
        | {
            users?: UserAccessRecord[];
            sessions?: SessionRecord[];
          }
        | undefined;

      setAdminReportUsers(report?.users ?? []);
      setAdminReportSessions(report?.sessions ?? []);
      setAdminReportLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [authToken, currentStep, userRole]);

  const loadAgentPanelData = useCallback(async () => {
    if (!authToken || !["agent", "admin"].includes(userRole)) {
      return;
    }

    setAgentPanelLoading(true);
    setAgentPanelError("");

    const [usersRes, sessionsRes] = await Promise.all([
      getAgentUsers(authToken),
      getAgentSessions(authToken),
    ]);

    if (!usersRes.success || !sessionsRes.success) {
      setAgentUsers([]);
      setAgentSessions([]);
      setAgentPanelError(
        usersRes.message || sessionsRes.message || "No se pudo cargar el panel presencial."
      );
      setAgentPanelLoading(false);
      return;
    }

    setAgentUsers((usersRes.data as AgentUser[]) ?? []);
    setAgentSessions((sessionsRes.data as AgentSession[]) ?? []);
    setAgentPanelLoading(false);
  }, [authToken, userRole]);

  useEffect(() => {
    if (currentStep !== "agent-panel") {
      return;
    }

    void loadAgentPanelData();
  }, [currentStep, loadAgentPanelData]);

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
    role: "student" | "agent" | "admin" = "student"
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

  const handleCreateAgentGroupSession = async (payload: {
    userIds: number[];
    vrApp: "presentation" | "improvisation";
    difficulty: "easy" | "medium" | "hard";
    duration?: number;
    totalMinutes?: number;
    textTitle?: string;
    fileName?: string;
  }) => {
    if (!authToken) return;

    const res = await createAgentGroupSession(authToken, payload);

    if (!res.success) {
      setAgentPanelError(res.message || "No se pudieron crear las sesiones.");
      return;
    }

    setAgentPanelError("");
    await loadAgentPanelData();
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
    duration: number;
  }) => {
    setTextTitle(config.textTitle);
    setDuration(config.duration);
    setCurrentStep("difficulty");
  };

  const handlePresentationConfig = (config: {
    fileName: string;
    fileSize: string;
    totalMinutes: number;
    slideCount: number;
    slideImages: string[];
  }) => {
    setFileName(config.fileName);
    setTotalMinutes(config.totalMinutes);
    setSlideCount(config.slideCount);
    setSlideImages(config.slideImages);
    setCurrentStep("difficulty");
  };

  const handleDifficulty = async (selectedDifficulty: "easy" | "medium" | "hard") => {
    setDifficulty(selectedDifficulty);
    const creation = await createPracticeSession({
      token: authToken || undefined,
      mode,
      difficulty: selectedDifficulty,
      fileName,
      totalMinutes,
      slideCount,
      slideImages,
      textTitle,
      duration,
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
      createdAt: creation.createdAt,
      videoUrl: creation.videoUrl ?? null,
      fileName,
      totalMinutes,
      slideCount,
      previewImage: slideImages[0],
      textTitle,
      duration,
    };

    if (authToken) {
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

  const handleSaveSessionFeedback = (sessionIdToUpdate: string, feedback: SessionFeedback) => {
    const stored = localStorage.getItem(SESSION_HISTORY_KEY);
    const parsed = stored ? (JSON.parse(stored) as SessionRecord[]) : [];
    const nextHistory = parsed.map((session) =>
      session.id === sessionIdToUpdate ? { ...session, feedback } : session
    );

    localStorage.setItem(SESSION_HISTORY_KEY, JSON.stringify(nextHistory));
    setAllSessions(
      nextHistory.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    );
    setSessionHistory(
      nextHistory
        .filter((session) => session.email === email)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    );
    setCurrentStep("dashboard");
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
    setAdminReportError("");
    setAgentUsers([]);
    setAgentSessions([]);
    setAgentPanelError("");
    setOtpResendCount(0);
    setSelectedSessionId(null);
    setCurrentStep("login");
  };

  const adminUsers = adminReportUsers;
  const isCurrentUserAdmin = userRole === "admin";
  const isCurrentUserAgent = userRole === "agent";
  const adminSessions = adminReportSessions;

  if (currentStep === "landing") {
    return <LandingPage onStart={handleStart} />;
  }

  const showTimeline =
    currentStep !== "login" &&
    currentStep !== "dashboard" &&
    currentStep !== "feedback" &&
    currentStep !== "admin-report" &&
    currentStep !== "agent-panel";
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
        {currentStep === "terms" && <TermsStep onComplete={handleTerms} />}
        {currentStep === "dashboard" && (
          <DashboardStep
            userName={userName || formatDisplayName(email)}
            onSelectMode={handleMode}
            onLogout={handleLogout}
            onOpenFeedback={handleOpenFeedback}
            onOpenAdminReport={isCurrentUserAdmin ? () => setCurrentStep("admin-report") : undefined}
            onOpenAgentPanel={
              isCurrentUserAgent || isCurrentUserAdmin
                ? () => setCurrentStep("agent-panel")
                : undefined
            }
            sessionSummary={sessionHistory[0] ?? null}
            sessionHistory={sessionHistory}
            isAdmin={isCurrentUserAdmin}
            isAgent={isCurrentUserAgent || isCurrentUserAdmin}
          />
        )}
        {currentStep === "admin-report" && isCurrentUserAdmin && (
          <AdminReportStep
            adminName={userName || formatDisplayName(email)}
            users={adminUsers}
            sessions={adminSessions}
            isLoading={adminReportLoading}
            error={adminReportError}
            dataSourceLabel="base real"
            onBack={() => setCurrentStep("dashboard")}
            onLogout={handleLogout}
          />
        )}
        {currentStep === "agent-panel" && (isCurrentUserAgent || isCurrentUserAdmin) && (
          <AgentPanelStep
            agentName={userName || formatDisplayName(email)}
            users={agentUsers}
            sessions={agentSessions}
            isLoading={agentPanelLoading}
            error={agentPanelError}
            onBack={() => setCurrentStep("dashboard")}
            onLogout={handleLogout}
            onRefresh={loadAgentPanelData}
            onCreateGroupSession={handleCreateAgentGroupSession}
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
          <ImprovisationConfigStep onComplete={handleImprovConfig} />
        )}
        {currentStep === "config-presentation" && (
          <PresentationConfigStep onComplete={handlePresentationConfig} />
        )}
        {currentStep === "difficulty" && (
          <DifficultyStep onComplete={handleDifficulty} />
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
            duration={duration}
            onBackToDashboard={() => setCurrentStep("dashboard")}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
