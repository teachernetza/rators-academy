import { createFileRoute } from "@tanstack/react-router";
import { RoleGuard } from "@/components/role-guard";
import { LabTrackingPage } from "@/components/labs/lab-tracking-page";

export const Route = createFileRoute("/admin/labs")({
  component: () => <RoleGuard role="admin"><LabTrackingPage /></RoleGuard>,
});
