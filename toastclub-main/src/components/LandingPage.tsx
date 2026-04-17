import HeroIllustration from "@/components/HeroIllustration";
import VRConferenceIllustration from "@/components/VRConferenceIllustration";
import { useInView } from "@/hooks/use-in-view";
import { Mic, Brain, RefreshCw, BarChart3, ShieldCheck, Users, ChevronRight } from "lucide-react";

interface LandingPageProps {
  onStart: () => void;
}

const benefits = [
  { icon: Brain,      title: "Audiencias realistas", desc: "Simulaciones con público virtual que reacciona a tu presentación." },
  { icon: ShieldCheck,title: "Sin presión real",     desc: "Practica en un entorno seguro donde los errores son oportunidades." },
  { icon: RefreshCw,  title: "Práctica repetible",   desc: "Repite tus discursos tantas veces como necesites sin límites." },
  { icon: BarChart3,  title: "Retroalimentación",    desc: "Recibe métricas y feedback sobre tu desempeño en tiempo real." },
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
  { num: "02", title: "Simulaciones en VR",        desc: "Practica en escenarios virtuales inmersivos." },
  { num: "03", title: "Presenta tu discurso",       desc: "Pon a prueba tus habilidades en tiempo real." },
  { num: "04", title: "Feedback personalizado",     desc: "Recibe análisis detallado de tu desempeño." },
];

