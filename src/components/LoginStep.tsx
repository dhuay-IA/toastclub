import { useState } from "react";
import { sendOTP } from "@/lib/auth";

interface LoginStepProps {
  onComplete: (email: string) => void;
}

const LoginStep = ({ onComplete }: LoginStepProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    try {
      const res = await sendOTP(email, isLogin ? undefined : name);
      if (res.success) {
        onComplete(email);
      } else {
        setError(res.message || "No se pudo enviar el código. Inténtalo de nuevo.");
      }
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="step-container py-16">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-1">
          Toast<span className="text-primary">Club</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-3">
          Entrena tu oratoria en realidad virtual con IA
        </p>
      </div>

      <div className="glass-card p-8 max-w-md mx-auto">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-6">
          {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                Nombre
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="Tu nombre completo"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              className="input-field"
              placeholder="usuario@email.com"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full mt-6">
            {loading ? "Enviando código..." : "ENVIAR CÓDIGO"}
          </button>
        </form>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          Recibirás un código de verificación en tu correo.
        </p>

        <button
          onClick={() => { setIsLogin(!isLogin); setError(""); }}
          className="mt-3 text-xs text-muted-foreground hover:text-secondary transition-colors w-full text-center block"
        >
          {isLogin
            ? "¿No tienes cuenta? Regístrate aquí"
            : "¿Ya tienes cuenta? Iniciar sesión"}
        </button>
      </div>
    </div>
  );
};

export default LoginStep;
