import { useEffect, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ExternalLink, Send, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "@/lib/theme";
import { findLab, levelMeta } from "@/lib/labs";
import { useAuth } from "@/lib/auth";
import { AssignLabDialog } from "@/components/labs/assign-lab-dialog";
import { submitLabResult } from "@/lib/labs.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/labs/$level/$slug")({
  head: ({ params }) => {
    const lab = findLab(params.level, params.slug);
    const lvl = levelMeta(params.level)?.label ?? "Lab";
    const title = lab?.title ?? params.slug.replace(/-/g, " ");
    const description =
      lab?.description ??
      `Lab interactivo gratuito de inglés (${lvl}). Practica directo desde el navegador, sin registro.`;
    return {
      meta: [
        { title: `${title} · Lab ${lvl} — Teacher Netza Varo` },
        { name: "description", content: description },
        { property: "og:title", content: `${title} · Lab de inglés ${lvl}` },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: LabViewer,
});

function LabViewer() {
  const { level, slug } = Route.useParams();
  const lab = findLab(level, slug);
  const lvl = levelMeta(level);
  const { resolved } = useTheme();
  const { profile, user } = useAuth();
  const isStaff = profile?.role === "admin" || profile?.role === "teacher";
  const frameRef = useRef<HTMLIFrameElement>(null);
  const qc = useQueryClient();
  const submitFn = useServerFn(submitLabResult);

  const syncTheme = () => {
    frameRef.current?.contentWindow?.postMessage(
      { type: "tn-theme", theme: resolved },
      "*",
    );
  };
  useEffect(syncTheme, [resolved]);

  // Recibe el puntaje que envía el lab al terminar y lo guarda en el LMS.
  useEffect(() => {
    const onMsg = async (e: MessageEvent) => {
      const d: any = e.data;
      if (!d || d.type !== "tn-lab-result") return;
      if (!user) {
        toast.info("Inicia sesión para que tu puntaje quede registrado.");
        return;
      }
      try {
        const res: any = await submitFn({
          data: {
            lab_level: d.level ?? level,
            lab_slug: d.slug ?? slug,
            score: Number(d.score) || 0,
            max_score: Number(d.max) || 1,
            sections: (d.sections ?? []).map((s: any) => ({
              title: String(s.title ?? ""),
              score: Number(s.score) || 0,
              max: Number(s.max) || 0,
            })),
          },
        });
        qc.invalidateQueries({ queryKey: ["lab-assignments"] });
        qc.invalidateQueries({ queryKey: ["lab-progress"] });
        toast.success(
          res?.saved
            ? `Puntaje guardado: ${d.score}/${d.max}`
            : `Puntaje registrado: ${d.score}/${d.max}`,
        );
      } catch (err: any) {
        toast.error(err?.message ?? "No se pudo guardar tu puntaje");
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [user, level, slug, submitFn, qc]);

  const locked = lab?.scope === "lms" && !user;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 shadow-[var(--shadow-soft)] backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link
            to="/labs"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Labs
          </Link>
          <span className="truncate font-heading text-sm font-semibold sm:text-base">
            {lab?.title ?? "Lab"}
            {lvl && <span className="ml-2 text-xs text-muted-foreground">· {lvl.label}</span>}
          </span>
          <div className="flex items-center gap-1">
            {lab && isStaff && (
              <AssignLabDialog
                lab={lab}
                trigger={
                  <Button variant="outline" size="sm">
                    <Send className="mr-1.5 h-4 w-4" />Asignar
                  </Button>
                }
              />
            )}
            <ThemeToggle />
            {lab ? (
              <a href={`${lab.file}?theme=${resolved}`} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </a>
            ) : (
              <span className="w-9" />
            )}
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        {!lab && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-10 text-center">
            <h1 className="font-heading text-2xl font-bold">Lab no encontrado</h1>
            <p className="max-w-md text-muted-foreground">
              Este lab ya no existe o cambió de nombre.
            </p>
            <Link to="/labs">
              <Button>Ver todos los labs</Button>
            </Link>
          </div>
        )}
        {lab && (
          <iframe
            ref={frameRef}
            onLoad={syncTheme}
            title={lab.title}
            src={`${lab.file}?theme=${resolved}`}
            className="animate-fade-in w-full flex-1 border-0 bg-background"
            style={{ height: "calc(100dvh - 3.5rem)" }}
          />
        )}
      </main>
    </div>
  );
}
