import { createFileRoute } from "@tanstack/react-router";
import { RoleGuard } from "@/components/role-guard";
import { LabProgressPage } from "@/components/labs/lab-progress-page";

export const Route = createFileRoute("/admin/lab-progress")({
  head: () => ({
    meta: [
      { title: "Progreso de Labs | Teacher Netza Varo" },
      {
        name: "description",
        content: "Seguimiento de labs completados y puntajes por alumno.",
      },
      { property: "og:title", content: "Progreso de Labs" },
      { property: "og:description", content: "Labs completados y puntajes por alumno." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RoleGuard role="admin">
      <LabProgressPage />
    </RoleGuard>
  ),
});
