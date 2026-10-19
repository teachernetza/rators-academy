import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { listLabFiles, uploadLabFile, deleteLabFile } from "@/lib/classes";
import { LAB_LEVELS } from "@/lib/labs";
import { OpenLabButton } from "./lab-frame";

export function LabLibrary() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const filesQ = useQuery({ queryKey: ["classes", "labfiles"], queryFn: listLabFiles });
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("a1");
  const [kind, setKind] = useState<"class" | "homework">("homework");
  const [block, setBlock] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("all");
  const input = useRef<HTMLInputElement>(null);

  const upload = async () => {
    if (!file || !user) return toast.error("Elige un archivo HTML");
    if (!/\.html?$/i.test(file.name)) return toast.error("Solo archivos .html");
    setBusy(true);
    try {
      await uploadLabFile(file, { title: title.trim() || file.name.replace(/\.html?$/i, ""), level, kind, block: block.trim() || null, uploaded_by: user.id });
      toast.success("Lab subido");
      setTitle(""); setFile(null); if (input.current) input.current.value = "";
      qc.invalidateQueries({ queryKey: ["classes", "labfiles"] });
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };

  const files = (filesQ.data ?? []).filter((f) => filter === "all" || f.level === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Biblioteca de labs HTML</h1>
        <p className="text-sm text-muted-foreground">Sube tus Labs de Clase y de Tarea una vez y reutilízalos con cualquier alumno.</p>
      </div>

      <Card className="grid gap-3 p-4 md:grid-cols-2 lg:grid-cols-6 lg:items-end">
        <div className="lg:col-span-2"><Label>Archivo HTML</Label><Input ref={input} type="file" accept=".html,.htm,text/html" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></div>
        <div><Label>Título</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Lesson 3 – Food" /></div>
        <div>
          <Label>Nivel</Label>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{LAB_LEVELS.map((l) => <SelectItem key={l.slug} value={l.slug}>{l.slug.toUpperCase()}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Tipo</Label>
          <Select value={kind} onValueChange={(v) => setKind(v as any)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="class">Lab de Clase</SelectItem><SelectItem value="homework">Lab de Tarea</SelectItem></SelectContent>
          </Select>
        </div>
        <div><Label>Bloque (opcional)</Label><Input value={block} onChange={(e) => setBlock(e.target.value)} placeholder="Book 2" /></div>
        <Button className="lg:col-span-6" onClick={upload} disabled={busy || !file}>
          {busy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Upload className="mr-1 h-4 w-4" />}Subir lab
        </Button>
      </Card>

      <div className="flex flex-wrap gap-2">
        {["all", ...LAB_LEVELS.map((l) => l.slug)].map((l) => (
          <Button key={l} size="sm" variant={filter === l ? "default" : "outline"} onClick={() => setFilter(l)}>{l === "all" ? "Todos" : l.toUpperCase()}</Button>
        ))}
      </div>

      {filesQ.isLoading && <Loader2 className="h-6 w-6 animate-spin text-primary" />}
      {filesQ.data && files.length === 0 && <Card className="p-8 text-center text-sm text-muted-foreground">Todavía no hay labs subidos en este nivel.</Card>}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {files.map((f) => (
          <Card key={f.id} className="flex flex-col gap-3 p-4">
            <div className="min-w-0">
              <p className="truncate font-semibold">{f.title}</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                <Badge variant="secondary">{f.level.toUpperCase()}</Badge>
                <Badge variant="outline">{f.kind === "class" ? "Clase" : "Tarea"}</Badge>
                {f.block && <Badge variant="outline">{f.block}</Badge>}
              </div>
            </div>
            <div className="mt-auto flex gap-2">
              <OpenLabButton labFileId={f.id} label="Vista previa" variant="outline" />
              <Button size="sm" variant="ghost" className="text-destructive" onClick={async () => {
                if (!confirm(`¿Borrar «${f.title}»? Las lecciones que lo usan se quedarán sin lab.`)) return;
                try { await deleteLabFile(f); qc.invalidateQueries({ queryKey: ["classes"] }); } catch (e: any) { toast.error(e.message); }
              }}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
