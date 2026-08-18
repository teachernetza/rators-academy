import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Volume2,
  Loader2,
  Download,
  RotateCcw,
  MessageCircle,
  Headphones,
  BookOpen,
  Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  QuestionBank,
  computeResult,
  sectionQuestions,
  SECTION_NAMES,
  SECTION_ORDER,
  CEFR_DESCRIPTION,
  CEFR_SCALE,
  CEFR_VALUE,
  TOTAL_QUESTIONS,
  type Answers,
  type ExamResult,
  type Question,
} from "@/lib/diagnostic-bank";
import { generateDiagnosticPdf } from "@/lib/diagnostic-pdf";

export const Route = createFileRoute("/diagnostic-exam")({
  head: () => ({
    meta: [
      { title: "Examen Diagnóstico de Inglés — Teacher Netza Varo" },
      {
        name: "description",
        content:
          "Descubre tu nivel real de inglés (A1–C1) en 15 minutos: Listening, Reading y Vocabulary. Recibe tu Constancia de Nivel en PDF, gratis.",
      },
      { property: "og:title", content: "Examen Diagnóstico de Inglés — Teacher Netza Varo" },
      {
        property: "og:description",
        content:
          "Examen diagnóstico gratuito con Constancia de Nivel en PDF. Mide Listening, Reading y Vocabulary & Use of Language.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DiagnosticExam,
});

const STORAGE_KEY = "netza.diagnostic.v2";
const WA_NUMBER = "523231116425";

type SavedState = { studentName: string; step: number; answers: Answers; version: 2 };

function loadState(): SavedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedState;
    if (parsed?.version !== 2) return null;
    return parsed;
  } catch {
    return null;
  }
}

function DiagnosticExam() {
  // Step 0 = start, 1..3 = sections, 4 = results
  const [step, setStep] = useState(0);
  const [studentName, setStudentName] = useState("");
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<ExamResult | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const radarRef = useRef<HTMLCanvasElement>(null);

  // Hydrate
  useEffect(() => {
    const saved = loadState();
    if (!saved) return;
    try {
      const a: Answers = { ...(saved.answers ?? {}) };
      setStudentName(saved.studentName || "");
      setAnswers(a);
      const savedStep = Number(saved.step) || 0;
      if (savedStep >= 4) {
        setResult(computeResult(a));
        setStep(4);
      } else {
        setStep(Math.max(0, Math.min(3, savedStep)));
      }
    } catch {
      if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
      setStep(0);
      setResult(null);
    }
  }, []);

  // Persist
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (step === 0 && !studentName) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ studentName, step, answers, version: 2 }),
    );
  }, [studentName, step, answers]);

  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  function resetExam() {
    if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
    setStudentName("");
    setStep(0);
    setAnswers({});
    setResult(null);
  }

  function answer(id: string, optIndex: number) {
    setAnswers((a) => ({ ...a, [id]: optIndex }));
  }

  function goto(next: number) {
    setStep(Math.max(0, Math.min(4, next)));
  }

  function finish() {
    setResult(computeResult(answers));
    setStep(4);
    toast.success("¡Examen calificado!");
  }

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const progress =
    step === 0 ? 0 : Math.round((answeredCount / TOTAL_QUESTIONS) * 100);
  const sectionKey = step >= 1 && step <= 3 ? SECTION_ORDER[step - 1] : null;

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div
        aria-hidden
        className="tn-shimmer-bg pointer-events-none fixed inset-0 -z-20"
        style={{
          background:
            "linear-gradient(165deg, var(--background) 0%, color-mix(in oklab, var(--mint) 9%, var(--background)) 55%, color-mix(in oklab, var(--primary) 8%, var(--background)) 100%)",
        }}
      />
      <div
        aria-hidden
        className="tn-float pointer-events-none fixed -right-32 top-24 -z-10 h-[380px] w-[380px] rounded-full opacity-20 blur-3xl"
        style={{ background: "var(--gradient-mint)" }}
      />

      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 shadow-[var(--shadow-soft)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="group flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[image:var(--gradient-hero)] text-white shadow-[var(--glow-mint)] transition-transform duration-500 group-hover:scale-110">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-heading text-base font-bold sm:text-lg">
              Examen Diagnóstico
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Link
              to="/"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>
        {sectionKey && (
          <div className="mx-auto max-w-5xl px-4 pb-3 sm:px-6">
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Paso {step} de 3 · {SECTION_NAMES[sectionKey]}
              </span>
              <span className="font-semibold text-primary">
                {answeredCount}/{TOTAL_QUESTIONS} · {progress}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-[width] duration-500 ease-out"
                style={{
                  width: `${progress}%`,
                  background: "var(--gradient-mint)",
                  boxShadow: "var(--glow-mint)",
                }}
              />
            </div>
          </div>
        )}
      </header>

      <main key={step} className="animate-fade-in mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:py-14">
        {step === 0 && (
          <StartScreen
            name={studentName}
            onName={setStudentName}
            hasProgress={answeredCount > 0}
            onStart={() => {
              if (!studentName.trim()) {
                toast.error("Escribe tu nombre para comenzar.");
                return;
              }
              goto(1);
            }}
            onReset={resetExam}
          />
        )}

        {step === 1 && <ListeningSection answers={answers} onAnswer={answer} />}
        {step === 2 && <ReadingSection answers={answers} onAnswer={answer} />}
        {step === 3 && <VocabSection answers={answers} onAnswer={answer} />}

        {step === 4 && !result && (
          <div className="rounded-2xl border border-border/60 bg-card/80 p-10 text-center backdrop-blur-xl">
            <h2 className="font-heading text-xl font-bold">No pudimos recuperar tus resultados</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Tu sesión anterior quedó incompleta. Puedes empezar el examen de nuevo.
            </p>
            <Button className="mt-6" onClick={resetExam}>
              <RotateCcw className="mr-2 h-4 w-4" /> Empezar de nuevo
            </Button>
          </div>
        )}

        {step === 4 && result && (
          <ResultsScreen
            studentName={studentName}
            result={result}
            radarRef={radarRef}
            onReset={resetExam}
            pdfLoading={pdfLoading}
            onDownload={async () => {
              setPdfLoading(true);
              try {
                await generateDiagnosticPdf({ studentName, result });
                toast.success("Constancia generada.");
              } catch (e) {
                console.error(e);
                toast.error("No se pudo generar la constancia.");
              } finally {
                setPdfLoading(false);
              }
            }}
          />
        )}

        {step > 0 && step < 4 && (
          <div className="mt-10 flex items-center justify-between border-t border-border/60 pt-6">
            <Button variant="outline" onClick={() => goto(step - 1)} disabled={step === 1}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Anterior
            </Button>
            {step < 3 ? (
              <Button onClick={() => goto(step + 1)}>
                Siguiente <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={finish} className="shadow-[var(--shadow-elegant)]">
                Ver resultados <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

/* ------------------------------- SCREENS ------------------------------- */

function StartScreen({
  name,
  onName,
  onStart,
  onReset,
  hasProgress,
}: {
  name: string;
  onName: (v: string) => void;
  onStart: () => void;
  onReset: () => void;
  hasProgress: boolean;
}) {
  const blocks = [
    { icon: Headphones, title: "Listening", desc: "5 audios · 10 preguntas" },
    { icon: BookOpen, title: "Reading", desc: "3 lecturas · 9 preguntas" },
    { icon: Type, title: "Vocabulary & Use", desc: "Gramática y modismos · 12 preguntas" },
  ];
  return (
    <div className="mx-auto max-w-xl text-center">
      <span className="inline-flex items-center gap-2 rounded-full border border-mint/40 bg-mint/10 px-3 py-1 text-xs font-medium text-primary shadow-[0_0_18px_-6px_var(--mint)]">
        <Sparkles className="h-3.5 w-3.5" /> Gratis · ~15 minutos
      </span>
      <h1 className="mt-6 font-heading text-3xl font-bold sm:text-4xl">
        Descubre tu nivel real de inglés
      </h1>
      <p className="mt-4 text-muted-foreground">
        Cada pregunta tiene dos respuestas correctas de distinto nivel: elige la que realmente
        usarías. Al terminar recibes tu <strong>Constancia de Nivel</strong> en PDF.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {blocks.map((b) => (
          <div
            key={b.title}
            className="rounded-xl border border-mint/25 bg-card/80 p-4 text-left shadow-[var(--shadow-soft)] backdrop-blur"
          >
            <b.icon className="h-5 w-5 text-primary" />
            <div className="mt-2 font-heading text-sm font-bold">{b.title}</div>
            <div className="text-xs text-muted-foreground">{b.desc}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-3 rounded-2xl border border-mint/30 bg-card/80 p-6 text-left shadow-[var(--shadow-soft)] backdrop-blur">
        <label className="text-sm font-medium">¿Cuál es tu nombre?</label>
        <Input
          value={name}
          onChange={(e) => onName(e.target.value)}
          placeholder="Ej. María López"
          onKeyDown={(e) => e.key === "Enter" && onStart()}
        />
        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
          <Button onClick={onStart} size="lg" className="w-full shadow-[var(--shadow-elegant)]">
            Comenzar examen
          </Button>
          {hasProgress && (
            <Button variant="ghost" onClick={onReset} size="lg" className="w-full sm:w-auto">
              <RotateCcw className="mr-2 h-4 w-4" /> Reiniciar
            </Button>
          )}
        </div>
        <p className="pt-2 text-xs text-muted-foreground">
          Tu nombre aparecerá en la constancia final.
        </p>
      </div>
    </div>
  );
}

/* --------------------------- REUSABLE PIECES --------------------------- */

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6">
      <h2 className="font-heading text-2xl font-bold sm:text-3xl">{title}</h2>
      <p className="mt-1 text-muted-foreground">{description}</p>
    </div>
  );
}

function QuestionBlock({
  q,
  index,
  answers,
  onAnswer,
}: {
  q: Question;
  index: number;
  answers: Answers;
  onAnswer: (id: string, v: number) => void;
}) {
  const selected = answers[q.id];
  return (
    <div className="rounded-2xl border border-border bg-card/80 p-5 shadow-[var(--shadow-soft)] backdrop-blur transition-all duration-500 hover:border-mint/50 hover:shadow-[var(--glow-mint)]">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Pregunta {index}
      </div>
      <div className="mt-1 text-base font-medium leading-snug">{q.q}</div>
      <div className="mt-4 space-y-2">
        {q.opts.map((opt, oi) => (
          <label
            key={oi}
            className={cn(
              "flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-all duration-300",
              selected === oi
                ? "border-mint bg-mint/10 shadow-[0_0_18px_-8px_var(--mint)]"
                : "border-border bg-background hover:-translate-y-0.5 hover:border-mint/50 hover:bg-mint/5",
            )}
          >
            <input
              type="radio"
              name={`q-${q.id}`}
              value={oi}
              checked={selected === oi}
              onChange={() => onAnswer(q.id, oi)}
              className="h-4 w-4 accent-[hsl(var(--primary))]"
            />
            <span>{opt.text}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ SECTIONS ------------------------------ */

function ListeningSection({
  answers,
  onAnswer,
}: {
  answers: Answers;
  onAnswer: (id: string, v: number) => void;
}) {
  let n = 0;
  return (
    <div>
      <SectionHeading
        title="Listening"
        description="Escucha la grabación completa y responde. Puedes repetirla las veces que necesites."
      />
      <div className="space-y-8">
        {QuestionBank.listening.map((item, ai) => (
          <div key={item.id} className="space-y-4">
            <div className="space-y-3 rounded-xl border border-mint/30 bg-mint/5 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Volume2 className="h-4 w-4 text-primary" />
                <span className="font-heading text-sm font-bold">
                  Audio {ai + 1} · {item.title}
                </span>
              </div>
              {item.subtitle && (
                <p className="text-xs text-muted-foreground">{item.subtitle}</p>
              )}
              <audio controls preload="metadata" src={item.src} className="w-full">
                Tu navegador no soporta la reproducción de audio.
              </audio>
            </div>
            {item.questions.map((q) => {
              n += 1;
              return (
                <QuestionBlock key={q.id} q={q} index={n} answers={answers} onAnswer={onAnswer} />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}


function ReadingSection({
  answers,
  onAnswer,
}: {
  answers: Answers;
  onAnswer: (id: string, v: number) => void;
}) {
  let n = 0;
  return (
    <div>
      <SectionHeading
        title="Reading"
        description="2 lecturas cortas y 1 lectura larga, con 3 preguntas cada una."
      />
      <div className="space-y-8">
        {QuestionBank.reading.map((p) => (
          <div key={p.id} className="space-y-4">
            <div className="rounded-xl border border-mint/30 bg-secondary/40 p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {p.kind === "long" ? "Lectura larga" : "Lectura corta"} · {p.title}
              </div>
              <div className="mt-2 space-y-3 text-sm leading-relaxed">
                {p.text.split("\n\n").map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>
            {p.questions.map((q) => {
              n += 1;
              return (
                <QuestionBlock key={q.id} q={q} index={n} answers={answers} onAnswer={onAnswer} />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function VocabSection({
  answers,
  onAnswer,
}: {
  answers: Answers;
  onAnswer: (id: string, v: number) => void;
}) {
  return (
    <div>
      <SectionHeading
        title="Vocabulary & Use of Language"
        description="Gramática, uso real del idioma, colocaciones y modismos."
      />
      <div className="space-y-4">
        {sectionQuestions("vocab").map((q, i) => (
          <QuestionBlock key={q.id} q={q} index={i + 1} answers={answers} onAnswer={onAnswer} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ RESULTS ------------------------------ */

function ResultsScreen({
  studentName,
  result,
  radarRef,
  onReset,
  onDownload,
  pdfLoading,
}: {
  studentName: string;
  result: ExamResult;
  radarRef: React.RefObject<HTMLCanvasElement | null>;
  onReset: () => void;
  onDownload: () => void;
  pdfLoading: boolean;
}) {
  useEffect(() => {
    drawRadar(radarRef.current, result);
  }, [result, radarRef]);

  const waMsg = `Hola Teacher Netza, acabo de terminar el examen diagnóstico. Mi nivel general es ${result.overall} (Listening ${result.sections[0].level}, Reading ${result.sections[1].level}, Vocabulary ${result.sections[2].level}). Me gustaría más información sobre los planes.`;
  const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waMsg)}`;

  return (
    <div>
      <div className="rounded-2xl border-2 border-mint bg-card p-8 text-center shadow-[var(--glow-mint)]">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Nivel general (MCER)
        </div>
        <div className="mt-2 bg-[image:var(--gradient-hero)] bg-clip-text font-heading text-7xl font-black text-transparent">
          {result.overall}
        </div>
        <div className="mt-2 text-lg">
          <strong>{studentName}</strong>
        </div>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          {CEFR_DESCRIPTION[result.overall]}
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {result.sections.map((s) => (
          <div
            key={s.key}
            className="card-hover rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]"
          >
            <div className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</div>
            <div className="mt-1 font-heading text-3xl font-bold text-primary">{s.level}</div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(CEFR_VALUE[s.level] / 5) * 100}%`,
                  background: "var(--gradient-mint)",
                }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
              {CEFR_SCALE.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-mint/30 bg-card p-6 shadow-[var(--shadow-soft)]">
        <h3 className="font-heading text-lg font-semibold">Perfil de habilidades</h3>
        <div className="mt-4 flex justify-center">
          <canvas ref={radarRef} width={360} height={280} className="max-w-full" />
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button
          size="lg"
          onClick={onDownload}
          disabled={pdfLoading}
          className="flex-1 shadow-[var(--shadow-elegant)]"
        >
          {pdfLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Descargar mi constancia
        </Button>
        <a href={waUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
          <Button
            size="lg"
            variant="outline"
            className="w-full bg-[#25D366] text-white hover:bg-[#1ebe57] hover:text-white"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Compartir con Teacher Netza
          </Button>
        </a>
      </div>

      <div className="mt-6 flex justify-center">
        <Button variant="ghost" onClick={onReset}>
          <RotateCcw className="mr-2 h-4 w-4" /> Rehacer examen
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------ RADAR ------------------------------ */

function drawRadar(cv: HTMLCanvasElement | null, result: ExamResult) {
  if (!cv) return;
  const ctx = cv.getContext("2d");
  if (!ctx) return;
  const w = cv.width;
  const h = cv.height;
  const cX = w / 2;
  const cY = h / 2;
  const radius = Math.min(w, h) / 2.9;

  ctx.clearRect(0, 0, w, h);

  const data = result.sections.map((s) => s.score);
  const labels = ["Listening", "Reading", "Vocabulary"];
  const sides = 3;
  const step = (Math.PI * 2) / sides;

  ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
  ctx.lineWidth = 1;
  for (let ring = 1; ring <= 4; ring++) {
    ctx.beginPath();
    for (let i = 0; i <= sides; i++) {
      const a = i * step - Math.PI / 2;
      const x = cX + Math.cos(a) * (radius / 4) * ring;
      const y = cY + Math.sin(a) * (radius / 4) * ring;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  }

  ctx.font = "600 11px 'Plus Jakarta Sans', system-ui, sans-serif";
  ctx.fillStyle = "#64748b";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i < sides; i++) {
    const a = i * step - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cX, cY);
    ctx.lineTo(cX + Math.cos(a) * radius, cY + Math.sin(a) * radius);
    ctx.stroke();
    ctx.fillText(labels[i], cX + Math.cos(a) * (radius + 26), cY + Math.sin(a) * (radius + 18));
  }

  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const val = Math.max(4, data[i]);
    const a = i * step - Math.PI / 2;
    const x = cX + Math.cos(a) * (radius * (val / 100));
    const y = cY + Math.sin(a) * (radius * (val / 100));
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = "rgba(86, 214, 178, 0.28)";
  ctx.fill();
  ctx.strokeStyle = "#0f3b4b";
  ctx.lineWidth = 2;
  ctx.stroke();

  for (let i = 0; i < sides; i++) {
    const val = Math.max(4, data[i]);
    const a = i * step - Math.PI / 2;
    const x = cX + Math.cos(a) * (radius * (val / 100));
    const y = cY + Math.sin(a) * (radius * (val / 100));
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.stroke();
  }
}
