interface SessionReadyStepProps {
  sessionId: string;
  mode: "improvisation" | "presentation";
  // Presentation fields
  fileName?: string;
  totalMinutes?: number;
  slideCount?: number;
  // Improvisation fields
  textTitle?: string;
  duration?: number;
  // Common
  difficulty: "easy" | "medium" | "hard";
}

const difficultyLabels = {
  easy: "FÁCIL",
  medium: "MEDIO",
  hard: "DIFÍCIL",
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
      <div className="border border-border bg-card p-8 max-w-md">
        <div className="font-mono text-xs text-primary uppercase tracking-wider mb-6 flex items-center gap-2">
          <span>[✓]</span>
          <span>Sesión Lista</span>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex justify-between text-sm border-b border-border pb-3">
            <span className="text-muted-foreground font-sans">Session ID</span>
            <span className="font-mono text-xs text-foreground">{sessionId}</span>
          </div>
          <div className="flex justify-between text-sm border-b border-border pb-3">
            <span className="text-muted-foreground font-sans">Modo</span>
            <span className="font-mono text-xs text-foreground uppercase">
              {mode === "improvisation" ? "Improvisación" : "Presentación"}
            </span>
          </div>
          <div className="flex justify-between text-sm border-b border-border pb-3">
            <span className="text-muted-foreground font-sans">Dificultad</span>
            <span className="font-mono text-xs text-foreground">{difficultyLabels[difficulty]}</span>
          </div>

          {mode === "presentation" && (
            <>
              <div className="flex justify-between text-sm border-b border-border pb-3">
                <span className="text-muted-foreground font-sans">Archivo</span>
                <span className="font-mono text-xs text-foreground">{fileName}</span>
              </div>
              <div className="flex justify-between text-sm border-b border-border pb-3">
                <span className="text-muted-foreground font-sans">Diapositivas</span>
                <span className="font-mono text-xs text-foreground">{slideCount}</span>
              </div>
              <div className="flex justify-between text-sm border-b border-border pb-3">
                <span className="text-muted-foreground font-sans">Duración</span>
                <span className="font-mono text-xs text-foreground">{totalMinutes} min</span>
              </div>
            </>
          )}

          {mode === "improvisation" && (
            <>
              <div className="flex justify-between text-sm border-b border-border pb-3">
                <span className="text-muted-foreground font-sans">Tema</span>
                <span className="font-mono text-xs text-foreground max-w-[200px] text-right">{textTitle}</span>
              </div>
              <div className="flex justify-between text-sm border-b border-border pb-3">
                <span className="text-muted-foreground font-sans">Duración</span>
                <span className="font-mono text-xs text-foreground">{duration} min</span>
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

        <p className="text-xs text-muted-foreground font-sans mt-4 text-center">
          {mode === "presentation"
            ? "El payload visual ha sido preparado. La sesión finalizará automáticamente al cumplirse el tiempo asignado."
            : "El texto ha sido cargado. Lee el teleprompter y luego improvisa tu discurso a favor o en contra del tema."}
        </p>
      </div>
    </div>
  );
};

export default SessionReadyStep;
