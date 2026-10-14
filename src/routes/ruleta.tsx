import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, RotateCcw, Sparkles, Target } from "lucide-react";
import { ROULETTE, ROULETTE_LEVELS, type RouletteLevel, type RouletteTopic } from "@/lib/roulette-topics";

export const Route = createFileRoute("/ruleta")({
  head: () => ({
    meta: [
      { title: "Ruleta de niveles y temas · Teacher Netza" },
      { name: "description", content: "Gira la ruleta, descubre tu nivel y el tema de inglés que te toca aprender." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Ruleta de niveles y temas · Teacher Netza" },
      { property: "og:description", content: "Gira la ruleta, descubre tu nivel y el tema de inglés que te toca aprender." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RuletaPage,
});

const FILLS = [
  "var(--primary)",
  "var(--accent)",
  "var(--primary-glow)",
  "var(--secondary-foreground)",
  "color-mix(in oklch, var(--accent) 55%, var(--primary))",
  "color-mix(in oklch, var(--primary) 45%, var(--background))",
];
const TEXT_ON = [
  "var(--primary-foreground)",
  "var(--accent-foreground)",
  "var(--primary-foreground)",
  "var(--primary-foreground)",
  "var(--primary-foreground)",
  "var(--foreground)",
];

function randInt(max: number) {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return a[0] % max;
}

function polar(r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [100 + r * Math.cos(rad), 100 + r * Math.sin(rad)];
}

function Wheel({
  labels,
  onResult,
  disabled,
  fontSize,
  spinLabel,
}: {
  labels: string[];
  onResult: (i: number) => void;
  disabled?: boolean;
  fontSize: number;
  spinLabel: string;
}) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<number | null>(null);
  const n = labels.length;
  const seg = 360 / n;
  const reduce = useRef(false);
  useEffect(() => {
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const spin = () => {
    if (spinning || disabled) return;
    const i = randInt(n);
    const jitter = (randInt(1000) / 1000 - 0.5) * seg * 0.6;
    const target = 360 - (i * seg + seg / 2) + jitter;
    const base = rotation - (rotation % 360);
    const next = base + 360 * (reduce.current ? 1 : 6) + target;
    setWinner(null);
    setSpinning(true);
    setRotation(next);
    window.setTimeout(
      () => {
        setSpinning(false);
        setWinner(i);
        onResult(i);
      },
      reduce.current ? 300 : 4600,
    );
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-full max-w-[min(88vw,420px)]">
        <div
          aria-hidden
          className={`absolute left-1/2 -top-3 z-10 -translate-x-1/2 ${spinning ? "animate-[tick_.12s_ease-in-out_infinite]" : ""}`}
        >
          <svg width="34" height="40" viewBox="0 0 34 40">
            <path d="M17 40 L2 6 Q17 -4 32 6 Z" fill="var(--accent)" stroke="var(--foreground)" strokeWidth="2.5" />
          </svg>
        </div>
        <div className="rounded-full p-2 shadow-[0_30px_60px_-30px_var(--primary)] bg-card ring-4 ring-primary/20">
          <svg
            viewBox="0 0 200 200"
            className="block w-full"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? "transform 4.6s cubic-bezier(0.12, 0.8, 0.12, 1)" : "none",
            }}
          >
            {labels.map((label, i) => {
              const a0 = i * seg;
              const a1 = (i + 1) * seg;
              const [x0, y0] = polar(98, a0);
              const [x1, y1] = polar(98, a1);
              const large = seg > 180 ? 1 : 0;
              const mid = a0 + seg / 2;
              const [tx, ty] = polar(n > 8 ? 62 : 64, mid);
              const c = i % FILLS.length;
              const short = label.length > 20 ? label.slice(0, 19) + "…" : label;
              return (
                <g key={i} opacity={winner === null || winner === i ? 1 : 0.45} style={{ transition: "opacity .4s" }}>
                  <path
                    d={`M100 100 L${x0} ${y0} A98 98 0 ${large} 1 ${x1} ${y1} Z`}
                    fill={FILLS[c]}
                    stroke="var(--card)"
                    strokeWidth="1.2"
                  />
                  <text
                    x={tx}
                    y={ty}
                    fill={TEXT_ON[c]}
                    fontSize={fontSize}
                    fontWeight={800}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${n > 8 ? mid - 90 : mid} ${tx} ${ty})`}
                    style={{ fontFamily: "Sora, sans-serif" }}
                  >
                    {short}
                  </text>
                </g>
              );
            })}
            <circle cx="100" cy="100" r="15" fill="var(--card)" stroke="var(--primary)" strokeWidth="3" />
            <circle cx="100" cy="100" r="5" fill="var(--accent)" />
          </svg>
        </div>
      </div>
      <button
        onClick={spin}
        disabled={spinning || disabled}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 font-bold text-primary-foreground shadow-lg transition hover:-translate-y-0.5 hover:brightness-110 disabled:opacity-50 disabled:hover:translate-y-0"
      >
        {winner !== null ? <RotateCcw className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
        {spinning ? "Girando…" : winner !== null ? "Volver a girar" : spinLabel}
      </button>
    </div>
  );
}

function RuletaPage() {
  const [level, setLevel] = useState<RouletteLevel | null>(null);
  const [topic, setTopic] = useState<RouletteTopic | null>(null);
  const [wheelKey, setWheelKey] = useState(0);
  const topicsRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const onLevel = (i: number) => {
    setLevel(ROULETTE_LEVELS[i]);
    setTopic(null);
    setWheelKey((k) => k + 1);
    setTimeout(() => topicsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
  };
  const onTopic = (i: number) => {
    if (!level) return;
    setTopic(ROULETTE[level][i]);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
      <style>{`
        @keyframes tick { 0%,100% { transform: translateX(-50%) rotate(0) } 50% { transform: translateX(-50%) rotate(-14deg) } }
        @keyframes rise { from { opacity: 0; transform: translateY(24px) scale(.98) } to { opacity: 1; transform: none } }
        .rise { animation: rise .6s cubic-bezier(.2,.8,.2,1) both }
        @media (prefers-reduced-motion: reduce) { .rise { animation: none } }
      `}</style>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <header className="text-center">
          <span className="inline-block rounded-full bg-accent px-4 py-1 text-xs font-extrabold uppercase tracking-widest text-accent-foreground">
            Teacher Netza
          </span>
          <h1 className="mt-4 font-[Sora] text-3xl font-extrabold sm:text-5xl">Ruleta del aprendizaje</h1>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Gira para descubrir tu nivel y después el tema que te toca aprender hoy.
          </p>
        </header>

        <section className="mt-10 rounded-3xl border border-border bg-card p-6 sm:p-10">
          <p className="text-center text-xs font-extrabold uppercase tracking-widest text-primary">Paso 1 · Nivel</p>
          <div className="mt-6">
            <Wheel labels={ROULETTE_LEVELS} onResult={onLevel} fontSize={15} spinLabel="Girar nivel" />
          </div>
          {level && (
            <p className="rise mt-6 text-center text-lg">
              Te tocó el nivel <b className="rounded-lg bg-accent px-2 py-0.5 text-accent-foreground">{level}</b>
            </p>
          )}
        </section>

        {level && (
          <section ref={topicsRef} key={`t-${wheelKey}`} className="rise mt-8 scroll-mt-6 rounded-3xl border border-border bg-card p-6 sm:p-10">
            <p className="text-center text-xs font-extrabold uppercase tracking-widest text-primary">
              Paso 2 · Tema {level}
            </p>
            <div className="mt-6">
              <Wheel labels={ROULETTE[level].map((t) => t.name)} onResult={onTopic} fontSize={6.2} spinLabel="Girar tema" />
            </div>
            <details className="mt-6 text-sm text-muted-foreground">
              <summary className="cursor-pointer text-center font-semibold">Ver los 15 temas de {level}</summary>
              <ol className="mt-3 grid list-decimal gap-1 pl-6 sm:grid-cols-2">
                {ROULETTE[level].map((t) => (
                  <li key={t.name}>{t.name}</li>
                ))}
              </ol>
            </details>
          </section>
        )}

        {level && topic && (
          <section ref={resultRef} key={topic.name} className="rise mt-8 scroll-mt-6 overflow-hidden rounded-3xl border border-border bg-card">
            <div className="bg-primary p-6 text-primary-foreground sm:p-8">
              <span className="rounded-full bg-accent px-3 py-1 text-xs font-extrabold text-accent-foreground">{level}</span>
              <h2 className="mt-3 font-[Sora] text-2xl font-extrabold sm:text-3xl">{topic.name}</h2>
              <p className="mt-2 flex items-start gap-2 opacity-90">
                <Target className="mt-1 h-4 w-4 shrink-0" />
                {topic.goal}
              </p>
            </div>
            <div className="p-6 sm:p-8">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-primary">Bibliografía</h3>
              <ul className="mt-4 grid gap-3">
                {topic.refs.map((r) => (
                  <li key={r.url}>
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between gap-3 rounded-2xl border border-border p-4 transition hover:-translate-y-0.5 hover:border-primary"
                    >
                      <span className="min-w-0">
                        <span className="block font-semibold">{r.title}</span>
                        <span className="text-sm text-muted-foreground">
                          {r.site} · actualizado {r.year}
                        </span>
                      </span>
                      <ExternalLink className="h-4 w-4 shrink-0 text-primary" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
