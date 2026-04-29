interface SessionReadyStepProps {
  sessionCode: string;
  mode: "improvisation" | "presentation";
  fileName?: string;
  totalMinutes?: number;
  slideCount?: number;
  slideImages?: string[];
  textTitle?: string;
  duration?: number;
  difficulty: "easy" | "medium" | "hard";
  onBackToDashboard: () => void;
}

const difficultyLabels = {
  easy: "Fácil",
  medium: "Medio",
  hard: "Difícil",
};

const difficultyColors = {
  easy: "text-green-400",
  medium: "text-accent",
  hard: "text-destructive",
};

const SessionReadyStep = ({
  sessionCode,
  mode,
  fileName,
  totalMinutes,
  slideCount,
  slideImages,
  textTitle,
  duration,
  difficulty,
  onBackToDashboard,
}: SessionReadyStepProps) => {
  return (
    <div className="step-container py-12">
      <div className="glass-card mx-auto max-w-md p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-secondary/10">
            <span className="text-2xl">VR</span>
          </div>
          <h2 className="text-lg font-semibold text-foreground">Sesion lista</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            La práctica ya quedó registrada. El acceso a VR se gestiona internamente.
          </p>
        </div>

        <div className="mb-6 flex items-center justify-between gap-4 border-2 border-red-600 bg-red-50/40 px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-red-700">
            ID de sesion
          </p>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-red-700">
            {sessionCode}
          </p>
        </div>

        <div className="mb-8 space-y-3">
          <div className="flex justify-between border-b border-border/50 py-2 text-sm">
            <span className="text-muted-foreground">Modo</span>
            <span className="text-sm text-foreground">
              {mode === "improvisation" ? "Improvisación" : "Presentación"}
            </span>
          </div>
          <div className="flex justify-between border-b border-border/50 py-2 text-sm">
            <span className="text-muted-foreground">Dificultad</span>
            <span className={`text-sm font-medium ${difficultyColors[difficulty]}`}>
              {difficultyLabels[difficulty]}
            </span>
          </div>

          {mode === "presentation" && (
            <>
              <div className="flex justify-between border-b border-border/50 py-2 text-sm">
                <span className="text-muted-foreground">Archivo</span>
                <span className="text-sm text-foreground">{fileName}</span>
              </div>
              <div className="flex justify-between border-b border-border/50 py-2 text-sm">
                <span className="text-muted-foreground">Diapositivas</span>
                <span className="text-sm text-foreground">{slideCount}</span>
              </div>
              <div className="flex justify-between border-b border-border/50 py-2 text-sm">
                <span className="text-muted-foreground">Duración</span>
                <span className="text-sm text-foreground">{totalMinutes} min</span>
              </div>
            </>
          )}

          {mode === "improvisation" && (
            <>
              <div className="flex justify-between border-b border-border/50 py-2 text-sm">
                <span className="text-muted-foreground">Tema</span>
                <span className="max-w-[200px] text-right text-sm text-foreground">
                  {textTitle}
                </span>
              </div>
              <div className="flex justify-between border-b border-border/50 py-2 text-sm">
                <span className="text-muted-foreground">Duración</span>
                <span className="text-sm text-foreground">{duration} min</span>
              </div>
            </>
          )}
        </div>

        <button
          onClick={onBackToDashboard}
          className="w-full rounded-lg border border-border bg-white/70 px-4 py-3 text-sm font-semibold uppercase tracking-wider text-foreground transition-colors hover:border-secondary hover:text-secondary"
        >
          VOLVER AL DASHBOARD
        </button>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          {mode === "presentation"
            ? "Tu presentación quedó lista y la información de la sesión puede enviarse por los canales internos definidos por el equipo."
            : "El tema fue registrado y la información de la sesión puede enviarse por los canales internos definidos por el equipo."}
        </p>

        {mode === "presentation" && slideImages && slideImages.length > 0 ? (
          <div className="mt-6">
            <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Vista previa
            </p>
            <div className="grid max-h-64 grid-cols-2 gap-3 overflow-y-auto rounded-2xl border border-border/70 bg-white/70 p-3">
              {slideImages.slice(0, 4).map((image, index) => (
                <div
                  key={`ready-slide-${index + 1}`}
                  className="overflow-hidden rounded-xl border border-border/70 bg-muted/20"
                >
                  <img
                    src={image}
                    alt={`Diapositiva convertida ${index + 1}`}
                    className="h-24 w-full object-cover object-top"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SessionReadyStep;
