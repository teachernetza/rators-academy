import { useEffect, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "@/lib/theme";
import { findLab, levelMeta } from "@/lib/labs";

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
  const frameRef = useRef<HTMLIFrameElement>(null);

  const syncTheme = () => {
    frameRef.current?.contentWindow?.postMessage(
      { type: "tn-theme", theme: resolved },
      "*",
    );
  };
  useEffect(syncTheme, [resolved]);

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
      </main>
    </div>
  );
}
