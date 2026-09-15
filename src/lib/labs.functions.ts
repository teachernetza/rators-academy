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

const ASSIGNMENT_COLS =
  "id, lab_level, lab_slug, status, due_date, note, completed_at, created_at, best_score, last_score, max_score, attempts, last_attempt_at";

export const listMyLabAssignments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await (await db())
      .from("lab_assignments")
      .select(ASSIGNMENT_COLS)
      .eq("student_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

/** Guarda el resultado de un lab del LMS (lo envía el propio lab por postMessage). */
export const submitLabResult = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        lab_level: z.string().min(1),
        lab_slug: z.string().min(1),
        score: z.number().int().min(0),
        max_score: z.number().int().min(1),
        sections: z
          .array(z.object({ title: z.string(), score: z.number(), max: z.number() }))
          .default([]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const client = await db();

    const { data: assignment } = await client
      .from("lab_assignments")
      .select("id, best_score, attempts")
      .eq("student_id", context.userId)
      .eq("lab_level", data.lab_level)
      .eq("lab_slug", data.lab_slug)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const now = new Date().toISOString();

    const { error: attErr } = await client.from("lab_attempts").insert({
      assignment_id: assignment?.id ?? null,
      student_id: context.userId,
      lab_level: data.lab_level,
      lab_slug: data.lab_slug,
      score: data.score,
      max_score: data.max_score,
      section_breakdown: data.sections,
      completed_at: now,
    });
    if (attErr) throw new Error(attErr.message);

    if (assignment) {
      const best = Math.max(assignment.best_score ?? 0, data.score);
      const { error } = await client
        .from("lab_assignments")
        .update({
          status: "completed",
          completed_at: now,
          best_score: best,
          last_score: data.score,
          max_score: data.max_score,
          attempts: (assignment.attempts ?? 0) + 1,
          last_attempt_at: now,
        })
        .eq("id", assignment.id);
      if (error) throw new Error(error.message);
    }

    return { ok: true, saved: !!assignment, score: data.score, max: data.max_score };
  });

/** Hoja de progreso de Labs para admin/teacher: resumen por alumno. */
export const labProgressOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertStaff(context.userId);
    const client = await db();

    const [{ data: assignments, error: aErr }, { data: attempts, error: tErr }] = await Promise.all([
      client
        .from("lab_assignments")
        .select(
          "id, student_id, lab_level, lab_slug, status, due_date, best_score, max_score, attempts, last_attempt_at, created_at",
        )
        .order("created_at", { ascending: false }),
      client
        .from("lab_attempts")
        .select("id, student_id, lab_level, lab_slug, score, max_score, section_breakdown, completed_at")
        .order("completed_at", { ascending: false }),
    ]);
    if (aErr) throw new Error(aErr.message);
    if (tErr) throw new Error(tErr.message);

    const ids = Array.from(
      new Set([
        ...(assignments ?? []).map((r) => r.student_id),
        ...(attempts ?? []).map((r) => r.student_id),
      ]),
    );
    const { data: profs } = ids.length
      ? await client.from("profiles").select("id, full_name, email").in("id", ids)
      : { data: [] as any[] };

    return (profs ?? []).map((p: any) => {
      const mine = (assignments ?? []).filter((a) => a.student_id === p.id);
      const myAttempts = (attempts ?? []).filter((a) => a.student_id === p.id);
      const completed = mine.filter((a) => a.status === "completed");
      const scored = completed.filter((a) => (a.max_score ?? 0) > 0);
      const avg = scored.length
        ? Math.round(
            scored.reduce((s, a) => s + ((a.best_score ?? 0) / (a.max_score || 1)) * 100, 0) /
              scored.length,
          )
        : null;
      return {
        student_id: p.id,
        full_name: p.full_name as string,
        email: p.email as string | null,
        assigned: mine.length,
        completed: completed.length,
        progress: mine.length ? Math.round((completed.length / mine.length) * 100) : 0,
        average: avg,
        attempts: myAttempts.length,
        last_activity: myAttempts[0]?.completed_at ?? null,
        labs: mine.map((a) => ({
          id: a.id,
          lab_level: a.lab_level,
          lab_slug: a.lab_slug,
          status: a.status,
          due_date: a.due_date,
          best_score: a.best_score,
          max_score: a.max_score,
          attempts: a.attempts,
          last_attempt_at: a.last_attempt_at,
          history: myAttempts
            .filter((t) => t.lab_level === a.lab_level && t.lab_slug === a.lab_slug)
            .map((t) => ({
              id: t.id,
              score: t.score,
              max_score: t.max_score,
              completed_at: t.completed_at,
              sections: t.section_breakdown,
            })),
        })),
      };
    });
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
