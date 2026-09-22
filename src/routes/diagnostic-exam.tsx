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
  Clock,
  Check,
  Zap,
  ShieldCheck,
  ClipboardCheck,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  computeResult,
  modeListening,
  modeReading,
  modeVocab,
  totalQuestions,
  EXAM_MODES,
  SECTION_NAMES,
  SECTION_ORDER,
  CEFR_DESCRIPTION,
  CEFR_SCALE,
  CEFR_VALUE,
  type Answers,
  type ExamMode,
  type ExamResult,
  type Question,
} from "@/lib/diagnostic-bank";
import { generateDiagnosticPdf } from "@/lib/diagnostic-pdf";
import { AudioPlayer } from "@/components/AudioPlayer";
import diagnosticStart from "@/assets/diagnostic-start.jpg";

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

const STORAGE_KEY = "netza.diagnostic.v4";
const WA_NUMBER = "523231116425";

type SavedState = {
  studentName: string;
  step: number;
  answers: Answers;
  mode: ExamMode;
  version: 5;
};

function loadState(): SavedState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedState;
    if (parsed?.version !== 5) return null;
    return parsed;
  } catch {
    return null;
  }
}

function DiagnosticExam() {
  // Step 0 = start, 1..3 = sections, 4 = results
  const [step, setStep] = useState(0);
  const [studentName, setStudentName] = useState("");
  const [mode, setMode] = useState<ExamMode>("quick");
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
      const savedMode: ExamMode = saved.mode === "full" ? "full" : "quick";
      setMode(savedMode);
      setAnswers(a);
      const savedStep = Number(saved.step) || 0;
      if (savedStep >= 4) {
        setResult(computeResult(a, savedMode));
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
      JSON.stringify({ studentName, step, answers, mode, version: 5 }),
    );
  }, [studentName, step, answers, mode]);

  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  function resetExam() {
    if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
    setStudentName("");
    setMode("quick");
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
    const unanswered = total - answeredCount;
    if (unanswered > 0) {
      const proceed = window.confirm(
        `Aún tienes ${unanswered} ${unanswered === 1 ? "reactivo sin responder" : "reactivos sin responder"}. Se calificarán sin puntos. ¿Quieres terminar?`,
      );
      if (!proceed) return;
    }
    setResult(computeResult(answers, mode));
    setStep(4);
    toast.success("¡Examen calificado!");
  }

  const total = useMemo(() => totalQuestions(mode), [mode]);
  const answeredIds = useMemo(
    () =>
      new Set([
        ...modeListening(mode).flatMap((a) => a.questions.map((q) => q.id)),
        ...modeReading(mode).flatMap((p) => p.questions.map((q) => q.id)),
        ...modeVocab(mode).map((q) => q.id),
      ]),
    [mode],
  );
  const answeredCount = useMemo(
    () => Object.keys(answers).filter((id) => answeredIds.has(id)).length,
    [answers, answeredIds],
  );
  const progress = step === 0 ? 0 : Math.round((answeredCount / total) * 100);
  const sectionKey = step >= 1 && step <= 3 ? SECTION_ORDER[step - 1] : null;

  return (
    <div className="relative min-h-screen overflow-x-clip bg-background text-foreground">
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
        className="tn-float pointer-events-none fixed -right-32 top-24 -z-10 hidden h-[380px] w-[380px] rounded-full opacity-20 blur-3xl sm:block"
        style={{ background: "var(--gradient-mint)" }}
      />

      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 shadow-[var(--shadow-soft)] backdrop-blur-xl">
        <div aria-hidden className="tn-diag h-1 w-full opacity-70" />
        <div className="mx-auto grid h-16 max-w-5xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 sm:flex sm:justify-between sm:px-6">
          <Link to="/" className="group flex min-w-0 items-center gap-3">
            <span className="glow-logo-sm">
              <img
                src="/icono_teacher_netza.png"
                alt="Teacher Netza"
                className="h-9 w-9 rounded-lg object-contain transition-transform duration-500 group-hover:scale-110"
              />
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate font-heading text-sm font-bold sm:text-lg">
                Examen Diagnóstico
              </span>
              <span className="hidden text-xs text-muted-foreground sm:block">
                Teacher Netza Varo
              </span>
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-1">
            <ThemeToggle />
            <Link
              to="/"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
            >
              <span className="sm:hidden">← Inicio</span>
              <span className="hidden sm:inline">← Volver al inicio</span>
            </Link>
          </div>
        </div>
        {sectionKey && (
          <div className="mx-auto max-w-5xl px-4 pb-3 sm:px-6">
            <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                {[1, 2, 3].map((s) => (
                  <span
                    key={s}
                    className={cn(
                      "rounded-full px-2.5 py-1 font-semibold transition-colors",
                      s === step
                        ? "bg-primary text-primary-foreground"
                        : s < step
                          ? "bg-mint/15 text-primary"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {s === 1 ? "Listening" : s === 2 ? "Reading" : "Vocabulary"}
                  </span>
                ))}
              </div>
              <span className="shrink-0 font-semibold text-primary">
                {answeredCount}/{total} · {progress}%
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
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


      <main
        key={step}
        className={cn(
          "animate-fade-in mx-auto w-full px-4 py-6 sm:px-6 lg:py-14",
          step === 0 ? "max-w-5xl" : "max-w-3xl",
        )}
      >
        {step === 0 && (
          <StartScreen
            name={studentName}
            onName={setStudentName}
            mode={mode}
            onMode={setMode}
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

        {step === 1 && <ListeningSection mode={mode} answers={answers} onAnswer={answer} />}
        {step === 2 && <ReadingSection mode={mode} answers={answers} onAnswer={answer} />}
        {step === 3 && <VocabSection mode={mode} answers={answers} onAnswer={answer} />}

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
  mode,
  onMode,
  onStart,
  onReset,
  hasProgress,
}: {
  name: string;
  onName: (v: string) => void;
  mode: ExamMode;
  onMode: (m: ExamMode) => void;
  onStart: () => void;
  onReset: () => void;
  hasProgress: boolean;
}) {
  const stats = (m: ExamMode) => ({
    listening: modeListening(m),
    reading: modeReading(m).length,
    vocab: modeVocab(m).length,
    total: totalQuestions(m),
  });
  const blocks = (m: ExamMode) => {
    const s = stats(m);
    return [
      {
        icon: Headphones,
        title: "Listening",
        desc: `${s.listening.length} audios reales · ${s.listening.reduce((a, x) => a + x.questions.length, 0)} preguntas`,
      },
      {
        icon: BookOpen,
        title: "Reading",
        desc: `${s.reading} lecturas · ${modeReading(m).reduce((a, p) => a + p.questions.length, 0)} preguntas`,
      },
      {
        icon: Type,
        title: "Vocabulary & Use",
        desc: `Gramática y modismos · ${s.vocab} preguntas`,
      },
    ];
  };
  const modes: ExamMode[] = ["quick", "full"];
  return (
    <div className="exam-start mx-auto w-full min-w-0 max-w-4xl overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-elegant)]">
      <div className="grid bg-exam-primary text-primary-foreground lg:grid-cols-[1.35fr_.65fr]">
        <div className="p-7 sm:p-9">
          <span className="inline-flex items-center gap-2 rounded-full bg-exam-yellow px-3 py-1 text-xs font-bold text-exam-ink">
            <Sparkles className="h-3.5 w-3.5" /> Gratis · sin registro
          </span>
          <h1 className="mt-5 max-w-xl font-heading text-3xl font-bold sm:text-4xl">
            Ubica tu nivel de inglés con mejor evidencia
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-primary-foreground/85 sm:text-base">
            Evalúa Listening, Reading y Use of English. Obtendrás un rango MCER, el nivel de
            confianza y un informe descargable con tus fortalezas.
          </p>
          <div className="mt-5 flex flex-wrap gap-4 text-xs font-semibold text-primary-foreground/90">
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-exam-yellow" /> Respuestas con clave única</span>
            <span className="flex items-center gap-1.5"><ClipboardCheck className="h-4 w-4 text-exam-yellow" /> Resultado orientativo</span>
          </div>
        </div>
        <div className="relative hidden min-h-64 overflow-hidden lg:block">
          <img src={diagnosticStart} alt="Estudiante realizando una evaluación de inglés en línea" width={1200} height={912} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-exam-primary to-transparent" />
        </div>
      </div>

      <div className="grid min-w-0 gap-5 p-5 sm:p-8 lg:grid-cols-[minmax(0,.82fr)_minmax(0,1.4fr)] lg:gap-x-8 lg:gap-y-5">
          <div className="min-w-0 lg:col-start-1 lg:row-start-1">
            <label htmlFor="student-name" className="text-sm font-semibold">Nombre completo</label>
            <Input id="student-name" value={name} onChange={(e) => onName(e.target.value)} placeholder="Ej. María López" onKeyDown={(e) => e.key === "Enter" && onStart()} className="mt-2 h-12 bg-background" />
            <p className="mt-2 text-xs text-muted-foreground">Aparecerá en tu informe personal.</p>
          </div>

        <div className="min-w-0 lg:col-start-2 lg:row-span-4 lg:row-start-1">
          <div className="mb-3 font-heading text-sm font-bold">Selecciona la modalidad</div>
          <div className="grid min-w-0 gap-3 sm:grid-cols-2">
          {modes.map((m) => {
            const info = EXAM_MODES[m];
            const s = stats(m);
            const active = mode === m;
            return (
              <Button
                key={m}
                type="button"
                variant="outline"
                onClick={() => onMode(m)}
                aria-pressed={active}
                  className={cn(
                    "group relative h-auto min-h-48 w-full min-w-0 max-w-full flex-col items-start justify-start overflow-hidden whitespace-normal rounded-xl border-2 p-5 text-left transition-all duration-300",
                  active
                    ? "border-exam-primary bg-exam-cyan/10 shadow-[var(--shadow-soft)]"
                    : "border-border bg-card hover:border-exam-cyan",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors",
                    active ? "border-exam-primary bg-exam-primary text-primary-foreground" : "border-border",
                  )}
                >
                  {active && <Check className="h-3.5 w-3.5" />}
                </span>
                <div
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-500 group-hover:scale-105",
                    active ? "bg-exam-primary text-primary-foreground" : "bg-muted text-primary",
                  )}
                >
                  {m === "quick" ? <Zap className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                </div>
                <div className="mt-4 w-full min-w-0 pr-8 font-heading text-lg font-bold">{info.label}</div>
                <div className="mt-1 flex w-full min-w-0 flex-wrap items-center gap-1.5">
                  <span className="text-sm font-semibold text-primary">{info.duration}</span>
                  {m === "full" && <span className="inline-flex rounded-full bg-exam-yellow px-2 py-0.5 text-[9px] font-bold text-exam-ink">RECOMENDADO</span>}
                </div>
                <p className="mt-2 w-full text-xs leading-relaxed text-muted-foreground">
                  {info.description}
                </p>
                <div className="mt-4 flex w-full flex-wrap gap-2 text-[11px] font-semibold">
                  <span className="rounded-full bg-muted px-2.5 py-1">
                    {s.listening.length} audios
                  </span>
                  <span className="rounded-full bg-muted px-2.5 py-1">{s.total} preguntas</span>
                </div>
              </Button>
            );
          })}
          </div>
          <div className="mt-3 grid min-w-0 gap-2 sm:grid-cols-3">
          {blocks(mode).map((b, i) => {
            return (
              <div
                key={b.title}
                className="rounded-xl border border-border bg-background p-3 text-left"
              >
                <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", i === 2 ? "bg-exam-yellow text-exam-ink" : "bg-exam-cyan/15 text-exam-primary")}>
                  <b.icon className="h-4.5 w-4.5" />
                </div>
                <div className="mt-3 font-heading text-sm font-bold">{b.title}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{b.desc}</div>
              </div>
            );
          })}
          </div>
        </div>

        <div className="min-w-0 rounded-xl bg-secondary p-4 text-sm lg:col-start-1 lg:row-start-2">
          <div className="font-heading font-bold">Antes de comenzar</div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Elige una sola respuesta por reactivo. Usa audífonos y responde sin traductor para obtener una estimación más fiel.</p>
        </div>
        <div className="min-w-0 lg:col-start-1 lg:row-start-3">
          <Button onClick={onStart} size="lg" className="h-12 w-full bg-exam-primary text-primary-foreground shadow-[var(--shadow-elegant)] hover:bg-exam-primary/90">
            Comenzar evaluación <ArrowUpRight className="h-4 w-4" />
          </Button>
          {hasProgress && <Button variant="ghost" onClick={onReset} className="mt-2 w-full"><RotateCcw className="mr-2 h-4 w-4" /> Reiniciar progreso</Button>}
        </div>
      </div>
      <div className="border-t border-border bg-secondary/50 px-5 py-3 text-center text-xs text-muted-foreground sm:px-8">
        Este diagnóstico estima habilidades receptivas y uso del idioma. Speaking y Writing requieren evaluación adicional.
      </div>
    </div>
  );
}

/* --------------------------- REUSABLE PIECES --------------------------- */

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6 rounded-2xl border border-border bg-card/85 p-5 shadow-[var(--shadow-soft)] backdrop-blur">
      <div className="flex items-center gap-3">
        <span
          aria-hidden
          className="h-8 w-1.5 rounded-full"
          style={{ background: "var(--gradient-mint)" }}
        />
        <h2 className="font-heading text-2xl font-bold sm:text-3xl">{title}</h2>
      </div>
      <p className="mt-2 text-sm text-muted-foreground sm:text-base">{description}</p>
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
    <div
      className={cn(
        "rounded-2xl border bg-card/85 p-5 shadow-[var(--shadow-soft)] backdrop-blur transition-all duration-500 sm:p-6",
        selected !== undefined ? "border-mint/45" : "border-border hover:border-mint/40",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-heading text-xs font-bold",
            selected !== undefined
              ? "bg-mint text-white"
              : "bg-muted text-muted-foreground",
          )}
        >
          {index}
        </span>
        <div className="text-base font-medium leading-snug">{q.q}</div>
      </div>
      <div className="mt-4 space-y-2 sm:pl-10">
        {q.opts.map((opt, oi) => {
          const active = selected === oi;
          return (
            <label
              key={oi}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 text-sm transition-all duration-300",
                active
                  ? "border-mint bg-mint/12 font-medium shadow-[0_0_18px_-8px_var(--mint)]"
                  : "border-border bg-background hover:border-mint/50 hover:bg-mint/5",
              )}
            >
              <input
                type="radio"
                name={`q-${q.id}`}
                value={oi}
                checked={active}
                onChange={() => onAnswer(q.id, oi)}
                className="sr-only"
              />
              <span
                aria-hidden
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold transition-colors",
                  active ? "border-mint bg-mint text-white" : "border-border text-muted-foreground",
                )}
              >
                {String.fromCharCode(65 + oi)}
              </span>
              <span className="leading-snug">{opt.text}</span>
            </label>
          );
        })}
      </div>
    </div>
  );

}

