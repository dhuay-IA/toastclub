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
  easy: "Facil",
  medium: "Medio",
  hard: "Dificil",
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
  const vrUrl = `https://vr.toastclub.app/session/${sessionCode}`;

  return (
    <div className="step-container py-12">
      <div className="glass-card max-w-md p-8 mx-auto">
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-secondary/10">
            <span className="text-2xl">VR</span>
          </div>
          <h2 className="text-lg font-semibold text-foreground">Sesion lista</h2>
        </div>

        <div className="mb-8 space-y-3">
          <div className="flex justify-between border-b border-border/50 py-2 text-sm">
            <span className="text-muted-foreground">Modo</span>
            <span className="text-sm text-foreground">
              {mode === "improvisation" ? "Improvisacion" : "Presentacion"}
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
                <span className="text-muted-foreground">Duracion</span>
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
                <span className="text-muted-foreground">Duracion</span>
                <span className="text-sm text-foreground">{duration} min</span>
              </div>
            </>
          )}
        </div>

        <a
          href={vrUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary block w-full text-center"
        >
          INICIAR SESION VR
        </a>

        <button
          onClick={onBackToDashboard}
          className="mt-3 w-full rounded-lg border border-border bg-white/70 px-4 py-3 text-sm font-semibold uppercase tracking-wider text-foreground transition-colors hover:border-secondary hover:text-secondary"
        >
          VOLVER AL DASHBOARD
        </button>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          {mode === "presentation"
            ? "Tu presentacion ya esta lista. El acceso se gestiona internamente y la sesion finalizara automaticamente al cumplirse el tiempo."
            : "El texto fue cargado. El acceso se gestiona internamente para iniciar la practica en VR."}
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
