import { ArrowLeft, Search, UsersRound } from "lucide-react";
import { useMemo, useState } from "react";
import type { AgentSession, AgentUser } from "@/lib/auth";

interface AgentPanelStepProps {
  agentName: string;
  users: AgentUser[];
  sessions: AgentSession[];
  isLoading: boolean;
  error: string;
  onBack: () => void;
  onLogout: () => void;
  onRefresh: () => void;
  onCreateGroupSession: (payload: {
    userIds: number[];
    vrApp: "presentation" | "improvisation";
    difficulty: "easy" | "medium" | "hard";
    duration?: number;
    totalMinutes?: number;
    textTitle?: string;
    fileName?: string;
  }) => Promise<void>;
}

const difficultyLabels = {
  easy: "Facil",
  medium: "Medio",
  hard: "Dificil",
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const AgentPanelStep = ({
  agentName,
  users,
  sessions,
  isLoading,
  error,
  onBack,
  onLogout,
  onRefresh,
  onCreateGroupSession,
}: AgentPanelStepProps) => {
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [mode, setMode] = useState<"improvisation" | "presentation">("improvisation");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [duration, setDuration] = useState(3);
  const [textTitle, setTextTitle] = useState("");
  const [fileName, setFileName] = useState("");
  const [query, setQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredSessions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return sessions;

    return sessions.filter((session) =>
      [
        session.sessionCode,
        session.name,
        session.email,
        session.metadata?.textTitle,
        session.metadata?.fileName,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery))
    );
  }, [query, sessions]);

  const toggleUser = (userId: number) => {
    setSelectedUserIds((current) =>
      current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId]
    );
  };

  const handleSubmit = async () => {
    if (selectedUserIds.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    await onCreateGroupSession({
      userIds: selectedUserIds,
      vrApp: mode,
      difficulty,
      duration,
      totalMinutes: duration,
      textTitle: mode === "improvisation" ? textTitle : undefined,
      fileName: mode === "presentation" ? fileName : undefined,
    });
    setSelectedUserIds([]);
    setTextTitle("");
    setFileName("");
    setIsSubmitting(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-10 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-white/80 px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:border-secondary hover:text-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </button>
        <button
          onClick={onLogout}
          className="rounded-lg border border-border bg-white/80 px-4 py-3 text-sm font-semibold uppercase tracking-wider text-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
        >
          Cerrar sesion
        </button>
      </div>

      <section className="glass-card overflow-hidden">
        <div className="bg-gradient-to-r from-primary/95 via-primary to-secondary px-8 py-8 text-white lg:px-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]">
                <UsersRound className="h-3.5 w-3.5" />
                Panel presencial
              </div>
              <h2 className="mt-3 text-2xl font-bold tracking-tight">
                Gestion de sesiones, {agentName}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/85">
                Revisa codigos creados y registra sesiones para varios estudiantes.
              </p>
            </div>
          </div>
        </div>

        {error ? (
          <div className="border-b border-destructive/20 bg-destructive/5 px-8 py-4 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 px-8 py-7 lg:grid-cols-[0.95fr_1.25fr] lg:px-10">
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Nueva sesion grupal
              </p>
              <h3 className="mt-2 text-lg font-semibold text-foreground">
                Usuarios vinculados
              </h3>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => setMode("improvisation")}
                className={`rounded-lg border px-4 py-3 text-sm font-semibold transition-colors ${
                  mode === "improvisation"
                    ? "border-secondary bg-secondary/10 text-secondary"
                    : "border-border bg-white/70 text-foreground"
                }`}
              >
                Improvisacion
              </button>
              <button
                onClick={() => setMode("presentation")}
                className={`rounded-lg border px-4 py-3 text-sm font-semibold transition-colors ${
                  mode === "presentation"
                    ? "border-secondary bg-secondary/10 text-secondary"
                    : "border-border bg-white/70 text-foreground"
                }`}
              >
                Presentacion
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {(["easy", "medium", "hard"] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`rounded-lg border px-4 py-3 text-sm font-semibold transition-colors ${
                    difficulty === level
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-white/70 text-foreground"
                  }`}
                >
                  {difficultyLabels[level]}
                </button>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
              <input
                value={mode === "improvisation" ? textTitle : fileName}
                onChange={(event) =>
                  mode === "improvisation"
                    ? setTextTitle(event.target.value)
                    : setFileName(event.target.value)
                }
                placeholder={mode === "improvisation" ? "Tema de practica" : "Nombre de presentacion"}
                className="rounded-lg border border-border bg-white/80 px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-secondary"
              />
              <input
                value={duration}
                onChange={(event) => setDuration(Number(event.target.value) || 1)}
                min={1}
                max={60}
                type="number"
                className="rounded-lg border border-border bg-white/80 px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-secondary"
              />
            </div>

            <div className="max-h-72 space-y-2 overflow-y-auto rounded-xl border border-border/70 bg-white/70 p-3">
              {users.length > 0 ? (
                users.map((user) => (
                  <label
                    key={user.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-sm transition-colors hover:border-border hover:bg-white"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(user.id)}
                      onChange={() => toggleUser(user.id)}
                      className="h-4 w-4 accent-secondary"
                    />
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-foreground">
                        {user.name}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </span>
                  </label>
                ))
              ) : (
                <p className="p-4 text-sm text-muted-foreground">
                  No hay estudiantes disponibles para vincular.
                </p>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={selectedUserIds.length === 0 || isSubmitting}
              className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting
                ? "Creando sesiones..."
                : `Crear sesiones (${selectedUserIds.length})`}
            </button>
          </div>

          <div className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Codigos de sesion
                </p>
                <h3 className="mt-2 text-lg font-semibold text-foreground">
                  Sesiones recientes
                </h3>
              </div>
              <button
                onClick={onRefresh}
                className="rounded-lg border border-border bg-white/80 px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:border-secondary hover:text-secondary"
              >
                Actualizar
              </button>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por codigo, usuario o tema"
                className="w-full rounded-lg border border-border bg-white/80 py-3 pl-11 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-secondary"
              />
            </div>

            <div className="max-h-[520px] space-y-3 overflow-y-auto">
              {isLoading ? (
                <div className="rounded-xl border border-border/70 bg-white/70 p-5 text-sm text-muted-foreground">
                  Cargando sesiones...
                </div>
              ) : filteredSessions.length > 0 ? (
                filteredSessions.map((session) => (
                  <article
                    key={session.id}
                    className="rounded-xl border border-border/70 bg-white/75 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-bold tracking-[0.18em] text-foreground">
                          {session.sessionCode}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-foreground">
                          {session.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{session.email}</p>
                      </div>
                      <span className="rounded-full bg-muted px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        {session.status}
                      </span>
                    </div>
                    <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                      <span>{session.mode === "improvisation" ? "Improvisacion" : "Presentacion"}</span>
                      <span>{difficultyLabels[session.metadata?.difficulty ?? "medium"]}</span>
                      <span>{formatDate(session.createdAt)}</span>
                      <span>
                        {session.metadata?.textTitle || session.metadata?.fileName || "Sin detalle"}
                      </span>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-border/80 bg-white/70 p-5 text-sm text-muted-foreground">
                  No hay sesiones que coincidan con la busqueda.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AgentPanelStep;
