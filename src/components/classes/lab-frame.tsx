import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { catalogLab } from "@/lib/classes";

/** Abre un lab en una pestaña nueva a pantalla completa (HTML subido o lab del catálogo). */
export function OpenLabButton({
  labFileId, labRef, lessonId, label = "Abrir lab", variant = "default", size = "sm",
}: {
  labFileId?: string | null; labRef?: string | null; lessonId?: string; label?: string;
  variant?: "default" | "outline" | "secondary"; size?: "sm" | "default";
}) {
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
  return (
    <Button asChild size={size} variant={variant}>
      <Link to="/lab/$labFileId" params={{ labFileId }} search={{ lesson: lessonId }} target="_blank">
        <Play className="mr-1 h-4 w-4" />{label}
      </Link>
    </Button>
  );
}
