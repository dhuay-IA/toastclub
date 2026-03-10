import { useState } from "react";

interface TermsStepProps {
  onComplete: () => void;
}

const TermsStep = ({ onComplete }: TermsStepProps) => {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedData, setAcceptedData] = useState(false);

  return (
    <div className="step-container py-12">
      <div className="border border-border bg-card p-8 max-w-md">
        <h2 className="font-mono text-sm uppercase tracking-wider text-foreground mb-6">
          Términos y Consentimiento
        </h2>

        <div className="space-y-6 text-sm text-muted-foreground font-sans leading-relaxed">
          <div className="border border-border p-4 max-h-40 overflow-y-auto text-xs">
            <p className="mb-3">
              <strong className="text-foreground">1. Términos de Servicio</strong><br />
              Al utilizar ToastClub, usted acepta que los archivos subidos (PDF, PPT) serán procesados
              para generar secuencias de imágenes destinadas a sesiones de práctica en entornos de
              Realidad Virtual. Los archivos se almacenan temporalmente y se eliminan tras la sesión.
            </p>
            <p className="mb-3">
              <strong className="text-foreground">2. Uso del Servicio</strong><br />
              El servicio está destinado exclusivamente a la práctica de presentaciones. Queda prohibido
              subir contenido ilegal, ofensivo o que infrinja derechos de propiedad intelectual de terceros.
            </p>
            <p>
              <strong className="text-foreground">3. Limitación de Responsabilidad</strong><br />
              ToastClub no garantiza la disponibilidad ininterrumpida del servicio ni se responsabiliza
              por pérdida de datos durante el procesamiento.
            </p>
          </div>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 accent-primary"
            />
            <span className="group-hover:text-foreground transition-none">
              Acepto los términos y condiciones del servicio.
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={acceptedData}
              onChange={(e) => setAcceptedData(e.target.checked)}
              className="mt-0.5 accent-primary"
            />
            <span className="group-hover:text-foreground transition-none">
              Consiento el tratamiento de mis datos personales y archivos subidos
              conforme a la política de privacidad.
            </span>
          </label>
        </div>

        <button
          onClick={onComplete}
          disabled={!acceptedTerms || !acceptedData}
          className="btn-primary w-full mt-8"
        >
          CONTINUAR
        </button>
      </div>
    </div>
  );
};

export default TermsStep;
