import { createFileRoute } from "@tanstack/react-router";
import { RoleGuard } from "@/components/role-guard";
import { StaffStudentHub } from "@/components/classes/staff-student-hub";

export const Route = createFileRoute("/teacher/classes/$studentId")({
  head: () => ({ meta: [{ title: "Clase del alumno — Teacher Netza" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function Page() {
  const { studentId } = Route.useParams();
  return <RoleGuard role="teacher"><StaffStudentHub studentId={studentId} mode="teacher" /></RoleGuard>;
}
