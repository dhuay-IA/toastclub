import { useState, useRef } from "react";

interface SessionConfigStepProps {
  onComplete: (config: {
    fileName: string;
    fileSize: string;
    totalMinutes: number;
    slideCount: number;
  }) => void;
}

const SessionConfigStep = ({ onComplete }: SessionConfigStepProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [minutes, setMinutes] = useState(10);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      const ext = selected.name.split(".").pop()?.toLowerCase();
      if (ext === "pdf" || ext === "ppt" || ext === "pptx") {
        setFile(selected);
      }
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + "KB";
    return (bytes / (1024 * 1024)).toFixed(1) + "MB";
  };

  const handleProcess = () => {
    if (!file) return;
    const fakeSlides = Math.floor(Math.random() * 20) + 8;
    onComplete({
      fileName: file.name,
      fileSize: formatSize(file.size),
      totalMinutes: minutes,
      slideCount: fakeSlides,
    });
  };

  return (
    <div className="step-container py-12">
      <div className="border border-border bg-card p-8 max-w-md">
        <h2 className="font-mono text-sm uppercase tracking-wider text-foreground mb-6">
          Configuración de Sesión
        </h2>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">
            Archivo de Presentación
          </label>
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
                PDF, PPT o PPTX
              </div>
            </button>
          ) : (
            <div className="border border-primary/30 bg-primary/5 p-4">
              <div className="font-mono text-xs text-primary flex items-center gap-2">
                <span>[✓]</span>
                <span>{file.name}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1 font-sans">
                {formatSize(file.size)}
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-xs text-muted-foreground hover:text-foreground mt-2 font-mono"
              >
                [CAMBIAR]
              </button>
            </div>
          )}
        </div>

        {/* Time */}
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
        </div>

        <button
          onClick={handleProcess}
          disabled={!file}
          className="btn-primary w-full"
        >
          PROCESAR ARCHIVO
        </button>
      </div>
    </div>
  );
};

export default SessionConfigStep;
