import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Search, ChevronRight, Clock, AlertTriangle } from "lucide-react";
import {
  listStudents, listPlans, listSessionsForPlans, listStudentTeachers, staffNames, listPendingSubmissions,
  listLessonsForPlans, nextLesson,
} from "@/lib/classes";
import { PLAN_RULES, hoursSummary, currentMonth } from "@/lib/plans";

/** Tabla de alumnos con su plan del mes. Admin ve todos; teacher solo los suyos (lo filtra la base de datos). */
export function StudentClassList({ mode, title, subtitle }: { mode: "admin" | "teacher"; title?: string; subtitle?: string }) {
  const [q, setQ] = useState("");
  const data = useQuery({
    queryKey: ["classes", "overview", mode],
    queryFn: async () => {
      const [students, plans, links, names, pending] = await Promise.all([
        listStudents(), listPlans(), listStudentTeachers(), staffNames(), listPendingSubmissions(),
      ]);
      const active = plans.filter((p) => p.status === "active");
      const [sessions, lessons] = await Promise.all([
        listSessionsForPlans(active.map((p) => p.id)), listLessonsForPlans(active.map((p) => p.id)),
      ]);
      return { students, plans: active, links, names, pending, sessions, lessons };
    },
  });

  const rows = useMemo(() => {
    if (!data.data) return [];
    const { students, plans, links, names, pending, sessions, lessons } = data.data;
    const mine = mode === "teacher" ? new Set(links.map((l) => l.student_id)) : null;
    return students
      .filter((s) => !mine || mine.has(s.id))
      .filter((s) => !q || (s.full_name + " " + (s.email ?? "")).toLowerCase().includes(q.toLowerCase()))
      .map((s) => {
        const plan = plans.find((p) => p.student_id === s.id) ?? null;
        const sum = plan ? hoursSummary({
          plan_key: plan.plan_key, hours_contracted: plan.hours_contracted, carried_hours: plan.carried_hours,
          given: sessions.filter((x) => x.plan_id === plan.id).map((x) => x.hours), month: plan.month,
        }) : null;
        return {
          ...s, plan, sum,
          next: plan ? nextLesson(lessons.filter((l) => l.plan_id === plan.id)) : null,
          teachers: links.filter((l) => l.student_id === s.id).map((l) => names[l.teacher_id] ?? "Teacher"),
          toReview: pending.filter((p) => p.student_id === s.id).length,
        };
      });
  }, [data.data, q, mode]);

  const base = mode === "admin" ? "/admin/classes/$studentId" : "/teacher/classes/$studentId";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title ?? (mode === "admin" ? "Alumnos y clases" : "Mis alumnos")}</h1>
          <p className="text-sm text-muted-foreground">
            {subtitle ?? (mode === "admin" ? "Abre un alumno para ponerle los labs de su próxima clase." : "Abre a tu alumno, da la clase con su lab y regístrala al terminar.")}
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Buscar alumno" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      {data.isLoading && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
      {data.error && <p className="text-sm text-destructive">{(data.error as Error).message}</p>}
      {data.data && rows.length === 0 && (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          {mode === "teacher" ? "Aún no tienes alumnos asignados. El admin te los asigna desde Alumnos y clases." : "No hay alumnos todavía. Créalos en Students."}
        </Card>
      )}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((r) => (
          <Link key={r.id} to={base} params={{ studentId: r.id }} className="group">
            <Card className="h-full p-4 transition hover:border-primary hover:shadow-md">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{r.full_name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {r.teachers.length ? `Teacher: ${r.teachers.join(", ")}` : "Sin teacher asignado"}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-primary" />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {r.plan ? (
                  <Badge variant="secondary">{PLAN_RULES[r.plan.plan_key].name} · {r.plan.month.slice(0, 7)}</Badge>
                ) : (
                  <Badge variant="outline">Sin plan {currentMonth().slice(0, 7)}</Badge>
                )}
                {r.toReview > 0 && <Badge>{r.toReview} evidencias por revisar</Badge>}
              </div>
              {r.plan && (
                <p className="mt-3 rounded-md bg-muted px-2.5 py-1.5 text-sm">
                  {r.next ? <>Próxima clase: <b>{r.next.title}</b></> : "Todas las lecciones del mes terminadas"}
                </p>
              )}
              {r.sum && (
                <div className="mt-3 space-y-1 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /><span><b>{r.sum.given}</b> / {r.sum.total} h dadas</span></span>
                    <span className="text-xs font-semibold text-primary">Quedan {r.sum.remaining} h</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-primary" style={{ width: `${Math.min(100, (r.sum.given / Math.max(1, r.sum.total)) * 100)}%` }} />
                  </div>
                  {r.sum.toMakeUp > 0 && (
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <AlertTriangle className="h-3.5 w-3.5" /> {r.sum.toMakeUp} h por reponer
                    </p>
                  )}
                </div>
              )}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
