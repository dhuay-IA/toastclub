import { useState } from "react";
import LoginStep from "@/components/LoginStep";
import TermsStep from "@/components/TermsStep";
import ModeSelectionStep from "@/components/ModeSelectionStep";
import ImprovisationConfigStep from "@/components/ImprovisationConfigStep";
import PresentationConfigStep from "@/components/PresentationConfigStep";
import DifficultyStep from "@/components/DifficultyStep";
import SessionReadyStep from "@/components/SessionReadyStep";
import StepTimeline from "@/components/StepTimeline";

type FlowStep =
  | "login"
  | "terms"
  | "mode"
  | "config-improv"
  | "config-presentation"
  | "difficulty"
  | "ready";

const generateSessionId = () => {
  const hex = () =>
    Math.floor(Math.random() * 0xffff)
      .toString(16)
      .padStart(4, "0");
  return `${hex()}-${hex()}-${hex()}-${hex()}`;
};

const Index = () => {
  const [currentStep, setCurrentStep] = useState<FlowStep>("login");

  const [mode, setMode] = useState<"improvisation" | "presentation">("improvisation");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [sessionId, setSessionId] = useState("");

  const [fileName, setFileName] = useState("");
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [slideCount, setSlideCount] = useState(0);

  const [textTitle, setTextTitle] = useState("");
  const [duration, setDuration] = useState(3);

  const handleLogin = (_email: string) => {
    setCurrentStep("terms");
  };

  const handleTerms = () => {
    setCurrentStep("mode");
  };

  const handleMode = (selectedMode: "improvisation" | "presentation") => {
    setMode(selectedMode);
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
    setCurrentStep("difficulty");
  };

  const handleDifficulty = (d: "easy" | "medium" | "hard") => {
    setDifficulty(d);
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    setCurrentStep("ready");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Subtle background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-30%] left-[-10%] w-[60%] h-[60%] rounded-full opacity-[0.03]"
          style={{ background: "radial-gradient(circle, hsl(186 100% 50%), transparent)" }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-[0.03]"
          style={{ background: "radial-gradient(circle, hsl(262 83% 58%), transparent)" }} />
      </div>

      {/* Timeline */}
      <StepTimeline currentStep={currentStep} />

      {/* Active step */}
      <div className="flex-1 flex flex-col justify-center relative z-10">
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
