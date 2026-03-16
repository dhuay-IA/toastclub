const STEPS = [
  { key: "login",      label: "Acceso" },
  { key: "otp",        label: "Verificar" },
  { key: "terms",      label: "Términos" },
  { key: "mode",       label: "Modo" },
  { key: "config",     label: "Configurar" },
  { key: "difficulty", label: "Dificultad" },
  { key: "ready",      label: "Sesión" },
];

interface StepTimelineProps {
  currentStep: string;
}

const getStepIndex = (step: string) => {
  const map: Record<string, number> = {
    login: 0,
    otp: 1,
    terms: 2,
    mode: 3,
    "config-improv": 4,
    "config-presentation": 4,
    difficulty: 5,
    ready: 6,
  };
  return map[step] ?? 0;
};

const StepTimeline = ({ currentStep }: StepTimelineProps) => {
  const activeIndex = getStepIndex(currentStep);

  return (
    <div className="w-full max-w-xl mx-auto px-6 py-6">
      <div className="flex items-center gap-1">
        {STEPS.map((step, idx) => {
          const isDone = idx < activeIndex;
          const isActive = idx === activeIndex;

          return (
            <div key={step.key} className="flex-1 flex flex-col items-center gap-2">
              {/* Bar */}
              <div className="w-full h-1 rounded-full overflow-hidden bg-muted/50">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isDone
                      ? "w-full bg-secondary"
                      : isActive
                      ? "w-1/2 bg-secondary animate-pulse-glow"
                      : "w-0"
                  }`}
                />
              </div>
              {/* Label - only show active */}
              <span
                className={`text-[10px] font-medium tracking-wider uppercase transition-all duration-300 ${
                  isActive
                    ? "text-secondary"
                    : isDone
                    ? "text-muted-foreground/60"
                    : "text-muted-foreground/30"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepTimeline;
