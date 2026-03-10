import { useState, useEffect, useRef } from "react";

interface ProcessingStepProps {
  fileName: string;
  fileSize: string;
  slideCount: number;
  onComplete: (sessionId: string) => void;
}

const generateSessionId = () => {
  const hex = () =>
    Math.floor(Math.random() * 0xffff)
      .toString(16)
      .padStart(4, "0");
  return `${hex()}-${hex()}-${hex()}-${hex()}`;
};

interface LogLine {
  text: string;
  type: "info" | "success" | "progress";
}

const ProcessingStep = ({
  fileName,
  fileSize,
  slideCount,
  onComplete,
}: ProcessingStepProps) => {
  const [lines, setLines] = useState<LogLine[]>([]);
  const [done, setDone] = useState(false);
  const sessionIdRef = useRef(generateSessionId());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const allLines: LogLine[] = [
      { text: "INICIANDO PROCESO...", type: "info" },
      {
        text: `[✓] ARCHIVO RECIBIDO: ${fileName} (${fileSize})`,
        type: "success",
      },
      { text: "[>] ANALIZANDO ESTRUCTURA DE DIAPOSITIVAS...", type: "progress" },
      { text: `[✓] ${slideCount} DIAPOSITIVAS DETECTADAS.`, type: "success" },
    ];

    for (let i = 1; i <= slideCount; i++) {
      allLines.push({
        text: `[>] CONVIRTIENDO DIAPOSITIVA ${i}/${slideCount} A IMAGEN...`,
        type: "progress",
      });
    }

    allLines.push(
      { text: "[✓] SECUENCIA DE IMÁGENES COMPLETA.", type: "success" },
      { text: "[>] GENERANDO PAYLOAD DE SESIÓN...", type: "progress" },
      { text: "[✓] PAYLOAD LISTO.", type: "success" },
      {
        text: `[✓] SESIÓN CREADA: session_id: ${sessionIdRef.current}`,
        type: "success",
      }
    );

    let i = 0;
    const interval = setInterval(() => {
      if (i < allLines.length) {
        setLines((prev) => [...prev, allLines[i]]);
        i++;
      } else {
        clearInterval(interval);
        setDone(true);
      }
    }, 180);

    return () => clearInterval(interval);
  }, [fileName, fileSize, slideCount]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div className="step-container py-12">
      <div className="border border-border bg-card p-6 max-w-xl">
        <div
          ref={containerRef}
          className="max-h-80 overflow-y-auto"
        >
          {lines.map((line, idx) => (
            <div
              key={idx}
              className="terminal-text"
              style={{
                opacity:
                  line.type === "progress" && idx < lines.length - 1
                    ? 0.4
                    : 1,
              }}
            >
              {line.text}
            </div>
          ))}
          {!done && (
            <span className="terminal-text animate-blink">▌</span>
          )}
        </div>

        {done && (
          <button
            onClick={() => onComplete(sessionIdRef.current)}
            className="btn-primary w-full mt-6"
          >
            CONTINUAR A SESIÓN VR
          </button>
        )}
      </div>
    </div>
  );
};

export default ProcessingStep;
