// Datos de clases particulares. Todas las consultas corren como la persona que
// inició sesión; los permisos los aplica la base de datos (RLS + triggers).
import { supabase } from "@/integrations/supabase/client";
import { planDefaults, type PlanKey } from "@/lib/plans";
import { findLab } from "@/lib/labs";

export type StudentPlan = {
  id: string; student_id: string; plan_key: PlanKey; month: string;
  hours_contracted: number; lessons_total: number; carried_hours: number;
  carry_note: string | null; slides_url: string | null; status: "active" | "closed";
};
export type ClassLesson = {
  id: string; plan_id: string; student_id: string; order_index: number; title: string;
  slides_url: string | null; homework_lab_file_id: string | null; homework_lab_ref: string | null;
  homework_active: boolean; status: "pending" | "done"; notes: string | null;
  material_url: string | null; completed_at: string | null;
};
export type ClassSession = {
  id: string; plan_id: string; student_id: string; teacher_id: string; lesson_id: string | null;
  session_date: string; hours: number; comment: string | null;
};
export type LabFile = {
  id: string; title: string; level: string; block: string | null; kind: "class" | "homework";
  storage_path: string; created_at: string;
};
export type HomeworkSubmission = {
  id: string; lesson_id: string; student_id: string; screenshot_path: string;
  student_note: string | null; status: "submitted" | "reviewed" | "done";
  feedback: string | null; reviewed_at: string | null; created_at: string;
};
export type ClassLab = { lesson_id: string; student_id: string; lab_file_id: string | null; lab_ref: string | null };

const db = supabase as any;

function check<T>(r: { data: T; error: any }): T {
  if (r.error) throw new Error(r.error.message);
  return r.data;
}

/* ---------- Personas ---------- */
export async function listStudents() {
  return check(await db.from("profiles").select("id, full_name, email, is_active").eq("role", "student").order("full_name")) as
    { id: string; full_name: string; email: string | null; is_active: boolean }[];
}
export async function listTeachers() {
  return check(await db.from("profiles").select("id, full_name").eq("role", "teacher").order("full_name")) as
    { id: string; full_name: string }[];
}
export async function getProfileName(id: string) {
  const r = check(await db.from("profiles").select("full_name").eq("id", id).maybeSingle()) as { full_name: string } | null;
  return r?.full_name ?? "Alumno";
}
export async function staffNames(): Promise<Record<string, string>> {
  const { data } = await db.rpc("staff_directory");
  const out: Record<string, string> = {};
  for (const r of (data ?? []) as { id: string; full_name: string }[]) out[r.id] = r.full_name;
  return out;
}
export async function listStudentTeachers(studentId?: string) {
  let q = db.from("student_teachers").select("id, student_id, teacher_id");
  if (studentId) q = q.eq("student_id", studentId);
  return check(await q) as { id: string; student_id: string; teacher_id: string }[];
}
export async function assignTeacher(studentId: string, teacherId: string) {
  check(await db.from("student_teachers").insert({ student_id: studentId, teacher_id: teacherId }));
}
export async function unassignTeacher(id: string) {
  check(await db.from("student_teachers").delete().eq("id", id));
}

/* ---------- Planes ---------- */
export async function listPlans(studentId?: string) {
  let q = db.from("student_plans").select("*").order("month", { ascending: false });
  if (studentId) q = q.eq("student_id", studentId);
  return check(await q) as StudentPlan[];
}
export async function createPlan(input: {
  student_id: string; plan_key: PlanKey; month: string; slides_url?: string | null;
  carried_hours?: number; carry_note?: string | null; created_by: string;
}) {
  const d = planDefaults(input.plan_key);
  const plan = check(await db.from("student_plans").insert({
    student_id: input.student_id, plan_key: input.plan_key, month: input.month,
    hours_contracted: d.hours_contracted, lessons_total: d.lessons_total,
    carried_hours: input.carried_hours ?? 0, carry_note: input.carry_note ?? null,
    slides_url: input.slides_url || null, created_by: input.created_by,
  }).select("*").single()) as StudentPlan;
  const lessons = Array.from({ length: d.lessons_total }, (_, i) => ({
    plan_id: plan.id, student_id: input.student_id, order_index: i + 1, title: `Lección ${i + 1}`,
  }));
  check(await db.from("class_lessons").insert(lessons));
  return plan;
}
export async function updatePlan(id: string, patch: Partial<StudentPlan>) {
  check(await db.from("student_plans").update(patch).eq("id", id));
}
export async function deletePlan(id: string) {
  check(await db.from("student_plans").delete().eq("id", id));
}

