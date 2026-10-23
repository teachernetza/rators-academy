import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, X, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { type ClassLesson, uploadSubmissions } from "@/lib/classes";

/** Selector de capturas con vista previa y envío (alumno). */
export function EvidenceUpload({ lesson, onSent }: { lesson: ClassLesson; onSent?: () => void }) {
  const qc = useQueryClient();
  const ref = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  const pick = (list: FileList | null) => {
    const imgs = Array.from(list ?? []).filter((f) => f.type.startsWith("image/"));
    if (list?.length && !imgs.length) toast.error("Sube imágenes (capturas de pantalla)");
    const big = imgs.find((f) => f.size > 10 * 1024 * 1024);
    if (big) return toast.error(`${big.name} pesa más de 10 MB`);
    setFiles((p) => [...p, ...imgs].slice(0, 6));
    setSent(false);
    if (ref.current) ref.current.value = "";
  };

  const send = async () => {
    setBusy(true);
    try {
      await uploadSubmissions(lesson, files, note.trim() || null);
      toast.success("¡Evidencia enviada a tu teacher!");
      setFiles([]); setNote(""); setSent(true);
      qc.invalidateQueries({ queryKey: ["classes"] });
      onSent?.();
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
  };

  return (
    <div className="space-y-2">
      <input ref={ref} type="file" accept="image/*" multiple className="hidden" onChange={(e) => pick(e.target.files)} />
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {previews.map((u, i) => (
            <div key={u} className="relative aspect-video overflow-hidden rounded-md border border-border bg-muted">
              <img src={u} alt={`Captura ${i + 1}`} className="h-full w-full object-cover" />
              <button aria-label="Quitar captura" onClick={() => setFiles((p) => p.filter((_, j) => j !== i))}
                className="absolute right-1 top-1 rounded-full bg-background/90 p-0.5 text-foreground"><X className="h-3.5 w-3.5" /></button>
            </div>
          ))}
        </div>
      )}
      {files.length > 0 ? (
        <>
          <Input placeholder="Mensaje para tu teacher (opcional)" value={note} onChange={(e) => setNote(e.target.value)} />
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => ref.current?.click()} disabled={busy}>Agregar más</Button>
            <Button className="flex-1" onClick={send} disabled={busy}>
              {busy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Upload className="mr-1 h-4 w-4" />}
              Enviar {files.length} {files.length === 1 ? "captura" : "capturas"}
            </Button>
          </div>
        </>
      ) : (
        <Button className="w-full" size="default" onClick={() => ref.current?.click()}>
          {sent ? <CheckCircle2 className="mr-1 h-4 w-4" /> : <Upload className="mr-1 h-4 w-4" />}
          {sent ? "Enviada · subir otra" : "Subir evidencia"}
        </Button>
      )}
    </div>
  );
}
