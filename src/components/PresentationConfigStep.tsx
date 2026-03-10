import { useState, useRef } from "react";

interface PresentationConfigStepProps {
  onComplete: (config: {
    fileName: string;
    fileSize: string;
    totalMinutes: number;
    slideCount: number;
  }) => void;
}

const PresentationConfigStep = ({ onComplete }: PresentationConfigStepProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);
  const [slideCount, setSlideCount] = useState(0);
  const [minutes, setMinutes] = useState(10);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + "KB";
    return (bytes / (1024 * 1024)).toFixed(1) + "MB";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const ext = selected.name.split(".").pop()?.toLowerCase();
    if (ext !== "pdf" && ext !== "ppt" && ext !== "pptx") return;

    // Validate size (max 50MB)
    if (selected.size > 50 * 1024 * 1024) return;

    setFile(selected);
    setProcessed(false);

    // Silent processing simulation
    setIsProcessing(true);
    const fakeSlides = Math.floor(Math.random() * 20) + 8;
    setTimeout(() => {
      setSlideCount(fakeSlides);
      setIsProcessing(false);
      setProcessed(true);
    }, 1800);
  };

  const handleSubmit = () => {
    if (!file || !processed) return;
    onComplete({
      fileName: file.name,
      fileSize: formatSize(file.size),
      totalMinutes: minutes,
      slideCount,
    });
  };

  return (
    <div className="step-container py-12">
      <div className="max-w-md">
        <h2 className="font-mono text-sm uppercase tracking-wider text-foreground mb-6">
          Sube tu Presentación
        </h2>

        {/* File Upload */}
        <div className="mb-6">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.ppt,.pptx"
            onChange={handleFileChange}
            className="hidden"
          />

          {!file ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full border border-dashed border-muted-foreground/30 p-8 text-center hover:border-primary transition-none"
            >
              <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                [ Seleccionar archivo ]
              </div>
              <div className="text-xs text-muted-foreground/60 mt-2 font-sans">
                PDF, PPT o PPTX — Máx. 50MB
              </div>
            </button>
          ) : (
            <div
              className={`border p-4 ${
                isProcessing
                  ? "border-muted bg-card"
                  : "border-primary/30 bg-primary/5"
              }`}
            >
              {isProcessing ? (
                <div className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
                  Procesando archivo<span className="animate-blink">...</span>
                </div>
              ) : (
                <>
                  <div className="font-mono text-xs text-primary flex items-center gap-2">
                    <span>[✓]</span>
                    <span>Presentación cargada</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 font-sans">
                    {file.name} — {formatSize(file.size)} — {slideCount} diapositivas detectadas
                  </div>
                </>
              )}
              {!isProcessing && (
                <button
                  onClick={() => {
                    setFile(null);
                    setProcessed(false);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground mt-2 font-mono"
                >
                  [CAMBIAR]
                </button>
              )}
            </div>
          )}
        </div>

        {/* Time config - only show after processing */}
        {processed && (
          <div className="mb-8">
            <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">
              Tiempo total de exposición
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min={1}
                max={120}
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                className="input-field w-24 text-center font-mono"
              />
              <span className="text-sm text-muted-foreground font-sans">minutos</span>
            </div>
            <p className="text-xs text-muted-foreground/60 font-sans mt-2">
              La sesión finalizará automáticamente al cumplirse este tiempo.
            </p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!processed}
          className="btn-primary w-full"
        >
          CONTINUAR
        </button>
      </div>
    </div>
  );
};

export default PresentationConfigStep;
