import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ArrowLeft, Plus, Clock, Trash2, Pencil, CheckCircle2, Loader2, Presentation, FileText, X, CalendarClock, Image as ImageIcon, Upload,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import {
  type ClassLesson, type StudentPlan, type HomeworkSubmission, type LabFile,
  getProfileName, listPlans, listLessons, listSessions, addSession, deleteSession, createPlan, updatePlan,
  updateLesson, addLesson, deleteLesson, listClassLabs, setClassLab, listLabFiles, listSubmissions,
  reviewSubmission, signedShot, listStudentTeachers, listTeachers, assignTeacher, unassignTeacher, staffNames,
  homeworkState, HW_LABEL, catalogLab, deletePlan, nextLesson,
} from "@/lib/classes";
import { PLAN_RULES, hoursSummary, currentMonth, nextMonth, monthLabel, carryOver, type PlanKey } from "@/lib/plans";
import { ALL_LABS } from "@/lib/labs";
import { OpenLabButton } from "./lab-frame";
import { LessonThread } from "./lesson-thread";

type Mode = "admin" | "teacher";

export function StaffStudentHub({ studentId, mode }: { studentId: string; mode: Mode }) {
  const isAdmin = mode === "admin";
  const { user } = useAuth();
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: ["classes"] });

  const nameQ = useQuery({ queryKey: ["classes", "name", studentId], queryFn: () => getProfileName(studentId) });
  const plansQ = useQuery({ queryKey: ["classes", "plans", studentId], queryFn: () => listPlans(studentId) });
  const [planId, setPlanId] = useState<string | null>(null);
  useEffect(() => {
    if (!plansQ.data?.length) { setPlanId(null); return; }
    if (!planId || !plansQ.data.some((p) => p.id === planId)) {
      setPlanId((plansQ.data.find((p) => p.status === "active") ?? plansQ.data[0]).id);
    }
  }, [plansQ.data, planId]);
  const plan = plansQ.data?.find((p) => p.id === planId) ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Link to={isAdmin ? "/admin/classes" : "/teacher/classes"} className="mb-1 inline-flex items-center text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="mr-1 h-4 w-4" /> {isAdmin ? "Alumnos y clases" : "Mis alumnos"}
          </Link>
          <h1 className="truncate text-2xl font-bold">{nameQ.data ?? "…"}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {plansQ.data && plansQ.data.length > 0 && (
            <Select value={planId ?? undefined} onValueChange={setPlanId}>
              <SelectTrigger className="w-56"><SelectValue placeholder="Mes" /></SelectTrigger>
              <SelectContent>
                {plansQ.data.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {monthLabel(p.month)} · {PLAN_RULES[p.plan_key].name}{p.status === "closed" ? " (cerrado)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {isAdmin && <NewPlanButton studentId={studentId} onDone={(id) => { setPlanId(id); refresh(); }} />}
        </div>
      </div>

      {isAdmin && <TeachersCard studentId={studentId} />}

      {plansQ.isLoading && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
      {plansQ.data?.length === 0 && (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          {isAdmin ? "Este alumno aún no tiene plan. Crea su plan del mes con «Nuevo plan»." : "El admin todavía no le asigna un plan a este alumno."}
        </Card>
      )}
      {plan && user && <PlanView plan={plan} isAdmin={isAdmin} userId={user.id} onChanged={refresh} onSelect={setPlanId} />}
    </div>
  );
}

/* ---------------- Teachers ---------------- */
function TeachersCard({ studentId }: { studentId: string }) {
  const qc = useQueryClient();
  const linksQ = useQuery({ queryKey: ["classes", "links", studentId], queryFn: () => listStudentTeachers(studentId) });
  const teachersQ = useQuery({ queryKey: ["classes", "teachers"], queryFn: listTeachers });
  const names = Object.fromEntries((teachersQ.data ?? []).map((t) => [t.id, t.full_name]));
  const free = (teachersQ.data ?? []).filter((t) => !(linksQ.data ?? []).some((l) => l.teacher_id === t.id));
  const run = async (fn: () => Promise<void>) => {
    try { await fn(); qc.invalidateQueries({ queryKey: ["classes"] }); } catch (e: any) { toast.error(e.message); }
  };
  return (
    <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
      <p className="text-sm font-medium">Teacher asignado:</p>
      <div className="flex flex-1 flex-wrap gap-2">
        {(linksQ.data ?? []).map((l) => (
          <Badge key={l.id} variant="secondary" className="gap-1">
            {names[l.teacher_id] ?? "Teacher"}
            <button aria-label="Quitar teacher" onClick={() => run(() => unassignTeacher(l.id))}><X className="h-3 w-3" /></button>
          </Badge>
        ))}
        {linksQ.data?.length === 0 && <span className="text-sm text-muted-foreground">Ninguno</span>}
      </div>
      {free.length > 0 && (
        <Select onValueChange={(v) => run(() => assignTeacher(studentId, v))}>
          <SelectTrigger className="w-full sm:w-56"><SelectValue placeholder="Asignar teacher" /></SelectTrigger>
          <SelectContent>{free.map((t) => <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>)}</SelectContent>
        </Select>
      )}
    </Card>
  );
}

/* ---------------- Nuevo plan ---------------- */
function NewPlanButton({ studentId, onDone }: { studentId: string; onDone: (id: string) => void }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState<PlanKey>("essential");
  const [month, setMonth] = useState(currentMonth().slice(0, 7));
  const [slides, setSlides] = useState("");
  const [busy, setBusy] = useState(false);
  const save = async () => {
    if (!user) return;
    setBusy(true);
    try {
      const p = await createPlan({ student_id: studentId, plan_key: key, month: `${month}-01`, slides_url: slides, created_by: user.id });
      toast.success("Plan creado con sus lecciones");
      setOpen(false); onDone(p.id);
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };
  return (
    <>
      <Button onClick={() => setOpen(true)}><Plus className="mr-1 h-4 w-4" />Nuevo plan</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo plan del mes</DialogTitle>
            <DialogDescription>Se crean automáticamente las lecciones del plan (2 h cada una).</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-3">
              {(Object.keys(PLAN_RULES) as PlanKey[]).map((k) => (
                <button key={k} type="button" onClick={() => setKey(k)}
                  className={`rounded-lg border p-3 text-left text-sm transition ${key === k ? "border-primary bg-primary/10" : "border-border"}`}>
                  <p className="font-semibold">{PLAN_RULES[k].name}</p>
                  <p className="text-xs text-muted-foreground">{PLAN_RULES[k].hoursPerWeek} h/sem · {PLAN_RULES[k].lessons} lecciones</p>
                </button>
              ))}
            </div>
            <div><Label>Mes</Label><Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} /></div>
            <div><Label>Presentación general (Google Slides, opcional)</Label><Input placeholder="https://docs.google.com/presentation/…" value={slides} onChange={(e) => setSlides(e.target.value)} /></div>
          </div>
          <DialogFooter><Button onClick={save} disabled={busy || !month}>{busy && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}Crear plan</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ---------------- Vista del plan ---------------- */
function PlanView({ plan, isAdmin, userId, onChanged, onSelect }: {
  plan: StudentPlan; isAdmin: boolean; userId: string; onChanged: () => void; onSelect: (id: string) => void;
}) {
  const lessonsQ = useQuery({ queryKey: ["classes", "lessons", plan.id], queryFn: () => listLessons(plan.id) });
  const sessionsQ = useQuery({ queryKey: ["classes", "sessions", plan.id], queryFn: () => listSessions(plan.id) });
  const labsQ = useQuery({ queryKey: ["classes", "classlabs", plan.student_id], queryFn: () => listClassLabs(plan.student_id) });
  const subsQ = useQuery({ queryKey: ["classes", "subs", plan.student_id], queryFn: () => listSubmissions(plan.student_id) });
  const filesQ = useQuery({ queryKey: ["classes", "labfiles"], queryFn: listLabFiles });
  const linksQ = useQuery({ queryKey: ["classes", "links", plan.student_id], queryFn: () => listStudentTeachers(plan.student_id) });
  const namesQ = useQuery({ queryKey: ["classes", "staffnames"], queryFn: staffNames });

  const sum = hoursSummary({
    plan_key: plan.plan_key, hours_contracted: plan.hours_contracted, carried_hours: plan.carried_hours,
    given: (sessionsQ.data ?? []).map((s) => s.hours), month: plan.month,
  });
  const lessons = lessonsQ.data ?? [];
  const done = lessons.filter((l) => l.status === "done").length;
  const closed = plan.status === "closed";

  const next = nextLesson(lessons);
  const teacherIds = (linksQ.data ?? []).map((l) => l.teacher_id);
  const others = lessons.filter((l) => l.id !== next?.id);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <Stat label="Horas dadas" value={`${sum.given} / ${sum.total} h`} />
        <Stat label="Horas restantes" value={`${sum.remaining} h`} />
        <Stat label="Por reponer a la fecha" value={`${sum.toMakeUp} h`} hint={plan.carried_hours > 0 ? `Incluye ${plan.carried_hours} h del mes anterior` : undefined} />
        <Stat label="Lecciones terminadas" value={`${done} / ${lessons.length}`} />
      </div>
      {plan.carry_note && <p className="text-sm text-muted-foreground">Nota de horas arrastradas: {plan.carry_note}</p>}

      {next && !closed && (
        <NextLessonPanel lesson={next} isAdmin={isAdmin} userId={userId} plan={plan}
          classLab={(labsQ.data ?? []).find((c) => c.lesson_id === next.id) ?? null}
          files={filesQ.data ?? []} teacherIds={teacherIds} names={namesQ.data ?? {}} onChanged={onChanged} />
      )}
      {!next && lessons.length > 0 && (
        <Card className="p-4 text-sm text-muted-foreground">Todas las lecciones de este mes están terminadas.{isAdmin ? " Puedes cerrar el mes en el panel de la derecha." : ""}</Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)]">
        <details className="group min-w-0 space-y-3" open={!next}>
          <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg border border-border px-4 py-3">
            <span className="font-semibold">Todas las lecciones ({lessons.length})</span>
            <span className="text-xs text-muted-foreground group-open:hidden">Mostrar</span>
            <span className="hidden text-xs text-muted-foreground group-open:inline">Ocultar</span>
          </summary>
          <div className="mt-3 space-y-3">
            {isAdmin && !closed && (
              <Button size="sm" variant="outline" onClick={async () => {
                try { await addLesson(plan, (lessons.at(-1)?.order_index ?? 0) + 1); onChanged(); } catch (e: any) { toast.error(e.message); }
              }}><Plus className="mr-1 h-4 w-4" />Agregar lección</Button>
            )}
            {lessonsQ.isLoading && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
            {others.map((l) => (
              <LessonCard key={l.id} lesson={l} isAdmin={isAdmin}
                classLab={(labsQ.data ?? []).find((c) => c.lesson_id === l.id) ?? null}
                subs={(subsQ.data ?? []).filter((s) => s.lesson_id === l.id)}
                files={filesQ.data ?? []} onChanged={onChanged} />
            ))}
          </div>
        </details>

        <div className="min-w-0 space-y-3">
          {next && (subsQ.data ?? []).some((s) => s.lesson_id === next.id) && (
            <Card className="space-y-2 p-4">
              <p className="font-semibold">Capturas de {next.title}</p>
              {(subsQ.data ?? []).filter((s) => s.lesson_id === next.id).map((s) => <SubmissionRow key={s.id} sub={s} onChanged={onChanged} />)}
            </Card>
          )}
          <SessionsPanel lessons={lessons} sessions={sessionsQ.data ?? []} isAdmin={isAdmin} userId={userId}
            closed={closed} names={namesQ.data ?? {}} onChanged={onChanged} />
          {isAdmin && (
            <PlanAdmin plan={plan} remaining={carryOver(sum.total, sum.given)} userId={userId} onChanged={onChanged} onSelect={onSelect} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Próxima clase ---------------- */
function NextLessonPanel({ lesson, plan, isAdmin, userId, classLab, files, teacherIds, names, onChanged }: {
  lesson: ClassLesson; plan: StudentPlan; isAdmin: boolean; userId: string;
  classLab: { lab_file_id: string | null; lab_ref: string | null } | null; files: LabFile[];
  teacherIds: string[]; names: Record<string, string>; onChanged: () => void;
}) {
  const [title, setTitle] = useState(lesson.title);
  const [slides, setSlides] = useState(lesson.slides_url ?? "");
  const [cls, setCls] = useState(toVal(classLab?.lab_file_id, classLab?.lab_ref));
  const [hw, setHw] = useState(toVal(lesson.homework_lab_file_id, lesson.homework_lab_ref));
  const [busy, setBusy] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  useEffect(() => {
    setTitle(lesson.title); setSlides(lesson.slides_url ?? "");
    setCls(toVal(classLab?.lab_file_id, classLab?.lab_ref)); setHw(toVal(lesson.homework_lab_file_id, lesson.homework_lab_ref));
  }, [lesson.id, lesson.title, lesson.slides_url, lesson.homework_lab_file_id, lesson.homework_lab_ref, classLab?.lab_file_id, classLab?.lab_ref]);

  const save = async () => {
    setBusy(true);
    try {
      const h = fromVal(hw); const c = fromVal(cls);
      await updateLesson(lesson.id, { title: title.trim() || lesson.title, slides_url: slides.trim() || null, homework_lab_file_id: h.file, homework_lab_ref: h.ref });
      await setClassLab(lesson, c.file, c.ref);
      toast.success("Próxima clase lista"); onChanged();
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };
  const classLabName = labName(files, classLab?.lab_file_id, classLab?.lab_ref);
  const hwName = labName(files, lesson.homework_lab_file_id, lesson.homework_lab_ref);

  return (
    <Card className="space-y-4 border-primary/40 p-5 shadow-[var(--shadow-soft)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Próxima clase</p>
          <h2 className="truncate text-xl font-bold">{lesson.title}</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <OpenLabButton labFileId={classLab?.lab_file_id} labRef={classLab?.lab_ref} label="Empezar clase" size="default" />
          {lesson.slides_url && <Button asChild variant="outline"><a href={lesson.slides_url} target="_blank" rel="noreferrer"><Presentation className="mr-1 h-4 w-4" />Slides</a></Button>}
          <Button variant="secondary" onClick={() => setLogOpen(true)}><Clock className="mr-1 h-4 w-4" />Registrar clase</Button>
        </div>
      </div>

      {isAdmin ? (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div><Label>Tema</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div><Label>Google Slides (opcional)</Label><Input value={slides} onChange={(e) => setSlides(e.target.value)} placeholder="https://docs.google.com/presentation/…" /></div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border p-3">
              <Label className="flex items-center gap-1"><Presentation className="h-4 w-4 text-primary" />Lab de clase <span className="font-normal text-muted-foreground">(solo staff)</span></Label>
              <div className="mt-2"><LabSelect value={cls} onChange={setCls} files={files} kind="class" /></div>
            </div>
            <div className="rounded-lg border border-border p-3">
              <Label className="flex items-center gap-1"><FileText className="h-4 w-4 text-primary" />Lab de tarea <span className="font-normal text-muted-foreground">(para el alumno)</span></Label>
              <div className="mt-2"><LabSelect value={hw} onChange={setHw} files={files} kind="homework" /></div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Link to="/admin/lab-library" className="inline-flex items-center text-sm text-primary hover:underline"><Upload className="mr-1 h-4 w-4" />Subir un HTML nuevo a la biblioteca</Link>
            <Button onClick={save} disabled={busy}>{busy && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}Guardar próxima clase</Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 text-sm">
          <div className="rounded-lg border border-border p-3"><p className="text-xs text-muted-foreground">Lab de clase</p><p className="font-medium">{classLabName ?? "El admin aún no lo asigna"}</p></div>
          <div className="rounded-lg border border-border p-3"><p className="text-xs text-muted-foreground">Lab de tarea</p><p className="font-medium">{hwName ?? "Sin tarea"}</p></div>
        </div>
      )}

      <LessonThread lesson={lesson} />

      <RegisterClassDialog open={logOpen} onOpenChange={setLogOpen} lesson={lesson} plan={plan} isAdmin={isAdmin} userId={userId}
        teacherIds={teacherIds} names={names} labTitle={classLabName} hasHomework={!!(lesson.homework_lab_file_id || lesson.homework_lab_ref)} onChanged={onChanged} />
    </Card>
  );
}

function RegisterClassDialog({ open, onOpenChange, lesson, plan, isAdmin, userId, teacherIds, names, labTitle, hasHomework, onChanged }: {
  open: boolean; onOpenChange: (v: boolean) => void; lesson: ClassLesson; plan: StudentPlan; isAdmin: boolean; userId: string;
  teacherIds: string[]; names: Record<string, string>; labTitle: string | null; hasHomework: boolean; onChanged: () => void;
}) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [hours, setHours] = useState("2");
  const [comment, setComment] = useState("");
  const [activateHw, setActivateHw] = useState(true);
  const [finish, setFinish] = useState(true);
  const [teacherId, setTeacherId] = useState(userId);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!open) return;
    setDate(new Date().toISOString().slice(0, 10)); setComment("");
    setTeacherId(isAdmin ? (teacherIds[0] ?? userId) : userId);
  }, [open]);

  const save = async () => {
    const h = Number(hours);
    setBusy(true);
    try {
      const labLine = labTitle ? `Lab: ${labTitle}` : null;
      await addSession({
        plan_id: plan.id, student_id: plan.student_id, teacher_id: teacherId, session_date: date, hours: h,
        lesson_id: lesson.id, comment: [labLine, comment.trim()].filter(Boolean).join("\n") || null,
      });
      const patch: Partial<ClassLesson> = {};
      if (hasHomework && activateHw) patch.homework_active = true;
      if (finish) patch.status = "done";
      if (Object.keys(patch).length) await updateLesson(lesson.id, patch);
      toast.success("Clase registrada"); onOpenChange(false); onChanged();
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar clase · {lesson.title}</DialogTitle>
          <DialogDescription>{labTitle ? `Lab usado: ${labTitle}` : "Sin lab de clase asignado"}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Día</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            <div>
              <Label>Horas trabajadas</Label>
              <Select value={hours} onValueChange={setHours}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["0.5", "1", "1.5", "2", "2.5", "3", "4"].map((h) => <SelectItem key={h} value={h}>{h} h</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          {isAdmin && (
            <div>
              <Label>Quién dio la clase</Label>
              <Select value={teacherId} onValueChange={setTeacherId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={userId}>Yo (admin)</SelectItem>
                  {teacherIds.filter((t) => t !== userId).map((t) => <SelectItem key={t} value={t}>{names[t] ?? "Teacher"}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <div><Label>Comentario</Label><Textarea rows={3} placeholder="Qué se vio, avances, acuerdos…" value={comment} onChange={(e) => setComment(e.target.value)} /></div>
          {hasHomework && (
            <label className="flex items-center justify-between gap-2 text-sm">Activar la tarea para el alumno<Switch checked={activateHw} onCheckedChange={setActivateHw} /></label>
          )}
          <label className="flex items-center justify-between gap-2 text-sm">Marcar lección como dada<Switch checked={finish} onCheckedChange={setFinish} /></label>
        </div>
        <DialogFooter><Button onClick={save} disabled={busy}>{busy && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}Registrar</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </Card>
  );
}

/* ---------------- Historial de horas ---------------- */
function SessionsPanel({ lessons, sessions, isAdmin, userId, closed, names, onChanged }: {
  lessons: ClassLesson[]; sessions: { id: string; session_date: string; hours: number; comment: string | null; teacher_id: string; lesson_id: string | null }[];
  isAdmin: boolean; userId: string; closed: boolean; names: Record<string, string>; onChanged: () => void;
}) {
  return (
    <Card className="space-y-4 p-4">
      <h2 className="flex items-center gap-2 text-lg font-semibold"><Clock className="h-5 w-5 text-primary" />Clases registradas</h2>
      {closed && <p className="text-sm text-muted-foreground">Este mes está cerrado.</p>}
      <div className="space-y-2">
        {sessions.length === 0 && <p className="text-sm text-muted-foreground">Sin clases registradas.</p>}
        {sessions.map((s) => {
          const canDelete = isAdmin || (s.teacher_id === userId && !closed);
          return (
            <div key={s.id} className="rounded-md border border-border p-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{new Date(s.session_date + "T00:00:00").toLocaleDateString("es-MX", { day: "numeric", month: "short" })} · {s.hours} h</span>
                {canDelete && (
                  <button aria-label="Borrar registro" className="text-muted-foreground hover:text-destructive" onClick={async () => {
                    try { await deleteSession(s.id); onChanged(); } catch (e: any) { toast.error(e.message); }
                  }}><Trash2 className="h-4 w-4" /></button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {names[s.teacher_id] ?? "Teacher"}{s.lesson_id ? ` · ${lessons.find((l) => l.id === s.lesson_id)?.title ?? ""}` : ""}
              </p>
              {s.comment && <p className="mt-1 whitespace-pre-wrap">{s.comment}</p>}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ---------------- Cierre de mes (admin) ---------------- */
function PlanAdmin({ plan, remaining, userId, onChanged, onSelect }: {
  plan: StudentPlan; remaining: number; userId: string; onChanged: () => void; onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [carry, setCarry] = useState(String(remaining));
  const [note, setNote] = useState("");
  const [key, setKey] = useState<PlanKey>(plan.plan_key);
  const [slides, setSlides] = useState(plan.slides_url ?? "");
  useEffect(() => { setCarry(String(remaining)); setSlides(plan.slides_url ?? ""); }, [remaining, plan.id]);

  const close = async () => {
    try {
      await updatePlan(plan.id, { status: "closed" });
      const next = await createPlan({
        student_id: plan.student_id, plan_key: key, month: nextMonth(plan.month), slides_url: plan.slides_url,
        carried_hours: Number(carry) || 0, carry_note: note.trim() || null, created_by: userId,
      });
      toast.success("Mes cerrado y plan siguiente creado");
      setOpen(false); onSelect(next.id); onChanged();
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <Card className="space-y-3 p-4">
      <h2 className="flex items-center gap-2 text-lg font-semibold"><CalendarClock className="h-5 w-5 text-primary" />Plan del mes</h2>
      <div>
        <Label>Presentación general (Google Slides)</Label>
        <div className="flex gap-2">
          <Input value={slides} onChange={(e) => setSlides(e.target.value)} placeholder="https://docs.google.com/presentation/…" />
          <Button variant="outline" onClick={async () => { try { await updatePlan(plan.id, { slides_url: slides || null }); toast.success("Guardado"); onChanged(); } catch (e: any) { toast.error(e.message); } }}>Guardar</Button>
        </div>
      </div>
      {plan.status === "active" ? (
        <Button variant="secondary" className="w-full" onClick={() => setOpen(true)}>Cerrar mes y pasar al siguiente</Button>
      ) : (
        <Button variant="outline" className="w-full" onClick={async () => { await updatePlan(plan.id, { status: "active" }); onChanged(); }}>Reabrir este mes</Button>
      )}
      <Button variant="ghost" size="sm" className="w-full text-destructive" onClick={async () => {
        if (!confirm("¿Borrar este plan con sus lecciones, horas y entregas?")) return;
        try { await deletePlan(plan.id); onChanged(); } catch (e: any) { toast.error(e.message); }
      }}><Trash2 className="mr-1 h-4 w-4" />Borrar plan</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cerrar {monthLabel(plan.month)}</DialogTitle>
            <DialogDescription>Se crea el plan de {monthLabel(nextMonth(plan.month))} con sus lecciones.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Plan del siguiente mes</Label>
              <Select value={key} onValueChange={(v) => setKey(v as PlanKey)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{(Object.keys(PLAN_RULES) as PlanKey[]).map((k) => <SelectItem key={k} value={k}>{PLAN_RULES[k].name} · {PLAN_RULES[k].hoursPerWeek} h/sem</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Horas que pasan al siguiente mes</Label><Input type="number" step="0.5" min="0" value={carry} onChange={(e) => setCarry(e.target.value)} /></div>
            <div><Label>Motivo (opcional)</Label><Input placeholder="Ej. acuerdo mutuo por viaje" value={note} onChange={(e) => setNote(e.target.value)} /></div>
          </div>
          <DialogFooter><Button onClick={close}>Cerrar mes</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

/* ---------------- Lección ---------------- */
function labOptions(files: LabFile[], kind: "class" | "homework") {
  const own = files.filter((f) => f.kind === kind);
  const other = files.filter((f) => f.kind !== kind);
  return { own, other };
}

function LabSelect({ value, onChange, files, kind }: { value: string; onChange: (v: string) => void; files: LabFile[]; kind: "class" | "homework" }) {
  const { own, other } = labOptions(files, kind);
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="none">Sin lab</SelectItem>
        {own.length > 0 && (
          <SelectGroup><SelectLabel>Mis labs subidos ({kind === "class" ? "Clase" : "Tarea"})</SelectLabel>
            {own.map((f) => <SelectItem key={f.id} value={`file:${f.id}`}>{f.level.toUpperCase()} · {f.title}</SelectItem>)}
          </SelectGroup>
        )}
        {other.length > 0 && (
          <SelectGroup><SelectLabel>Otros labs subidos</SelectLabel>
            {other.map((f) => <SelectItem key={f.id} value={`file:${f.id}`}>{f.level.toUpperCase()} · {f.title}</SelectItem>)}
          </SelectGroup>
        )}
        <SelectGroup><SelectLabel>Catálogo de labs</SelectLabel>
          {ALL_LABS.map((l) => <SelectItem key={`${l.level}/${l.slug}`} value={`ref:${l.level}/${l.slug}`}>{l.level.toUpperCase()} · {l.title}</SelectItem>)}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

const toVal = (file: string | null | undefined, ref: string | null | undefined) => (file ? `file:${file}` : ref ? `ref:${ref}` : "none");
const fromVal = (v: string) => ({ file: v.startsWith("file:") ? v.slice(5) : null, ref: v.startsWith("ref:") ? v.slice(4) : null });

function labName(files: LabFile[], file: string | null | undefined, ref: string | null | undefined) {
  if (file) return files.find((f) => f.id === file)?.title ?? "Lab subido";
  return catalogLab(ref)?.title ?? null;
}

function LessonCard({ lesson, isAdmin, classLab, subs, files, onChanged }: {
  lesson: ClassLesson; isAdmin: boolean; classLab: { lab_file_id: string | null; lab_ref: string | null } | null;
  subs: HomeworkSubmission[]; files: LabFile[]; onChanged: () => void;
}) {
  const [edit, setEdit] = useState(false);
  const [notes, setNotes] = useState(lesson.notes ?? "");
  const [material, setMaterial] = useState(lesson.material_url ?? "");
  useEffect(() => { setNotes(lesson.notes ?? ""); setMaterial(lesson.material_url ?? ""); }, [lesson.id, lesson.notes, lesson.material_url]);
  const state = homeworkState(lesson, subs);
  const run = async (fn: () => Promise<void>, ok?: string) => {
    try { await fn(); if (ok) toast.success(ok); onChanged(); } catch (e: any) { toast.error(e.message); }
  };
  const hasHomework = !!(lesson.homework_lab_file_id || lesson.homework_lab_ref);
  const classLabName = labName(files, classLab?.lab_file_id, classLab?.lab_ref);
  const hwName = labName(files, lesson.homework_lab_file_id, lesson.homework_lab_ref);

  return (
    <Card className={`space-y-3 p-4 ${lesson.status === "done" ? "border-primary/40 bg-primary/5" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold">{lesson.title}</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <Badge variant={lesson.status === "done" ? "default" : "outline"}>{lesson.status === "done" ? "Lección terminada" : "Lección pendiente"}</Badge>
            {hasHomework && <Badge variant="secondary">Tarea: {HW_LABEL[state]}</Badge>}
          </div>
        </div>
        <div className="flex gap-1">
          {isAdmin && <Button size="sm" variant="ghost" onClick={() => setEdit(true)}><Pencil className="mr-1 h-4 w-4" />Editar</Button>}
          {isAdmin && (
            <Button size="sm" variant="ghost" aria-label="Borrar lección" onClick={() => confirm("¿Borrar esta lección?") && run(() => deleteLesson(lesson.id))}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border p-3">
          <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground"><Presentation className="h-3.5 w-3.5" />Lab de Clase (solo staff)</p>
          <p className="mt-1 truncate text-sm">{classLabName ?? "Sin asignar"}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <OpenLabButton labFileId={classLab?.lab_file_id} labRef={classLab?.lab_ref} label="Presentar" />
            {lesson.slides_url && <Button asChild size="sm" variant="outline"><a href={lesson.slides_url} target="_blank" rel="noreferrer">Slides</a></Button>}
          </div>
        </div>
        <div className="rounded-lg border border-border p-3">
          <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground"><FileText className="h-3.5 w-3.5" />Lab de Tarea</p>
          <p className="mt-1 truncate text-sm">{hwName ?? "Sin asignar"}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <OpenLabButton labFileId={lesson.homework_lab_file_id} labRef={lesson.homework_lab_ref} label="Ver" variant="outline" />
            {hasHomework && (
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={lesson.homework_active} onCheckedChange={(v) => run(() => updateLesson(lesson.id, { homework_active: v }), v ? "Tarea activada para el alumno" : "Tarea oculta")} />
                {lesson.homework_active ? "Activa" : "Inactiva"}
              </label>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
        <div><Label className="text-xs">Comentarios / material de la clase</Label><Textarea rows={1} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Visible para el alumno" /></div>
        <div><Label className="text-xs">Link de material extra</Label><Input value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="https://…" /></div>
        <Button size="sm" variant="outline" onClick={() => run(() => updateLesson(lesson.id, { notes: notes.trim() || null, material_url: material.trim() || null }), "Guardado")}>Guardar</Button>
      </div>

      {subs.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Capturas del alumno</p>
          {subs.map((s) => <SubmissionRow key={s.id} sub={s} onChanged={onChanged} />)}
        </div>
      )}

      <LessonThread lesson={lesson} />

      <div className="flex justify-end">
        {lesson.status === "done" ? (
          <Button size="sm" variant="ghost" onClick={() => run(() => updateLesson(lesson.id, { status: "pending" }))}>Marcar como pendiente</Button>
        ) : (
          <Button size="sm" onClick={() => run(() => updateLesson(lesson.id, { status: "done" }), "Lección terminada")}><CheckCircle2 className="mr-1 h-4 w-4" />Marcar lección terminada</Button>
        )}
      </div>

      {isAdmin && <EditLessonDialog open={edit} onOpenChange={setEdit} lesson={lesson} classLab={classLab} files={files} onChanged={onChanged} />}
    </Card>
  );
}

function SubmissionRow({ sub, onChanged }: { sub: HomeworkSubmission; onChanged: () => void }) {
  const [url, setUrl] = useState<string | null>(null);
  const [feedback, setFeedback] = useState(sub.feedback ?? "");
  useEffect(() => { signedShot(sub.screenshot_path).then(setUrl); }, [sub.screenshot_path]);
  const save = async (status: "reviewed" | "done") => {
    try { await reviewSubmission(sub.id, status, feedback.trim() || null); toast.success(status === "done" ? "Tarea terminada" : "Revisión enviada"); onChanged(); }
    catch (e: any) { toast.error(e.message); }
  };
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-3 sm:flex-row">
      <a href={url ?? undefined} target="_blank" rel="noreferrer" className="block h-28 w-full shrink-0 overflow-hidden rounded-md bg-muted sm:w-40">
        {url ? <img src={url} alt="Captura de resultados" className="h-full w-full object-cover" /> : <ImageIcon className="m-auto mt-10 h-6 w-6 text-muted-foreground" />}
      </a>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant={sub.status === "submitted" ? "default" : "secondary"}>{HW_LABEL[sub.status]}</Badge>
          {new Date(sub.created_at).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })}
        </div>
        {sub.student_note && <p className="text-sm">“{sub.student_note}”</p>}
        <Textarea rows={2} placeholder="Comentario para el alumno" value={feedback} onChange={(e) => setFeedback(e.target.value)} />
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => save("reviewed")}>Marcar revisada</Button>
          <Button size="sm" onClick={() => save("done")}><CheckCircle2 className="mr-1 h-4 w-4" />Marcar terminada</Button>
        </div>
      </div>
    </div>
  );
}

function EditLessonDialog({ open, onOpenChange, lesson, classLab, files, onChanged }: {
  open: boolean; onOpenChange: (v: boolean) => void; lesson: ClassLesson;
  classLab: { lab_file_id: string | null; lab_ref: string | null } | null; files: LabFile[]; onChanged: () => void;
}) {
  const [title, setTitle] = useState(lesson.title);
  const [slides, setSlides] = useState(lesson.slides_url ?? "");
  const [cls, setCls] = useState(toVal(classLab?.lab_file_id, classLab?.lab_ref));
  const [hw, setHw] = useState(toVal(lesson.homework_lab_file_id, lesson.homework_lab_ref));
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!open) return;
    setTitle(lesson.title); setSlides(lesson.slides_url ?? "");
    setCls(toVal(classLab?.lab_file_id, classLab?.lab_ref)); setHw(toVal(lesson.homework_lab_file_id, lesson.homework_lab_ref));
  }, [open]);
  const hasFiles = useMemo(() => files.length > 0, [files]);
  const save = async () => {
    setBusy(true);
    try {
      const h = fromVal(hw); const c = fromVal(cls);
      await updateLesson(lesson.id, { title: title.trim() || lesson.title, slides_url: slides.trim() || null, homework_lab_file_id: h.file, homework_lab_ref: h.ref });
      await setClassLab(lesson, c.file, c.ref);
      toast.success("Lección actualizada"); onOpenChange(false); onChanged();
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar lección</DialogTitle>
          <DialogDescription>
            {hasFiles ? "Elige un lab que subiste o uno del catálogo." : <>Aún no subes labs HTML. Súbelos en <Link to="/admin/lab-library" className="text-primary underline">Biblioteca de labs</Link>, o usa uno del catálogo.</>}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div><Label>Título / tema</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} /></div>
          <div><Label>Google Slides de la clase</Label><Input value={slides} onChange={(e) => setSlides(e.target.value)} placeholder="https://docs.google.com/presentation/…" /></div>
          <div><Label>Lab de Clase (solo lo ven teacher y admin)</Label><LabSelect value={cls} onChange={setCls} files={files} kind="class" /></div>
          <div><Label>Lab de Tarea (el alumno lo ve cuando se activa)</Label><LabSelect value={hw} onChange={setHw} files={files} kind="homework" /></div>
        </div>
        <DialogFooter><Button onClick={save} disabled={busy}>{busy && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}Guardar</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