/* ------------------------------ SECTIONS ------------------------------ */

function ListeningSection({
  mode,
  answers,
  onAnswer,
}: {
  mode: ExamMode;
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
        {modeListening(mode).map((item, ai) => (
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
              <AudioPlayer src={item.src} />
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
  mode,
  answers,
  onAnswer,
}: {
  mode: ExamMode;
  answers: Answers;
  onAnswer: (id: string, v: number) => void;
}) {
  let n = 0;
  return (
    <div>
      <SectionHeading
        title="Reading"
        description={`${modeReading(mode).length} lecturas con preguntas de comprensión.`}
      />

      <div className="space-y-8">
        {modeReading(mode).map((p) => (
          <div key={p.id} className="space-y-4">
            <div className="rounded-xl border border-mint/30 bg-secondary/40 p-5">
              {p.image && (
                <img src={p.image} alt={p.imageAlt ?? "Ilustración de apoyo para la lectura"} loading="lazy" width={1200} height={720} className="mb-4 aspect-[5/2] w-full rounded-lg object-cover" />
              )}
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {p.kind === "long" ? "Lectura larga" : "Lectura corta"} · {p.title}
              </div>
              <div className="mt-2 space-y-3 text-sm leading-relaxed">
                {p.text.split("\n\n").map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
              {p.visual && (
                <div className="mt-4 overflow-hidden rounded-lg border border-border bg-card" role="figure" aria-label={`Información visual: ${p.visual.title}`}>
                  <div className="bg-exam-primary px-4 py-2 font-heading text-sm font-bold text-primary-foreground">{p.visual.title}</div>
                  <dl className="divide-y divide-border">
                    {p.visual.rows.map((row) => (
                      <div key={row.label} className="grid grid-cols-[1fr_1.2fr] gap-3 px-4 py-2.5 text-xs sm:text-sm">
                        <dt className="font-semibold">{row.label}</dt>
                        <dd className="text-muted-foreground">{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
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
  mode,
  answers,
  onAnswer,
}: {
  mode: ExamMode;
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
        {modeVocab(mode).map((q, i) => (
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
          Estimación general (MCER)
        </div>
        <div className="mt-2 bg-[image:var(--gradient-hero)] bg-clip-text font-heading text-7xl font-black text-transparent">
          {result.band}
        </div>
        <div className="mt-2 text-lg">
          <strong>{studentName}</strong>
        </div>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          {CEFR_DESCRIPTION[result.overall]}
        </p>
        <div className="mt-4 inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
          Confianza {result.confidence.toLowerCase()} · {result.mode === "quick" ? "estimación inicial" : "evaluación ampliada"}
        </div>
        {result.uneven ? (
          <p className="mx-auto mt-3 max-w-xl text-xs font-medium text-primary">
            Tu perfil es desigual ({result.skillRange}): guíate por el nivel de cada habilidad y refuerza la más baja
            antes de asumir el nivel general.
          </p>
        ) : null}
        <p className="mx-auto mt-3 max-w-xl text-xs text-muted-foreground">
          El nivel general es el promedio de las tres habilidades; cada una se otorga solo con dominio comprobado del
          nivel y de los anteriores, y el puntaje está ajustado por azar.
          {result.mode === "quick" ? " El examen rápido llega como máximo a B2." : ""} Este resultado cubre Listening, Reading y Use of
          English. Speaking y Writing requieren una evaluación adicional.
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
  ctx.fillStyle = "rgba(22, 73, 255, 0.2)";
  ctx.fill();
  ctx.strokeStyle = "#1649ff";
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