const LandingPage = ({ onStart }: LandingPageProps) => {
  const hero    = useInView(0.1);
  const about   = useInView(0.15);
  const benefits_ = useInView(0.1);
  const learn   = useInView(0.15);
  const works   = useInView(0.1);
  const cta     = useInView(0.2);

  return (
    <div className="min-h-screen bg-background overflow-y-auto">
      {/* Background tints */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-[0.04]"
          style={{ background: "radial-gradient(circle, #660000, transparent)" }} />
        <div className="absolute bottom-[-20%] right-[-15%] w-[50%] h-[50%] rounded-full opacity-[0.03]"
          style={{ background: "radial-gradient(circle, #007cd8, transparent)" }} />
        <div className="absolute top-[40%] right-[10%] w-[30%] h-[30%] rounded-full opacity-[0.03]"
          style={{ background: "radial-gradient(circle, #e0aa00, transparent)" }} />
      </div>

      {/* Nav — slides down on load */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 max-w-6xl mx-auto animate-slide-down">
        <div className="flex items-center gap-2">
          <Mic className="w-6 h-6 text-primary" />
          <span className="text-lg font-bold tracking-tight text-foreground">
            Toast<span className="text-primary">Club</span>
          </span>
        </div>
        <button
          onClick={onStart}
          className="text-sm font-semibold text-primary border border-primary/30 px-4 py-1.5 rounded-lg transition-all duration-200 hover:bg-primary hover:text-white hover:border-primary hover:shadow-md active:scale-95"
        >
          Iniciar sesión
        </button>
      </nav>

      {/* Hero */}
      <section ref={hero.ref} className="relative z-10 max-w-6xl mx-auto px-8 pt-10 pb-12">
        <div className="grid md:grid-cols-2 gap-14 items-center">
          {/* Text — fades in from left */}
          <div
            className={`space-y-6 ${hero.inView ? "animate-fade-in-left" : "anim-hidden"}`}
            style={{ animationDelay: "0.1s" }}
          >
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

          {/* Illustration — fades in from right + floats */}
          <div
            className={`relative px-10 ${hero.inView ? "animate-fade-in-right" : "anim-hidden"}`}
            style={{
              animationDelay: "0.25s",
              filter: "drop-shadow(0 16px 40px rgba(0,0,0,0.13)) drop-shadow(0 4px 12px rgba(0,0,0,0.08))",
            }}
          >
            <div className="animate-float">
              <HeroIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section ref={about.ref} className="relative z-10 py-12 border-t border-border/30">
        <div className="max-w-6xl mx-auto px-8">
          <div className="grid md:grid-cols-2 gap-14 items-center">
            {/* Illustration — fades in from left + floats */}
            <div
              className={`relative order-2 md:order-1 px-8 ${about.inView ? "animate-fade-in-left" : "anim-hidden"}`}
              style={{
                animationDelay: "0.1s",
                filter: "drop-shadow(0 16px 40px rgba(0,0,0,0.13)) drop-shadow(0 4px 12px rgba(0,0,0,0.08))",
              }}
            >
              <div className="animate-float" style={{ animationDelay: "1.5s" }}>
                <VRConferenceIllustration />
              </div>
            </div>

            {/* Text — fades in from right */}
            <div
              className={`space-y-5 order-1 md:order-2 ${about.inView ? "animate-fade-in-right" : "anim-hidden"}`}
              style={{ animationDelay: "0.25s" }}
            >
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
      <section ref={benefits_.ref} className="relative z-10 py-12 border-t border-border/30">
        <div className="max-w-6xl mx-auto px-8">
          <div
            className={`text-center mb-8 ${benefits_.inView ? "animate-fade-in-up" : "anim-hidden"}`}
            style={{ animationDelay: "0.05s" }}
          >
            <h2 className="text-3xl font-bold text-foreground mb-3">
              ¿Por qué <span className="text-primary">Realidad Virtual</span>?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              La tecnología inmersiva transforma la forma en que aprendes a comunicarte.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((b, i) => (
              <div
                key={b.title}
                className={`glass-card p-6 space-y-4 group hover:border-primary/30 hover:-translate-y-1 hover:shadow-lg ${benefits_.inView ? "animate-fade-in-up" : "anim-hidden"}`}
                style={{ animationDelay: `${0.1 + i * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-200">
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
      <section ref={learn.ref} className="relative z-10 py-12 border-t border-border/30">
        <div className="max-w-4xl mx-auto px-8">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div
              className={learn.inView ? "animate-fade-in-left" : "anim-hidden"}
              style={{ animationDelay: "0.1s" }}
            >
              <h2 className="text-3xl font-bold text-foreground mb-3">
                ¿Qué <span className="text-accent">aprenderás</span>?
              </h2>
              <p className="text-muted-foreground">
                Resultados concretos que transformarán tu forma de presentar.
              </p>
            </div>
            <ul className="space-y-4">
              {learnings.map((item, i) => (
                <li
                  key={i}
                  className={`flex items-start gap-3 ${learn.inView ? "animate-fade-in-right" : "anim-hidden"}`}
                  style={{ animationDelay: `${0.15 + i * 0.08}s` }}
                >
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
      <section ref={works.ref} className="relative z-10 py-12 border-t border-border/30">
        <div className="max-w-5xl mx-auto px-8">
          <div
            className={`text-center mb-8 ${works.inView ? "animate-fade-in-up" : "anim-hidden"}`}
            style={{ animationDelay: "0.05s" }}
          >
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Cómo <span className="text-secondary">funciona</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div
                key={s.num}
                className={`glass-card relative space-y-3 p-6 hover:border-secondary/40 hover:-translate-y-1 hover:shadow-lg ${works.inView ? "animate-fade-in-up" : "anim-hidden"}`}
                style={{ animationDelay: `${0.1 + i * 0.1}s` }}
              >
                <span className="text-3xl font-bold text-secondary/20 font-mono">{s.num}</span>
                <h3 className="text-base font-semibold text-foreground">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section ref={cta.ref} className="relative z-10 py-10 border-t border-border/30">
        <div
          className={`max-w-3xl mx-auto px-8 text-center space-y-4 ${cta.inView ? "animate-fade-in-up" : "anim-hidden"}`}
          style={{ animationDelay: "0.1s" }}
        >
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
      <footer className="relative z-10 border-t border-border/30 py-5">
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
