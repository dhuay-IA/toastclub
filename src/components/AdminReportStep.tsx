import {
  BarChart3,
  CheckCircle2,
  Download,
  GraduationCap,
  Headphones,
  LayoutDashboard,
  MonitorPlay,
  Presentation,
  XCircle,
} from "lucide-react";
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
  sessions: Array<SessionSummary & { email: string }>;
  metrics?: AdminReportMetrics | null;
  isLoading?: boolean;
  error?: string;
  dataSourceLabel?: string;
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

const csvEscape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;

const downloadCsv = (users: AdminUserRecord[], sessions: Array<SessionSummary & { email: string }>) => {
  const sessionsByUser = new Map<string, number>();

  sessions.forEach((session) => {
    sessionsByUser.set(session.email, (sessionsByUser.get(session.email) ?? 0) + 1);
  });

  const lines = [
    [
      "Tipo",
      "Email",
      "Nombre",
      "Total Sesiones",
      "Ultimo Ingreso",
      "Modo",
      "Dificultad",
      "Fecha Sesion",
      "Fecha Programada",
      "Estado",
    ],
    ...users.map((user) => [
      "Usuario",
      user.email,
      user.name,
      sessionsByUser.get(user.email) ?? 0,
      formatDate(user.lastSeenAt),
      "",
      "",
      "",
      "",
      "",
    ]),
    ...sessions.map((session) => [
      "Sesion",
      session.email,
      "",
      "",
      "",
      session.mode === "improvisation" ? "Improvisacion" : "Presentacion",
      session.difficulty,
      formatDate(session.createdAt),
      formatOptionalDate(session.scheduledAt),
      session.status ?? "active",
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
  onBack,
  onLogout,
}: AdminReportStepProps) => {
  const totalStudents = metrics?.totalStudents ?? users.length;
  const totalSessions = metrics?.totalSessions ?? sessions.length;
  const improvSessions =
    metrics?.improvisationSessions ??
    sessions.filter((session) => session.mode === "improvisation").length;
  const presentationSessions =
    metrics?.presentationSessions ?? totalSessions - improvSessions;
  const canceledSessions =
    metrics?.canceledSessions ??
    sessions.filter((session) => session.status === "canceled").length;
  const audioSessions =
    metrics?.audioSessions ??
    sessions.filter((session) => session.audioUrl ?? session.videoUrl).length;
  const feedbackSessions =
    metrics?.feedbackSessions ??
    sessions.filter((session) => session.feedback).length;
  const recentSessions =
    metrics?.recentSessions ??
    sessions.filter(
      (session) =>
        new Date(session.createdAt).getTime() >=
        Date.now() - 7 * 24 * 60 * 60 * 1000
    ).length;
  const difficultyTotals =
    metrics?.difficulty ??
    sessions.reduce(
      (totals, session) => ({
        ...totals,
        [session.difficulty]: totals[session.difficulty] + 1,
      }),
      { easy: 0, medium: 0, hard: 0 }
    );

  const topUsers = users
    .map((user) => ({
      ...user,
      totalSessions:
        user.totalSessions ?? sessions.filter((session) => session.email === user.email).length,
    }))
    .sort((a, b) => b.totalSessions - a.totalSessions || b.lastSeenAt.localeCompare(a.lastSeenAt));

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

              <button
                onClick={() => downloadCsv(users, sessions)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/15"
              >
                <Download className="h-4 w-4" />
                Descargar CSV
              </button>
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

            {topUsers.length > 0 ? (
              <div className="mt-5 space-y-4">
                {topUsers.map((user) => (
                  <article
                    key={user.email}
                    className="rounded-2xl border border-border/70 bg-white/75 p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{user.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        {user.totalSessions} sesiones
                      </span>
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

            {sessions.length > 0 ? (
              <div className="mt-5 space-y-4">
                {sessions.slice(0, 6).map((session) => (
                  <article
                    key={session.id}
                    className="rounded-2xl border border-border/70 bg-white/75 p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {session.mode === "improvisation" ? "Improvisacion" : "Presentacion"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">{session.email}</p>
                      </div>
                      <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        {session.difficulty}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {formatDate(session.createdAt)}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Programada: {formatOptionalDate(session.scheduledAt)}
                    </p>
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
    </div>
  );
};

export default AdminReportStep;
