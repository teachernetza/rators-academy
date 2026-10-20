import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Lock, MessageCircle, Save } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { getStudentInfo, saveStudentInfo, staffNames } from "@/lib/classes";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

/** Ficha visible solo para admin y teachers asignados (RLS). */
export function StudentInfoCard({ studentId }: { studentId: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["classes", "info", studentId], queryFn: () => getStudentInfo(studentId) });
  const namesQ = useQuery({ queryKey: ["classes", "staffNames"], queryFn: staffNames });
  const [phone, setPhone] = useState("");
  const [goals, setGoals] = useState("");
  const [diag, setDiag] = useState("");
  const [level, setLevel] = useState<string>("none");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const p = q.data?.profile;
    setPhone(p?.phone ?? ""); setGoals(p?.goals_summary ?? ""); setDiag(p?.diagnosis ?? ""); setLevel(p?.cefr_level ?? "none");
  }, [q.data]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await saveStudentInfo(studentId, user.id, {
        phone: phone.trim() || null, goals_summary: goals.trim() || null,
        diagnosis: diag.trim() || null, cefr_level: level === "none" ? null : level,
      });
      toast.success("Ficha guardada");
      qc.invalidateQueries({ queryKey: ["classes", "info", studentId] });
    } catch (e: any) { toast.error(e.message); } finally { setSaving(false); }
  };

  const digits = phone.replace(/\D/g, "");
  const wa = digits ? `https://wa.me/${digits.length === 10 ? "52" + digits : digits}` : null;
  const p = q.data?.profile;

  return (
    <Card className="space-y-4 p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Ficha del estudiante</h2>
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Lock className="h-3 w-3" /> Solo teachers y admins</span>
      </div>
      {q.isLoading ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="si-phone">Teléfono</Label>
              <div className="flex gap-2">
                <Input id="si-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Ej. 3231116425" inputMode="tel" />
                {wa && <Button asChild variant="outline" size="icon" aria-label="Abrir WhatsApp"><a href={wa} target="_blank" rel="noreferrer"><MessageCircle className="h-4 w-4" /></a></Button>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={q.data?.email ?? "—"} readOnly disabled />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="si-goals">Objetivos personales y orientaciones</Label>
            <Textarea id="si-goals" rows={4} value={goals} onChange={(e) => setGoals(e.target.value)} placeholder="Para qué quiere aprender inglés, metas, preferencias…" />
          </div>
          <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
            <div className="space-y-1.5">
              <Label htmlFor="si-diag">Diagnóstico (perfil académico)</Label>
              <Textarea id="si-diag" rows={4} value={diag} onChange={(e) => setDiag(e.target.value)} placeholder="Fortalezas, áreas a reforzar, resultados del examen…" />
            </div>
            <div className="space-y-1.5">
              <Label>Nivel MCER</Label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin definir</SelectItem>
                  {LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              {p ? `Última actualización: ${new Date(p.updated_at).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}${p.updated_by ? ` · ${namesQ.data?.[p.updated_by] ?? ""}` : ""}` : "Aún sin datos"}
            </p>
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}Guardar ficha
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
