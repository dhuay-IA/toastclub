interface DifficultyStepProps {
  onComplete: (difficulty: "easy" | "medium" | "hard") => void;
}

const difficulties = [
  {
    key: "easy" as const,
    label: "FÁCIL",
    code: "[01]",
    description: "Audiencia tranquila, sin interrupciones. Ideal para tu primera sesión de práctica.",
  },
  {
    key: "medium" as const,
    label: "MEDIO",
    code: "[02]",
    description: "Audiencia atenta con preguntas ocasionales. Simula una presentación profesional estándar.",
  },
  {
    key: "hard" as const,
    label: "DIFÍCIL",
    code: "[03]",
    description: "Audiencia exigente, interrupciones frecuentes y preguntas desafiantes. Máxima presión.",
  },
];

const DifficultyStep = ({ onComplete }: DifficultyStepProps) => {
  return (
    <div className="step-container py-12">
      <div className="mb-8">
        <h2 className="font-mono text-sm uppercase tracking-wider text-foreground mb-2">
          Nivel de Dificultad
        </h2>
        <p className="text-sm text-muted-foreground font-sans">
          Define la intensidad de tu sesión de práctica.
        </p>
      </div>

      <div className="space-y-3 max-w-md">
        {difficulties.map((d) => (
          <button
            key={d.key}
            onClick={() => onComplete(d.key)}
            className="w-full border border-border bg-card p-5 text-left hover:border-primary transition-none"
          >
            <div className="font-mono text-xs uppercase tracking-wider text-primary mb-1">
              {d.code} {d.label}
            </div>
            <p className="text-xs text-muted-foreground font-sans leading-relaxed">
              {d.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DifficultyStep;
