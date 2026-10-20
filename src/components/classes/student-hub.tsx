import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, Clock, MessageSquare, ExternalLink, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import {
  type ClassLesson, type HomeworkSubmission, listPlans, listLessons, listSessions, listSubmissions,
  uploadSubmission, slidesEmbed, homeworkState, HW_LABEL, signedShot, nextLesson,
} from "@/lib/classes";
import { Link } from "@tanstack/react-router";
import { LessonThread, AnnouncementBanner } from "./lesson-thread";
import { PLAN_RULES, hoursSummary, monthLabel } from "@/lib/plans";
import { OpenLabButton } from "./lab-frame";

export function StudentHub({ view = "class" }: { view?: "class" | "tasks" }) {
  const { user, profile } = useAuth();
  const sid = user?.id ?? "";
  const plansQ = useQuery({ queryKey: ["classes", "plans", sid], queryFn: () => listPlans(sid), enabled: !!sid });
  const plan = plansQ.data?.find((p) => p.status === "active") ?? plansQ.data?.[0] ?? null;
  const lessonsQ = useQuery({ queryKey: ["classes", "lessons", plan?.id], queryFn: () => listLessons(plan!.id), enabled: !!plan });
  const sessionsQ = useQuery({ queryKey: ["classes", "sessions", plan?.id], queryFn: () => listSessions(plan!.id), enabled: !!plan });
  const subsQ = useQuery({ queryKey: ["classes", "subs", sid], queryFn: () => listSubmissions(sid), enabled: !!sid });

  const lessons = lessonsQ.data ?? [];
  const homework = lessons.filter((l) => l.homework_active && (l.homework_lab_file_id || l.homework_lab_ref));
  const next = nextLesson(lessons);
  const current = (next?.slides_url ? next : null) ?? [...lessons].reverse().find((l) => l.slides_url) ?? null;
  const slidesUrl = current?.slides_url ?? plan?.slides_url ?? null;
  const embed = slidesEmbed(slidesUrl);
  const sum = plan ? hoursSummary({
    plan_key: plan.plan_key, hours_contracted: plan.hours_contracted, carried_hours: plan.carried_hours,
    given: (sessionsQ.data ?? []).map((s) => s.hours), month: plan.month,
  }) : null;

  if (plansQ.isLoading) return <Loader2 className="h-6 w-6 animate-spin text-primary" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{view === "tasks" ? "Mis tareas" : `Hola, ${profile?.full_name?.split(" ")[0] ?? ""}`}</h1>
        <p className="text-sm text-muted-foreground">{view === "tasks" ? "Abre el lab, hazlo y sube la captura de tus resultados." : "Tu próxima clase, tus slides y tus horas del mes."}</p>
      </div>
      {view === "class" && <AnnouncementBanner />}

      {!plan && <Card className="p-8 text-center text-sm text-muted-foreground">Tu plan de clases aparecerá aquí cuando tu teacher lo active.</Card>}

      {view === "class" && plan && sum && (
        <Card className="grid gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div className="min-w-0 space-y-2">
            <p className="text-sm text-muted-foreground">{PLAN_RULES[plan.plan_key].name} · {monthLabel(plan.month)}</p>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary" style={{ width: `${Math.min(100, (sum.given / Math.max(1, sum.total)) * 100)}%` }} />
            </div>
            <p className="flex items-center gap-2 text-sm"><Clock className="h-4 w-4 text-primary" /><b>{sum.given}</b> de {sum.total} h tomadas</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary">{sum.remaining} h restantes</Badge>
            {sum.toMakeUp > 0 && <Badge variant="outline">{sum.toMakeUp} h por reponer</Badge>}
          </div>
        </Card>
      )}

      {view === "class" && next && (
        <Card className="space-y-3 border-primary/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">Próxima clase</p>
              <p className="text-lg font-bold">{next.title}</p>
            </div>
            {homework.length > 0 && <Button asChild variant="outline" size="sm"><Link to="/student/tasks">Ver mis tareas ({homework.filter((l) => homeworkState(l, subsQ.data ?? []) !== "done").length} pendientes)</Link></Button>}
          </div>
          {next.notes && <p className="whitespace-pre-wrap text-sm text-muted-foreground">{next.notes}</p>}
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

      {view === "tasks" && plan && (
        <div className="space-y-3">
          {homework.length === 0 && <Card className="p-6 text-center text-sm text-muted-foreground">No tienes tareas activas por ahora.</Card>}
          <div className="grid gap-3 md:grid-cols-2">
            {homework.map((l) => <HomeworkCard key={l.id} lesson={l} subs={(subsQ.data ?? []).filter((s) => s.lesson_id === l.id)} />)}
          </div>
        </div>
      )}

      {view === "tasks" && (
        <p className="text-sm text-muted-foreground">¿Te asignaron un lab extra del catálogo? Está en <Link to="/student/labs" className="text-primary underline">labs extra</Link>.</p>
      )}

      {view === "class" && lessons.some((l) => l.id !== next?.id && (l.notes || l.material_url)) && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Comentarios y material de tus clases</h2>
          {lessons.filter((l) => l.id !== next?.id && (l.notes || l.material_url)).map((l) => (
            <Card key={l.id} className="p-4 text-sm">
              <p className="font-medium">{l.title}</p>
              {l.notes && <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{l.notes}</p>}
              {l.material_url && <a href={l.material_url} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center text-primary"><ExternalLink className="mr-1 h-3.5 w-3.5" />Material</a>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function HomeworkCard({ lesson, subs }: { lesson: ClassLesson; subs: HomeworkSubmission[] }) {
  const qc = useQueryClient();
  const state = homeworkState(lesson, subs);
  const fileRef = useRef<HTMLInputElement>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const last = subs[0];
  const [thumb, setThumb] = useState<string | null>(null);
  useEffect(() => { if (last) signedShot(last.screenshot_path).then(setThumb); }, [last?.screenshot_path]);

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) return toast.error("Sube una imagen (captura de pantalla)");
    setBusy(true);
    try {
      await uploadSubmission(lesson, f, note.trim() || null);
      toast.success("¡Captura enviada a tu teacher!");
      setNote("");
      qc.invalidateQueries({ queryKey: ["classes", "subs"] });
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  return (
    <Card className={`flex flex-col gap-3 p-4 ${state === "done" ? "border-primary/40 bg-primary/5" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold">{lesson.title}</p>
        <Badge variant={state === "pending" ? "outline" : state === "done" ? "default" : "secondary"}>
          {state === "done" && <CheckCircle2 className="mr-1 h-3.5 w-3.5" />}{HW_LABEL[state]}
        </Badge>
      </div>
      {last?.feedback && (
        <p className="flex gap-2 rounded-md bg-muted p-2 text-sm"><MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{last.feedback}</p>
      )}
      {thumb && <img src={thumb} alt="Tu última captura" className="h-28 w-full rounded-md object-cover" />}
      <div className="mt-auto space-y-2">
        <OpenLabButton labFileId={lesson.homework_lab_file_id} labRef={lesson.homework_lab_ref} label="Hacer lab" size="default" />
        {state !== "done" && (
          <>
            <Input placeholder="Mensaje para tu teacher (opcional)" value={note} onChange={(e) => setNote(e.target.value)} />
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
            <Button variant="outline" className="w-full" disabled={busy} onClick={() => fileRef.current?.click()}>
              {busy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Upload className="mr-1 h-4 w-4" />}Subir captura de resultados
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
