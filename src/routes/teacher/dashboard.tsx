import { createFileRoute } from "@tanstack/react-router";
import { RoleGuard } from "@/components/role-guard";
import { StudentClassList } from "@/components/classes/student-class-list";
import { AnnouncementBanner } from "@/components/classes/lesson-thread";

export const Route = createFileRoute("/teacher/dashboard")({
  head: () => ({ meta: [{ title: "Inicio — Teacher Netza" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <RoleGuard role="teacher">
      <div className="space-y-6">
        <AnnouncementBanner />
        <StudentClassList mode="teacher" title="Mis clases" subtitle="Abre a tu alumno → Empezar clase → Registrar clase al terminar." />
      </div>
    </RoleGuard>
  ),
});
