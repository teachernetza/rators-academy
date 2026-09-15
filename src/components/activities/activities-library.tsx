import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FlaskConical, ExternalLink, PlayCircle, BarChart3, Target } from "lucide-react";
import { AssignLabDialog } from "@/components/labs/assign-lab-dialog";
import { LAB_LEVELS, LMS_LABS, type LabLevel } from "@/lib/labs";

export function ActivitiesLibrary({ basePath }: { basePath: "/admin/activities" | "/teacher/activities" }) {
  const progressPath = basePath === "/admin/activities" ? "/admin/lab-progress" : "/teacher/lab-progress";
  const [level, setLevel] = useState<LabLevel>("a1");
  const [search, setSearch] = useState("");

  const labs = useMemo(() => {
    const list = LMS_LABS.filter((l) => l.level === level);
    if (!search) return list;
    const s = search.toLowerCase();
    return list.filter((l) => l.title.toLowerCase().includes(s));
  }, [level, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Labs del LMS</h1>
          <p className="mt-1 text-muted-foreground">
            Tus laboratorios internos por nivel. Ábrelos o asígnalos a tus alumnos.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to={progressPath as any}>
              <BarChart3 className="mr-2 h-4 w-4" />Progreso de Labs
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/labs">
              <ExternalLink className="mr-2 h-4 w-4" />Ver catálogo público
            </Link>
          </Button>
          <AssignLabDialog trigger={<Button>Asignar Lab</Button>} />
        </div>
      </div>

      <Card className="space-y-4 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Tabs value={level} onValueChange={(v) => setLevel(v as LabLevel)}>
            <TabsList className="grid w-full grid-cols-6 sm:w-auto">
              {LAB_LEVELS.map((l) => (
                <TabsTrigger key={l.slug} value={l.slug}>
                  {l.slug.toUpperCase()}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Input
            placeholder="Buscar lab…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:max-w-xs"
          />
        </div>

        {labs.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-12 text-center">
            <FlaskConical className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              Aún no hay labs en este nivel — pásame el material y lo integro.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {labs.map((lab) => (
              <div
                key={`${lab.level}-${lab.slug}`}
                className="flex flex-col rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-[var(--shadow-soft)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-heading text-base font-semibold leading-tight">{lab.title}</h3>
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                    {lab.level.toUpperCase()}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{lab.description}</p>

                {lab.objectives && lab.objectives.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {lab.objectives.map((o) => (
                      <li key={o} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <Target className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                        <span>{o}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="secondary">Con puntaje</Badge>
                  {lab.exercises && <Badge variant="outline">{lab.exercises} ejercicios</Badge>}
                </div>

                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                  <Button asChild size="sm" variant="outline">
                    <Link to="/labs/$level/$slug" params={{ level: lab.level, slug: lab.slug }}>
                      <PlayCircle className="mr-2 h-4 w-4" />Abrir lab
                    </Link>
                  </Button>
                  <AssignLabDialog lab={lab} trigger={<Button size="sm">Asignar</Button>} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
