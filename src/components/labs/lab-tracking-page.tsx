import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, FlaskConical, ExternalLink } from "lucide-react";
import { listLabAssignmentsForStaff, deleteLabAssignment } from "@/lib/labs.functions";
import { findLab } from "@/lib/labs";
import { AssignLabDialog } from "@/components/labs/assign-lab-dialog";
import { toast } from "sonner";

export function LabTrackingPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listLabAssignmentsForStaff);
  const delFn = useServerFn(deleteLabAssignment);

  const q = useQuery({ queryKey: ["lab-assignments", "staff"], queryFn: () => listFn() });

  const delM = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Asignación eliminada");
      qc.invalidateQueries({ queryKey: ["lab-assignments"] });
    },
    onError: (e: any) => toast.error(e.message ?? "No se pudo eliminar"),
  });

  const rows = q.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold">Labs asignados</h1>
          <p className="mt-1 text-muted-foreground">
            Seguimiento de los laboratorios que asignaste a tus alumnos.
          </p>
        </div>
        <AssignLabDialog trigger={<Button>Asignar Lab</Button>} />
      </div>

      {q.isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : rows.length === 0 ? (
        <Card className="p-10 text-center text-sm text-muted-foreground">
          <FlaskConical className="mx-auto mb-3 h-7 w-7 opacity-50" />
          Todavía no has asignado ningún Lab. Entra a un Lab del catálogo y usa “Asignar Lab”.
          <div className="mt-4">
            <Button asChild variant="outline" size="sm"><Link to="/labs">Ver catálogo de Labs</Link></Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {rows.map((r: any) => {
            const lab = findLab(r.lab_level, r.lab_slug);
            return (
              <Card key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="font-semibold">{lab?.title ?? r.lab_slug}</p>
                  <p className="text-sm text-muted-foreground">
                    {r.student_name} · Nivel {r.lab_level.toUpperCase()}
                    {r.due_date ? ` · Entrega ${new Date(r.due_date).toLocaleDateString()}` : ""}
                  </p>
                  {r.note && <p className="mt-1 text-xs text-muted-foreground">Nota: {r.note}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {r.max_score > 0 && r.best_score != null && (
                    <span className="font-heading text-sm font-bold text-primary">
                      {r.best_score}/{r.max_score} ·{" "}
                      {Math.round((r.best_score / r.max_score) * 100)}%
                    </span>
                  )}
                  <Badge variant={r.status === "completed" ? "default" : "secondary"}>
                    {r.status === "completed" ? "Completado" : "Pendiente"}
                  </Badge>
                  {lab && (
                    <Button asChild size="sm" variant="ghost">
                      <Link to="/labs/$level/$slug" params={{ level: r.lab_level, slug: r.lab_slug }}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => delM.mutate(r.id)}>
                    <Trash2 className="h-4 w-4" />
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
