import { createFileRoute } from "@tanstack/react-router";
import { RoleGuard } from "@/components/role-guard";
import { LabLibrary } from "@/components/classes/lab-library";

export const Route = createFileRoute("/admin/lab-library")({
  head: () => ({ meta: [{ title: "Biblioteca de labs — Teacher Netza" }, { name: "robots", content: "noindex" }] }),
  component: () => <RoleGuard role="admin"><LabLibrary /></RoleGuard>,
});
