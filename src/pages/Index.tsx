import { useState } from "react";
import LoginStep from "@/components/LoginStep";
import TermsStep from "@/components/TermsStep";
import ModeSelectionStep from "@/components/ModeSelectionStep";
import ImprovisationConfigStep from "@/components/ImprovisationConfigStep";
import PresentationConfigStep from "@/components/PresentationConfigStep";
import DifficultyStep from "@/components/DifficultyStep";
import SessionReadyStep from "@/components/SessionReadyStep";

type FlowStep =
  | "login"
  | "terms"
  | "mode"
  | "config-improv"
  | "config-presentation"
  | "difficulty"
  | "ready";

interface CompletedStep {
  label: string;
}

const generateSessionId = () => {
  const hex = () =>
    Math.floor(Math.random() * 0xffff)
      .toString(16)
      .padStart(4, "0");
  return `${hex()}-${hex()}-${hex()}-${hex()}`;
};

const Index = () => {
  const [currentStep, setCurrentStep] = useState<FlowStep>("login");
  const [completedSteps, setCompletedSteps] = useState<CompletedStep[]>([]);

  const [mode, setMode] = useState<"improvisation" | "presentation">("improvisation");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [sessionId, setSessionId] = useState("");

  // Presentation data
  const [fileName, setFileName] = useState("");
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [slideCount, setSlideCount] = useState(0);

  // Improvisation data
  const [textTitle, setTextTitle] = useState("");
  const [duration, setDuration] = useState(3);

  const addCompleted = (label: string) => {
    setCompletedSteps((prev) => [...prev, { label }]);
  };

  const handleLogin = (email: string) => {
    addCompleted(`Usuario: ${email} [✓]`);
    setCurrentStep("terms");
  };

  const handleTerms = () => {
    addCompleted("Términos aceptados [✓]");
    setCurrentStep("mode");
  };

  const handleMode = (selectedMode: "improvisation" | "presentation") => {
    setMode(selectedMode);
    addCompleted(
      `Modo: ${selectedMode === "improvisation" ? "Improvisación" : "Presentación propia"} [✓]`
    );
    setCurrentStep(
      selectedMode === "improvisation" ? "config-improv" : "config-presentation"
    );
  };

  const handleImprovConfig = (config: {
    textId: string;
    textTitle: string;
    duration: number;
  }) => {
    setTextTitle(config.textTitle);
    setDuration(config.duration);
    addCompleted(`Texto: "${config.textTitle}" | ${config.duration}min [✓]`);
    setCurrentStep("difficulty");
  };

  const handlePresentationConfig = (config: {
    fileName: string;
    fileSize: string;
    totalMinutes: number;
    slideCount: number;
  }) => {
    setFileName(config.fileName);
    setTotalMinutes(config.totalMinutes);
    setSlideCount(config.slideCount);
    addCompleted(`Archivo: ${config.fileName} | ${config.totalMinutes}min [✓]`);
    setCurrentStep("difficulty");
  };

  const handleDifficulty = (d: "easy" | "medium" | "hard") => {
    setDifficulty(d);
    const labels = { easy: "Fácil", medium: "Medio", hard: "Difícil" };
    addCompleted(`Dificultad: ${labels[d]} [✓]`);

    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    addCompleted(`Sesión: ${newSessionId} [✓]`);
    setCurrentStep("ready");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Collapsed completed steps */}
      {completedSteps.length > 0 && (
        <div className="border-b border-border">
          {completedSteps.map((step, idx) => (
            <div key={idx} className="step-summary">
              <span className="check">[✓]</span>
              <span>{step.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Active step */}
      <div className="flex-1 flex flex-col justify-center">
        {currentStep === "login" && <LoginStep onComplete={handleLogin} />}
        {currentStep === "terms" && <TermsStep onComplete={handleTerms} />}
        {currentStep === "mode" && <ModeSelectionStep onComplete={handleMode} />}
        {currentStep === "config-improv" && (
          <ImprovisationConfigStep onComplete={handleImprovConfig} />
        )}
        {currentStep === "config-presentation" && (
          <PresentationConfigStep onComplete={handlePresentationConfig} />
        )}
        {currentStep === "difficulty" && (
          <DifficultyStep onComplete={handleDifficulty} />
        )}
        {currentStep === "ready" && (
          <SessionReadyStep
            sessionId={sessionId}
            mode={mode}
            difficulty={difficulty}
            fileName={fileName}
            totalMinutes={totalMinutes}
            slideCount={slideCount}
            textTitle={textTitle}
            duration={duration}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
