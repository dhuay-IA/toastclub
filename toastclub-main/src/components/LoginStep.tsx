import { useState } from "react";
import {
  type AuthenticatedUser,
  loginUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
  sendOTP,
} from "@/lib/auth";

interface LoginStepProps {
  onLoginSuccess: (
    email: string,
    name?: string,
    token?: string,
    role?: "student" | "admin"
  ) => void;
  onRegisterSuccess: (email: string, name: string) => void;
}

const LoginStep = ({
  onLoginSuccess,
  onRegisterSuccess,
}: LoginStepProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isRecoveringPassword, setIsRecoveringPassword] = useState(false);
  const [resetCodeSent, setResetCodeSent] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const clearMessages = () => {
    setError("");
    setInfo("");
  };

  const resetRecoveryState = () => {
    setIsRecoveringPassword(false);
    setResetCodeSent(false);
    setResetCode("");
    setPassword("");
    setConfirmPassword("");
    clearMessages();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    clearMessages();

    try {
      if (isLogin) {
        const res = await loginUser(email, password);

        if (res.success) {
          const authData = res.data as
            | { token?: string; user?: AuthenticatedUser }
            | undefined;

          onLoginSuccess(email, authData?.user?.name, authData?.token, authData?.user?.role);
        } else {
          setError(res.message || "No se pudo iniciar sesión. Inténtalo de nuevo.");
        }
      } else {
        const registerRes = await registerUser(email, name.trim(), password);

        if (!registerRes.success) {
          setError(registerRes.message || "No se pudo crear la cuenta.");
          return;
        }

        const otpRes = await sendOTP(email);

        if (!otpRes.success) {
          setError(
            otpRes.message || "La cuenta se creó, pero no se pudo enviar el código."
          );
          return;
        }

        onRegisterSuccess(email, name.trim());
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Error de conexión. Inténtalo de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  const requestResetCode = async () => {
    if (!email) return;

    setLoading(true);
    clearMessages();

    try {
      const res = await requestPasswordReset(email);

      if (!res.success) {
        setError(res.message || "No se pudo enviar el código de recuperación.");
        return;
      }

      setResetCodeSent(true);
      setInfo("Te enviamos un código para restablecer tu contraseña.");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Error de conexión. Inténtalo de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    await requestResetCode();
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !resetCode || !password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    clearMessages();

    try {
      const res = await resetPassword(email, resetCode, password);

      if (!res.success) {
        setError(res.message || "No se pudo actualizar la contraseña.");
        return;
      }

      const authData = res.data as
        | { token?: string; user?: AuthenticatedUser }
        | undefined;

      setInfo("Tu contraseña fue actualizada correctamente.");
      onLoginSuccess(email, authData?.user?.name, authData?.token, authData?.user?.role);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Error de conexión. Inténtalo de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  const currentSubmit = isRecoveringPassword
    ? resetCodeSent
      ? handlePasswordReset
      : handleForgotPasswordRequest
    : handleSubmit;

  return (
    <div className="step-container py-16">
      <div className="mb-10 text-center">
        <h1 className="mb-1 text-4xl font-bold tracking-tight text-foreground">
          Toast<span className="text-primary">Club</span>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Entrena tu oratoria en realidad virtual con IA
        </p>
      </div>

      <div className="glass-card mx-auto max-w-md p-8">
        <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-foreground">
          {isRecoveringPassword
            ? resetCodeSent
              ? "Nueva contraseña"
              : "Recuperar acceso"
            : isLogin
              ? "Iniciar sesión"
              : "Crear cuenta"}
        </h2>

        <form onSubmit={currentSubmit} className="space-y-4">
          {!isRecoveringPassword && !isLogin && (
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Nombre completo
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  clearMessages();
                }}
                className="input-field"
                placeholder="Tu nombre completo"
                required
              />
            </div>
          )}

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearMessages();
              }}
              className="input-field"
              placeholder="usuario@email.com"
              required
            />
          </div>

          {!isRecoveringPassword && (
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearMessages();
                }}
                className="input-field"
                placeholder={isLogin ? "Tu contraseña" : "Mínimo 8 caracteres"}
                required
              />
            </div>
          )}

          {isRecoveringPassword && resetCodeSent && (
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Código
              </label>
              <input
                type="text"
                value={resetCode}
                onChange={(e) => {
                  setResetCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                  clearMessages();
                }}
                className="input-field tracking-[0.3em]"
                placeholder="123456"
                required
              />
            </div>
          )}

          {isRecoveringPassword && resetCodeSent && (
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Nueva contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearMessages();
                }}
                className="input-field"
                placeholder="Mínimo 8 caracteres"
                required
              />
            </div>
          )}

          {isRecoveringPassword && resetCodeSent && (
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Confirmar contraseña
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  clearMessages();
                }}
                className="input-field"
                placeholder="Repite tu nueva contraseña"
                required
              />
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
          {info && <p className="text-sm text-secondary">{info}</p>}

          <button type="submit" disabled={loading} className="btn-primary mt-6 w-full">
            {loading
              ? isRecoveringPassword
                ? resetCodeSent
                  ? "Actualizando..."
                  : "Enviando..."
                : isLogin
                  ? "Ingresando..."
                  : "Creando cuenta..."
              : isRecoveringPassword
                ? resetCodeSent
                  ? "ACTUALIZAR CONTRASEÑA"
                  : "ENVIAR CÓDIGO"
                : isLogin
                  ? "INICIAR SESIÓN"
                  : "CREAR CUENTA"}
          </button>
        </form>

        {!isRecoveringPassword && (
          <>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              {isLogin
                ? "Ingresa con tu correo y contraseña."
                : "Después del registro te enviaremos un código de verificación."}
            </p>

            {isLogin && (
              <button
                type="button"
                onClick={() => {
                  setIsRecoveringPassword(true);
                  setResetCodeSent(false);
                  setResetCode("");
                  setPassword("");
                  setConfirmPassword("");
                  clearMessages();
                }}
                className="mt-3 block w-full text-center text-xs text-secondary transition-colors hover:text-primary"
              >
                Olvidé mi contraseña
              </button>
            )}
          </>
        )}

        {isRecoveringPassword && (
          <div className="mt-4 space-y-3">
            {resetCodeSent && (
              <button
                type="button"
                onClick={() => {
                  void requestResetCode();
                }}
                disabled={loading}
                className="block w-full text-center text-xs text-secondary transition-colors hover:text-primary"
              >
                Reenviar código
              </button>
            )}
            <button
              type="button"
              onClick={resetRecoveryState}
              className="block w-full text-center text-xs text-muted-foreground transition-colors hover:text-secondary"
            >
              Volver al inicio de sesión
            </button>
          </div>
        )}

        {!isRecoveringPassword && (
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              clearMessages();
            }}
            className="mt-3 block w-full text-center text-xs text-muted-foreground transition-colors hover:text-secondary"
          >
            {isLogin
              ? "¿No tienes cuenta? Regístrate aquí"
              : "¿Ya tienes cuenta? Iniciar sesión"}
          </button>
        )}
      </div>
    </div>
  );
};

export default LoginStep;
