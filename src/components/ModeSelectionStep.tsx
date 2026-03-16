interface ModeSelectionStepProps {
  onComplete: (mode: "improvisation" | "presentation") => void;
}

const ModeSelectionStep = ({ onComplete }: ModeSelectionStepProps) => {
  return (
    <div className="step-container py-12">
      <div className="mb-8 text-center">
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Elige tu Modo de Práctica
        </h2>
        <p className="text-sm text-muted-foreground">
          ¿Cómo deseas entrenar hoy?
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
        {/* Modo Improvisación */}
        <button
          onClick={() => onComplete("improvisation")}
          className="glass-card p-6 text-left hover:border-secondary transition-colors group"
        >
          <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
            <span className="text-secondary text-lg">🎤</span>
          </div>
          <div className="text-sm font-semibold text-foreground mb-2">
            Improvisación
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Selecciona un texto, léelo en el teleprompter e improvisa un discurso. Duración: 3 min.
          </p>
        </button>

        {/* Modo Presentación */}
        <button
          onClick={() => onComplete("presentation")}
          className="glass-card p-6 text-left hover:border-secondary transition-colors group"
        >
          <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
            <span className="text-secondary text-lg">📊</span>
          </div>
          <div className="text-sm font-semibold text-foreground mb-2">
            Presentación Propia
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Sube tu PDF o PPT, define el tiempo y practica con tus diapositivas en VR.
          </p>
        </button>
      </div>
    </div>
  );
};

export default ModeSelectionStep;
