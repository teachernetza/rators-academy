import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Maximize, Upload, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { loadLabHtml, withViewport, getLesson } from "@/lib/classes";
import { EvidenceUpload } from "@/components/classes/evidence-upload";

export const Route = createFileRoute("/lab/$labFileId")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({ lesson: typeof s.lesson === "string" ? s.lesson : undefined }),
  head: () => ({ meta: [{ title: "Lab — Teacher Netza" }, { name: "robots", content: "noindex" }] }),
  component: LabPage,
});

function LabPage() {
  const { labFileId } = Route.useParams();
  const { lesson: lessonId } = Route.useSearch();
  const { profile, loading } = useAuth() as any;
  const wrap = useRef<HTMLDivElement>(null);
  const [upload, setUpload] = useState(false);
  const labQ = useQuery({ queryKey: ["labhtml", labFileId], queryFn: () => loadLabHtml(labFileId), enabled: !loading, retry: false });
  const lessonQ = useQuery({ queryKey: ["classes", "lesson", lessonId], queryFn: () => getLesson(lessonId!), enabled: !!lessonId && profile?.role === "student" });
  useEffect(() => { if (labQ.data) document.title = `${labQ.data.title} — Teacher Netza`; }, [labQ.data]);

  return (
    <div ref={wrap} className="flex h-dvh w-full flex-col bg-background">
      <div className="flex items-center gap-2 border-b border-border px-3 py-1.5">
        <p className="min-w-0 flex-1 truncate text-sm font-semibold">{labQ.data?.title ?? "Lab"}</p>
        {lessonQ.data && lessonQ.data.status !== "done" && (
          <Button size="sm" onClick={() => setUpload(true)}><Upload className="mr-1 h-4 w-4" />Subir evidencia</Button>
        )}
        <Button size="sm" variant="outline" aria-label="Pantalla completa" onClick={() => wrap.current?.requestFullscreen?.()}>
          <Maximize className="h-4 w-4 sm:mr-1" /><span className="hidden sm:inline">Pantalla completa</span>
        </Button>
        <Button size="sm" variant="ghost" aria-label="Cerrar" onClick={() => (window.history.length > 1 ? window.close() : null)}><X className="h-4 w-4" /></Button>
      </div>
      {labQ.isLoading && <div className="flex flex-1 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>}
      {labQ.error && <p className="p-6 text-center text-sm text-destructive">{(labQ.error as Error).message}</p>}
      {labQ.data && (
        <iframe title={labQ.data.title} srcDoc={withViewport(labQ.data.html)}
          sandbox="allow-scripts allow-forms allow-modals allow-popups"
          className="min-h-0 w-full flex-1 border-0 bg-background" />
      )}
      {lessonQ.data && (
        <Dialog open={upload} onOpenChange={setUpload}>
          <DialogContent>
            <DialogHeader><DialogTitle>Evidencia · {lessonQ.data.title}</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">Toma captura de tus resultados y súbela aquí. Puedes subir varias.</p>
            <EvidenceUpload lesson={lessonQ.data} onSent={() => setUpload(false)} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
