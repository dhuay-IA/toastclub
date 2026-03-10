import { useState } from "react";

interface LoginStepProps {
  onComplete: (email: string) => void;
}

const LoginStep = ({ onComplete }: LoginStepProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onComplete(email);
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
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="usuario@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn-primary w-full mt-6">
            {isLogin ? "ACCEDER" : "CREAR CUENTA"}
          </button>
        </form>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="mt-4 text-xs text-muted-foreground hover:text-primary transition-colors w-full text-center block"
        >
          {isLogin
            ? "¿No tienes cuenta? Crear una"
            : "¿Ya tienes cuenta? Iniciar sesión"}
        </button>
      </div>
    </div>
  );
};

export default LoginStep;
