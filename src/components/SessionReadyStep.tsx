interface SessionReadyStepProps {
  sessionId: string;
  mode: "improvisation" | "presentation";
  fileName?: string;
  totalMinutes?: number;
  slideCount?: number;
  textTitle?: string;
  duration?: number;
  difficulty: "easy" | "medium" | "hard";
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
  sessionId,
  mode,
  fileName,
  totalMinutes,
  slideCount,
  textTitle,
  duration,
  difficulty,
}: SessionReadyStepProps) => {
  const vrUrl = `https://vr.toastclub.app/session/${sessionId}`;

  return (
    <div className="step-container py-12">
      <div className="glass-card p-8 max-w-md mx-auto">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-3">
            <span className="text-2xl">🚀</span>
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            Sesión Lista
          </h2>
        </div>

        <div className="space-y-3 mb-8">
          <div className="flex justify-between text-sm py-2 border-b border-border/50">
            <span className="text-muted-foreground">Session ID</span>
            <span className="font-mono text-xs text-foreground">{sessionId}</span>
          </div>
          <div className="flex justify-between text-sm py-2 border-b border-border/50">
            <span className="text-muted-foreground">Modo</span>
            <span className="text-sm text-foreground">
              {mode === "improvisation" ? "Improvisación" : "Presentación"}
            </span>
          </div>
          <div className="flex justify-between text-sm py-2 border-b border-border/50">
            <span className="text-muted-foreground">Dificultad</span>
            <span className={`text-sm font-medium ${difficultyColors[difficulty]}`}>
              {difficultyLabels[difficulty]}
            </span>
          </div>

          {mode === "presentation" && (
            <>
              <div className="flex justify-between text-sm py-2 border-b border-border/50">
                <span className="text-muted-foreground">Archivo</span>
                <span className="text-sm text-foreground">{fileName}</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-border/50">
                <span className="text-muted-foreground">Diapositivas</span>
                <span className="text-sm text-foreground">{slideCount}</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-border/50">
                <span className="text-muted-foreground">Duración</span>
                <span className="text-sm text-foreground">{totalMinutes} min</span>
              </div>
            </>
          )}

          {mode === "improvisation" && (
            <>
              <div className="flex justify-between text-sm py-2 border-b border-border/50">
                <span className="text-muted-foreground">Tema</span>
                <span className="text-sm text-foreground max-w-[200px] text-right">{textTitle}</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-border/50">
                <span className="text-muted-foreground">Duración</span>
                <span className="text-sm text-foreground">{duration} min</span>
              </div>
            </>
          )}
        </div>

        <a
          href={vrUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary w-full block text-center"
        >
          INICIAR SESIÓN VR
        </a>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          {mode === "presentation"
            ? "Tu presentación está lista. La sesión finalizará automáticamente al cumplirse el tiempo."
            : "El texto ha sido cargado. Lee el teleprompter y luego improvisa tu discurso."}
        </p>
      </div>
    </div>
  );
};

export default SessionReadyStep;