/* ---------- Lecciones ---------- */
export async function listLessons(planId: string) {
  return check(await db.from("class_lessons").select("*").eq("plan_id", planId).order("order_index")) as ClassLesson[];
}
export async function listStudentLessons(studentId: string) {
  return check(await db.from("class_lessons").select("*").eq("student_id", studentId).order("order_index")) as ClassLesson[];
}
export async function updateLesson(id: string, patch: Partial<ClassLesson>) {
  check(await db.from("class_lessons").update(patch).eq("id", id));
}
export async function addLesson(plan: StudentPlan, order: number) {
  check(await db.from("class_lessons").insert({
    plan_id: plan.id, student_id: plan.student_id, order_index: order, title: `Lección ${order}`,
  }));
}
export async function deleteLesson(id: string) {
  check(await db.from("class_lessons").delete().eq("id", id));
}
export async function listClassLabs(studentId: string) {
  return check(await db.from("class_lesson_labs").select("*").eq("student_id", studentId)) as ClassLab[];
}
export async function setClassLab(lesson: ClassLesson, lab_file_id: string | null, lab_ref: string | null) {
  if (!lab_file_id && !lab_ref) {
    check(await db.from("class_lesson_labs").delete().eq("lesson_id", lesson.id));
    return;
  }
  check(await db.from("class_lesson_labs").upsert({
    lesson_id: lesson.id, student_id: lesson.student_id, lab_file_id, lab_ref,
  }));
}

/* ---------- Sesiones / horas ---------- */
export async function listSessions(planId: string) {
  return check(await db.from("class_sessions").select("*").eq("plan_id", planId).order("session_date", { ascending: false })) as ClassSession[];
}
export async function listSessionsForPlans(planIds: string[]) {
  if (!planIds.length) return [] as ClassSession[];
  return check(await db.from("class_sessions").select("*").in("plan_id", planIds)) as ClassSession[];
}
export async function addSession(input: Omit<ClassSession, "id">) {
  check(await db.from("class_sessions").insert(input));
}
export async function deleteSession(id: string) {
  check(await db.from("class_sessions").delete().eq("id", id));
}

