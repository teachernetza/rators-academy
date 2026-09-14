import { createFileRoute } from "@tanstack/react-router";
import { RoleGuard } from "@/components/role-guard";
import { LabTrackingPage } from "@/components/labs/lab-tracking-page";

export const Route = createFileRoute("/teacher/labs")({
  component: () => <RoleGuard role="teacher"><LabTrackingPage /></RoleGuard>,
});
