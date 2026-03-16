import { useState, useEffect } from "react";
import LandingPage from "@/components/LandingPage";
import LoginStep from "@/components/LoginStep";
import OTPStep from "@/components/OTPStep";
import TermsStep from "@/components/TermsStep";
import ModeSelectionStep from "@/components/ModeSelectionStep";
import ImprovisationConfigStep from "@/components/ImprovisationConfigStep";
import PresentationConfigStep from "@/components/PresentationConfigStep";
import DifficultyStep from "@/components/DifficultyStep";
import SessionReadyStep from "@/components/SessionReadyStep";
import StepTimeline from "@/components/StepTimeline";

type FlowStep =
  | "landing"
  | "login"
  | "otp"
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

const SESSION_KEY = "toastclub_user";

const Index = () => {
  const [currentStep, setCurrentStep] = useState<FlowStep>("landing");
  const [email, setEmail] = useState("");

  // On mount: restore saved session and skip login/OTP if already verified
  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) setEmail(saved);
  }, []);

  const [mode, setMode] = useState<"improvisation" | "presentation">("improvisation");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [sessionId, setSessionId] = useState("");

  const [fileName, setFileName] = useState("");
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [slideCount, setSlideCount] = useState(0);

  const [textTitle, setTextTitle] = useState("");
  const [duration, setDuration] = useState(3);

  const handleLogin = (userEmail: string) => {
    setEmail(userEmail);
    setCurrentStep("otp");
  };

  const handleOTPVerified = () => {
    localStorage.setItem(SESSION_KEY, email);
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

  const handleStart = () => {
    const saved = localStorage.getItem(SESSION_KEY);
    setCurrentStep(saved ? "terms" : "login");
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setEmail("");
    setCurrentStep("login");
  };

  if (currentStep === "landing") {
    return <LandingPage onStart={handleStart} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Subtle background tint */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-30%] left-[-10%] w-[60%] h-[60%] rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, #660000, transparent)" }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full opacity-[0.03]"
          style={{ background: "radial-gradient(circle, #007cd8, transparent)" }} />
      </div>

      {/* Top bar with logout */}
      {email && (
        <div className="relative z-10 flex items-center justify-end px-6 pt-4 max-w-2xl mx-auto w-full">
          <span className="text-xs text-muted-foreground mr-3">{email}</span>
          <button
            onClick={handleLogout}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors duration-200"
          >
            Cerrar sesión
          </button>
        </div>
      )}

      {/* Timeline */}
      <StepTimeline currentStep={currentStep} />

      {/* Active step */}
      <div className="flex-1 flex flex-col justify-center relative z-10">
        {currentStep === "login" && <LoginStep onComplete={handleLogin} />}
        {currentStep === "otp" && (
          <OTPStep
            email={email}
            onComplete={handleOTPVerified}
            onBack={() => setCurrentStep("login")}
          />
        )}
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
