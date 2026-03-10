interface SessionReadyStepProps {
  sessionId: string;
  fileName: string;
  totalMinutes: number;
  slideCount: number;
}

const SessionReadyStep = ({
  sessionId,
  fileName,
  totalMinutes,
  slideCount,
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
        </div>

        <a
          href={vrUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary w-full block text-center"
        >
          ABRIR EN VR
        </a>

        <p className="text-xs text-muted-foreground font-sans mt-4 text-center">
          El payload de sesión ha sido preparado y está disponible para descarga
          en el entorno VR mediante el session_id proporcionado.
        </p>
      </div>
    </div>
  );
};

export default SessionReadyStep;
