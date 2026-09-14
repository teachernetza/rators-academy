import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function db() {
  const { userClient } = await import("@/lib/request-supabase.server");
  return userClient();
}

async function getRole(userId: string) {
  const { data } = await (await db()).from("profiles").select("role").eq("id", userId).maybeSingle();
  return data?.role as "admin" | "teacher" | "student" | undefined;
}

async function assertStaff(userId: string) {
  const role = await getRole(userId);
  if (role !== "admin" && role !== "teacher") throw new Error("No tienes permiso para esto.");
  return role;
}

export const assignLab = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        lab_level: z.string().min(1),
        lab_slug: z.string().min(1),
        student_ids: z.array(z.string().uuid()).min(1),
        due_date: z.string().nullable().optional(),
        note: z.string().max(500).nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertStaff(context.userId);
    const rows = data.student_ids.map((sid) => ({
      lab_level: data.lab_level,
      lab_slug: data.lab_slug,
      student_id: sid,
      assigned_by: context.userId,
      status: "pending",
      due_date: data.due_date ?? null,
      note: data.note ?? null,
    }));
    const { error } = await (await db()).from("lab_assignments").insert(rows);
    if (error) throw new Error(error.message);
    return { ok: true, count: rows.length };
  });

export const listMyLabAssignments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await (await db())
      .from("lab_assignments")
      .select("id, lab_level, lab_slug, status, due_date, note, completed_at, created_at")
      .eq("student_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listLabAssignmentsForStaff = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.userId);
    const client = await db();
    const { data, error } = await client
      .from("lab_assignments")
      .select("id, lab_level, lab_slug, status, due_date, note, completed_at, created_at, student_id, assigned_by")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    const ids = Array.from(new Set((data ?? []).map((r) => r.student_id)));
    const { data: profs } = ids.length
      ? await client.from("profiles").select("id, full_name").in("id", ids)
      : { data: [] as any[] };
    const map = new Map((profs ?? []).map((p: any) => [p.id, p.full_name]));
    return (data ?? []).map((r) => ({ ...r, student_name: map.get(r.student_id) ?? "Alumno" }));
  });

export const setLabAssignmentStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), status: z.enum(["pending", "completed"]) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { error } = await (await db())
      .from("lab_assignments")
      .update({
        status: data.status,
        completed_at: data.status === "completed" ? new Date().toISOString() : null,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteLabAssignment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertStaff(context.userId);
    const { error } = await (await db()).from("lab_assignments").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
