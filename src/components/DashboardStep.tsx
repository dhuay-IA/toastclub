import { ArrowRight, ChartColumnBig, Clock3, History, LayoutDashboard, MonitorPlay, PlayCircle, Presentation, Sparkles, UsersRound } from "lucide-react";

export type SessionFeedback = {
  confidence: string;
  audienceReaction: string;
  improvement: string;
  notes: string;
};

export type SessionSummary = {
  id: string;
  sessionCode?: string;
  mode: "improvisation" | "presentation";
  difficulty: "easy" | "medium" | "hard";
  createdAt: string;
  videoUrl?: string | null;
  feedback?: SessionFeedback;
  fileName?: string;
  totalMinutes?: number;
  slideCount?: number;
  previewImage?: string;
  textTitle?: string;
  duration?: number;
};

interface DashboardStepProps {
  userName: string;
  onSelectMode: (mode: "improvisation" | "presentation") => void;
  onLogout: () => void;
  onOpenFeedback: (sessionId: string) => void;
  onOpenAdminReport?: () => void;
  onOpenAgentPanel?: () => void;
  sessionSummary?: SessionSummary | null;
  sessionHistory: SessionSummary[];
  isAdmin?: boolean;
  isAgent?: boolean;
}

const difficultyLabels = {
  easy: "Facil",
  medium: "Medio",
  hard: "Dificil",
};

const modeCards = [
  {
    mode: "improvisation" as const,
    title: "Improvisacion",
    description: "Elige un tema, revisa el teleprompter y practica respuestas espontaneas.",
    icon: Sparkles,
    accent: "from-secondary/20 to-accent/10",
  },
  {
    mode: "presentation" as const,
    title: "Presentacion propia",
    description: "Sube tu material, ajusta la duracion y ensaya tu exposicion en VR.",
    icon: Presentation,
    accent: "from-primary/15 to-secondary/10",
  },
];

const formatSessionDate = (value: string) =>
  new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const feedbackComplete = (feedback?: SessionFeedback) =>
  Boolean(
    feedback?.confidence?.trim() &&
      feedback?.audienceReaction?.trim() &&
      feedback?.improvement?.trim()
  );

