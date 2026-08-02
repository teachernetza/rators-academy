import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLabHtml } from "@/lib/labs.functions";
import { levelMeta } from "@/lib/labs";

export const Route = createFileRoute("/labs/$level/$slug")({
  head: ({ params }) => {
    const lvl = levelMeta(params.level)?.label ?? "Lab";
    const title = params.slug.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());
    return {
      meta: [
        { title: `${title} · Lab ${lvl} — Teacher Netza Varo` },
        {
          name: "description",
          content: `Lab interactivo gratuito de inglés (${lvl}): ${title}. Practica directo desde el navegador, sin registro.`,
        },
        { property: "og:title", content: `${title} · Lab de inglés ${lvl}` },
        {
          property: "og:description",
          content: `Practica gratis con el lab interactivo "${title}" de Teacher Netza.`,
        },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: LabViewer,
});

function LabViewer() {
  const { level, slug } = Route.useParams();
  const fetchLab = useServerFn(getLabHtml);
  const q = useQuery({
    queryKey: ["lab", level, slug],
    queryFn: () => fetchLab({ data: { level, slug } }),
  });

  const lvl = levelMeta(level);

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
            {q.data?.title ?? "Cargando lab…"}
            {lvl && <span className="ml-2 text-xs text-muted-foreground">· {lvl.label}</span>}
          </span>
          {q.data?.sourceUrl ? (
            <a href={q.data.sourceUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          ) : (
            <span className="w-9" />
          )}
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        {q.isLoading && (
          <div className="flex flex-1 items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-primary" /> Cargando lab…
          </div>
        )}
        {!q.isLoading && !q.data && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-10 text-center">
            <h1 className="font-heading text-2xl font-bold">Lab no encontrado</h1>
            <p className="max-w-md text-muted-foreground">
              Este lab ya no existe o cambió de nombre en el repositorio.
            </p>
            <Link to="/labs">
              <Button>Ver todos los labs</Button>
            </Link>
          </div>
        )}
        {q.data && (
          <iframe
            title={q.data.title}
            srcDoc={q.data.html}
            sandbox="allow-scripts allow-forms allow-popups allow-modals allow-downloads"
            className="animate-fade-in h-[calc(100vh-3.5rem)] w-full border-0 bg-white"
          />
        )}
      </main>
    </div>
  );
}
