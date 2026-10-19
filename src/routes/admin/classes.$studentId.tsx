import { createFileRoute } from "@tanstack/react-router";
import { RoleGuard } from "@/components/role-guard";
import { StaffStudentHub } from "@/components/classes/staff-student-hub";

export const Route = createFileRoute("/admin/classes/$studentId")({
  head: () => ({ meta: [{ title: "Hub del alumno — Teacher Netza" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function Page() {
  const { studentId } = Route.useParams();
  return <RoleGuard role="admin"><StaffStudentHub studentId={studentId} mode="admin" /></RoleGuard>;
}
