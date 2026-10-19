import { createFileRoute } from "@tanstack/react-router";
import { RoleGuard } from "@/components/role-guard";
import { StudentClassList } from "@/components/classes/student-class-list";

export const Route = createFileRoute("/admin/classes/")({
  head: () => ({ meta: [{ title: "Clases y horas — Teacher Netza" }, { name: "robots", content: "noindex" }] }),
  component: () => <RoleGuard role="admin"><StudentClassList mode="admin" /></RoleGuard>,
});
