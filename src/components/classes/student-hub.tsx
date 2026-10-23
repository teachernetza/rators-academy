import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2, MessageSquare, ExternalLink, CheckCircle2, AlertCircle, CalendarDays, User } from "lucide-react";
import { useAuth } from "@/lib/auth";
import {
  type ClassLesson, type HomeworkSubmission, listPlans, listLessons, listSessions, listSubmissions,
  slidesEmbed, homeworkState, HW_LABEL, signedShot, nextLesson, staffNames, listStudentSessions, catalogLab,
} from "@/lib/classes";
import { LessonThread, AnnouncementBanner } from "./lesson-thread";
import { PLAN_RULES, hoursSummary, monthLabel } from "@/lib/plans";
import { OpenLabButton } from "./lab-frame";
import { EvidenceUpload } from "./evidence-upload";

const fmtDate = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short" });

export function StudentHub({ view = "class" }: { view?: "class" | "tasks" }) {
  const { user, profile } = useAuth();
  const sid = user?.id ?? "";
  const plansQ = useQuery({ queryKey: ["classes", "plans", sid], queryFn: () => listPlans(sid), enabled: !!sid });
  const plan = plansQ.data?.find((p) => p.status === "active") ?? plansQ.data?.[0] ?? null;
  const lessonsQ = useQuery({ queryKey: ["classes", "lessons", plan?.id], queryFn: () => listLessons(plan!.id), enabled: !!plan });
  const sessionsQ = useQuery({ queryKey: ["classes", "sessions", plan?.id], queryFn: () => listSessions(plan!.id), enabled: !!plan });
  const historyQ = useQuery({ queryKey: ["classes", "history", sid], queryFn: () => listStudentSessions(sid), enabled: !!sid && view === "class" });
  const subsQ = useQuery({ queryKey: ["classes", "subs", sid], queryFn: () => listSubmissions(sid), enabled: !!sid });
  const namesQ = useQuery({ queryKey: ["classes", "staffnames"], queryFn: staffNames });
  const allLessonsQ = useQuery({ queryKey: ["classes", "alllessons", sid], queryFn: async () => {
    const plans = plansQ.data ?? [];
    return (await Promise.all(plans.map((p) => listLessons(p.id)))).flat();
  }, enabled: !!plansQ.data && view === "class" });

  const lessons = lessonsQ.data ?? [];
  const subs = subsQ.data ?? [];
  const homework = lessons.filter((l) => l.homework_active && (l.homework_lab_file_id || l.homework_lab_ref));
  const missing = homework.filter((l) => homeworkState(l, subs) === "pending" || homeworkState(l, subs) === "reviewed");
  const next = nextLesson(lessons);
  const current = (next?.slides_url ? next : null) ?? [...lessons].reverse().find((l) => l.slides_url) ?? null;
  const slidesUrl = current?.slides_url ?? plan?.slides_url ?? null;
  const embed = slidesEmbed(slidesUrl);
  const sum = plan ? hoursSummary({
    plan_key: plan.plan_key, hours_contracted: plan.hours_contracted, carried_hours: plan.carried_hours,
    given: (sessionsQ.data ?? []).map((s) => s.hours), month: plan.month,
  }) : null;
  const names = namesQ.data ?? {};
  const lessonById = (id: string | null) => (allLessonsQ.data ?? []).find((l) => l.id === id) ?? null;

  if (plansQ.isLoading) return <Loader2 className="h-6 w-6 animate-spin text-primary" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{view === "tasks" ? "Mis tareas" : `Hola, ${profile?.full_name?.split(" ")[0] ?? ""}`}</h1>
        <p className="text-sm text-muted-foreground">{view === "tasks" ? "Abre el lab, hazlo y sube la captura de tus resultados." : "Tus horas, tu próxima clase y tu historial."}</p>
      </div>
      {view === "class" && <AnnouncementBanner />}

      {!plan && <Card className="p-8 text-center text-sm text-muted-foreground">Tu plan de clases aparecerá aquí cuando tu teacher lo active.</Card>}

      {missing.length > 0 && (
        <Card className="flex flex-wrap items-center gap-3 border-accent bg-accent/15 p-4">
          <AlertCircle className="h-5 w-5 shrink-0 text-foreground" />
          <p className="min-w-0 flex-1 text-sm">
            <b>{missing.length} {missing.length === 1 ? "tarea necesita" : "tareas necesitan"} tu evidencia:</b> {missing.map((l) => l.title).join(", ")}
          </p>
          {view === "class" && <Button asChild size="sm"><Link to="/student/tasks">Subir ahora</Link></Button>}
        </Card>
      )}

      {view === "class" && plan && sum && (
        <Card className="space-y-3 p-4">
          <p className="text-sm text-muted-foreground">{PLAN_RULES[plan.plan_key].name} · {monthLabel(plan.month)}</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Mini label="Horas del plan" value={`${sum.total} h`} />
            <Mini label="Tomadas" value={`${sum.given} h`} />
            <Mini label="Te quedan" value={`${sum.remaining} h`} strong />
            <Mini label="Por reponer" value={`${sum.toMakeUp} h`} />
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary" style={{ width: `${Math.min(100, (sum.given / Math.max(1, sum.total)) * 100)}%` }} />
          </div>
        </Card>
      )}

      {view === "class" && next && (
        <Card className="space-y-3 border-primary/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Próxima clase · Lección {next.order_index}</p>
          <p className="text-lg font-bold">{next.title}</p>
          {next.notes && <p className="whitespace-pre-wrap text-sm text-muted-foreground">{next.notes}</p>}
          {next.material_url && <a href={next.material_url} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm text-primary"><ExternalLink className="mr-1 h-3.5 w-3.5" />Material</a>}
          <LessonThread lesson={next} />
        </Card>
      )}

      {view === "class" && embed && (
        <Card className="overflow-hidden p-0">
          <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2">
            <p className="truncate text-sm font-medium">{current?.title ?? "Presentación"}</p>
            <a href={slidesUrl!} target="_blank" rel="noreferrer" className="inline-flex items-center text-xs text-primary"><ExternalLink className="mr-1 h-3.5 w-3.5" />Abrir</a>
          </div>
          <div className="relative w-full" style={{ paddingTop: "59.27%" }}>
            <iframe title="Presentación" src={embed} className="absolute inset-0 h-full w-full" allowFullScreen />
          </div>
        </Card>
      )}

      {view === "class" && (historyQ.data?.length ?? 0) > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Historial de clases</h2>
          <div className="space-y-2">
            {historyQ.data!.map((s) => {
              const l = lessonById(s.lesson_id);
              const hw = l ? (catalogLab(l.homework_lab_ref)?.title ?? (l.homework_lab_file_id ? "Lab de tarea" : null)) : null;
              return (
                <Card key={s.id} className="p-3 text-sm">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1 font-medium"><CalendarDays className="h-4 w-4 text-primary" />{fmtDate(s.session_date)}</span>
                    <Badge variant="secondary">{s.hours} h</Badge>
                    <span className="flex items-center gap-1 text-muted-foreground"><User className="h-4 w-4" />{names[s.teacher_id] ?? "Teacher"}</span>
                  </div>
                  {l && <p className="mt-1"><b>Tema:</b> {l.title}{hw ? <span className="text-muted-foreground"> · Tarea: {hw}</span> : null}</p>}
                  {s.comment && <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{s.comment}</p>}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {view === "tasks" && plan && (
        <div className="space-y-3">
          {homework.length === 0 && <Card className="p-6 text-center text-sm text-muted-foreground">No tienes tareas activas por ahora.</Card>}
          <div className="grid gap-3 md:grid-cols-2">
            {homework.map((l) => <HomeworkCard key={l.id} lesson={l} subs={subs.filter((s) => s.lesson_id === l.id)} />)}
          </div>
        </div>
      )}

      {view === "tasks" && (
        <p className="text-sm text-muted-foreground">¿Te asignaron un lab extra del catálogo? Está en <Link to="/student/labs" className="text-primary underline">labs extra</Link>.</p>
      )}
    </div>
  );
}

function Mini({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`rounded-lg border p-2.5 ${strong ? "border-primary bg-primary/5" : "border-border"}`}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-lg font-bold ${strong ? "text-primary" : ""}`}>{value}</p>
    </div>
  );
}

function Shot({ path }: { path: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [big, setBig] = useState(false);
  useEffect(() => { signedShot(path).then(setUrl); }, [path]);
  if (!url) return <div className="aspect-video rounded-md bg-muted" />;
  return (
    <>
      <button onClick={() => setBig(true)} className="block aspect-video overflow-hidden rounded-md border border-border">
        <img src={url} alt="Captura enviada" className="h-full w-full object-cover" />
      </button>
      <Dialog open={big} onOpenChange={setBig}>
        <DialogContent className="max-w-4xl p-2"><img src={url} alt="Captura enviada" className="max-h-[85vh] w-full object-contain" /></DialogContent>
      </Dialog>
    </>
  );
}

function HomeworkCard({ lesson, subs }: { lesson: ClassLesson; subs: HomeworkSubmission[] }) {
  const state = homeworkState(lesson, subs);
  const fb = subs.find((s) => s.feedback);
  return (
    <Card className={`flex flex-col gap-3 p-4 ${state === "done" ? "border-primary/40 bg-primary/5" : state === "pending" || state === "reviewed" ? "border-accent" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-muted-foreground">Lección {lesson.order_index}</p>
          <p className="font-semibold">{lesson.title}</p>
        </div>
        <Badge variant={state === "pending" || state === "reviewed" ? "outline" : state === "done" ? "default" : "secondary"}>
          {state === "done" && <CheckCircle2 className="mr-1 h-3.5 w-3.5" />}{HW_LABEL[state]}
        </Badge>
      </div>
      {fb?.feedback && (
        <p className="flex gap-2 rounded-md bg-muted p-2 text-sm"><MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{fb.feedback}</p>
      )}
      {subs.length > 0 && <div className="grid grid-cols-3 gap-2">{subs.slice(0, 6).map((s) => <Shot key={s.id} path={s.screenshot_path} />)}</div>}
      <div className="mt-auto space-y-2">
        <OpenLabButton labFileId={lesson.homework_lab_file_id} labRef={lesson.homework_lab_ref} lessonId={lesson.id} label="Hacer lab" size="default" variant="outline" />
        {state !== "done" && <EvidenceUpload lesson={lesson} />}
      </div>
    </Card>
  );
}
