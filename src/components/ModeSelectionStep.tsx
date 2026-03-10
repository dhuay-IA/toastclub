interface ModeSelectionStepProps {
  onComplete: (mode: "improvisation" | "presentation") => void;
}

const ModeSelectionStep = ({ onComplete }: ModeSelectionStepProps) => {
  return (
    <div className="step-container py-12">
      <div className="mb-8">
        <h2 className="font-mono text-sm uppercase tracking-wider text-foreground mb-2">
          Selecciona el Modo de Práctica
        </h2>
        <p className="text-sm text-muted-foreground font-sans">
          Elige cómo deseas entrenar en esta sesión.
        </p>
      </div>

      <div className="space-y-4 max-w-md">
        {/* Modo Improvisación */}
        <button
          onClick={() => onComplete("improvisation")}
          className="w-full border border-border bg-card p-6 text-left hover:border-primary transition-none group"
        >
          <div className="font-mono text-xs uppercase tracking-wider text-primary mb-2">
            [01] Improvisación
          </div>
          <p className="text-sm text-muted-foreground font-sans leading-relaxed">
            Selecciona un texto de nuestro catálogo. Léelo en el teleprompter y luego
            improvisa un discurso a favor o en contra del tema. Duración por defecto: 3 minutos.
          </p>
        </button>

        {/* Modo Presentación Propia */}
        <button
          onClick={() => onComplete("presentation")}
          className="w-full border border-border bg-card p-6 text-left hover:border-primary transition-none group"
        >
          <div className="font-mono text-xs uppercase tracking-wider text-primary mb-2">
            [02] Presentación Propia
          </div>
          <p className="text-sm text-muted-foreground font-sans leading-relaxed">
            Sube tu archivo PDF o PPT. Define el tiempo total de tu exposición y practica
            con tus propias diapositivas en el entorno VR.
          </p>
        </button>
      </div>
    </div>
  );
};

export default ModeSelectionStep;
