import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Play } from "lucide-react";
import { loadLabHtml, catalogLab } from "@/lib/classes";
import { toast } from "sonner";

/** Botón que abre un lab: HTML subido (en ventana aislada) o lab del catálogo. */
export function OpenLabButton({
  labFileId, labRef, label = "Abrir lab", variant = "default", size = "sm",
}: {
  labFileId?: string | null; labRef?: string | null; label?: string;
  variant?: "default" | "outline" | "secondary"; size?: "sm" | "default";
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [doc, setDoc] = useState<{ title: string; html: string } | null>(null);
  const cat = catalogLab(labRef);

  if (!labFileId && cat) {
    return (
      <Button asChild size={size} variant={variant}>
        <Link to="/labs/$level/$slug" params={{ level: cat.level, slug: cat.slug }} target="_blank">
          <Play className="mr-1 h-4 w-4" />{label}
        </Link>
      </Button>
    );
  }
  if (!labFileId) return null;

  const openIt = async () => {
    setLoading(true);
    try {
      setDoc(await loadLabHtml(labFileId));
      setOpen(true);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button size={size} variant={variant} onClick={openIt} disabled={loading}>
        {loading ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Play className="mr-1 h-4 w-4" />}
        {label}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex h-[92vh] max-w-[96vw] flex-col gap-2 p-3 sm:max-w-[96vw]">
          <DialogHeader><DialogTitle className="truncate pr-8">{doc?.title}</DialogTitle></DialogHeader>
          {doc && (
            <iframe
              title={doc.title}
              srcDoc={doc.html}
              sandbox="allow-scripts allow-forms allow-modals allow-popups"
              className="min-h-0 w-full flex-1 rounded-md border border-border bg-background"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