/* ---------- Biblioteca de labs HTML ---------- */
export async function listLabFiles() {
  return check(await db.from("lab_files").select("*").order("level").order("title")) as LabFile[];
}
export async function uploadLabFile(file: File, meta: { title: string; level: string; block: string | null; kind: "class" | "homework"; uploaded_by: string }) {
  const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${meta.level}/${Date.now()}-${safe}`;
  const up = await supabase.storage.from("lab-html").upload(path, file, { contentType: "text/html", upsert: false });
  if (up.error) throw new Error(up.error.message);
  check(await db.from("lab_files").insert({ ...meta, storage_path: path }));
}
export async function deleteLabFile(f: LabFile) {
  await supabase.storage.from("lab-html").remove([f.storage_path]);
  check(await db.from("lab_files").delete().eq("id", f.id));
}
export async function loadLabHtml(labFileId: string) {
  const f = check(await db.from("lab_files").select("storage_path, title").eq("id", labFileId).maybeSingle()) as { storage_path: string; title: string } | null;
  if (!f) throw new Error("No tienes acceso a este lab.");
  const r = await supabase.storage.from("lab-html").download(f.storage_path);
  if (r.error || !r.data) throw new Error("No se pudo abrir el lab.");
  return { title: f.title, html: await r.data.text() };
}

/* ---------- Tareas (capturas) ---------- */
export async function listSubmissions(studentId: string) {
  return check(await db.from("homework_submissions").select("*").eq("student_id", studentId).order("created_at", { ascending: false })) as HomeworkSubmission[];
}
export async function listPendingSubmissions() {
  return check(await db.from("homework_submissions").select("id, student_id, status").eq("status", "submitted")) as
    { id: string; student_id: string; status: string }[];
}
export async function uploadSubmission(lesson: ClassLesson, file: File, note: string | null) {
  const ext = (file.name.split(".").pop() || "png").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${lesson.student_id}/${lesson.id}/${Date.now()}.${ext}`;
  const up = await supabase.storage.from("homework-shots").upload(path, file, { contentType: file.type || "image/png" });
  if (up.error) throw new Error(up.error.message);
  check(await db.from("homework_submissions").insert({
    lesson_id: lesson.id, student_id: lesson.student_id, screenshot_path: path, student_note: note || null,
  }));
}
/** Sube varias capturas a la vez; la nota va solo en la primera. */
export async function uploadSubmissions(lesson: ClassLesson, files: File[], note: string | null) {
  for (let i = 0; i < files.length; i++) await uploadSubmission(lesson, files[i], i === 0 ? note : null);
}
export async function getLesson(id: string) {
  return check(await db.from("class_lessons").select("*").eq("id", id).maybeSingle()) as ClassLesson | null;
}
export async function listStudentSessions(studentId: string) {
  return check(await db.from("class_sessions").select("*").eq("student_id", studentId).order("session_date", { ascending: false })) as ClassSession[];
}
export async function reviewSubmission(id: string, status: "reviewed" | "done", feedback: string | null) {
  check(await db.from("homework_submissions").update({ status, feedback }).eq("id", id));
}
export async function signedShot(path: string) {
  const r = await supabase.storage.from("homework-shots").createSignedUrl(path, 3600);
  return r.data?.signedUrl ?? null;
}
/** Asegura que el HTML del lab se escale al ancho de la pantalla. */
export function withViewport(html: string) {
  if (/<meta[^>]+name=["']?viewport/i.test(html)) return html;
  const tag = '<meta name="viewport" content="width=device-width, initial-scale=1">';
  return /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, (m) => m + tag) : tag + html;
}

/* ---------- Utilidades ---------- */
export function slidesEmbed(url: string | null | undefined) {
  if (!url) return null;
  const m = url.match(/docs\.google\.com\/presentation\/d\/(?:e\/)?([a-zA-Z0-9_-]+)/);
  if (!m) return null;
  if (url.includes("/d/e/")) return `https://docs.google.com/presentation/d/e/${m[1]}/embed?start=false&loop=false`;
  return `https://docs.google.com/presentation/d/${m[1]}/embed?start=false&loop=false`;
}

/** "a1/slug" del catálogo existente → datos del lab. */
export function catalogLab(ref: string | null | undefined) {
  if (!ref) return null;
  const [level, slug] = ref.split("/");
  const lab = findLab(level, slug);
  return lab ? { level, slug, title: lab.title } : null;
}

export function homeworkState(lesson: ClassLesson, subs: HomeworkSubmission[]) {
  // La tarea es independiente de la lección: terminar la clase no cierra la tarea.
  const mine = subs.filter((s) => s.lesson_id === lesson.id);
  if (mine.some((s) => s.status === "done")) return "done" as const;
  if (mine.some((s) => s.status === "reviewed")) return "reviewed" as const;
  if (mine.length) return "submitted" as const;
  return "pending" as const;
}

export const HW_LABEL = { pending: "Sin evidencia", submitted: "Entregada", reviewed: "Corregir", done: "Terminada" } as const;

/** Primera lección pendiente (en orden) = la próxima clase. */
export function nextLesson(lessons: ClassLesson[]) {
  return [...lessons].sort((a, b) => a.order_index - b.order_index).find((l) => l.status !== "done") ?? null;
}
export async function listLessonsForPlans(planIds: string[]) {
  if (!planIds.length) return [] as ClassLesson[];
  return check(await db.from("class_lessons").select("*").in("plan_id", planIds).order("order_index")) as ClassLesson[];
}

/* ---------- Mensajes por lección (teacher ↔ alumno) ---------- */
export type LessonMessage = { id: string; lesson_id: string; student_id: string; author_id: string; body: string; created_at: string };
export async function listLessonMessages(studentId: string) {
  return check(await db.from("class_lesson_messages").select("*").eq("student_id", studentId).order("created_at")) as LessonMessage[];
}
export async function addLessonMessage(lesson: ClassLesson, authorId: string, body: string) {
  check(await db.from("class_lesson_messages").insert({ lesson_id: lesson.id, student_id: lesson.student_id, author_id: authorId, body }));
}
export async function deleteLessonMessage(id: string) {
  check(await db.from("class_lesson_messages").delete().eq("id", id));
}

/* ---------- Aviso más reciente ---------- */
export async function latestAnnouncement() {
  const { data } = await db.from("announcements").select("id, title, body, created_at").is("course_id", null)
    .order("pinned", { ascending: false }).order("created_at", { ascending: false }).limit(1);
  return ((data ?? [])[0] ?? null) as { id: string; title: string; body: string; created_at: string } | null;
}

/* ---------- Ficha privada (solo staff) ---------- */
export type StudentPrivateProfile = {
  student_id: string; phone: string | null; goals_summary: string | null; diagnosis: string | null;
  cefr_level: string | null; updated_by: string | null; updated_at: string;
};
export async function getStudentInfo(studentId: string) {
  const p = check(await db.from("student_profiles_private").select("*").eq("student_id", studentId).maybeSingle()) as StudentPrivateProfile | null;
  const e = check(await db.from("profiles").select("email").eq("id", studentId).maybeSingle()) as { email: string | null } | null;
  return { profile: p, email: e?.email ?? null };
}
export async function saveStudentInfo(studentId: string, userId: string, patch: Pick<StudentPrivateProfile, "phone" | "goals_summary" | "diagnosis" | "cefr_level">) {
  check(await db.from("student_profiles_private").upsert({ student_id: studentId, ...patch, updated_by: userId, updated_at: new Date().toISOString() }));
}
