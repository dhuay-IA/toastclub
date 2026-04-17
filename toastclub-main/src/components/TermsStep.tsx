import { useState } from "react";

interface TermsStepProps {
  onComplete: () => void;
}

const TermsStep = ({ onComplete }: TermsStepProps) => {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedData, setAcceptedData] = useState(false);

  return (
    <div className="step-container py-12">
      <div className="glass-card p-8 max-w-md mx-auto">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-6">
          Términos y Consentimiento
        </h2>

        <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
          <div className="border border-border rounded-lg p-4 max-h-40 overflow-y-auto text-xs bg-muted/20">
            <p className="mb-3">
              <strong className="text-foreground">1. Términos de Servicio</strong><br />
              Al utilizar ToastClub, usted acepta que los archivos subidos (PDF, PPT) serán procesados
              para generar secuencias de imágenes destinadas a sesiones de práctica en entornos de
              Realidad Virtual.
            </p>
            <p className="mb-3">
              <strong className="text-foreground">2. Uso del Servicio</strong><br />
              El servicio está destinado exclusivamente a la práctica de presentaciones. Queda prohibido
              subir contenido ilegal u ofensivo.
            </p>
            <p>
              <strong className="text-foreground">3. Limitación de Responsabilidad</strong><br />
              ToastClub no garantiza la disponibilidad ininterrumpida del servicio.
            </p>
          </div>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 accent-[#007cd8]"
            />
            <span className="group-hover:text-foreground transition-colors">
              Acepto los términos y condiciones del servicio.
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={acceptedData}
              onChange={(e) => setAcceptedData(e.target.checked)}
              className="mt-0.5 accent-[#007cd8]"
            />
            <span className="group-hover:text-foreground transition-colors">
              Consiento el tratamiento de mis datos personales conforme a la política de privacidad.
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
