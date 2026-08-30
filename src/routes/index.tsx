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
  Gauge,
  Rocket,
} from "lucide-react";
import { useState } from "react";
import { useReveal } from "@/hooks/use-reveal";
import { ThemeToggle } from "@/components/theme-toggle";
import { useScrollProgress } from "@/hooks/use-scroll-progress";
import { COMPUTED_PLANS, HOURLY_RATE, mxn } from "@/lib/pricing";
import heroStudent from "@/assets/hero-student.jpg";
import methodStudy from "@/assets/method-study.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Teacher Netza | ESL Platform" },
      {
        name: "description",
        content:
          "Plataforma de inglés con Labs interactivos gratuitos, examen diagnóstico y Masterclasses. Clases desde $149 MXN por hora y paquetes mensuales con hasta 20% de descuento.",
      },
      { property: "og:title", content: "Teacher Netza | ESL Platform" },
      {
        property: "og:description",
        content:
          "Aprende inglés online con un sistema moderno e interactivo. Clases y paquetes mensuales con hasta 20% de descuento.",
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

const RIBBON_ITEMS: string[] = [
  "Examen diagnóstico gratis",
  "Labs interactivos A1–C1",
  "Constancia de nivel en PDF",
  "Clases 1 a 1 en línea",
  "Hasta 20% en paquetes",
];

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
              alt="Teacher Netza | ESL System"
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
        <section className="relative isolate overflow-hidden">
          <div
            className="absolute inset-0 -z-30"
            style={{
              background:
                "linear-gradient(165deg, var(--background) 0%, color-mix(in oklab, var(--primary) 6%, var(--background)) 55%, color-mix(in oklab, var(--mint) 8%, var(--background)) 100%)",
            }}
          />
          {/* Retícula y diagonales */}
          <div aria-hidden className="tn-grid tn-fade-mask absolute inset-0 -z-20" />
          <div
            aria-hidden
            className="tn-diag absolute -right-10 top-10 -z-20 h-[280px] w-[420px] rotate-6 opacity-60"
          />
          <div
            aria-hidden
            className="tn-dots absolute bottom-10 left-[-40px] -z-20 h-[220px] w-[280px] opacity-50"
          />
          {/* Figuras geométricas */}
          <div
            aria-hidden
            className="tn-outline-shape tn-float absolute -top-16 right-[12%] -z-20 hidden h-56 w-56 rotate-12 rounded-[2.5rem] lg:block"
          />
          <div
            aria-hidden
            className="tn-float absolute bottom-4 right-[2%] -z-20 hidden h-16 w-16 rotate-45 rounded-xl lg:block"
            style={{ background: "var(--gradient-gold)", opacity: 0.5, animationDelay: "-2s" }}
          />
          <div
            aria-hidden
            className="absolute left-[8%] top-24 -z-20 hidden h-3 w-3 rounded-full lg:block"
            style={{ background: "var(--mint)" }}
          />
          {/* Más figuras */}

          <div
            aria-hidden
            className="tn-float absolute left-[6%] top-[36%] -z-20 hidden h-24 w-24 rotate-12 rounded-full border-2 border-[color-mix(in_oklab,var(--mint)_45%,transparent)] lg:block"
            style={{ animationDelay: "-6s" }}
          />
          <div
            aria-hidden
            className="absolute right-[20%] top-[58%] -z-20 hidden h-14 w-14 rounded-full lg:block"
            style={{ background: "color-mix(in oklab, var(--mint) 22%, transparent)" }}
          />
          <div
            aria-hidden
            className="tn-diag absolute -left-8 top-[8%] -z-20 hidden h-[180px] w-[220px] -rotate-6 opacity-40 lg:block"
          />
          <div
            aria-hidden
            className="tn-dots absolute right-[4%] top-[30%] -z-20 hidden h-[160px] w-[180px] opacity-40 lg:block"
          />
          <div
            aria-hidden
            className="absolute left-[24%] top-[14%] -z-20 hidden h-0 w-0 lg:block"
            style={{
              borderLeft: "18px solid transparent",
              borderRight: "18px solid transparent",
              borderBottom: "30px solid color-mix(in oklab, var(--gold) 55%, transparent)",
            }}
          />
          <div
            aria-hidden
            className="tn-outline-shape absolute bottom-[12%] left-[42%] -z-20 hidden h-24 w-24 rotate-45 lg:block"
          />
          <div
            aria-hidden
            className="absolute inset-x-0 top-[42%] -z-20 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, color-mix(in oklab, var(--primary) 25%, transparent), transparent)",
            }}
          />

          <div
            aria-hidden
            className="tn-float absolute -top-40 left-[10%] -z-10 h-[420px] w-[420px] rounded-full opacity-20 blur-3xl"
            style={{ background: "var(--gradient-primary)" }}
          />
          <div
            aria-hidden
            className="tn-float absolute -bottom-24 right-[8%] -z-10 h-[360px] w-[360px] rounded-full opacity-20 blur-3xl"
            style={{ background: "var(--gradient-mint)", animationDelay: "-4s" }}
          />


          <div className="mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pb-20 lg:pt-24">
            <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
              {/* Columna de texto */}
              <div className="text-center lg:text-left">
                <Reveal>
                  <span className="inline-flex items-center gap-2 rounded-full border border-mint/40 bg-mint/10 px-3 py-1 text-xs font-medium text-primary shadow-[0_0_18px_-6px_var(--mint)]">
                    <Sparkles className="h-3.5 w-3.5 text-mint-strong" />
                    +6 años formando estudiantes bilingües
                  </span>
                  <h1 className="mt-6 font-heading text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                    Aprende inglés de verdad,{" "}
                    <span className="bg-[image:var(--gradient-heading)] bg-clip-text text-transparent">
                      a tu ritmo y a tu medida
                    </span>
                    .
                  </h1>
                  <p className="mt-5 text-lg text-muted-foreground sm:text-xl">
                    Descubre tu nivel en minutos, practica con Labs interactivos gratis y avanza
                    con clases 1 a 1 desde {mxn(HOURLY_RATE)} por hora.
                  </p>
                </Reveal>

                <Reveal delay={120}>
                  <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
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
                </Reveal>

                {/* Firma de marca */}
                <Reveal delay={220}>
                  <div className="mt-10 flex items-center justify-center gap-4 lg:justify-start">
                    <div className="glow-logo shrink-0">
                      <img
                        src="/logo_teacher_netza.png"
                        alt="Teacher Netza Varo"
                        className="h-20 w-20 object-contain sm:h-24 sm:w-24"
                        width={96}
                        height={96}
                      />
                    </div>
                    <div className="text-left">
                      <div className="font-heading text-base font-bold text-foreground">
                        Teacher Netza Varo
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Clases 1 a 1, Labs y constancia de nivel
                      </p>
                    </div>
                  </div>
                </Reveal>
              </div>

              {/* Imagen recortada en diagonal */}
              <Reveal delay={180} className="relative">
                <div className="relative">
                  <div
                    aria-hidden
                    className="tn-clip-diagonal absolute -inset-3 -z-10 hidden lg:block"
                    style={{ background: "var(--gradient-mint)", opacity: 0.35 }}
                  />
                  <div className="tn-clip-diagonal relative overflow-hidden shadow-[var(--shadow-elegant)]">
                    <img
                      src={heroStudent}
                      alt="Estudiante tomando una clase de inglés en línea con Teacher Netza"
                      className="h-[340px] w-full object-cover sm:h-[420px] lg:h-[540px]"
                      width={1280}
                      height={1600}
                    />
                    <span
                      aria-hidden
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(200deg, color-mix(in oklab, var(--primary) 45%, transparent) 0%, transparent 45%, color-mix(in oklab, var(--primary) 30%, transparent) 100%)",
                      }}
                    />
                  </div>

                  {/* Tarjeta flotante sobre la imagen */}
                  <div className="absolute -bottom-5 left-2 flex items-center gap-3 rounded-2xl border border-border bg-card/95 px-4 py-3 shadow-[var(--shadow-elegant)] backdrop-blur sm:left-6">
                    <div className="tn-accent-icon flex h-10 w-10 items-center justify-center rounded-xl" style={{ "--c": "#FFB830" } as CSSProperties}>
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <div className="font-heading text-sm font-bold leading-tight">A1 → C1</div>
                      <div className="text-xs text-muted-foreground">Ruta completa por nivel</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>



          {/* CINTA DIAGONAL */}
          <div aria-hidden className="relative -mb-2 mt-2 select-none">
            <div
              className="tn-ribbon -rotate-2 border-y border-[color-mix(in_oklab,var(--primary)_25%,transparent)] py-3"
              style={{ background: "var(--gradient-hero)" }}
            >
              <div className="tn-marquee flex w-max gap-10 whitespace-nowrap">
                {Array.from({ length: 4 }).map((_, k) => (
                  <span key={k} className="flex items-center gap-10">
                    {RIBBON_ITEMS.map((t) => (
                      <span
                        key={t + k}
                        className="flex items-center gap-3 font-heading text-sm font-semibold uppercase tracking-[0.18em] text-primary-foreground/90"
                      >
                        <Star className="h-3.5 w-3.5 text-gold" />
                        {t}
                      </span>
                    ))}
                  </span>
                ))}
              </div>
            </div>
            <div
              className="tn-ribbon absolute inset-x-0 top-0 rotate-2 py-3 opacity-25"
              style={{ background: "var(--gradient-mint)" }}
            />
          </div>

          {/* 3 TARJETAS DEL HERO */}
          <div className="mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3">
              {[
                {
                  icon: Gauge,
                  title: "Examen Diagnóstico",
                  text: "Descubre tu nivel real (A1–C1) y recibe tu constancia en PDF.",
                  tag: "Gratis · 7 min",
                  cta: "Hacer examen",
                  to: "/diagnostic-exam" as const,
                  color: "#FFB830",
                  invert: false,
                },
                {
                  icon: FlaskConical,
                  title: "Labs Interactivos",
                  text: "Practica gratis con labs por nivel MCER (A1–C1), sin registro.",
                  tag: "Sin registro",
                  cta: "Entrar a los Labs",
                  to: "/labs" as const,
                  color: "#FF6B4A",
                  invert: false,
                },
                {
                  icon: Rocket,
                  title: "Planes de Clases",
                  text: `Clases 1 a 1 desde ${mxn(HOURLY_RATE)} por hora y paquetes con hasta 20% menos.`,
                  tag: "Hasta -20%",
                  cta: "Ver planes",
                  href: "#planes",
                  color: "#0F3B4B",
                  invert: true,
                },
              ].map((c, i) => {
                const Inner = (
                  <div
                    className="card-hover group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card p-6 text-left shadow-[var(--shadow-soft)]"
                    style={{ "--c": c.color } as CSSProperties}
                  >
                    <span
                      aria-hidden
                      className="absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-[0.14] blur-2xl transition-opacity duration-500 group-hover:opacity-30"
                      style={{ background: c.color }}
                    />
                    <span
                      aria-hidden
                      className="absolute right-5 top-5 font-heading text-4xl font-bold leading-none opacity-10"
                      style={{ color: c.color }}
                    >
                      0{i + 1}
                    </span>
                    <div className="relative">
                      <div
                        className={`${c.invert ? "tn-accent-icon-invert" : "tn-accent-icon"} mb-5 flex h-14 w-14 rotate-3 items-center justify-center rounded-2xl shadow-[0_10px_24px_-12px_var(--c)] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-105`}
                      >
                        <c.icon className="h-6 w-6" />
                      </div>
                      <span
                        className="inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider"
                        style={{
                          background: `color-mix(in oklab, ${c.color} 16%, transparent)`,
                          color: c.invert ? c.color : `color-mix(in oklab, ${c.color} 72%, black)`,
                        }}
                      >
                        {c.tag}
                      </span>
                      <h2 className="mt-3 font-heading text-xl font-semibold">{c.title}</h2>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.text}</p>
                    </div>
                    <span className="tn-accent-text mt-6 inline-flex items-center text-sm font-semibold">
                      {c.cta}
                      <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                    <span
                      aria-hidden
                      className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                      style={{ background: c.color }}
                    />
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
                      Descubre tu nivel real de inglés en 7 o 20 minutos
                    </h2>

                    <p className="mt-4 text-base text-white/90 sm:text-lg">
                      Un examen diagnóstico creado por Teacher Netza que evalúa Listening,
                      Reading y Vocabulary & Use of Language. Elige la versión rápida (~7 min) o
                      la completa (15–20 min) y recibe tu nivel por habilidad y una Constancia de
                      Nivel en PDF.
                    </p>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      <Link to="/diagnostic-exam">
                        <Button
                          size="lg"
                          className="group tn-on-accent bg-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/90"
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
                      { icon: Zap, text: "3 rubros: Listening (audio real), Reading (3 lecturas) y Vocabulary & Use of Language." },
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
