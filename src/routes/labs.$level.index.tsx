import type { CSSProperties } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Beaker, FlaskConical } from "lucide-react";
import { icons } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { labsByLevel, levelMeta, type Lab } from "@/lib/labs";
import { useReveal } from "@/hooks/use-reveal";

export const Route = createFileRoute("/labs/$level/")({
  head: ({ params }) => {
    const lvl = levelMeta(params.level);
    const title = lvl ? `Labs de inglés ${lvl.label}` : "Labs de inglés";
    const description =
      lvl?.description ??
      "Labs interactivos gratuitos de inglés. Practica desde el navegador, sin registro.";
    return {
      meta: [
        { title: `${title} — Teacher Netza Varo` },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: LevelPage,
});

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const r = useReveal<HTMLDivElement>(delay);
  return (
    <div ref={r.ref} className={r.className}>
      {children}
    </div>
  );
}

function LabIcon({ name, className }: { name: string; className?: string }) {
  const Cmp = (icons as Record<string, React.ComponentType<{ className?: string }>>)[name];
  const Fallback = FlaskConical;
  const C = Cmp ?? Fallback;
  return <C className={className} />;
}

function LevelPage() {
  const { level } = Route.useParams();
  const lvl = levelMeta(level);
  const items = labsByLevel(level);

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

      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 shadow-[var(--shadow-soft)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link to="/labs" className="group flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[image:var(--gradient-hero)] text-primary-foreground shadow-[var(--glow-mint)]">
              <Beaker className="h-5 w-5" />
            </div>
            <span className="font-heading text-base font-bold sm:text-lg">Labs</span>
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
          <Link
            to="/labs"
            className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Todos los niveles
          </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        {!lvl && (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <h1 className="font-heading text-2xl font-bold">Nivel no encontrado</h1>
            <Link to="/labs">
              <Button>Ver todos los niveles</Button>
            </Link>
          </div>
        )}

        {lvl && (
          <>
            <Reveal>
              <div className="text-center">
                <span
                  className="tn-accent-chip inline-flex items-center rounded-lg px-3 py-1 font-heading text-sm font-bold"
                  style={{ "--c": lvl.color } as CSSProperties}
                >
                  {lvl.slug.toUpperCase()}
                </span>
                <h1 className="mt-5 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                  {lvl.label}
                </h1>
                <p
                  className="tn-accent-text mt-3 text-lg font-medium"
                  style={{ "--c": lvl.color } as CSSProperties}
                >
                  {lvl.tagline}
                </p>
                <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{lvl.description}</p>
              </div>
            </Reveal>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center text-sm text-muted-foreground sm:col-span-2 lg:col-span-3">
                  Aún no hay labs publicados en este nivel. ¡Muy pronto!
                </div>
              )}

              {items.map((lab: Lab, i: number) => (
                <Reveal key={lab.slug} delay={i * 70}>
                  <Link
                    to="/labs/$level/$slug"
                    params={{ level: lab.level, slug: lab.slug }}
                    className="card-hover group flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card/90 p-6 shadow-[var(--shadow-soft)] backdrop-blur"
                    style={{ borderTop: `4px solid ${lab.color}`, "--c": lab.color } as CSSProperties}
                  >
                    <div>
                      <div
                        className="tn-accent-icon mb-4 flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                      >
                        <LabIcon name={lab.icon} className="h-5 w-5" />
                      </div>
                      <h2 className="font-heading text-lg font-semibold">{lab.title}</h2>
                      <p className="mt-2 text-sm text-muted-foreground">{lab.description}</p>
                    </div>
                    <span
                      className="tn-accent-text mt-5 inline-flex items-center text-sm font-semibold"
                    >
                      Practicar
                      <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