const DashboardStep = ({
  userName,
  onSelectMode,
  onLogout,
  onOpenFeedback,
  onOpenAdminReport,
  onOpenAgentPanel,
  sessionSummary,
  sessionHistory,
  isAdmin = false,
  isAgent = false,
}: DashboardStepProps) => {
  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-10 lg:px-8">
      <div className="space-y-6">
        <section className="glass-card overflow-hidden">
          <div className="bg-gradient-to-r from-primary/95 via-primary to-secondary px-8 py-8 text-white lg:px-10">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]">
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Dashboard
                </div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Hola, {userName}
                </h2>
                <p className="max-w-xl text-sm leading-relaxed text-white/85">
                  Desde aqui puedes iniciar una nueva practica, revisar grabaciones y
                  abrir el feedback de cada sesion desde su propio registro.
                </p>
              </div>

              <div className="hidden rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm md:block">
                <MonitorPlay className="h-8 w-8 text-white/85" />
              </div>
            </div>
          </div>

          <div className="grid gap-5 px-8 py-7 md:grid-cols-[1.45fr_0.95fr] lg:px-10">
            <div className="rounded-2xl border border-border/70 bg-white/70 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Accion rapida
              </p>
              <h3 className="mt-2 text-lg font-semibold text-foreground">
                Crea una nueva sesion de practica
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Elige como quieres entrenar hoy y te llevamos directo a la configuracion.
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-white/70 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Estado
              </p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
                  <Clock3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Historial con video y feedback
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Cada sesion tiene su propio registro y formulario.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.35fr_0.8fr]">
          <div className="grid gap-5 sm:grid-cols-2">
            {modeCards.map((card) => (
              <button
                key={card.mode}
                onClick={() => onSelectMode(card.mode)}
                className="glass-card group flex h-full flex-col text-left"
              >
                <div className={`rounded-t-xl bg-gradient-to-br ${card.accent} px-6 py-6`}>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 text-primary shadow-sm transition-transform duration-200 group-hover:scale-105">
                    <card.icon className="h-6 w-6" />
                  </div>
                </div>

                <div className="flex flex-1 flex-col px-6 py-6">
                  <h3 className="text-lg font-semibold text-foreground">
                    {card.title}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {card.description}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-secondary">
                    Empezar
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                  </span>
                </div>
              </button>
            ))}

            {isAdmin && onOpenAdminReport ? (
              <button
                onClick={onOpenAdminReport}
                className="glass-card group flex h-full flex-col text-left"
              >
                <div className="rounded-t-xl bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-secondary/70 px-6 py-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/90 text-slate-900 shadow-sm transition-transform duration-200 group-hover:scale-105">
                    <ChartColumnBig className="h-6 w-6" />
                  </div>
                </div>

                <div className="flex flex-1 flex-col px-6 py-6">
                  <h3 className="text-lg font-semibold text-foreground">
                    Reporte administrador
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                    Revisa cuantos estudiantes ingresaron, cuantas sesiones se hicieron
                    y descarga el consolidado final.
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-secondary">
                    Abrir reporte
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                  </span>
                </div>
              </button>
            ) : null}

            {isAgent && onOpenAgentPanel ? (
              <button
                onClick={onOpenAgentPanel}
                className="glass-card group flex h-full flex-col text-left"
              >
                <div className="rounded-t-xl bg-gradient-to-br from-secondary/20 via-white to-primary/10 px-6 py-6">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/90 text-secondary shadow-sm transition-transform duration-200 group-hover:scale-105">
                    <UsersRound className="h-6 w-6" />
                  </div>
                </div>

                <div className="flex flex-1 flex-col px-6 py-6">
                  <h3 className="text-lg font-semibold text-foreground">
                    Panel presencial
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                    Consulta codigos de sesion y registra practicas para varios usuarios.
                  </p>
                  <span className="mt-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-secondary">
                    Gestionar
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                  </span>
                </div>
              </button>
            ) : null}
          </div>

          <aside className="glass-card p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Ultima sesion
            </p>

            {sessionSummary ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl border border-border/70 bg-white/75 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                    {sessionSummary.mode === "improvisation" ? "Improvisacion" : "Presentacion"}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-foreground">
                    {formatSessionDate(sessionSummary.createdAt)}
                  </p>
                </div>

                <div className="rounded-2xl border border-border/70 bg-white/75 p-4">
                  {sessionSummary.mode === "presentation" && sessionSummary.previewImage ? (
                    <img
                      src={sessionSummary.previewImage}
                      alt={`Vista previa de ${sessionSummary.fileName ?? "presentacion"}`}
                      className="mb-3 h-28 w-full rounded-xl border border-border/70 object-cover object-top"
                    />
                  ) : null}
                  <p className="text-sm font-semibold text-foreground">
                    {sessionSummary.mode === "improvisation"
                      ? sessionSummary.textTitle ?? "Tema no disponible"
                      : sessionSummary.fileName ?? "Archivo no disponible"}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {difficultyLabels[sessionSummary.difficulty]}
                  </p>
                </div>

                <div className="flex gap-3">
                  {sessionSummary.videoUrl ? (
                    <a
                      href={sessionSummary.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex flex-1 items-center justify-center rounded-lg border border-border bg-white px-4 py-3 text-center text-sm font-semibold text-foreground transition-colors hover:border-secondary hover:text-secondary"
                    >
                      Ver video
                    </a>
                  ) : (
                    <div className="inline-flex flex-1 items-center justify-center rounded-lg border border-dashed border-border bg-white/70 px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                      Video pendiente
                    </div>
                  )}
                  <button
                    onClick={() => onOpenFeedback(sessionSummary.id)}
                    className="flex-1 rounded-lg border border-secondary/30 bg-secondary/5 px-4 py-3 text-sm font-semibold text-secondary transition-colors hover:border-secondary hover:bg-secondary/10"
                  >
                    {feedbackComplete(sessionSummary.feedback) ? "Editar feedback" : "Completar feedback"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-border/80 bg-white/70 p-5">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Aun no has generado una sesion desde este navegador. Elige un modo
                  de practica para crear la primera.
                </p>
              </div>
            )}
          </aside>
        </section>

        <section className="glass-card p-6 lg:p-7">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <History className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Sesiones anteriores
              </p>
              <h3 className="mt-1 text-lg font-semibold text-foreground">
                Registro breve
              </h3>
            </div>
          </div>

          {sessionHistory.length > 0 ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {sessionHistory.map((session) => (
                <article
                  key={session.id}
                  className="flex h-full flex-col rounded-2xl border border-border/70 bg-white/75 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {session.mode === "improvisation" ? "Improvisacion" : "Presentacion"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatSessionDate(session.createdAt)}
                      </p>
                    </div>
                    <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      {difficultyLabels[session.difficulty]}
                    </span>
                  </div>

                  <div className="mt-4 min-h-[72px]">
                    {session.mode === "presentation" && session.previewImage ? (
                      <img
                        src={session.previewImage}
                        alt={`Vista previa de ${session.fileName ?? "presentacion"}`}
                        className="mb-3 h-28 w-full rounded-xl border border-border/70 object-cover object-top"
                      />
                    ) : null}
                    <p className="text-sm text-muted-foreground">
                      {session.mode === "improvisation"
                        ? session.textTitle ?? "Tema no disponible"
                        : session.fileName ?? "Archivo no disponible"}
                    </p>
                  </div>

                  <div className="mt-auto flex items-stretch gap-3 pt-4">
                    {session.videoUrl ? (
                      <a
                        href={session.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-white px-4 py-3 text-center text-sm font-semibold text-foreground transition-colors hover:border-secondary hover:text-secondary"
                      >
                        <PlayCircle className="h-4 w-4" />
                        Video
                      </a>
                    ) : (
                      <div className="inline-flex flex-1 items-center justify-center rounded-lg border border-dashed border-border bg-white/70 px-4 py-3 text-center text-sm font-medium text-muted-foreground">
                        Video pendiente
                      </div>
                    )}
                    <button
                      onClick={() => onOpenFeedback(session.id)}
                      className="flex-1 rounded-lg border border-secondary/30 bg-secondary/5 px-4 py-3 text-sm font-semibold text-secondary transition-colors hover:border-secondary hover:bg-secondary/10"
                    >
                      {feedbackComplete(session.feedback) ? "Ver feedback" : "Responder feedback"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-border/80 bg-white/70 p-5">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Todavia no hay sesiones guardadas para este usuario. Cuando completes una
                practica, aparecera aqui automaticamente.
              </p>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={onLogout}
              className="rounded-lg border border-border bg-white/80 px-4 py-3 text-sm font-semibold uppercase tracking-wider text-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
            >
              Cerrar sesion
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardStep;
