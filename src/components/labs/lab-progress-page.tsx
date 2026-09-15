import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, FlaskConical, ChevronDown, ChevronRight, Trophy } from "lucide-react";
import { labProgressOverview } from "@/lib/labs.functions";
import { findLab } from "@/lib/labs";
import { AssignLabDialog } from "@/components/labs/assign-lab-dialog";

function pct(score: number | null, max: number | null) {
  if (!max || score == null) return null;
  return Math.round((score / max) * 100);
}

export function LabProgressPage() {
  const fn = useServerFn(labProgressOverview);
  const q = useQuery({ queryKey: ["lab-progress", "overview"], queryFn: () => fn() });
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = (q.data ?? []).filter((r: any) => r.assigned > 0 || r.attempts > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold">Progreso de Labs</h1>
          <p className="mt-1 text-muted-foreground">
            Cuántos labs ha hecho cada alumno y con qué puntaje.
          </p>
        </div>
        <AssignLabDialog trigger={<Button>Asignar Lab</Button>} />
      </div>

      {q.isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : rows.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          <FlaskConical className="mx-auto mb-3 h-7 w-7 opacity-50" />
          Todavía no hay labs asignados. Usa “Asignar Lab” para empezar.
        </Card>
      ) : (
        <div className="space-y-3">
          {rows.map((r: any) => {
            const open = openId === r.student_id;
            return (
              <Card key={r.student_id} className="overflow-hidden">
                <button
                  className="flex w-full flex-wrap items-center justify-between gap-4 p-4 text-left hover:bg-muted/40"
                  onClick={() => setOpenId(open ? null : r.student_id)}
                >
                  <div className="min-w-[180px] flex-1">
                    <p className="flex items-center gap-2 font-semibold">
                      {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      {r.full_name}
                    </p>
                    <p className="pl-6 text-xs text-muted-foreground">
                      {r.completed} de {r.assigned} labs completados
                      {r.last_activity
                        ? ` · último: ${new Date(r.last_activity).toLocaleDateString()}`
                        : ""}
                    </p>
                  </div>
                  <div className="w-40">
                    <Progress value={r.progress} />
                    <p className="mt-1 text-right text-xs text-muted-foreground">{r.progress}%</p>
                  </div>
                  <div className="flex w-28 items-center justify-end gap-2">
                    <Trophy className="h-4 w-4 text-primary" />
                    <span className="font-heading text-lg font-bold">
                      {r.average == null ? "—" : `${r.average}%`}
                    </span>
                  </div>
                </button>

                {open && (
                  <div className="space-y-2 border-t border-border bg-muted/20 p-4">
                    {r.labs.length === 0 && (
                      <p className="text-sm text-muted-foreground">Sin labs asignados.</p>
                    )}
                    {r.labs.map((l: any) => {
                      const meta = findLab(l.lab_level, l.lab_slug);
                      const p = pct(l.best_score, l.max_score);
                      return (
                        <div
                          key={l.id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-3"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold">{meta?.title ?? l.lab_slug}</p>
                            <p className="text-xs text-muted-foreground">
                              Nivel {String(l.lab_level).toUpperCase()}
                              {l.attempts ? ` · ${l.attempts} intento(s)` : " · sin intentos"}
                              {l.last_attempt_at
                                ? ` · ${new Date(l.last_attempt_at).toLocaleDateString()}`
                                : ""}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            {p != null && (
                              <span className="font-heading text-sm font-bold text-primary">
                                {l.best_score}/{l.max_score} · {p}%
                              </span>
                            )}
                            <Badge variant={l.status === "completed" ? "default" : "secondary"}>
                              {l.status === "completed" ? "Completado" : "Pendiente"}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
