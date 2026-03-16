import { useState, useRef, useEffect } from "react";
import { verifyOTP } from "@/lib/auth";

interface OTPStepProps {
  email: string;
  onComplete: () => void;
  onBack: () => void;
}

const OTPStep = ({ email, onComplete, onBack }: OTPStepProps) => {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  const handleChange = (i: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[i] = value;
    setDigits(next);
    setError("");
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
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setDigits(next);
    inputs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join("");
    if (code.length < 6) return;
    setLoading(true);
    setError("");
    try {
      const res = await verifyOTP(email, code);
      if (res.success) {
        onComplete();
      } else {
        setError(res.message || "Código incorrecto. Inténtalo de nuevo.");
        setDigits(["", "", "", "", "", ""]);
        inputs.current[0]?.focus();
      }
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="step-container py-16">
      <div className="glass-card p-8 max-w-md mx-auto">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-2">
          Verificación
        </h2>
        <p className="text-sm text-muted-foreground mb-8">
          Enviamos un código de 6 dígitos a{" "}
          <span className="text-foreground font-medium">{email}</span>.
          Revisa tu bandeja de entrada.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-2 justify-center" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => { inputs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-11 h-14 text-center text-xl font-bold border border-border rounded-lg bg-white focus:border-secondary focus:ring-0 text-foreground transition-colors"
              />
            ))}
          </div>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={digits.join("").length < 6 || loading}
            className="btn-primary w-full"
          >
            {loading ? "Verificando..." : "VERIFICAR"}
          </button>
        </form>

        <button
          onClick={onBack}
          className="mt-4 text-xs text-muted-foreground hover:text-secondary transition-colors w-full text-center block"
        >
          Volver e introducir otro correo
        </button>
      </div>
    </div>
  );
};

export default OTPStep;
