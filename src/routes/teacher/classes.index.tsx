import { createFileRoute } from "@tanstack/react-router";
import { RoleGuard } from "@/components/role-guard";
import { StudentClassList } from "@/components/classes/student-class-list";

export const Route = createFileRoute("/teacher/classes/")({
  head: () => ({ meta: [{ title: "Mis clases — Teacher Netza" }, { name: "robots", content: "noindex" }] }),
  component: () => <RoleGuard role="teacher"><StudentClassList mode="teacher" /></RoleGuard>,
});
