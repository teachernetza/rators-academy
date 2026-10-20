import { createFileRoute } from "@tanstack/react-router";
import { RoleGuard } from "@/components/role-guard";
import { StudentClassList } from "@/components/classes/student-class-list";
import { AnnouncementBanner } from "@/components/classes/lesson-thread";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Inicio — Teacher Netza" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <RoleGuard role="admin">
      <div className="space-y-6">
        <AnnouncementBanner />
        <StudentClassList mode="admin" title="Inicio" subtitle="Cada tarjeta muestra la próxima clase. Ábrela para ponerle sus labs." />
      </div>
    </RoleGuard>
  ),
});
