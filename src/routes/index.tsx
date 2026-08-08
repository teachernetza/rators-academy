import type { CSSProperties } from "react";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useAuth, dashboardPathFor } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Beaker,
  FlaskConical,
  GraduationCap,
  Check,
  Mail,
  MessageCircle,
  Menu,
  X,
  ClipboardCheck,
  FileDown,
  Zap,
  Sparkles,
  Star,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";
import { useReveal } from "@/hooks/use-reveal";
import { ThemeToggle } from "@/components/theme-toggle";
import { useScrollProgress } from "@/hooks/use-scroll-progress";
import { COMPUTED_PLANS, HOURLY_RATE, mxn } from "@/lib/pricing";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Teacher Netza Varo — Domina el inglés con un sistema moderno" },
      {
        name: "description",
        content:
          "Plataforma de inglés con Labs interactivos gratuitos, examen diagnóstico y Masterclasses. Clases desde $149 MXN por hora y paquetes mensuales con hasta 20% de descuento.",
      },
      { property: "og:title", content: "Teacher Netza Varo — Inglés moderno e interactivo" },
      {
        property: "og:description",
        content:
          "Aprende inglés con un sistema moderno e interactivo. Clases desde $149 MXN/hora y paquetes mensuales con hasta 20% de descuento.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingOrRedirect,
});

function LandingOrRedirect() {
  const { loading, user, profile } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  if (user) return <Navigate to={dashboardPathFor(profile?.role) as any} />;
  return <Landing />;
}

const WA_NUMBER = "523231116425";
const waUrl = (msg: string) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
const WA_URL = waUrl(
  "Hola Teacher Netza, me gustaría recibir más información sobre los planes de clases de inglés.",
);
const EMAIL = "teacher.netza.varo@gmail.com";

const SECTION_IDS = ["examen", "metodologia", "planes", "contacto"];

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const r = useReveal<HTMLDivElement>(delay);
  return (
    <div ref={r.ref} className={`${r.className} ${className}`}>
      {children}
    </div>
  );
}

