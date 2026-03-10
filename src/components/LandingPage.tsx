import heroImg from "@/assets/hero-vr-speech.png";
import vrConferenceImg from "@/assets/vr-conference.png";
import { Mic, Brain, RefreshCw, BarChart3, ShieldCheck, Users, ChevronRight } from "lucide-react";

interface LandingPageProps {
  onStart: () => void;
}

const benefits = [
  { icon: Brain, title: "Audiencias realistas", desc: "Simulaciones con público virtual que reacciona a tu presentación." },
  { icon: ShieldCheck, title: "Sin presión real", desc: "Practica en un entorno seguro donde los errores son oportunidades." },
  { icon: RefreshCw, title: "Práctica repetible", desc: "Repite tus discursos tantas veces como necesites sin límites." },
  { icon: BarChart3, title: "Retroalimentación", desc: "Recibe métricas y feedback sobre tu desempeño en tiempo real." },
];

const learnings = [
  "Estructurar presentaciones claras y persuasivas",
  "Controlar nervios y ansiedad escénica",
  "Mejorar tu lenguaje corporal",
  "Proyectar la voz correctamente",
  "Conectar emocionalmente con la audiencia",
];

const steps = [
  { num: "01", title: "Técnicas de comunicación", desc: "Aprende los fundamentos de la oratoria efectiva." },
  { num: "02", title: "Simulaciones en VR", desc: "Practica en escenarios virtuales inmersivos." },
  { num: "03", title: "Presenta tu discurso", desc: "Pon a prueba tus habilidades en tiempo real." },
  { num: "04", title: "Feedback personalizado", desc: "Recibe análisis detallado de tu desempeño." },
];

const LandingPage = ({ onStart }: LandingPageProps) => {
  return (
    <div className="min-h-screen bg-background overflow-y-auto">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-[0.05]"
          style={{ background: "radial-gradient(circle, hsl(186 100% 50%), transparent)" }} />
        <div className="absolute bottom-[-20%] right-[-15%] w-[50%] h-[50%] rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, hsl(262 83% 58%), transparent)" }} />
        <div className="absolute top-[40%] right-[10%] w-[30%] h-[30%] rounded-full opacity-[0.03]"
          style={{ background: "radial-gradient(circle, hsl(14 100% 63%), transparent)" }} />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <Mic className="w-6 h-6 text-primary" />
          <span className="text-lg font-bold tracking-tight text-foreground">
            Toast<span className="text-primary">Club</span>
          </span>
        </div>
        <button onClick={onStart} className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
          Iniciar sesión
        </button>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-8 pt-12 pb-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-medium text-primary tracking-wider uppercase">Tecnología VR + IA</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] text-foreground">
              Mejora tu{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                oratoria
              </span>{" "}
              con Realidad Virtual
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
              Practica presentaciones en escenarios simulados. Enfrenta audiencias virtuales, 
              controla los nervios y mejora tu comunicación en un entorno seguro e inmersivo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button onClick={onStart} className="btn-primary flex items-center justify-center gap-2">
                Inscribirme al taller
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="relative flex justify-center">
            <div className="absolute inset-0 rounded-full opacity-20 blur-3xl"
              style={{ background: "radial-gradient(circle, hsl(186 100% 50%), hsl(262 83% 58%), transparent)" }} />
            <img src={heroImg} alt="Persona con casco VR dando un discurso" className="relative w-full max-w-md drop-shadow-2xl" />
          </div>
        </div>
      </section>

      {/* About */}
      <section className="relative z-10 py-20 border-t border-border/30">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative flex justify-center order-2 md:order-1">
              <div className="absolute inset-0 rounded-3xl opacity-10 blur-2xl"
                style={{ background: "radial-gradient(circle, hsl(262 83% 58%), transparent)" }} />
              <img src={vrConferenceImg} alt="Sala de conferencias virtual" className="relative w-full max-w-sm rounded-2xl" />
            </div>
            <div className="space-y-5 order-1 md:order-2">
              <h2 className="text-3xl font-bold text-foreground">
                Oratoria inmersiva como{" "}
                <span className="text-secondary">nunca antes</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Nuestro taller combina técnicas de comunicación y entrenamiento en oratoria con 
                simulaciones en Realidad Virtual. Los participantes practican discursos en escenarios 
                virtuales como salas de conferencia y exposiciones frente a público.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Entrena habilidades de comunicación sin presión real, pero con una experiencia completamente inmersiva. 
                El miedo a hablar en público es una de las fobias más comunes, y la simulación ayuda a superarla progresivamente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="relative z-10 py-20 border-t border-border/30">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-foreground mb-3">
              ¿Por qué <span className="text-primary">Realidad Virtual</span>?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              La tecnología inmersiva transforma la forma en que aprendes a comunicarte.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b) => (
              <div key={b.title} className="glass-card p-6 space-y-4 group hover:border-primary/30 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <b.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground">{b.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you'll learn */}
      <section className="relative z-10 py-20 border-t border-border/30">
        <div className="max-w-4xl mx-auto px-8">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-3">
                ¿Qué <span className="text-accent">aprenderás</span>?
              </h2>
              <p className="text-muted-foreground">
                Resultados concretos que transformarán tu forma de presentar.
              </p>
            </div>
            <ul className="space-y-4">
              {learnings.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1 w-6 h-6 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
                    <ChevronRight className="w-4 h-4 text-accent" />
                  </span>
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 py-20 border-t border-border/30">
        <div className="max-w-5xl mx-auto px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Cómo <span className="text-secondary">funciona</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.num} className="relative space-y-3 p-6 rounded-xl border border-border/50 bg-card/30 hover:border-secondary/30 transition-colors">
                <span className="text-3xl font-bold text-secondary/20 font-mono">{s.num}</span>
                <h3 className="text-base font-semibold text-foreground">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 border-t border-border/30">
        <div className="max-w-3xl mx-auto px-8 text-center space-y-6">
          <Users className="w-10 h-10 text-primary mx-auto opacity-60" />
          <h2 className="text-3xl font-bold text-foreground">
            ¿Listo para superar el miedo escénico?
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Únete a nuestro taller y transforma tu comunicación con la potencia de la Realidad Virtual.
          </p>
          <button onClick={onStart} className="btn-primary inline-flex items-center gap-2">
            Comenzar ahora
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/30 py-8">
        <div className="max-w-6xl mx-auto px-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              Toast<span className="text-primary">Club</span> © 2026
            </span>
          </div>
          <span className="text-xs text-muted-foreground/50">Powered by VR & AI</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
