import { useEffect, useState } from "react";
import { ArrowLeft, PlayCircle } from "lucide-react";
import type { SessionFeedback } from "./DashboardStep";

type SessionDetails = {
  id: string;
  mode: "improvisation" | "presentation";
  difficulty: "easy" | "medium" | "hard";
  createdAt: string;
  videoUrl: string;
  feedback?: SessionFeedback;
  fileName?: string;
  totalMinutes?: number;
  slideCount?: number;
  textTitle?: string;
  duration?: number;
};

interface SessionFeedbackStepProps {
  session: SessionDetails;
  onBack: () => void;
  onSave: (sessionId: string, feedback: SessionFeedback) => void;
}

const difficultyLabels = {
  easy: "Facil",
  medium: "Medio",
  hard: "Dificil",
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
    label: "¿Como evaluas tu nivel de confianza en esta sesion?",
    placeholder: "Ejemplo: Me senti mas seguro despues del primer minuto.",
  },
  {
    key: "audienceReaction" as const,
    label: "¿Como percibiste la reaccion de la audiencia virtual?",
    placeholder: "Ejemplo: Vi a la audiencia atenta, pero las preguntas me sacaron del ritmo.",
  },
  {
    key: "improvement" as const,
    label: "¿Que aspecto quieres mejorar para la siguiente practica?",
    placeholder: "Ejemplo: Mantener mejor el contacto visual y cerrar con mas claridad.",
  },
  {
    key: "notes" as const,
    label: "Notas adicionales",
    placeholder: "Cualquier aprendizaje o recordatorio importante para la proxima sesion.",
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
              Registro de sesion
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">
              Feedback de la sesion
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/85">
              Revisa el video, responde el formulario y guarda observaciones utiles para
              tu siguiente practica.
            </p>
          </div>

          <div className="grid gap-5 px-8 py-8 lg:grid-cols-[0.95fr_1.25fr]">
            <aside className="space-y-4">
              <div className="rounded-2xl border border-border/70 bg-white/75 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  Video
                </p>
                <a
                  href={session.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:underline"
                >
                  <PlayCircle className="h-4 w-4" />
                  Ver grabacion de la sesion
                </a>
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
                    {session.mode === "improvisation" ? "Improvisacion" : "Presentacion"}
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
                </div>
              </div>
            </aside>

            <div className="rounded-2xl border border-border/70 bg-white/75 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                Formulario de feedback
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
                  className="btn-primary"
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
