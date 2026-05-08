import {
  ArrowRight,
  CheckCircle2,
  Headphones,
  LayoutDashboard,
  Search,
  Sparkles,
  Presentation,
  XCircle,
} from "lucide-react";
import { useState } from "react";

type AgentStudent = {
  id?: number;
  email: string;
  name: string;
  totalSessions?: number;
};

type AgentSessionLookup = {
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

type AgentPanelStepProps = {
  agentName: string;
  students: AgentStudent[];
  sessions: AgentSessionLookup[];
  selectedStudentId: string;
  onSelectStudent: (studentId: string) => void;
  onCreateSession: (mode: "improvisation" | "presentation") => void;
  onLookupSession: (sessionCode: string) => Promise<AgentSessionLookup>;
  onUploadAudioByCode: (sessionCode: string, file: File) => Promise<void>;
  onRefresh: () => void;
  onLogout: () => void;
};

const difficultyLabels = {
  easy: "Fácil",
  medium: "Medio",
  hard: "Difícil",
};

const formatDate = (value?: string) =>
  value
    ? new Intl.DateTimeFormat("es-PE", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "Por confirmar";

const AgentPanelStep = ({
  agentName,
  students,
  sessions,
  selectedStudentId,
  onSelectStudent,
  onCreateSession,
  onLookupSession,
  onUploadAudioByCode,
  onRefresh,
  onLogout,
}: AgentPanelStepProps) => {
  const [sessionCode, setSessionCode] = useState("");
  const [lookup, setLookup] = useState<AgentSessionLookup | null>(null);
  const [lookupError, setLookupError] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const selectedStudent = students.find((student) => String(student.id ?? "") === selectedStudentId);

  const handleLookup = async () => {
    const code = sessionCode.trim().toUpperCase();
    if (!code) return;

    setIsLookingUp(true);
    setLookupError("");

    try {
      const result = await onLookupSession(code);
      setLookup(result);
    } catch (error) {
      setLookup(null);
      setLookupError(
        error instanceof Error
          ? error.message
          : "No se pudo validar el código de sesión."
      );
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleAudioInput = async (file?: File | null) => {
    const code = lookup?.sessionCode ?? sessionCode.trim().toUpperCase();
    if (!file || !code) return;

    await onUploadAudioByCode(code, file);
    const refreshed = await onLookupSession(code);
    setLookup(refreshed);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-10 lg:px-8">
      <div className="space-y-6">
        <section className="glass-card overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 via-primary to-secondary px-8 py-8 text-white lg:px-10">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]">
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Espacio agent
                </div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Atención presencial, {agentName}
                </h2>
                <p className="max-w-2xl text-sm leading-relaxed text-white/85">
                  Valida códigos de sesión, crea prácticas para alumnos registrados y asocia el audio final sin entrar al panel del estudiante.
                </p>
              </div>
              <button
                onClick={onLogout}
                className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/15"
              >
                Cerrar sesión
              </button>
            </div>
          </div>

          <div className="grid gap-5 px-8 py-7 lg:grid-cols-[1fr_0.95fr] lg:px-10">
            <div className="rounded-2xl border border-border/70 bg-white/75 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Código de sesión
              </p>
              <h3 className="mt-2 text-lg font-semibold text-foreground">
                Validar práctica del alumno
              </h3>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <input
                  value={sessionCode}
                  onChange={(event) => setSessionCode(event.target.value.toUpperCase())}
                  placeholder="VR-000000"
                  className="input-field font-mono"
                />
                <button
                  onClick={handleLookup}
                  disabled={isLookingUp || !sessionCode.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-secondary/30 bg-secondary/5 px-4 py-3 text-sm font-semibold text-secondary transition-colors hover:border-secondary hover:bg-secondary/10 disabled:pointer-events-none disabled:opacity-60"
                >
                  <Search className="h-4 w-4" />
                  Validar
                </button>
              </div>

              {lookupError ? (
                <div className="mt-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                  {lookupError}
                </div>
              ) : null}

              {lookup ? (
                <article className="mt-5 rounded-2xl border border-border/70 bg-white p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-primary">
                        {lookup.sessionCode}
                      </p>
                      <h4 className="mt-2 text-base font-semibold text-foreground">
                        {lookup.studentName}
                      </h4>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {lookup.studentEmail}
                      </p>
                    </div>
                    <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {lookup.status === "canceled" ? "Cancelada" : difficultyLabels[lookup.difficulty]}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                    <p>Modo: {lookup.mode === "improvisation" ? "Improvisación" : "Presentación"}</p>
                    <p>Programada: {formatDate(lookup.scheduledAt)}</p>
                    <p>
                      Contenido:{" "}
                      {lookup.mode === "improvisation"
                        ? lookup.textTitle ?? "Tema no disponible"
                        : lookup.fileName ?? "Archivo no disponible"}
                    </p>
                    <p>Duración: {lookup.duration ?? "-"} min</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {lookup.audioUrl ?? lookup.videoUrl ? (
                      <a
                        href={lookup.audioUrl ?? lookup.videoUrl ?? undefined}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:border-secondary hover:text-secondary"
                      >
                        <Headphones className="h-4 w-4" />
                        Ver audio
                      </a>
                    ) : (
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border bg-white/70 px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-secondary hover:text-secondary">
                        <Headphones className="h-4 w-4" />
                        Subir audio
                        <input
                          type="file"
                          accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.webm"
                          className="sr-only"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            event.target.value = "";
                            void handleAudioInput(file);
                          }}
                        />
                      </label>
                    )}
                    <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-white/70 px-3 py-2 text-xs font-semibold text-muted-foreground">
                      {lookup.status === "canceled" ? (
                        <XCircle className="h-4 w-4 text-destructive" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-secondary" />
                      )}
                      {lookup.status === "canceled" ? "No usar" : "Lista para atención"}
                    </span>
                  </div>
                </article>
              ) : null}
            </div>

            <div className="rounded-2xl border border-border/70 bg-white/75 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Crear sesión presencial
              </p>
              <h3 className="mt-2 text-lg font-semibold text-foreground">
                Alumno registrado
              </h3>
              <select
                value={selectedStudentId}
                onChange={(event) => onSelectStudent(event.target.value)}
                className="input-field mt-5"
              >
                <option value="">Selecciona un alumno</option>
                {students.map((student) => (
                  <option key={student.id ?? student.email} value={String(student.id ?? "")}>
                    {student.name} - {student.email}
                  </option>
                ))}
              </select>
              {selectedStudent ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  Se creará una práctica para {selectedStudent.name}.
                </p>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  El alumno debe estar registrado como estudiante para aparecer aquí.
                </p>
              )}
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button
                  onClick={() => onCreateSession("improvisation")}
                  disabled={!selectedStudentId}
                  className="group rounded-2xl border border-border/70 bg-white p-5 text-left transition-colors hover:border-secondary/50 disabled:pointer-events-none disabled:opacity-50"
                >
                  <Sparkles className="h-5 w-5 text-primary" />
                  <p className="mt-3 text-sm font-semibold text-foreground">Improvisación</p>
                  <span className="mt-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                    Empezar <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </button>
                <button
                  onClick={() => onCreateSession("presentation")}
                  disabled={!selectedStudentId}
                  className="group rounded-2xl border border-border/70 bg-white p-5 text-left transition-colors hover:border-secondary/50 disabled:pointer-events-none disabled:opacity-50"
                >
                  <Presentation className="h-5 w-5 text-primary" />
                  <p className="mt-3 text-sm font-semibold text-foreground">Presentación</p>
                  <span className="mt-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                    Empezar <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="glass-card p-6 lg:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Registro del agent
              </p>
              <h3 className="mt-1 text-lg font-semibold text-foreground">
                Sesiones creadas y atendidas
              </h3>
            </div>
            <button
              onClick={onRefresh}
              className="rounded-lg border border-border bg-white px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:border-secondary hover:text-secondary"
            >
              Actualizar
            </button>
          </div>

          {sessions.length > 0 ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {sessions.map((session) => (
                <article
                  key={session.id}
                  className="rounded-2xl border border-border/70 bg-white/75 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-primary">
                        {session.sessionCode}
                      </p>
                      <h4 className="mt-2 text-sm font-semibold text-foreground">
                        {session.mode === "improvisation" ? "Improvisación" : "Presentación"}
                      </h4>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {session.studentName} - {session.studentEmail}
                      </p>
                    </div>
                    <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {session.status === "canceled" ? "Cancelada" : difficultyLabels[session.difficulty]}
                    </span>
                  </div>

                  <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                    <p>Creada: {formatDate(session.createdAt)}</p>
                    <p>Programada: {formatDate(session.scheduledAt)}</p>
                    <p>
                      Contenido:{" "}
                      {session.mode === "improvisation"
                        ? session.textTitle ?? "Tema no disponible"
                        : session.fileName ?? "Archivo no disponible"}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {session.audioUrl ?? session.videoUrl ? (
                      <a
                        href={session.audioUrl ?? session.videoUrl ?? undefined}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:border-secondary hover:text-secondary"
                      >
                        <Headphones className="h-4 w-4" />
                        Audio
                      </a>
                    ) : (
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border bg-white/70 px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-secondary hover:text-secondary">
                        <Headphones className="h-4 w-4" />
                        Subir audio
                        <input
                          type="file"
                          accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.webm"
                          className="sr-only"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            event.target.value = "";
                            if (file) {
                              void onUploadAudioByCode(session.sessionCode, file);
                            }
                          }}
                        />
                      </label>
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
                Aún no hay sesiones creadas por este agent. Cuando registre una práctica presencial, aparecerá aquí.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AgentPanelStep;
