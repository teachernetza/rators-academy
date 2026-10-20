import { createFileRoute } from "@tanstack/react-router";
import { RoleGuard } from "@/components/role-guard";
import { StudentHub } from "@/components/classes/student-hub";

export const Route = createFileRoute("/student/tasks")({
  head: () => ({ meta: [{ title: "Mis tareas — Teacher Netza" }, { name: "robots", content: "noindex" }] }),
  component: () => <RoleGuard role="student"><StudentHub view="tasks" /></RoleGuard>,
});
