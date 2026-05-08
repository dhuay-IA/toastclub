import {
  BarChart3,
  CheckCircle2,
  Download,
  GraduationCap,
  Headphones,
  LayoutDashboard,
  MonitorPlay,
  Presentation,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { SessionSummary } from "@/components/DashboardStep";

type AdminUserRecord = {
  id?: number;
  email: string;
  name: string;
  firstSeenAt: string;
  lastSeenAt: string;
  totalSessions?: number;
  isDemo?: boolean;
};

type AdminReportStepProps = {
  adminName: string;
  users: AdminUserRecord[];
  sessions: Array<SessionSummary & { userId?: number; email: string; name?: string }>;
  metrics?: AdminReportMetrics | null;
  isLoading?: boolean;
  error?: string;
  dataSourceLabel?: string;
  onLoadUserSessions?: (
    userId: number
  ) => Promise<Array<SessionSummary & { userId?: number; email: string; name?: string }>>;
  onUploadAudio?: (
    session: SessionSummary & { userId?: number; email: string; name?: string },
    file: File
  ) => Promise<void>;
  onRefresh: () => void;
  onBack: () => void;
  onLogout: () => void;
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

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const formatOptionalDate = (value?: string) => (value ? formatDate(value) : "Por confirmar");
const difficultyLabels = {
  easy: "Fácil",
  medium: "Medio",
  hard: "Difícil",
};

const csvEscape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;

const downloadCsv = (
  users: AdminUserRecord[],
  sessions: Array<SessionSummary & { userId?: number; email: string; name?: string }>
) => {
  const sessionsByUser = new Map<string, number>();

  sessions.forEach((session) => {
    sessionsByUser.set(session.email, (sessionsByUser.get(session.email) ?? 0) + 1);
  });

  const lines = [
    [
      "Tipo",
      "Email",
      "Nombre",
      "Codigo Sesion",
      "Total Sesiones",
      "Ultimo Ingreso",
      "Modo",
      "Dificultad",
      "Fecha Sesion",
      "Fecha Programada",
      "Estado",
      "Audio",
      "Feedback",
    ],
    ...users.map((user) => [
      "Usuario",
      user.email,
      user.name,
      "",
      sessionsByUser.get(user.email) ?? 0,
      formatDate(user.lastSeenAt),
      "",
      "",
      "",
      "",
      "",
      "",
      "",
    ]),
    ...sessions.map((session) => [
      "Sesion",
      session.email,
      session.name ?? "",
      session.sessionCode ?? "",
      "",
      "",
      session.mode === "improvisation" ? "Improvisacion" : "Presentacion",
      difficultyLabels[session.difficulty],
      formatDate(session.createdAt),
      formatOptionalDate(session.scheduledAt),
      session.status ?? "active",
      session.audioUrl ?? session.videoUrl ?? "",
      session.feedback ? "Registrado" : "Pendiente",
    ]),
  ];

  const csvContent = lines
    .map((row) => row.map((value) => csvEscape(value)).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `toastclub-reporte-admin-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const AdminReportStep = ({
  adminName,
  users,
  sessions,
  metrics,
  isLoading = false,
  error = "",
  dataSourceLabel = "servidor",
  onLoadUserSessions,
  onUploadAudio,
  onRefresh,
  onBack,
  onLogout,
}: AdminReportStepProps) => {
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);
  const [loadedUserSessions, setLoadedUserSessions] = useState<
    Array<SessionSummary & { userId?: number; email: string; name?: string }>
  >([]);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [sessionModeFilter, setSessionModeFilter] = useState<"all" | "improvisation" | "presentation">("all");
  const [sessionStatusFilter, setSessionStatusFilter] = useState<"all" | "active" | "completed" | "canceled">("all");
  const [sessionFromDate, setSessionFromDate] = useState("");
  const [sessionToDate, setSessionToDate] = useState("");
  const computedImprovSessions = sessions.filter((session) => session.mode === "improvisation").length;
  const computedPresentationSessions = sessions.filter((session) => session.mode === "presentation").length;
  const computedCanceledSessions = sessions.filter((session) => session.status === "canceled").length;
  const computedAudioSessions = sessions.filter((session) => session.audioUrl ?? session.videoUrl).length;
  const computedFeedbackSessions = sessions.filter((session) => session.feedback).length;
  const computedRecentSessions = sessions.filter(
    (session) =>
      new Date(session.createdAt).getTime() >=
      Date.now() - 7 * 24 * 60 * 60 * 1000
  ).length;
  const computedDifficultyTotals = sessions.reduce(
    (totals, session) => ({
      ...totals,
      [session.difficulty]: totals[session.difficulty] + 1,
    }),
    { easy: 0, medium: 0, hard: 0 }
  );
  const totalStudents = Math.max(metrics?.totalStudents ?? 0, users.length);
  const totalSessions = Math.max(metrics?.totalSessions ?? 0, sessions.length);
  const improvSessions =
    Math.max(metrics?.improvisationSessions ?? 0, computedImprovSessions);
  const presentationSessions =
    Math.max(metrics?.presentationSessions ?? 0, computedPresentationSessions);
  const canceledSessions =
    Math.max(metrics?.canceledSessions ?? 0, computedCanceledSessions);
  const audioSessions =
    Math.max(metrics?.audioSessions ?? 0, computedAudioSessions);
  const feedbackSessions =
    Math.max(metrics?.feedbackSessions ?? 0, computedFeedbackSessions);
  const recentSessions =
    Math.max(metrics?.recentSessions ?? 0, computedRecentSessions);
  const difficultyTotals = {
    easy: Math.max(metrics?.difficulty?.easy ?? 0, computedDifficultyTotals.easy),
    medium: Math.max(metrics?.difficulty?.medium ?? 0, computedDifficultyTotals.medium),
    hard: Math.max(metrics?.difficulty?.hard ?? 0, computedDifficultyTotals.hard),
  };

  const topUsers = users
    .map((user) => ({
      ...user,
      totalSessions:
        user.totalSessions ?? sessions.filter((session) => session.email === user.email).length,
    }))
    .sort((a, b) => b.totalSessions - a.totalSessions || b.lastSeenAt.localeCompare(a.lastSeenAt));
  const filteredTopUsers = topUsers.filter((user) => {
    const query = studentSearch.trim().toLowerCase();
    if (!query) return true;
    return user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query);
  });
  const filteredSessions = sessions
    .filter((session) => {
      const matchesMode = sessionModeFilter === "all" || session.mode === sessionModeFilter;
      const matchesStatus = sessionStatusFilter === "all" || (session.status ?? "active") === sessionStatusFilter;
      const createdTime = new Date(session.createdAt).getTime();
      const matchesFrom = !sessionFromDate || createdTime >= new Date(`${sessionFromDate}T00:00:00`).getTime();
      const matchesTo = !sessionToDate || createdTime <= new Date(`${sessionToDate}T23:59:59`).getTime();
      return matchesMode && matchesStatus && matchesFrom && matchesTo;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const selectedUser = topUsers.find((user) => user.email === selectedUserEmail) ?? null;
  const selectedUserId = selectedUser?.id ? String(selectedUser.id) : "";
  const selectedUserEmailNormalized = selectedUser?.email.trim().toLowerCase() ?? "";
  const selectedUserSessions = useMemo(
    () =>
      selectedUser
        ? sessions
            .filter((session) => {
              const sessionUserId = session.userId ? String(session.userId) : "";
              const sessionEmail = session.email.trim().toLowerCase();

              return selectedUserId
                ? sessionUserId === selectedUserId
                : sessionEmail === selectedUserEmailNormalized;
            })
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
        : [],
    [selectedUser, selectedUserEmailNormalized, selectedUserId, sessions]
  );
  const detailSessions = loadedUserSessions.length > 0 ? loadedUserSessions : selectedUserSessions;

  const openUserSessions = async (user: AdminUserRecord) => {
    setSelectedUserEmail(user.email);
    setLoadedUserSessions([]);
    setDetailError("");

    if (!user.id || !onLoadUserSessions) {
      return;
    }

    setIsDetailLoading(true);

    try {
      const userSessions = await onLoadUserSessions(user.id);
      setLoadedUserSessions(userSessions);
    } catch (loadError) {
      setDetailError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudieron cargar las sesiones del alumno."
      );
    } finally {
      setIsDetailLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-10 lg:px-8">
      <div className="space-y-6">
        <section className="glass-card overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-secondary px-8 py-8 text-white lg:px-10">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]">
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Espacio admin
                </div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Reporte final, {adminName}
                </h2>
                <p className="max-w-2xl text-sm leading-relaxed text-white/85">
                  Este panel consolida estudiantes y sesiones desde la {dataSourceLabel},
                  para que el reporte admin refleje cuentas reales y no solo este navegador.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  onClick={onRefresh}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/15 disabled:pointer-events-none disabled:opacity-60"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                  Actualizar
                </button>
                <button
                  onClick={() => downloadCsv(users, sessions)}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/15"
                >
                  <Download className="h-4 w-4" />
                  Descargar CSV
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 px-8 py-7 md:grid-cols-3 lg:px-10">
            <article className="rounded-2xl border border-border/70 bg-white/75 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <GraduationCap className="h-5 w-5" />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Estudiantes
              </p>
              <p className="mt-2 text-3xl font-bold text-foreground">{totalStudents}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Usuarios no administradores que ingresaron.
              </p>
            </article>

            <article className="rounded-2xl border border-border/70 bg-white/75 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
                <MonitorPlay className="h-5 w-5" />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Sesiones
              </p>
              <p className="mt-2 text-3xl font-bold text-foreground">{totalSessions}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Total de practicas registradas en la base compartida.
              </p>
            </article>

            <article className="rounded-2xl border border-border/70 bg-white/75 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/20 text-foreground">
                <BarChart3 className="h-5 w-5" />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Distribucion
              </p>
              <p className="mt-2 text-lg font-bold text-foreground">
                {improvSessions} improvisacion / {presentationSessions} presentacion
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Vista rapida por tipo de entrenamiento.
              </p>
            </article>
          </div>

          <div className="grid gap-4 border-t border-border/60 px-8 py-7 md:grid-cols-2 xl:grid-cols-4 lg:px-10">
            <article className="rounded-2xl border border-border/70 bg-white/75 p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Ultimos 7 dias
                </p>
                <BarChart3 className="h-4 w-4 text-secondary" />
              </div>
              <p className="mt-3 text-3xl font-bold text-foreground">{recentSessions}</p>
              <p className="mt-2 text-sm text-muted-foreground">sesiones recientes</p>
            </article>

            <article className="rounded-2xl border border-border/70 bg-white/75 p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Audios
                </p>
                <Headphones className="h-4 w-4 text-secondary" />
              </div>
              <p className="mt-3 text-3xl font-bold text-foreground">{audioSessions}</p>
              <p className="mt-2 text-sm text-muted-foreground">grabaciones recibidas</p>
            </article>

            <article className="rounded-2xl border border-border/70 bg-white/75 p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Feedback
                </p>
                <CheckCircle2 className="h-4 w-4 text-secondary" />
              </div>
              <p className="mt-3 text-3xl font-bold text-foreground">{feedbackSessions}</p>
              <p className="mt-2 text-sm text-muted-foreground">formularios completos</p>
            </article>

            <article className="rounded-2xl border border-border/70 bg-white/75 p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Canceladas
                </p>
                <XCircle className="h-4 w-4 text-destructive" />
              </div>
              <p className="mt-3 text-3xl font-bold text-foreground">{canceledSessions}</p>
              <p className="mt-2 text-sm text-muted-foreground">sesiones anuladas</p>
            </article>
          </div>

          <div className="grid gap-5 border-t border-border/60 px-8 pb-7 md:grid-cols-2 lg:px-10">
            <div className="rounded-2xl border border-border/70 bg-white/75 p-5">
              <p className="text-sm font-semibold text-foreground">
                Distribucion por dificultad
              </p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-muted/60 p-3">
                  <p className="text-xl font-bold text-foreground">{difficultyTotals.easy}</p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Facil
                  </p>
                </div>
                <div className="rounded-xl bg-muted/60 p-3">
                  <p className="text-xl font-bold text-foreground">{difficultyTotals.medium}</p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Medio
                  </p>
                </div>
                <div className="rounded-xl bg-muted/60 p-3">
                  <p className="text-xl font-bold text-foreground">{difficultyTotals.hard}</p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Dificil
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-white/75 p-5">
              <p className="text-sm font-semibold text-foreground">
                Estado operativo
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-muted/60 p-3">
                  <p className="text-xl font-bold text-foreground">
                    {Math.max(totalSessions - canceledSessions, 0)}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Vigentes
                  </p>
                </div>
                <div className="rounded-xl bg-muted/60 p-3">
                  <p className="text-xl font-bold text-foreground">
                    {totalSessions > 0 ? Math.round((feedbackSessions / totalSessions) * 100) : 0}%
                  </p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Con feedback
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="glass-card p-6 lg:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Estudiantes registrados
                </p>
                <h3 className="mt-1 text-lg font-semibold text-foreground">
                  Ultimos ingresos
                </h3>
              </div>
            </div>
            <input
              type="search"
              value={studentSearch}
              onChange={(event) => setStudentSearch(event.target.value)}
              placeholder="Buscar alumno por nombre o correo..."
              className="mt-5 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-secondary"
            />

            {filteredTopUsers.length > 0 ? (
              <div className="mt-5 space-y-4">
                {filteredTopUsers.map((user) => (
                  <article
                    key={user.email}
                    className="rounded-2xl border border-border/70 bg-white/75 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{user.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void openUserSessions(user)}
                        className="rounded-full bg-muted px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:bg-secondary/10 hover:text-secondary"
                        title="Ver detalle de sesiones"
                      >
                        {user.totalSessions} sesiones
                      </button>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      Ultimo ingreso: {formatDate(user.lastSeenAt)}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-border/80 bg-white/70 p-5">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {isLoading
                    ? "Cargando estudiantes reales..."
                    : "Aun no hay estudiantes reales registrados para mostrar."}
                </p>
              </div>
            )}
          </div>

          <aside className="glass-card p-6 lg:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
                <Presentation className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Resumen de sesiones
                </p>
                <h3 className="mt-1 text-lg font-semibold text-foreground">
                  Actividad reciente
                </h3>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <select
                value={sessionModeFilter}
                onChange={(event) =>
                  setSessionModeFilter(event.target.value as typeof sessionModeFilter)
                }
                className="rounded-xl border border-border bg-white px-4 py-3 text-sm font-semibold text-foreground outline-none transition-colors focus:border-secondary"
              >
                <option value="all">Todos los modos</option>
                <option value="improvisation">Improvisación</option>
                <option value="presentation">Presentación</option>
              </select>
              <select
                value={sessionStatusFilter}
                onChange={(event) =>
                  setSessionStatusFilter(event.target.value as typeof sessionStatusFilter)
                }
                className="rounded-xl border border-border bg-white px-4 py-3 text-sm font-semibold text-foreground outline-none transition-colors focus:border-secondary"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Vigentes</option>
                <option value="completed">Completadas</option>
                <option value="canceled">Canceladas</option>
              </select>
              <input
                type="date"
                value={sessionFromDate}
                onChange={(event) => setSessionFromDate(event.target.value)}
                className="rounded-xl border border-border bg-white px-4 py-3 text-sm font-semibold text-foreground outline-none transition-colors focus:border-secondary"
                aria-label="Filtrar desde"
              />
              <input
                type="date"
                value={sessionToDate}
                onChange={(event) => setSessionToDate(event.target.value)}
                className="rounded-xl border border-border bg-white px-4 py-3 text-sm font-semibold text-foreground outline-none transition-colors focus:border-secondary"
                aria-label="Filtrar hasta"
              />
            </div>

            {filteredSessions.length > 0 ? (
              <div className="mt-5 space-y-4">
                {filteredSessions.map((session) => (
                  <article
                    key={session.id}
                    className="rounded-2xl border border-border/70 bg-white/75 p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {session.mode === "improvisation" ? "Improvisacion" : "Presentacion"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {session.name ? `${session.name} - ` : ""}{session.email}
                        </p>
                        {session.sessionCode ? (
                          <p className="mt-1 font-mono text-xs font-semibold text-secondary">
                            {session.sessionCode}
                          </p>
                        ) : null}
                      </div>
                      <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${
                        session.status === "canceled"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {session.status === "canceled" ? "Cancelada" : difficultyLabels[session.difficulty]}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      Creada: {formatDate(session.createdAt)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Programada: {formatOptionalDate(session.scheduledAt)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {session.mode === "improvisation"
                        ? session.textTitle ?? "Tema no disponible"
                        : session.fileName ?? "Archivo no disponible"}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(session.audioUrl ?? session.videoUrl) ? (
                        <a
                          href={session.audioUrl ?? session.videoUrl ?? undefined}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:border-secondary hover:text-secondary"
                        >
                          Audio
                        </a>
                      ) : onUploadAudio ? (
                        <label className="cursor-pointer rounded-lg border border-dashed border-border bg-white/70 px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-secondary hover:text-secondary">
                          Subir audio
                          <input
                            type="file"
                            accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.webm"
                            className="sr-only"
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              event.target.value = "";
                              if (file) {
                                void onUploadAudio(session, file);
                              }
                            }}
                          />
                        </label>
                      ) : (
                        <span className="rounded-lg border border-dashed border-border bg-white/70 px-3 py-2 text-xs font-semibold text-muted-foreground">
                          Audio pendiente
                        </span>
                      )}
                      <span className="rounded-lg border border-border bg-white/70 px-3 py-2 text-xs font-semibold text-muted-foreground">
                        {session.feedback ? "Feedback registrado" : "Feedback pendiente"}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-border/80 bg-white/70 p-5">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {isLoading
                    ? "Cargando sesiones reales..."
                    : "Todavia no se han creado sesiones reales para incluirlas en el reporte."}
                </p>
              </div>
            )}

            {error ? (
              <div className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={onBack}
                className="rounded-lg border border-border bg-white/80 px-4 py-3 text-sm font-semibold uppercase tracking-wider text-foreground transition-colors hover:border-secondary hover:text-secondary"
              >
                Volver al dashboard
              </button>
              <button
                onClick={onLogout}
                className="rounded-lg border border-border bg-white/80 px-4 py-3 text-sm font-semibold uppercase tracking-wider text-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
              >
                Cerrar sesion
              </button>
            </div>
          </aside>
        </section>
      </div>

      {selectedUser ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
          <section className="max-h-[86vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-border/70 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Detalle de sesiones
                </p>
                <h3 className="mt-1 text-lg font-semibold text-foreground">
                  {selectedUser.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedUser.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedUserEmail(null);
                  setLoadedUserSessions([]);
                  setDetailError("");
                }}
                className="rounded-lg border border-border bg-white px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
              >
                Cerrar
              </button>
            </div>

            <div className="max-h-[64vh] overflow-y-auto px-6 py-5">
              {isDetailLoading ? (
                <div className="rounded-2xl border border-dashed border-border/80 bg-white/70 p-5">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Cargando sesiones del alumno...
                  </p>
                </div>
              ) : detailSessions.length > 0 ? (
                <div className="space-y-3">
                  {detailSessions.map((session) => (
                    <article
                      key={session.id}
                      className="rounded-2xl border border-border/70 bg-white/80 p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {session.mode === "improvisation"
                              ? "Improvisacion"
                              : "Presentacion"}
                          </p>
                          {session.sessionCode ? (
                            <p className="mt-1 font-mono text-xs font-semibold text-secondary">
                              {session.sessionCode}
                            </p>
                          ) : null}
                        </div>
                        <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                          {session.status === "canceled"
                            ? "Cancelada"
                            : difficultyLabels[session.difficulty]}
                        </span>
                      </div>
                      <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                        <p>Creada: {formatDate(session.createdAt)}</p>
                        <p>Programada: {formatOptionalDate(session.scheduledAt)}</p>
                        <p>
                          Modo:{" "}
                          {session.mode === "improvisation"
                            ? "Improvisacion"
                            : "Presentacion"}
                        </p>
                        <p>Estado: {session.status ?? "active"}</p>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        {session.mode === "improvisation"
                          ? session.textTitle ?? "Tema no disponible"
                          : session.fileName ?? "Archivo no disponible"}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(session.audioUrl ?? session.videoUrl) ? (
                          <a
                            href={session.audioUrl ?? session.videoUrl ?? undefined}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:border-secondary hover:text-secondary"
                          >
                            Audio
                          </a>
                        ) : onUploadAudio ? (
                          <label className="cursor-pointer rounded-lg border border-dashed border-border bg-white/70 px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-secondary hover:text-secondary">
                            Subir audio
                            <input
                              type="file"
                              accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.webm"
                              className="sr-only"
                              onChange={(event) => {
                                const file = event.target.files?.[0];
                                event.target.value = "";
                                if (file) {
                                  void onUploadAudio(session, file);
                                }
                              }}
                            />
                          </label>
                        ) : (
                          <span className="rounded-lg border border-dashed border-border bg-white/70 px-3 py-2 text-xs font-semibold text-muted-foreground">
                            Audio pendiente
                          </span>
                        )}
                        <span className="rounded-lg border border-border bg-white/70 px-3 py-2 text-xs font-semibold text-muted-foreground">
                          {session.feedback ? "Feedback registrado" : "Feedback pendiente"}
                        </span>
                      </div>
                      {session.feedback ? (
                        <div className="mt-3 rounded-xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground">
                          <p className="font-semibold text-foreground">Resumen de feedback</p>
                          {session.feedback.confidence ? (
                            <p className="mt-1">Confianza: {session.feedback.confidence}</p>
                          ) : null}
                          {session.feedback.improvement ? (
                            <p className="mt-1">Mejora: {session.feedback.improvement}</p>
                          ) : null}
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border/80 bg-white/70 p-5">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {detailError || "Este alumno aun no tiene sesiones para mostrar."}
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
};

export default AdminReportStep;
