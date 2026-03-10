import { useState } from "react";
import LoginStep from "@/components/LoginStep";
import TermsStep from "@/components/TermsStep";
import SessionConfigStep from "@/components/SessionConfigStep";
import ProcessingStep from "@/components/ProcessingStep";
import SessionReadyStep from "@/components/SessionReadyStep";

type FlowStep = "login" | "terms" | "config" | "processing" | "ready";

interface CompletedStep {
  label: string;
}

interface SessionData {
  fileName: string;
  fileSize: string;
  totalMinutes: number;
  slideCount: number;
  sessionId: string;
}

const Index = () => {
  const [currentStep, setCurrentStep] = useState<FlowStep>("login");
  const [completedSteps, setCompletedSteps] = useState<CompletedStep[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [sessionData, setSessionData] = useState<SessionData>({
    fileName: "",
    fileSize: "",
    totalMinutes: 0,
    slideCount: 0,
    sessionId: "",
  });

  const addCompleted = (label: string) => {
    setCompletedSteps((prev) => [...prev, { label }]);
  };

  const handleLogin = (email: string) => {
    setUserEmail(email);
    addCompleted(`Usuario: ${email} [✓]`);
    setCurrentStep("terms");
  };

  const handleTerms = () => {
    addCompleted("Términos aceptados [✓]");
    setCurrentStep("config");
  };

  const handleConfig = (config: {
    fileName: string;
    fileSize: string;
    totalMinutes: number;
    slideCount: number;
  }) => {
    setSessionData((prev) => ({ ...prev, ...config }));
    addCompleted(`Archivo: ${config.fileName} | ${config.totalMinutes}min [✓]`);
    setCurrentStep("processing");
  };

  const handleProcessing = (sessionId: string) => {
    setSessionData((prev) => ({ ...prev, sessionId }));
    addCompleted(`Sesión: ${sessionId} [✓]`);
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
        {currentStep === "config" && (
          <SessionConfigStep onComplete={handleConfig} />
        )}
        {currentStep === "processing" && (
          <ProcessingStep
            fileName={sessionData.fileName}
            fileSize={sessionData.fileSize}
            slideCount={sessionData.slideCount}
            onComplete={handleProcessing}
          />
        )}
        {currentStep === "ready" && (
          <SessionReadyStep
            sessionId={sessionData.sessionId}
            fileName={sessionData.fileName}
            totalMinutes={sessionData.totalMinutes}
            slideCount={sessionData.slideCount}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
