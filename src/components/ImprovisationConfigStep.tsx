import { useState } from "react";

interface ImprovisationConfigStepProps {
  onComplete: (config: {
    textId: string;
    textTitle: string;
    promptWord: string;
    textPrompt: string;
    selectedTags: string[];
    duration: number;
    scheduledAt: string;
  }) => void;
}

const SAMPLE_TEXTS = [
  { id: "txt-001", title: "La inteligencia artificial reemplazará empleos creativos", tags: ["tecnología", "debate", "sociedad"] },
  { id: "txt-002", title: "El teletrabajo es más productivo que el presencial", tags: ["trabajo", "debate", "productividad"] },
  { id: "txt-003", title: "Las redes sociales fortalecen la democracia", tags: ["política", "debate", "tecnología"] },
  { id: "txt-004", title: "La educación universitaria debería ser gratuita", tags: ["educación", "debate", "economía"] },
  { id: "txt-005", title: "Los videojuegos son una forma legítima de arte", tags: ["cultura", "debate", "entretenimiento"] },
  { id: "txt-006", title: "El cambio climático requiere sacrificios económicos inmediatos", tags: ["medioambiente", "debate", "economía"] },
  { id: "txt-007", title: "La exploración espacial debería ser prioridad global", tags: ["ciencia", "debate", "tecnología"] },
  { id: "txt-008", title: "Las criptomonedas reemplazarán al dinero tradicional", tags: ["finanzas", "debate", "tecnología"] },
];

const PROMPT_WORDS_BY_TEXT_ID: Record<string, string> = {
  "txt-001": "automatizacion",
  "txt-002": "autonomia",
  "txt-003": "participacion",
  "txt-004": "oportunidad",
  "txt-005": "experiencia",
  "txt-006": "responsabilidad",
  "txt-007": "frontera",
  "txt-008": "confianza",
};

const ALL_TAGS = Array.from(new Set(SAMPLE_TEXTS.flatMap((t) => t.tags))).sort();

const getDefaultScheduleValue = () => {
  const nextHour = new Date();
  nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
  return nextHour.toISOString().slice(0, 16);
};

const ImprovisationConfigStep = ({ onComplete }: ImprovisationConfigStepProps) => {
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [duration, setDuration] = useState("3");
  const [scheduledAt, setScheduledAt] = useState(getDefaultScheduleValue);

  const normalizeDurationInput = (value: string) => {
    if (!value) return "";

    const numericValue = value.replace(/\D/g, "");
    if (!numericValue) return "";

    return String(Number(numericValue));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filteredTexts = SAMPLE_TEXTS.filter((text) => {
    const matchesSearch =
      !search || text.title.toLowerCase().includes(search.toLowerCase());
    const matchesTags =
      selectedTags.length === 0 ||
      selectedTags.some((tag) => text.tags.includes(tag));
    return matchesSearch && matchesTags;
  });

  const chosen = SAMPLE_TEXTS.find((t) => t.id === selectedText);

  const handleSubmit = () => {
    if (!chosen) return;
    const promptWord = PROMPT_WORDS_BY_TEXT_ID[chosen.id] ?? "idea";
    const textPrompt = `Improvisa sobre "${promptWord}" conectandolo con el tema: ${chosen.title}.`;
    onComplete({
      textId: chosen.id,
      textTitle: chosen.title,
      promptWord,
      textPrompt,
      selectedTags: chosen.tags,
      duration: Number(duration),
      scheduledAt: new Date(scheduledAt).toISOString(),
    });
  };

  return (
    <div className="step-container py-12">
      <div className="max-w-lg mx-auto">
        <h2 className="text-lg font-semibold text-foreground mb-6 text-center">
          Selecciona un Texto
        </h2>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar tema..."
            className="input-field"
          />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {ALL_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                selectedTags.includes(tag)
                  ? "border-secondary bg-secondary/10 text-secondary"
                  : "border-border text-muted-foreground hover:border-muted-foreground hover:text-foreground"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Text List */}
        <div className="space-y-2 mb-8 max-h-52 overflow-y-auto">
          {filteredTexts.map((text) => (
            <button
              key={text.id}
              onClick={() => setSelectedText(text.id)}
              className={`w-full text-left p-4 rounded-xl border backdrop-blur-md transition-colors ${
                selectedText === text.id
                  ? "border-secondary/60 bg-secondary/8"
                  : "hover:border-white/80"
              }`}
              style={selectedText !== text.id ? { background: "rgba(255,255,255,0.72)", borderColor: "rgba(255,255,255,0.70)" } : undefined}
            >
              <div className="text-sm text-foreground">{text.title}</div>
              <div className="flex gap-2 mt-1.5">
                {text.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] uppercase tracking-wider text-muted-foreground/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          ))}
          {filteredTexts.length === 0 && (
            <div className="text-sm text-muted-foreground py-4 text-center">
              No se encontraron textos con esos criterios.
            </div>
          )}
        </div>

        {chosen ? (
          <div className="mb-6 rounded-xl border border-secondary/20 bg-secondary/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Palabra guia
            </p>
            <p className="mt-2 text-lg font-semibold text-foreground">
              {PROMPT_WORDS_BY_TEXT_ID[chosen.id] ?? "idea"}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Improvisa conectando esta palabra con el tema seleccionado.
            </p>
          </div>
        ) : null}

        {/* Duration */}
        <div className="mb-6">
          <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Duración de improvisación
          </label>
          <div className="flex items-center gap-4">
            <input
              type="number"
              min={1}
              max={30}
              value={duration}
              onChange={(e) => setDuration(normalizeDurationInput(e.target.value))}
              onBlur={() => {
                if (!duration) {
                  setDuration("3");
                }
              }}
              className="input-field w-24 text-center font-mono"
            />
            <span className="text-sm text-muted-foreground">minutos (recomendado: 3)</span>
          </div>
        </div>

        <div className="mb-8">
          <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
            Fecha y hora de practica
          </label>
          <input
            type="datetime-local"
            value={scheduledAt}
            min={getDefaultScheduleValue()}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="input-field"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!selectedText || !scheduledAt}
          className="btn-primary w-full"
        >
          CONTINUAR
        </button>
      </div>
    </div>
  );
};

export default ImprovisationConfigStep;
