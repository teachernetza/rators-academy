import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Users } from "lucide-react";
import { listStudents } from "@/lib/activities.functions";
import { assignLab } from "@/lib/labs.functions";
import type { Lab } from "@/lib/labs";
import { toast } from "sonner";

export function AssignLabDialog({ lab, trigger }: { lab: Lab; trigger?: React.ReactNode }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [due, setDue] = useState("");
  const [note, setNote] = useState("");

  const studentsFn = useServerFn(listStudents);
  const assignFn = useServerFn(assignLab);

  const studentsQ = useQuery({
    queryKey: ["labs", "students"],
    queryFn: () => studentsFn(),
    enabled: open,
  });

  const toggle = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const assignM = useMutation({
    mutationFn: () =>
      assignFn({
        data: {
          lab_level: lab.level,
          lab_slug: lab.slug,
          student_ids: picked,
          due_date: due ? new Date(due).toISOString() : null,
          note: note || null,
        },
      }),
    onSuccess: (res: any) => {
      toast.success(`Lab asignado a ${res.count} alumno(s)`);
      qc.invalidateQueries({ queryKey: ["lab-assignments"] });
      setOpen(false);
      setPicked([]);
      setDue("");
      setNote("");
    },
    onError: (e: any) => toast.error(e.message ?? "No se pudo asignar"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="outline">
            <Send className="mr-2 h-4 w-4" />Asignar Lab
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Asignar “{lab.title}”</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Alumnos</Label>
            <div className="max-h-60 divide-y divide-border overflow-y-auto rounded-lg border border-border">
              {studentsQ.isLoading && (
                <div className="flex justify-center p-6"><Loader2 className="h-5 w-5 animate-spin" /></div>
              )}
              {!studentsQ.isLoading && (studentsQ.data ?? []).length === 0 && (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  <Users className="mx-auto mb-2 h-5 w-5 opacity-50" />
                  Aún no hay alumnos activos.
                </div>
              )}
              {(studentsQ.data ?? []).map((s: any) => (
                <label key={s.id} className="flex cursor-pointer items-center gap-3 px-4 py-2.5 hover:bg-muted/50">
                  <Checkbox checked={picked.includes(s.id)} onCheckedChange={() => toggle(s.id)} />
                  <span className="text-sm">{s.full_name}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Fecha límite (opcional)</Label>
            <Input type="datetime-local" value={due} onChange={(e) => setDue(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Nota para el alumno (opcional)</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={() => assignM.mutate()} disabled={picked.length === 0 || assignM.isPending}>
            {assignM.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Asignar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
