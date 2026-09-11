import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// All handlers below run as the signed-in person. Reading the directory and
// toggling flags is allowed by row-level security for administrators; the
// delicate operations (create account, hand out a new password, delete an
// account) go through guarded database routines that re-check the role of the
// caller before doing anything.
type NewAccount = { id: string; email: string; role: string; password: string };

export const adminGetStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin, getDb } = await import("./admin-helpers.server");
    await assertAdmin(context.userId);
    const db = getDb();
    const [students, teachers, courses, enrollments] = await Promise.all([
      db.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
      db.from("profiles").select("*", { count: "exact", head: true }).eq("role", "teacher"),
      db.from("courses").select("*", { count: "exact", head: true }),
      db.from("enrollments").select("*", { count: "exact", head: true }),
    ]);
    return {
      students: students.count ?? 0,
      teachers: teachers.count ?? 0,
      courses: courses.count ?? 0,
      enrollments: enrollments.count ?? 0,
    };
  });

export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin, getDb } = await import("./admin-helpers.server");
    await assertAdmin(context.userId);
    const { data, error } = await getDb()
      .from("profiles")
      .select("id, full_name, role, email, status, is_active, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((p) => ({
      id: p.id,
      full_name: p.full_name,
      role: p.role,
      email: p.email ?? "",
      status: p.status,
      is_active: p.is_active,
      created_at: p.created_at,
    }));
  });

const createUserSchema = z.object({
  full_name: z.string().min(1).max(120),
  email: z.string().email(),
  role: z.enum(["teacher", "student"]),
});

export const adminCreateUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => createUserSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { getRole, getDb } = await import("./admin-helpers.server");
    const callerRole = await getRole(context.userId);
    if (callerRole !== "admin" && !(callerRole === "teacher" && data.role === "student")) {
      throw new Error("Forbidden");
    }
    const { data: created, error } = await getDb().rpc("staff_create_user", {
      p_full_name: data.full_name,
      p_email: data.email,
      p_role: data.role,
    });
    if (error) throw new Error(error.message);
    const account = created as unknown as NewAccount;
    return { id: account.id, email: account.email, password: account.password };
  });

export const adminDeleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { assertAdmin, getDb } = await import("./admin-helpers.server");
    await assertAdmin(context.userId);
    if (data.id === context.userId) throw new Error("Cannot delete yourself");
    const { error } = await getDb().rpc("staff_delete_user", { p_user_id: data.id });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminToggleActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    id: z.string().uuid(), is_active: z.boolean(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { assertAdmin, getDb } = await import("./admin-helpers.server");
    await assertAdmin(context.userId);
    const { error } = await getDb().from("profiles")
      .update({ is_active: data.is_active, status: data.is_active ? "active" : "inactive" })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminUpdateUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    id: z.string().uuid(),
    full_name: z.string().min(1).max(120),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { assertAdmin, getDb } = await import("./admin-helpers.server");
    await assertAdmin(context.userId);
    const { error } = await getDb().from("profiles")
      .update({ full_name: data.full_name })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminUpdateRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    id: z.string().uuid(),
    role: z.enum(["admin", "teacher", "student"]),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { assertAdmin, getDb } = await import("./admin-helpers.server");
    await assertAdmin(context.userId);
    if (data.id === context.userId) throw new Error("No puedes cambiar tu propio rol");
    const { error } = await getDb().from("profiles")
      .update({ role: data.role })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminResetPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { assertAdmin, getDb } = await import("./admin-helpers.server");
    await assertAdmin(context.userId);
    const { data: result, error } = await getDb().rpc("staff_set_password", { p_user_id: data.id });
    if (error) throw new Error(error.message);
    const password = (result as unknown as { password?: string })?.password;
    if (!password) throw new Error("No se pudo generar la nueva contraseña");
    return { password };
  });

export const adminListByRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ role: z.enum(["teacher", "student"]) }).parse(d))
  .handler(async ({ data, context }) => {
    const { assertAdmin, getDb } = await import("./admin-helpers.server");
    await assertAdmin(context.userId);
    const { data: rows, error } = await getDb().from("profiles")
      .select("id, full_name").eq("role", data.role).order("full_name");
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminEnrollStudent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    student_id: z.string().uuid(),
    course_id: z.string().uuid(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { assertAdmin, getDb } = await import("./admin-helpers.server");
    await assertAdmin(context.userId);
    const { error } = await getDb().from("enrollments")
      .upsert({ student_id: data.student_id, course_id: data.course_id }, { onConflict: "student_id,course_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