function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { progress, scrolled, active } = useScrollProgress(SECTION_IDS);

  const navLinks = [
    { href: "#examen", id: "examen", label: "Examen Diagnóstico" },
    
    { href: "#metodologia", id: "metodologia", label: "Metodología" },
    { href: "#planes", id: "planes", label: "Planes" },
    { href: "#contacto", id: "contacto", label: "Contacto" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* SCROLL PROGRESS */}
      <div className="fixed inset-x-0 top-0 z-50 h-0.5 bg-transparent">
        <div
          className="h-full origin-left transition-[width] duration-150 ease-out"
          style={{
            width: `${progress * 100}%`,
            background: "var(--gradient-mint)",
            boxShadow: "var(--glow-mint)",
          }}
        />
      </div>

      {/* HEADER */}
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${
          scrolled
            ? "border-b border-border/60 bg-background/85 shadow-[var(--shadow-soft)] backdrop-blur-xl"
            : "border-b border-transparent bg-background/40 backdrop-blur-md"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#top" className="glow-logo-sm flex items-center gap-3">
            <img
              src="/icono_teacher_netza.png"
              alt="Teacher Netza"
              className="h-10 w-10 object-contain sm:hidden"
            />
            <img
              src="/banner_teacher_netza.png"
              alt="Teacher Netza — Clases de Inglés"
              className="hidden h-10 w-auto object-contain sm:block"
            />
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                data-active={active === l.id}
                className="link-underline text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[active=true]:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle />
            <Link to="/login">
              <Button
                size="sm"
                className="shadow-[var(--shadow-elegant)] transition-all duration-300 hover:shadow-[var(--glow-mint)]"
              >
                Iniciar Sesión
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              className="transition-transform duration-300 active:scale-90"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Abrir menú"
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="animate-fade-in border-t border-border/60 bg-background/95 backdrop-blur-xl md:hidden">
            <div className="space-y-1 px-4 py-3">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {l.label}
                </a>
              ))}
              <Link to="/login" onClick={() => setMenuOpen(false)}>
                <Button className="mt-2 w-full">Iniciar Sesión</Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      <main id="top" className="pt-16">
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div
            className="tn-shimmer-bg absolute inset-0 -z-20"
            style={{
              background:
                "linear-gradient(160deg, var(--background) 0%, color-mix(in oklab, var(--mint) 12%, var(--background)) 45%, color-mix(in oklab, var(--primary) 10%, var(--background)) 100%)",
            }}
          />
          <div
            aria-hidden
            className="tn-float absolute -top-40 left-[15%] -z-10 h-[420px] w-[420px] rounded-full opacity-30 blur-3xl"
            style={{ background: "var(--gradient-primary)" }}
          />
          <div
            aria-hidden
            className="tn-float absolute -bottom-24 right-[8%] -z-10 h-[360px] w-[360px] rounded-full opacity-25 blur-3xl"
            style={{ background: "var(--gradient-mint)", animationDelay: "-4s" }}
          />

          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
            <div className="mx-auto max-w-3xl text-center">
              <Reveal>
                <div className="glow-logo mx-auto mb-8 w-fit">
                  <img
                    src="/logo_teacher_netza.png"
                    alt="Teacher Netza — Clases de Inglés"
                    className="mx-auto h-40 w-auto object-contain sm:h-48"
                  />
                </div>
              </Reveal>

              <Reveal delay={80}>
                <span className="inline-flex items-center gap-2 rounded-full border border-mint/40 bg-mint/10 px-3 py-1 text-xs font-medium text-primary shadow-[0_0_18px_-6px_var(--mint)]">
                  <Sparkles className="h-3.5 w-3.5 text-mint-strong" />
                  +6 años formando estudiantes bilingües
                </span>
                <h1 className="mt-6 font-heading text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                  Domina el inglés con un sistema{" "}
                  <span className="bg-[image:var(--gradient-heading)] bg-clip-text text-transparent">
                    moderno, interactivo y a tu medida
                  </span>
                  .
                </h1>
                <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
                  Una plataforma de aprendizaje con acompañamiento experto, herramientas
                  tecnológicas y práctica real para que avances con confianza desde la
                  primera clase.
                </p>
              </Reveal>

              <Reveal delay={160}>
                <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link to="/diagnostic-exam">
                    <Button
                      size="lg"
                      className="group shadow-[var(--shadow-elegant)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--glow-mint)]"
                    >
                      <ClipboardCheck className="mr-2 h-4 w-4" />
                      Iniciar Examen Diagnóstico
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <a href="#planes">
                    <Button
                      size="lg"
                      variant="outline"
                      className="transition-all duration-300 hover:-translate-y-0.5 hover:border-mint hover:text-primary"
                    >
                      Ver Planes
                    </Button>
                  </a>
                  <a href={WA_URL} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" variant="ghost" className="transition-all duration-300">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      WhatsApp
                    </Button>
                  </a>
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-mint-strong" />
                    Clases desde {mxn(HOURLY_RATE)} / hora
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-mint-strong" />
                    Hasta 20% en paquetes mensuales
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-mint-strong" />
                    Examen diagnóstico gratis
                  </span>
                </div>
              </Reveal>
            </div>

            {/* 3 TARJETAS DEL HERO */}
            <div className="mx-auto mt-14 grid max-w-5xl gap-5 sm:grid-cols-3">
              {[
                {
                  icon: ClipboardCheck,
                  title: "Examen Diagnóstico",
                  text: "Descubre tu nivel real (A1–C1) y recibe tu constancia en PDF.",
                  cta: "Hacer examen",
                  to: "/diagnostic-exam" as const,
                  color: "#f0a83c",
                },
                {
                  icon: Beaker,
                  title: "Labs Interactivos",
                  text: "Practica gratis con labs por nivel MCER (A1–C1), sin registro.",
                  cta: "Entrar a los Labs",
                  to: "/labs" as const,
                  color: "#35d1a8",
                },
                {
                  icon: Sparkles,
                  title: "Planes de Clases",
                  text: `Clases desde ${mxn(HOURLY_RATE)} por hora y paquetes con hasta 20% menos.`,
                  cta: "Ver planes",
                  href: "#planes",
                  color: "#2bb3c9",
                },
              ].map((c, i) => {
                const Inner = (
                  <div
                    className="card-hover group flex h-full flex-col justify-between rounded-2xl border border-border bg-card/85 p-6 text-left shadow-[var(--shadow-soft)] backdrop-blur"
                    style={{ borderTop: `4px solid ${c.color}`, "--c": c.color } as CSSProperties}
                  >
                    <div>
                      <div
                        className="tn-accent-icon mb-4 flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                      >
                        <c.icon className="h-5 w-5" />
                      </div>
                      <h2 className="font-heading text-lg font-semibold">{c.title}</h2>
                      <p className="mt-2 text-sm text-muted-foreground">{c.text}</p>
                    </div>
                    <span
                      className="tn-accent-text mt-5 inline-flex items-center text-sm font-semibold"
                    >
                      {c.cta}
                      <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                );
                return (
                  <Reveal key={c.title} delay={200 + i * 80}>
                    {c.to ? (
                      <Link to={c.to} className="block h-full">
                        {Inner}
                      </Link>
                    ) : (
                      <a href={c.href} className="block h-full">
                        {Inner}
                      </a>
                    )}
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>


        {/* EXAMEN DIAGNÓSTICO — HIGHLIGHT */}
        <section id="examen" className="relative overflow-hidden py-16 lg:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div
                className="tn-shimmer-bg relative overflow-hidden rounded-3xl p-8 shadow-[var(--shadow-elegant)] sm:p-12"
                style={{ background: "var(--gradient-hero)" }}
              >
                <div
                  aria-hidden
                  className="tn-float absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/15 blur-3xl"
                />
                <div
                  aria-hidden
                  className="tn-float absolute -bottom-32 -left-16 h-72 w-72 rounded-full bg-white/10 blur-3xl"
                  style={{ animationDelay: "-3s" }}
                />
                <div className="relative grid gap-10 md:grid-cols-[1.2fr,1fr] md:items-center">
                  <div className="text-white">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide backdrop-blur">
                      <Sparkles className="h-3.5 w-3.5" />
                      Gratis · Sin registro
                    </span>
                    <h2 className="mt-5 font-heading text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                      Descubre tu nivel real de inglés en 15 minutos
                    </h2>
                    <p className="mt-4 text-base text-white/90 sm:text-lg">
                      Un examen diagnóstico creado por Teacher Netza que evalúa Listening,
                      Reading y Vocabulary & Use of Language. Al terminar recibes tu nivel por
                      habilidad y una Constancia de Nivel en PDF.

                    </p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      <Link to="/diagnostic-exam">
                        <Button
                          size="lg"
                          className="group bg-white text-primary shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/90"
                        >
                          <ClipboardCheck className="mr-2 h-5 w-5" />
                          Iniciar Examen Diagnóstico
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </Button>
                      </Link>
                      <a href="#metodologia">
                        <Button
                          size="lg"
                          variant="outline"
                          className="border-white/40 bg-transparent text-white transition-all duration-300 hover:bg-white/10 hover:text-white"
                        >
                          Conocer más
                        </Button>
                      </a>
                    </div>
                  </div>

                  <ul className="grid gap-3 rounded-2xl border border-white/25 bg-white/10 p-5 text-white backdrop-blur">
                    {[
                      { icon: Zap, text: "3 rubros: Listening (5 audios), Reading (3 lecturas) y Vocabulary & Use of Language." },
                      { icon: ClipboardCheck, text: "Nivel por habilidad y nivel general (A1 – C1) al instante." },
                      { icon: FileDown, text: "Constancia de Nivel en PDF, lista para descargar y compartir." },

                      { icon: Sparkles, text: "Diseñado por Teacher Netza · +6 años de experiencia." },
                    ].map((f) => (
                      <li
                        key={f.text}
                        className="flex items-start gap-3 rounded-xl p-2 text-sm transition-colors duration-300 hover:bg-white/10"
                      >
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/20">
                          <f.icon className="h-4 w-4" />
                        </span>
                        <span>{f.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          </div>
        </section>



        {/* METODOLOGÍA */}
        <section id="metodologia" className="border-t border-border/60 py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                  Un ecosistema completo de aprendizaje
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Tres pilares diseñados para que aprendas inglés practicando, conversando y
                  aplicándolo en situaciones reales.
                </p>
              </div>
            </Reveal>

            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: Beaker,
                  title: "Labs Interactivos",
                  desc: "Práctica dinámica con herramientas tecnológicas que refuerzan vocabulario, gramática y comprensión.",
                  tint: "var(--gradient-primary)",
                },
                {
                  icon: FlaskConical,
                  title: "Labs por nivel",
                  desc: "Prácticas gratuitas para visitantes, organizadas por nivel MCER, de A1 a C1.",
                  tint: "var(--gradient-mint)",
                },
                {
                  icon: GraduationCap,
                  title: "Masterclasses",
                  desc: "Preparación enfocada en situaciones reales y objetivos específicos: viajes, entrevistas, exámenes.",
                  tint: "var(--gradient-teal)",
                },
              ].map((f, i) => (
                <Reveal key={f.title} delay={i * 110}>
                  <div className="card-hover group relative h-full overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-soft)]">
                    <div
                      aria-hidden
                      className="absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-25"
                      style={{ background: f.tint }}
                    />
                    <div
                      className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl text-white transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                      style={{ background: f.tint }}
                    >
                      <f.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-heading text-xl font-semibold">{f.title}</h3>
                    <p className="mt-3 text-muted-foreground">{f.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* PLANES */}
        <section
          id="planes"
          className="relative overflow-hidden border-t border-border/60 bg-secondary/40 py-20 lg:py-28"
        >
          <div
            aria-hidden
            className="tn-float absolute -left-20 top-24 -z-10 h-80 w-80 rounded-full opacity-20 blur-3xl"
            style={{ background: "var(--gradient-mint)" }}
          />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                  Planes pensados para tu ritmo
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Tarifa base de <strong className="text-foreground">{mxn(HOURLY_RATE)} por hora</strong>. Con
                  un paquete mensual bajas el costo por clase hasta un 20%.
                </p>
              </div>
            </Reveal>

            {/* Clase suelta */}
            <Reveal delay={80}>
              <div className="mx-auto mt-12 flex max-w-3xl flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] transition-all duration-500 hover:border-mint/50 sm:flex-row">
                <div>
                  <h3 className="font-heading text-xl font-semibold">Clase suelta</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Sin compromiso mensual. Agenda cuando quieras.
                  </p>
                </div>
                <div className="flex items-center gap-5">
                  <div className="text-right">
                    <div className="font-heading text-3xl font-bold">{mxn(HOURLY_RATE)}</div>
                    <div className="text-xs text-muted-foreground">MXN / hora</div>
                  </div>
                  <a
                    href={waUrl(
                      `Hola Teacher Netza, me interesa tomar una clase suelta de ${mxn(HOURLY_RATE)} la hora.`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="transition-all hover:border-mint">
                      Agendar
                    </Button>
                  </a>
                </div>
              </div>
            </Reveal>

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {COMPUTED_PLANS.map((p, i) => (
                <Reveal key={p.id} delay={i * 110} className="h-full">
                  <div
                    className={`card-hover group relative flex h-full flex-col overflow-hidden rounded-2xl bg-card p-8 ${
                      p.highlight
                        ? "border-2 border-mint shadow-[var(--glow-mint)] lg:-translate-y-3"
                        : "border border-border shadow-[var(--shadow-soft)]"
                    }`}
                  >
                    {p.highlight && (
                      <div className="absolute -top-px left-0 right-0 h-1" style={{ background: "var(--gradient-mint)" }} />
                    )}

                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-heading text-2xl font-semibold">{p.name}</h3>
                      {p.highlight ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[image:var(--gradient-mint)] px-3 py-1 text-[11px] font-bold uppercase tracking-wide tn-on-accent">
                          <Star className="h-3 w-3" />
                          Más popular
                        </span>
                      ) : (
                        <span className="rounded-full border border-mint/40 bg-mint/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-primary">
                          -{Math.round(p.discount * 100)}%
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-sm text-muted-foreground">{p.tagline}</p>

                    <div className="mt-6">
                      <div className="text-sm text-muted-foreground line-through">
                        {mxn(p.listPrice)}
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-heading text-4xl font-bold">{mxn(p.total)}</span>
                        <span className="text-sm text-muted-foreground">/ mes</span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-md bg-mint/15 px-2 py-1 font-semibold text-primary">
                          Ahorras {mxn(p.savings)}
                        </span>
                        <span className="rounded-md bg-muted px-2 py-1 text-muted-foreground">
                          {mxn(p.perHour)} / hora
                        </span>
                      </div>
                      <div className="mt-3 text-sm text-muted-foreground">
                        {p.hoursPerWeek} h por semana · {p.hoursPerMonth} h al mes
                      </div>
                    </div>

                    <ul className="mt-6 flex-1 space-y-3 text-sm">
                      {p.benefits.map((b) => (
                        <li key={b} className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-mint-strong" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>

                    <a
                      href={waUrl(
                        `Hola Teacher Netza, quiero el paquete ${p.name} (${p.hoursPerWeek} h por semana, ${mxn(p.total)} al mes). ¿Cómo empiezo?`,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-8 block"
                    >
                      <Button
                        variant={p.highlight ? "default" : "outline"}
                        className={`w-full transition-all duration-300 ${
                          p.highlight
                            ? "shadow-[var(--shadow-elegant)] hover:shadow-[var(--glow-mint)]"
                            : "hover:border-mint"
                        }`}
                      >
                        Elegir {p.name}
                      </Button>
                    </a>
                  </div>
                </Reveal>
              ))}
            </div>

            <p className="mt-8 text-center text-xs text-muted-foreground">
              Precios en pesos mexicanos. Los paquetes mensuales consideran 4 semanas de clases.
            </p>
          </div>
        </section>

        {/* CONTACTO */}
        <section id="contacto" className="border-t border-border/60 py-20 lg:py-28">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                  Hablemos de tus objetivos
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Escríbeme directo por WhatsApp o por correo, te respondo personalmente.
                </p>
              </div>
            </Reveal>

            <div className="mt-12 grid gap-6 md:grid-cols-2">
              <Reveal delay={60}>
                <a
                  href={WA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-hover group flex items-center gap-4 rounded-2xl border border-border bg-card p-6"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#25D366] text-white transition-transform duration-500 group-hover:scale-110">
                    <MessageCircle className="h-7 w-7" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      WhatsApp
                    </div>
                    <div className="font-heading text-lg font-semibold">323 111 6425</div>
                    <div className="text-sm text-muted-foreground">Respuesta inmediata</div>
                  </div>
                </a>
              </Reveal>

              <Reveal delay={140}>
                <a
                  href={`mailto:${EMAIL}`}
                  className="card-hover group flex items-center gap-4 rounded-2xl border border-border bg-card p-6"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[image:var(--gradient-hero)] text-white transition-transform duration-500 group-hover:scale-110">
                    <Mail className="h-7 w-7" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Correo
                    </div>
                    <div className="truncate font-heading text-base font-semibold">{EMAIL}</div>
                    <div className="text-sm text-muted-foreground">Atención personal</div>
                  </div>
                </a>
              </Reveal>
            </div>

            <div className="mt-10 flex justify-center">
              <a href={WA_URL} target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  className="bg-[#25D366] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1ebe57]"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Escribir por WhatsApp ahora
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-border/60 py-10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
            <div>© {new Date().getFullYear()} Teacher Netza Varo. Todos los derechos reservados.</div>
            <div className="flex items-center gap-4">
              <a href={`mailto:${EMAIL}`} className="transition-colors hover:text-foreground">
                {EMAIL}
              </a>
              <Link to="/login" className="transition-colors hover:text-foreground">
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </footer>
      </main>

      {/* WHATSAPP FLOATING BUTTON */}
      <a
        href={WA_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 transition-transform duration-300 hover:scale-110"
      >
        <MessageCircle className="h-7 w-7" />
        <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366] opacity-30" />
      </a>
    </div>
  );
}
