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
    if (selected.size > 50 * 1024 * 1024) return;

    setFile(selected);
    setProcessed(false);

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
      <div className="max-w-md mx-auto">
        <h2 className="text-lg font-semibold text-foreground mb-6 text-center">
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
              className="w-full glass-card border-dashed p-10 text-center hover:border-secondary transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-secondary text-xl">📄</span>
              </div>
              <div className="text-sm text-muted-foreground font-medium">
                Seleccionar archivo
              </div>
              <div className="text-xs text-muted-foreground/60 mt-1">
                PDF, PPT o PPTX — Máx. 50MB
              </div>
            </button>
          ) : (
            <div
              className={`glass-card p-5 ${
                isProcessing ? "border-muted" : "border-secondary/30"
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    Procesando archivo...
                  </span>
                </div>
              ) : (
                <>
                  <div className="text-sm text-secondary flex items-center gap-2 font-medium">
                    <span>✓</span>
                    <span>Presentación cargada</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {file.name} — {formatSize(file.size)} — {slideCount} diapositivas
                  </div>
                </>
              )}
              {!isProcessing && (
                <button
                  onClick={() => {
                    setFile(null);
                    setProcessed(false);
                  }}
                  className="text-xs text-muted-foreground hover:text-secondary mt-2 transition-colors"
                >
                  Cambiar archivo
                </button>
              )}
            </div>
          )}
        </div>

        {/* Time config */}
        {processed && (
          <div className="mb-8">
            <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
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
              <span className="text-sm text-muted-foreground">minutos</span>
            </div>
            <p className="text-xs text-muted-foreground/60 mt-2">
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
