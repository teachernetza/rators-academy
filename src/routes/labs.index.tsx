import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Beaker, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LAB_LEVELS, labsByLevel } from "@/lib/labs";
import { useReveal } from "@/hooks/use-reveal";

export const Route = createFileRoute("/labs/")({
  head: () => ({
    meta: [
      { title: "Labs interactivos de inglés A1–C1 — Teacher Netza Varo" },
      {
        name: "description",
        content:
          "Prácticas interactivas gratuitas de inglés organizadas por nivel MCER: A1, A2, B1, B2 y C1. Sin registro, entra y practica desde el navegador.",
      },
      { property: "og:title", content: "Labs interactivos de inglés A1–C1 — gratis" },
      {
        property: "og:description",
        content: "Elige tu nivel MCER y practica inglés gratis con Labs interactivos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LabsPage,
});

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

function LabsPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div
        aria-hidden
        className="tn-shimmer-bg pointer-events-none fixed inset-0 -z-20"
        style={{
          background:
            "linear-gradient(165deg, var(--background) 0%, color-mix(in oklab, var(--mint) 10%, var(--background)) 55%, color-mix(in oklab, var(--primary) 8%, var(--background)) 100%)",
        }}
      />
      <div
        aria-hidden
        className="tn-float pointer-events-none fixed -left-32 top-40 -z-10 h-[360px] w-[360px] rounded-full opacity-20 blur-3xl"
        style={{ background: "var(--gradient-mint)" }}
      />

      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 shadow-[var(--shadow-soft)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="group flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[image:var(--gradient-hero)] text-primary-foreground shadow-[var(--glow-mint)] transition-transform duration-500 group-hover:scale-110">
              <Beaker className="h-5 w-5" />
            </div>
            <span className="font-heading text-base font-bold sm:text-lg">Labs</span>
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
          <Link
            to="/"
            className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Volver al inicio
          </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <Reveal>
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-mint/40 bg-mint/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Gratis · Sin registro
            </span>
            <h1 className="mt-5 font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Elige tu nivel de inglés
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Labs interactivos creados por Teacher Netza, organizados del A1 al C1 del Marco
              Común Europeo. Entra a un nivel y practica desde el navegador.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {LAB_LEVELS.map((lvl, i) => {
            const count = labsByLevel(lvl.slug).length;
            return (
              <Reveal key={lvl.slug} delay={i * 70}>
                <Link
                  to="/labs/$level"
                  params={{ level: lvl.slug }}
                  className="card-hover group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card/90 p-6 shadow-[var(--shadow-soft)] backdrop-blur"
                  style={{ borderTop: `4px solid ${lvl.color}` }}
                >
                  <div>
                    <span
                      className="inline-flex items-center rounded-lg px-3 py-1 font-heading text-sm font-bold text-white"
                      style={{ backgroundColor: lvl.color }}
                    >
                      {lvl.slug.toUpperCase()}
                    </span>
                    <h2 className="mt-4 font-heading text-xl font-semibold">{lvl.label}</h2>
                    <p className="mt-2 text-sm font-medium" style={{ color: lvl.color }}>
                      {lvl.tagline}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">{lvl.description}</p>
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                      {count} {count === 1 ? "lab" : "labs"}
                    </span>
                    <span className="inline-flex items-center text-sm font-semibold text-primary">
                      Entrar
                      <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={120}>
          <div className="mt-16 rounded-2xl border border-border bg-card/80 p-8 text-center backdrop-blur">
            <h2 className="font-heading text-xl font-semibold">¿Quieres practicar con guía?</h2>
            <p className="mt-2 text-muted-foreground">
              Los labs son gratis, pero avanzas mucho más rápido con clases personalizadas.
            </p>
            <Link to="/">
              <Button className="mt-5">Ver planes de clases</Button>
            </Link>
          </div>
        </Reveal>
      </main>
    </div>
  );
}
