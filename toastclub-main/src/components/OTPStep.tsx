import { useEffect, useRef, useState } from "react";
import { sendOTP, verifyOTP } from "@/lib/auth";

interface OTPStepProps {
  email: string;
  onComplete: () => void;
  onBack: () => void;
  resendCount: number;
  maxResends?: number;
  onResendSuccess: () => void;
}

const OTPStep = ({
  email,
  onComplete,
  onBack,
  resendCount,
  maxResends = 3,
  onResendSuccess,
}: OTPStepProps) => {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const resendsRemaining = Math.max(maxResends - resendCount, 0);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  const handleChange = (i: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[i] = value;
    setDigits(next);
    setError("");
    setInfo("");
    if (value && i < 5) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = [...digits];
    pasted.split("").forEach((ch, i) => {
      next[i] = ch;
    });
    setDigits(next);
    setError("");
    setInfo("");
    inputs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length < 6) return;
    setLoading(true);
    setError("");
    setInfo("");

    try {
      const res = await verifyOTP(email, code);
      if (res.success) {
        onComplete();
      } else {
        setError(res.message || "Codigo incorrecto. Intentalo de nuevo.");
        setDigits(["", "", "", "", "", ""]);
        inputs.current[0]?.focus();
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Error de conexion. Intentalo de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendsRemaining === 0 || resending) return;

    setResending(true);
    setError("");
    setInfo("");

    try {
      const res = await sendOTP(email);

      if (!res.success) {
        setError(res.message || "No se pudo reenviar el codigo.");
        return;
      }

      setDigits(["", "", "", "", "", ""]);
      setInfo(
        `Te enviamos un nuevo codigo. Te quedan ${Math.max(
          maxResends - (resendCount + 1),
          0
        )} reenvios.`
      );
      onResendSuccess();
      inputs.current[0]?.focus();
    } catch (resendError) {
      setError(
        resendError instanceof Error
          ? resendError.message
          : "Error de conexion. Intentalo de nuevo."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="step-container py-16">
      <div className="glass-card mx-auto max-w-md p-8">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-foreground">
          Verificacion
        </h2>
        <p className="mb-8 text-sm text-muted-foreground">
          Enviamos un codigo de 6 digitos a{" "}
          <span className="font-medium text-foreground">{email}</span>.
          Revisa tu bandeja de entrada.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2" onPaste={handlePaste}>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="h-14 w-11 rounded-lg border border-border bg-white text-center text-xl font-bold text-foreground transition-colors focus:border-secondary focus:ring-0"
              />
            ))}
          </div>

          {error && <p className="text-center text-sm text-destructive">{error}</p>}
          {info && <p className="text-center text-sm text-secondary">{info}</p>}

          <button
            type="submit"
            disabled={digits.join("").length < 6 || loading}
            className="btn-primary w-full"
          >
            {loading ? "Verificando..." : "VERIFICAR"}
          </button>
        </form>

        <div className="mt-4 rounded-xl border border-dashed border-border/70 bg-white/60 p-4 text-center">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
            Reenvio de codigo
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Puedes solicitar un nuevo codigo hasta {maxResends} veces.
            {resendsRemaining > 0
              ? ` Te quedan ${resendsRemaining} reenvios.`
              : " Alcanzaste el limite. Usa otro correo para registrarte."}
          </p>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendsRemaining === 0 || resending}
            className="mt-4 w-full rounded-lg border border-secondary/30 bg-white px-4 py-3 text-sm font-semibold uppercase tracking-wider text-secondary transition-colors hover:border-secondary hover:bg-secondary/5 disabled:cursor-not-allowed disabled:border-border disabled:text-muted-foreground"
          >
            {resending ? "REENVIANDO..." : "SOLICITAR NUEVO CODIGO"}
          </button>
        </div>

        <button
          onClick={onBack}
          className="mt-4 block w-full text-center text-xs text-muted-foreground transition-colors hover:text-secondary"
        >
          Volver e introducir otro correo
        </button>
      </div>
    </div>
  );
};

export default OTPStep;
