import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Beaker, Search, Sparkles, FlaskConical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { listLabs } from "@/lib/labs.functions";
import { LAB_LEVELS, type Lab } from "@/lib/labs";
import { useReveal } from "@/hooks/use-reveal";

export const Route = createFileRoute("/labs/")({
  head: () => ({
    meta: [
      { title: "Labs interactivos de inglés — Teacher Netza Varo" },
      {
        name: "description",
        content:
          "Prácticas interactivas gratuitas de inglés por nivel: básico, intermedio y avanzado. Sin registro, entra y practica desde el navegador.",
      },
      { property: "og:title", content: "Labs interactivos de inglés — gratis" },
      {
        property: "og:description",
        content:
          "Practica inglés gratis con Labs interactivos organizados por nivel: básico, intermedio y avanzado.",
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
  const fetchLabs = useServerFn(listLabs);
  const q = useQuery({ queryKey: ["labs"], queryFn: () => fetchLabs({}) });
  const [search, setSearch] = useState("");

  const labs = q.data?.labs ?? [];
  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return labs;
    return labs.filter((l: Lab) => l.title.toLowerCase().includes(s));
  }, [labs, search]);

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
          <Link
            to="/"
            className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Volver al inicio
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <Reveal>
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-mint/40 bg-mint/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Gratis · Sin registro
            </span>
            <h1 className="mt-5 font-heading text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Labs interactivos de inglés
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Prácticas creadas por Teacher Netza. Elige tu nivel, entra a un lab y practica
              directamente desde el navegador.
            </p>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="mx-auto mt-8 flex max-w-md items-center gap-2 rounded-xl border border-border bg-card/80 px-3 shadow-[var(--shadow-soft)] backdrop-blur transition-colors focus-within:border-mint">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar un lab…"
              className="border-0 bg-transparent shadow-none focus-visible:ring-0"
            />
          </div>
        </Reveal>

        {q.data?.error && (
          <p className="mt-8 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-center text-sm text-destructive">
            {q.data.error}
          </p>
        )}

        <div className="mt-14 space-y-14">
          {LAB_LEVELS.map((lvl, li) => {
            const items = filtered.filter((l: Lab) => l.level === lvl.slug);
            return (
              <section key={lvl.slug}>
                <Reveal delay={li * 80}>
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <h2 className="font-heading text-2xl font-bold sm:text-3xl">{lvl.label}</h2>
                      <p className="mt-1 text-muted-foreground">{lvl.description}</p>
                    </div>
                    <span className="rounded-full border border-mint/40 bg-mint/10 px-3 py-1 text-xs font-semibold text-primary">
                      {q.isLoading ? "…" : `${items.length} labs`}
                    </span>
                  </div>
                </Reveal>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {q.isLoading &&
                    Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-36 animate-pulse rounded-2xl border border-border bg-card/60"
                      />
                    ))}

                  {!q.isLoading && items.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground sm:col-span-2 lg:col-span-3">
                      Aún no hay labs en este nivel. ¡Pronto habrá más!
                    </div>
                  )}

                  {items.map((lab: Lab, i: number) => (
                    <Reveal key={`${lab.level}-${lab.slug}`} delay={i * 70}>
                      <Link
                        to="/labs/$level/$slug"
                        params={{ level: lab.level, slug: lab.slug }}
                        className="card-hover group flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card/90 p-6 shadow-[var(--shadow-soft)] backdrop-blur"
                      >
                        <div>
                          <div
                            className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-white transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
                            style={{ background: "var(--gradient-mint)" }}
                          >
                            <FlaskConical className="h-5 w-5" />
                          </div>
                          <h3 className="font-heading text-lg font-semibold">{lab.title}</h3>
                          <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
                            {lvl.label}
                          </p>
                        </div>
                        <span className="mt-5 inline-flex items-center text-sm font-semibold text-primary">
                          Practicar
                          <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </span>
                      </Link>
                    </Reveal>
                  ))}
                </div>
              </section>
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
