import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, X, FlaskConical } from "lucide-react";
import { toast } from "sonner";
import { type ClassLesson, type LabFile, listLessonLabs, addLessonLabs, removeLessonLab } from "@/lib/classes";
import { LAB_LEVELS } from "@/lib/labs";
import { OpenLabButton } from "./lab-frame";

export const lessonLabsKey = (studentId: string) => ["classes", "lessonlabs", studentId];

/** Labs extra asignados a una lección (staff): lista + botón "Asignar labs". */
export function LessonLabs({ lesson, files, userId }: { lesson: ClassLesson; files: LabFile[]; userId: string }) {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: lessonLabsKey(lesson.student_id), queryFn: () => listLessonLabs(lesson.student_id) });
  const [open, setOpen] = useState(false);
  const items = (q.data ?? []).filter((i) => i.lesson_id === lesson.id);
  const title = (id: string) => files.find((f) => f.id === id)?.title ?? "Lab";

  return (
    <div className="space-y-2 rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1 text-sm font-medium"><FlaskConical className="h-4 w-4 text-primary" />Labs asignados a esta clase ({items.length})</p>
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}><Plus className="mr-1 h-4 w-4" />Asignar labs</Button>
      </div>
      {items.length === 0 && <p className="text-xs text-muted-foreground">Puedes sumar uno o más labs de tu biblioteca, de clase o de tarea.</p>}
      <div className="flex flex-col gap-2">
        {items.map((i) => (
          <div key={i.id} className="flex flex-wrap items-center gap-2 rounded-md bg-muted/50 px-2 py-1.5">
            <Badge variant={i.kind === "class" ? "outline" : "secondary"}>{i.kind === "class" ? "Clase" : "Tarea"}</Badge>
            <span className="min-w-0 flex-1 truncate text-sm">{title(i.lab_file_id)}</span>
            <OpenLabButton labFileId={i.lab_file_id} label="Abrir" variant="outline" />
            <Button size="sm" variant="ghost" aria-label="Quitar lab" onClick={async () => {
              try { await removeLessonLab(i.id); qc.invalidateQueries({ queryKey: lessonLabsKey(lesson.student_id) }); } catch (e: any) { toast.error(e.message); }
            }}><X className="h-4 w-4" /></Button>
          </div>
        ))}
      </div>
      <AssignLessonLabsDialog open={open} onOpenChange={setOpen} lesson={lesson} files={files} userId={userId}
        taken={items.map((i) => `${i.kind}|${i.lab_file_id}`)} />
    </div>
  );
}

function AssignLessonLabsDialog({ open, onOpenChange, lesson, files, userId, taken }: {
  open: boolean; onOpenChange: (v: boolean) => void; lesson: ClassLesson; files: LabFile[]; userId: string; taken: string[];
}) {
  const qc = useQueryClient();
  const [kind, setKind] = useState<"class" | "homework">("homework");
  const [level, setLevel] = useState("all");
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const list = useMemo(() => files.filter((f) =>
    (level === "all" || f.level === level) && (!search || f.title.toLowerCase().includes(search.toLowerCase()))), [files, level, search]);

  const save = async () => {
    setBusy(true);
    try {
      await addLessonLabs(lesson, picked, kind, userId);
      toast.success(`${picked.length} lab(s) asignado(s)`);
      qc.invalidateQueries({ queryKey: lessonLabsKey(lesson.student_id) });
      setPicked([]); onOpenChange(false);
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Asignar labs a «{lesson.title}»</DialogTitle>
          <DialogDescription>Elige uno o más labs de la biblioteca de la app.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Tabs value={kind} onValueChange={(v) => setKind(v as any)}>
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="homework">Lab de Tarea (alumno)</TabsTrigger>
              <TabsTrigger value="class">Lab de Clase (staff)</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex flex-wrap gap-1.5">
            {["all", ...LAB_LEVELS.map((l) => l.slug)].map((l) => (
              <Button key={l} size="sm" variant={level === l ? "default" : "outline"} onClick={() => setLevel(l)}>{l === "all" ? "Todos" : l.toUpperCase()}</Button>
            ))}
          </div>
          <Input placeholder="Buscar lab…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="max-h-64 divide-y divide-border overflow-y-auto rounded-lg border border-border">
            {list.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No hay labs subidos con ese filtro.</p>}
            {list.map((f) => {
              const already = taken.includes(`${kind}|${f.id}`);
              return (
                <label key={f.id} className={`flex items-center gap-3 px-3 py-2 ${already ? "opacity-50" : "cursor-pointer hover:bg-muted/50"}`}>
                  <Checkbox disabled={already} checked={already || picked.includes(f.id)}
                    onCheckedChange={() => setPicked((p) => p.includes(f.id) ? p.filter((x) => x !== f.id) : [...p, f.id])} />
                  <span className="min-w-0 flex-1 truncate text-sm">{f.title}</span>
                  <Badge variant="secondary">{f.level.toUpperCase()}</Badge>
                </label>
              );
            })}
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={save} disabled={busy || picked.length === 0}>{busy && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}Asignar {picked.length || ""}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
