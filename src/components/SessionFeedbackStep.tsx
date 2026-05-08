import { useEffect, useState } from "react";
import { ArrowLeft, Headphones } from "lucide-react";
import type { SessionFeedback } from "./DashboardStep";

type SessionDetails = {
  id: string;
  mode: "improvisation" | "presentation";
  difficulty: "easy" | "medium" | "hard";
  createdAt: string;
  audioUrl?: string | null;
  videoUrl?: string | null;
  feedback?: SessionFeedback;
  fileName?: string;
  totalMinutes?: number;
  slideCount?: number;
  textTitle?: string;
  promptWord?: string;
  textPrompt?: string;
  selectedTags?: string[];
  duration?: number;
};

interface SessionFeedbackStepProps {
  session: SessionDetails;
  onBack: () => void;
  onSave: (sessionId: string, feedback: SessionFeedback) => void;
}

const difficultyLabels = {
  easy: "Fácil",
  medium: "Medio",
  hard: "Difícil",
};

const emptyFeedback: SessionFeedback = {
  confidence: "",
  audienceReaction: "",
  improvement: "",
  notes: "",
};

const feedbackFields = [
  {
    key: "confidence" as const,
    label: "¿Cómo evalúas tu nivel de confianza en esta sesión?",
    placeholder: "Ejemplo: Me sentí más seguro después del primer minuto.",
  },
  {
    key: "audienceReaction" as const,
    label: "¿Cómo percibiste la reacción de la audiencia virtual?",
    placeholder: "Ejemplo: Vi a la audiencia atenta, pero las preguntas me sacaron del ritmo.",
  },
  {
    key: "improvement" as const,
    label: "¿Qué aspecto quieres mejorar para la siguiente práctica?",
    placeholder: "Ejemplo: Mantener mejor el contacto visual y cerrar con más claridad.",
  },
  {
    key: "notes" as const,
    label: "Notas adicionales",
    placeholder: "Cualquier aprendizaje o recordatorio importante para la próxima sesión.",
  },
];

const formatSessionDate = (value: string) =>
  new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const SessionFeedbackStep = ({ session, onBack, onSave }: SessionFeedbackStepProps) => {
  const [feedback, setFeedback] = useState<SessionFeedback>(session.feedback ?? emptyFeedback);

  useEffect(() => {
    setFeedback(session.feedback ?? emptyFeedback);
  }, [session]);

  const audioUrl = session.audioUrl ?? session.videoUrl ?? null;
  const canSaveFeedback = Boolean(
    feedback.confidence.trim() &&
    feedback.audienceReaction.trim() &&
    feedback.improvement.trim()
  );

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-10 lg:px-8">
      <div className="space-y-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-secondary"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al dashboard
        </button>

        <section className="glass-card overflow-hidden">
          <div className="bg-gradient-to-r from-primary/95 via-primary to-secondary px-8 py-8 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/75">
              Registro de sesión
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">
              Feedback de la sesión
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/85">
              Registra tu autoevaluación después de practicar. Esto alimenta tu progreso y el reporte del administrador.
            </p>
          </div>

          <div className="grid gap-5 px-8 py-8 lg:grid-cols-[0.95fr_1.25fr]">
            <aside className="space-y-4">
              <div className="rounded-2xl border border-border/70 bg-white/75 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Audio
                </p>
                {audioUrl ? (
                  <a
                    href={audioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:underline"
                  >
                    <Headphones className="h-4 w-4" />
                    Ver audio de la sesión
                  </a>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">
                    El audio aún no ha sido cargado para esta sesión.
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-border/70 bg-white/75 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Resumen
                </p>
                <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                  <p>
                    <span className="font-semibold text-foreground">Fecha:</span>{" "}
                    {formatSessionDate(session.createdAt)}
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Modo:</span>{" "}
                    {session.mode === "improvisation" ? "Improvisación" : "Presentación"}
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Dificultad:</span>{" "}
                    {difficultyLabels[session.difficulty]}
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Contenido:</span>{" "}
                    {session.mode === "improvisation"
                      ? session.textTitle ?? "Tema no disponible"
                      : session.fileName ?? "Archivo no disponible"}
                  </p>
                  {session.mode === "improvisation" && session.promptWord ? (
                    <p>
                      <span className="font-semibold text-foreground">Palabra guía:</span>{" "}
                      {session.promptWord}
                    </p>
                  ) : null}
                  {session.mode === "improvisation" && session.textPrompt ? (
                    <p>
                      <span className="font-semibold text-foreground">Consigna:</span>{" "}
                      {session.textPrompt}
                    </p>
                  ) : null}
                </div>
              </div>
            </aside>

            <div className="rounded-2xl border border-border/70 bg-white/75 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Formulario de feedback
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Completa los tres primeros campos para cerrar el feedback de esta sesión.
              </p>

              <div className="mt-4 space-y-5">
                {feedbackFields.map((field) => (
                  <label key={field.key} className="block">
                    <span className="text-sm font-medium text-foreground">
                      {field.label}
                    </span>
                    <textarea
                      value={feedback[field.key]}
                      onChange={(e) =>
                        setFeedback((current) => ({
                          ...current,
                          [field.key]: e.target.value,
                        }))
                      }
                      rows={field.key === "notes" ? 4 : 3}
                      className="mt-2 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground"
                      placeholder={field.placeholder}
                    />
                  </label>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => onSave(session.id, feedback)}
                  disabled={!canSaveFeedback}
                  className="btn-primary disabled:pointer-events-none disabled:opacity-50"
                >
                  Guardar formulario
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SessionFeedbackStep;
