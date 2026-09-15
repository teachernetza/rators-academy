import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { RoleGuard } from "@/components/role-guard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, FlaskConical, CheckCircle2, PlayCircle } from "lucide-react";
import { listMyLabAssignments, setLabAssignmentStatus } from "@/lib/labs.functions";
import { findLab } from "@/lib/labs";
import { toast } from "sonner";

export const Route = createFileRoute("/student/labs")({
  component: () => <RoleGuard role="student"><Page /></RoleGuard>,
});

function Page() {
  const qc = useQueryClient();
  const listFn = useServerFn(listMyLabAssignments);
  const statusFn = useServerFn(setLabAssignmentStatus);

  const q = useQuery({ queryKey: ["lab-assignments", "mine"], queryFn: () => listFn() });

  const m = useMutation({
    mutationFn: (vars: { id: string; status: "pending" | "completed" }) => statusFn({ data: vars }),
    onSuccess: () => {
      toast.success("Actualizado");
      qc.invalidateQueries({ queryKey: ["lab-assignments"] });
    },
    onError: (e: any) => toast.error(e.message ?? "No se pudo actualizar"),
  });

  const rows = q.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Mis Labs</h1>
        <p className="mt-1 text-muted-foreground">Laboratorios que tu teacher te asignó.</p>
      </div>

      {q.isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : rows.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          <FlaskConical className="mx-auto mb-3 h-7 w-7 opacity-50" />
          Todavía no tienes Labs asignados.
          <div className="mt-4">
            <Button asChild variant="outline" size="sm"><Link to="/labs">Explorar Labs</Link></Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {rows.map((r: any) => {
            const lab = findLab(r.lab_level, r.lab_slug);
            const done = r.status === "completed";
            return (
              <Card key={r.id} className="flex flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-heading text-lg font-bold">{lab?.title ?? r.lab_slug}</p>
                    <p className="text-xs text-muted-foreground">Nivel {r.lab_level.toUpperCase()}</p>
                  </div>
                  <Badge variant={done ? "default" : "secondary"}>{done ? "Completado" : "Pendiente"}</Badge>
                </div>
                {lab?.description && <p className="text-sm text-muted-foreground">{lab.description}</p>}
                {r.due_date && (
                  <p className="text-xs text-muted-foreground">
                    Entrega: {new Date(r.due_date).toLocaleDateString()}
                  </p>
                )}
                {r.note && <p className="rounded-md bg-muted/50 p-2 text-xs">Nota: {r.note}</p>}
                {r.max_score > 0 && r.best_score != null && (
                  <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
                    <span className="font-heading text-lg font-bold text-primary">
                      {Math.round((r.best_score / r.max_score) * 100)}%
                    </span>{" "}
                    <span className="text-muted-foreground">
                      ({r.best_score} de {r.max_score} correctos · {r.attempts} intento
                      {r.attempts === 1 ? "" : "s"})
                    </span>
                  </div>
                )}
                <div className="mt-auto flex flex-wrap gap-2 pt-2">
                  {lab && (
                    <Button asChild size="sm">
                      <Link to="/labs/$level/$slug" params={{ level: r.lab_level, slug: r.lab_slug }}>
                        <PlayCircle className="mr-2 h-4 w-4" />Abrir Lab
                      </Link>
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant={done ? "ghost" : "outline"}
                    onClick={() => m.mutate({ id: r.id, status: done ? "pending" : "completed" })}
                    disabled={m.isPending}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {done ? "Marcar pendiente" : "Marcar completado"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
