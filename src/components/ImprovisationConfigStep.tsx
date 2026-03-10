import { useState } from "react";

interface ImprovisationConfigStepProps {
  onComplete: (config: { textId: string; textTitle: string; duration: number }) => void;
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

const ALL_TAGS = Array.from(new Set(SAMPLE_TEXTS.flatMap((t) => t.tags))).sort();

const ImprovisationConfigStep = ({ onComplete }: ImprovisationConfigStepProps) => {
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [duration, setDuration] = useState(3);

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
    onComplete({
      textId: chosen.id,
      textTitle: chosen.title,
      duration,
    });
  };

  return (
    <div className="step-container py-12">
      <div className="max-w-lg">
        <h2 className="font-mono text-sm uppercase tracking-wider text-foreground mb-6">
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
              className={`font-mono text-xs uppercase tracking-wider px-3 py-1.5 border transition-none ${
                selectedTags.includes(tag)
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-muted-foreground"
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
              className={`w-full text-left p-4 border transition-none ${
                selectedText === text.id
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-muted-foreground"
              }`}
            >
              <div className="text-sm text-foreground font-sans">{text.title}</div>
              <div className="flex gap-2 mt-1.5">
                {text.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </button>
          ))}
          {filteredTexts.length === 0 && (
            <div className="text-sm text-muted-foreground font-sans py-4 text-center">
              No se encontraron textos con esos criterios.
            </div>
          )}
        </div>

        {/* Duration */}
        <div className="mb-8">
          <label className="block font-mono text-xs uppercase tracking-wider text-muted-foreground mb-3">
            Duración de improvisación
          </label>
          <div className="flex items-center gap-4">
            <input
              type="number"
              min={1}
              max={30}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="input-field w-24 text-center font-mono"
            />
            <span className="text-sm text-muted-foreground font-sans">minutos (recomendado: 3)</span>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!selectedText}
          className="btn-primary w-full"
        >
          CONTINUAR
        </button>
      </div>
    </div>
  );
};

export default ImprovisationConfigStep;
