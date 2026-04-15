import { useRef, useState } from "react";
import {
  convertPdfFileToImages,
  convertPresentationFileToImages,
} from "@/lib/presentation";

interface PresentationConfigStepProps {
  onComplete: (config: {
    fileName: string;
    fileSize: string;
    totalMinutes: number;
    slideCount: number;
    slideImages: string[];
  }) => void;
}

const PresentationConfigStep = ({ onComplete }: PresentationConfigStepProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);
  const [slideCount, setSlideCount] = useState(0);
  const [slideImages, setSlideImages] = useState<string[]>([]);
  const [minutes, setMinutes] = useState("10");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const normalizeMinutesInput = (value: string) => {
    if (!value) return "";

    const numericValue = value.replace(/\D/g, "");
    if (!numericValue) return "";

    return String(Number(numericValue));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const resetSelection = () => {
    setFile(null);
    setProcessed(false);
    setIsProcessing(false);
    setSlideCount(0);
    setSlideImages([]);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const ext = selected.name.split(".").pop()?.toLowerCase();

    if (ext !== "pdf" && ext !== "ppt" && ext !== "pptx") {
      setError("Solo se admiten archivos PDF, PPT o PPTX.");
      return;
    }

    if (selected.size > 50 * 1024 * 1024) {
      setError("El archivo supera el maximo permitido de 50MB.");
      return;
    }

    setFile(selected);
    setProcessed(false);
    setSlideCount(0);
    setSlideImages([]);
    setError("");
    setIsProcessing(true);

    try {
      const images =
        ext === "pdf"
          ? await convertPdfFileToImages(selected)
          : await convertPresentationFileToImages(selected);

      setSlideImages(images);
      setSlideCount(images.length);
      setProcessed(true);
    } catch (conversionError) {
      setProcessed(false);
      setSlideImages([]);
      setSlideCount(0);
      setError(
        conversionError instanceof Error
          ? conversionError.message
          : "No se pudo preparar el archivo."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = () => {
    if (!file || !processed) return;

    onComplete({
      fileName: file.name,
      fileSize: formatSize(file.size),
      totalMinutes: Number(minutes),
      slideCount,
      slideImages,
    });
  };

  return (
    <div className="step-container py-12">
      <div className="max-w-3xl mx-auto">
        <h2 className="mb-6 text-center text-lg font-semibold text-foreground">
          Sube tu presentacion
        </h2>

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
              className="w-full glass-card border-dashed p-10 text-center transition-colors hover:border-secondary"
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
                <span className="text-xl text-secondary">PDF</span>
              </div>
              <div className="text-sm font-medium text-muted-foreground">
                Seleccionar archivo
              </div>
              <div className="mt-1 text-xs text-muted-foreground/60">
                PDF, PPT o PPTX - Max. 50MB
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
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
                  <span className="text-sm text-muted-foreground">
                    Preparando tu presentacion...
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-sm font-medium text-secondary">
                    <span>OK</span>
                    <span>Presentacion lista</span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {file.name} - {formatSize(file.size)} - {slideCount} diapositivas
                  </div>
                </>
              )}

              {!isProcessing && (
                <button
                  onClick={resetSelection}
                  className="mt-2 text-xs text-muted-foreground transition-colors hover:text-secondary"
                >
                  Cambiar archivo
                </button>
              )}
            </div>
          )}
        </div>

        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

        {processed && (
          <div className="mb-8">
            <label className="mb-3 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Tiempo total de exposicion
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min={1}
                max={120}
                value={minutes}
                onChange={(e) => setMinutes(normalizeMinutesInput(e.target.value))}
                onBlur={() => {
                  if (!minutes) {
                    setMinutes("10");
                  }
                }}
                className="input-field w-24 text-center font-mono"
              />
              <span className="text-sm text-muted-foreground">minutos</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground/60">
              La sesion finalizara automaticamente al cumplirse este tiempo.
            </p>
          </div>
        )}

        {slideImages.length > 0 && (
          <div className="mb-8">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Vista previa
            </p>
            <div className="grid max-h-80 grid-cols-2 gap-3 overflow-y-auto rounded-2xl border border-border/70 bg-white/70 p-3 md:grid-cols-3">
              {slideImages.slice(0, 6).map((image, index) => (
                <div
                  key={`slide-${index + 1}`}
                  className="overflow-hidden rounded-xl border border-border/70 bg-muted/20"
                >
                  <img
                    src={image}
                    alt={`Diapositiva ${index + 1}`}
                    className="h-28 w-full object-cover object-top"
                  />
                  <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Slide {index + 1}
                  </div>
                </div>
              ))}
            </div>
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
