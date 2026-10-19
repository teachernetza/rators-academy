import { createFileRoute } from "@tanstack/react-router";
import { RoleGuard } from "@/components/role-guard";
import { StudentHub } from "@/components/classes/student-hub";

export const Route = createFileRoute("/student/hub")({
  head: () => ({ meta: [{ title: "Mi Hub de clases — Teacher Netza" }, { name: "robots", content: "noindex" }] }),
  component: () => <RoleGuard role="student"><StudentHub /></RoleGuard>,
});
