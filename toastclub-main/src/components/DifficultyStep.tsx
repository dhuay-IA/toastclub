interface DifficultyStepProps {
  onComplete: (difficulty: "easy" | "medium" | "hard") => void;
}

const difficulties = [
  {
    key: "easy" as const,
    label: "Fácil",
    emoji: "😌",
    color: "text-green-400",
    borderHover: "hover:border-green-400/50",
    bgHover: "bg-green-400/10",
    description: "Audiencia tranquila, sin interrupciones. Ideal para tu primera sesión.",
  },
  {
    key: "medium" as const,
    label: "Medio",
    emoji: "🎯",
    color: "text-accent",
    borderHover: "hover:border-accent/50",
    bgHover: "bg-accent/10",
    description: "Audiencia atenta con preguntas ocasionales. Nivel profesional estándar.",
  },
  {
    key: "hard" as const,
    label: "Difícil",
    emoji: "🔥",
    color: "text-destructive",
    borderHover: "hover:border-destructive/50",
    bgHover: "bg-destructive/10",
    description: "Audiencia exigente, interrupciones frecuentes. Máxima presión.",
  },
];

const DifficultyStep = ({ onComplete }: DifficultyStepProps) => {
  return (
    <div className="step-container py-12">
      <div className="mb-8 text-center">
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Nivel de Dificultad
        </h2>
        <p className="text-sm text-muted-foreground">
          Define la intensidad de tu sesión
        </p>
      </div>

      <div className="space-y-3 max-w-md mx-auto">
        {difficulties.map((d) => (
          <button
            key={d.key}
            onClick={() => onComplete(d.key)}
            className={`w-full glass-card p-5 text-left ${d.borderHover} transition-colors flex items-start gap-4`}
          >
            <div className={`w-10 h-10 rounded-lg ${d.bgHover} flex items-center justify-center flex-shrink-0`}>
              <span className="text-lg">{d.emoji}</span>
            </div>
            <div>
              <div className={`text-sm font-semibold ${d.color} mb-1`}>
                {d.label}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {d.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DifficultyStep;
