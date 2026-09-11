-- ============================================================
-- 1) Perfiles con correo (para listar usuarios sin clave secreta)
-- ============================================================
alter table public.profiles add column if not exists email text;

update public.profiles p
   set email = lower(u.email)
  from auth.users u
 where u.id = p.id
   and p.email is null
   and u.email is not null;

create index if not exists profiles_email_lower_idx
  on public.profiles (lower(email));

-- El disparador de registro también guarda el correo
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'extensions'
as $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'student'),
    lower(COALESCE(NEW.email, ''))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- ============================================================
-- 2) Crear cuentas sin clave secreta
-- ============================================================
create or replace function public.staff_create_user(
  p_full_name text,
  p_email text,
  p_role public.app_role
)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'extensions'
as $$
DECLARE
  v_caller uuid := auth.uid();
  v_uid    uuid := gen_random_uuid();
  v_pw     text;
  v_email  text;
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Debes iniciar sesion';
  END IF;

  IF NOT (
    public.has_role(v_caller, 'admin')
    OR (p_role = 'student' AND public.has_role(v_caller, 'teacher'))
  ) THEN
    RAISE EXCEPTION 'No tienes permisos para crear esa cuenta';
  END IF;

  v_email := lower(btrim(coalesce(p_email, '')));
  IF v_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' THEN
    RAISE EXCEPTION 'El correo no es valido';
  END IF;
  IF btrim(coalesce(p_full_name, '')) = '' THEN
    RAISE EXCEPTION 'El nombre es obligatorio';
  END IF;

  IF EXISTS (SELECT 1 FROM auth.users WHERE lower(email) = v_email)
     OR EXISTS (SELECT 1 FROM public.profiles WHERE lower(email) = v_email) THEN
    RAISE EXCEPTION 'Ese correo ya tiene una cuenta';
  END IF;

  v_pw := translate(encode(gen_random_bytes(9), 'base64'), '+/=', '-_x');

  INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, is_sso_user, is_anonymous
  ) VALUES (
    v_uid,
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', v_email,
    extensions.crypt(v_pw, extensions.gen_salt('bf')),
    now(),
    jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
    jsonb_build_object('full_name', btrim(p_full_name), 'role', p_role::text),
    now(), now(), false, false
  );

  INSERT INTO auth.identities (
    id, user_id, provider_id, provider, identity_data, email, last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), v_uid, v_uid::text, 'email',
    jsonb_build_object(
      'sub', v_uid::text,
      'email', v_email,
      'email_verified', true,
      'phone_verified', false,
      'created_at', now(),
      'updated_at', now()
    ),
    v_email, now(), now(), now()
  );

  INSERT INTO public.profiles (id, full_name, role, email, status, is_active)
  VALUES (v_uid, btrim(p_full_name), p_role, v_email, 'active', true)
  ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        email = EXCLUDED.email;

  RETURN jsonb_build_object(
    'id', v_uid, 'email', v_email, 'role', p_role::text, 'password', v_pw
  );
END;
$$;

-- ============================================================
-- 3) Nueva contraseña temporal para un usuario
-- ============================================================
create or replace function public.staff_set_password(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'extensions'
as $$
DECLARE
  v_caller uuid := auth.uid();
  v_pw text;
  v_found boolean;
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Debes iniciar sesion';
  END IF;

  IF NOT (
    public.has_role(v_caller, 'admin')
    OR (public.has_role(v_caller, 'teacher') AND private.teacher_has_student(v_caller, p_user_id))
  ) THEN
    RAISE EXCEPTION 'No tienes permisos sobre esa cuenta';
  END IF;

  v_pw := translate(encode(gen_random_bytes(9), 'base64'), '+/=', '-_x');

  UPDATE auth.users
     SET encrypted_password = extensions.crypt(v_pw, extensions.gen_salt('bf')),
         updated_at = now()
   WHERE id = p_user_id;
  GET DIAGNOSTICS v_found = ROW_COUNT;

  IF NOT v_found THEN
    RAISE EXCEPTION 'La cuenta no existe';
  END IF;

  RETURN jsonb_build_object('id', p_user_id, 'password', v_pw);
END;
$$;

-- ============================================================
-- 4) Eliminar cuenta (solo admin, nunca la propia)
-- ============================================================
create or replace function public.staff_delete_user(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'extensions'
as $$
DECLARE
  v_caller uuid := auth.uid();
BEGIN
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Debes iniciar sesion';
  END IF;
  IF NOT public.has_role(v_caller, 'admin') THEN
    RAISE EXCEPTION 'Solo un administrador puede eliminar cuentas';
  END IF;
  IF p_user_id = v_caller THEN
    RAISE EXCEPTION 'No puedes eliminar tu propia cuenta';
  END IF;

  IF EXISTS (SELECT 1 FROM public.activities WHERE created_by = p_user_id)
     OR EXISTS (SELECT 1 FROM public.activity_assignments WHERE assigned_by = p_user_id)
     OR EXISTS (SELECT 1 FROM public.assignment_submissions WHERE submitted_to = p_user_id) THEN
    RAISE EXCEPTION 'Esta cuenta tiene historial. Desactivala en lugar de eliminarla.';
  END IF;

  DELETE FROM auth.users WHERE id = p_user_id;
  RETURN jsonb_build_object('id', p_user_id, 'deleted', true);
END;
$$;

-- ============================================================
-- 5) Progreso de curso y constancia (verificado en la base)
-- ============================================================
create or replace function public.sync_student_progress(p_course_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'extensions'
as $$
DECLARE
  v_uid uuid := auth.uid();
  v_lessons int := 0;
  v_done int := 0;
  v_pct int := 0;
  v_cert uuid;
  v_serial text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Debes iniciar sesion';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.enrollments
     WHERE student_id = v_uid AND course_id = p_course_id
  ) THEN
    RAISE EXCEPTION 'No estas inscrito en este curso';
  END IF;

  SELECT count(*) INTO v_lessons
    FROM public.lessons l
    JOIN public.sections s ON s.id = l.section_id
   WHERE s.course_id = p_course_id;

  IF v_lessons = 0 THEN
    RETURN jsonb_build_object('progress', 0, 'certificate', null);
  END IF;

  SELECT count(*) INTO v_done
    FROM public.lesson_completions lc
    JOIN public.lessons l ON l.id = lc.lesson_id
    JOIN public.sections s ON s.id = l.section_id
   WHERE lc.student_id = v_uid
     AND s.course_id = p_course_id;

  v_pct := round((v_done::numeric / v_lessons::numeric) * 100);

  UPDATE public.enrollments
     SET progress = v_pct
   WHERE student_id = v_uid AND course_id = p_course_id;

  IF v_pct = 100 THEN
    SELECT id INTO v_cert
      FROM public.certificates
     WHERE student_id = v_uid AND course_id = p_course_id
     LIMIT 1;

    IF v_cert IS NULL THEN
      v_serial := 'RA-' || to_char(now(), 'YYMM') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
      INSERT INTO public.certificates (student_id, course_id, serial)
      VALUES (v_uid, p_course_id, v_serial)
      RETURNING id INTO v_cert;
    END IF;
  END IF;

  RETURN jsonb_build_object('progress', v_pct, 'certificate', v_cert);
END;
$$;

-- ============================================================
-- 6) Los alumnos pueden enviar una tarea pendiente a su teacher
-- ============================================================
drop policy if exists "tasks_push_for_teacher" on public.pending_tasks;
create policy "tasks_push_for_teacher" on public.pending_tasks
  for insert to authenticated
  with check (
    user_id = auth.uid()
    OR private.teacher_has_student(user_id, auth.uid())
  );

-- ============================================================
-- 7) Labs asignables
-- ============================================================
create table if not exists public.lab_assignments (
  id uuid not null default gen_random_uuid() primary key,
  lab_level text not null,
  lab_slug text not null,
  student_id uuid not null references auth.users(id) on delete cascade,
  assigned_by uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending',
  due_date timestamp with time zone,
  completed_at timestamp with time zone,
  note text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint lab_assignments_level_check check (lab_level in ('a1','a2','b1','b2','c1')),
  constraint lab_assignments_status_check check (status in ('pending','completed')),
  constraint lab_assignments_completed_check check (
    (status = 'completed' and completed_at is not null)
    or (status = 'pending' and completed_at is null)
  )
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.lab_assignments TO authenticated;
GRANT ALL ON public.lab_assignments TO service_role;

ALTER TABLE public.lab_assignments ENABLE ROW LEVEL SECURITY;

create index if not exists lab_assignments_student_idx
  on public.lab_assignments (student_id, status);
create index if not exists lab_assignments_assigner_idx
  on public.lab_assignments (assigned_by);
create index if not exists lab_assignments_lab_idx
  on public.lab_assignments (lab_level, lab_slug);
create unique index if not exists lab_assignments_unique_idx
  on public.lab_assignments (lab_level, lab_slug, student_id, assigned_by);

drop policy if exists "lab_assignments_student_read" on public.lab_assignments;
create policy "lab_assignments_student_read" on public.lab_assignments
  for select to authenticated
  using (
    student_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR assigned_by = auth.uid()
    OR private.teacher_has_student(auth.uid(), student_id)
  );

drop policy if exists "lab_assignments_staff_insert" on public.lab_assignments;
create policy "lab_assignments_staff_insert" on public.lab_assignments
  for insert to authenticated
  with check (
    assigned_by = auth.uid()
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher'))
    AND EXISTS (SELECT 1 FROM public.profiles pr WHERE pr.id = student_id AND pr.role = 'student')
  );

drop policy if exists "lab_assignments_update" on public.lab_assignments;
create policy "lab_assignments_update" on public.lab_assignments
  for update to authenticated
  using (
    student_id = auth.uid()
    OR assigned_by = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR private.teacher_has_student(auth.uid(), student_id)
  )
  with check (
    student_id = auth.uid()
    OR assigned_by = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
    OR private.teacher_has_student(auth.uid(), student_id)
  );

drop policy if exists "lab_assignments_staff_delete" on public.lab_assignments;
create policy "lab_assignments_staff_delete" on public.lab_assignments
  for delete to authenticated
  using (
    assigned_by = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
  );

-- Un alumno solo puede cambiar el estado / fecha de completado de su asignación
create or replace function public.guard_lab_assignment_update()
returns trigger
language plpgsql
set search_path to 'public', 'extensions'
as $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Debes iniciar sesion';
  END IF;

  IF public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher') THEN
    RETURN NEW;
  END IF;

  IF NEW.student_id    IS DISTINCT FROM OLD.student_id
     OR NEW.assigned_by IS DISTINCT FROM OLD.assigned_by
     OR NEW.lab_level   IS DISTINCT FROM OLD.lab_level
     OR NEW.lab_slug    IS DISTINCT FROM OLD.lab_slug
     OR NEW.due_date    IS DISTINCT FROM OLD.due_date
     OR NEW.note        IS DISTINCT FROM OLD.note THEN
    RAISE EXCEPTION 'No puedes modificar esa asignacion';
  END IF;

  RETURN NEW;
END;
$$;

drop trigger if exists trg_lab_assignments_guard on public.lab_assignments;
create trigger trg_lab_assignments_guard
  before update on public.lab_assignments
  for each row execute function public.guard_lab_assignment_update();

drop trigger if exists trg_lab_assignments_updated_at on public.lab_assignments;
create trigger trg_lab_assignments_updated_at
  before update on public.lab_assignments
  for each row execute function public.update_updated_at_column();

-- ============================================================
-- 8) Solo personal autenticado puede usar las funciones nuevas
-- ============================================================
revoke all on function public.staff_create_user(text, text, public.app_role) from public, anon;
revoke all on function public.staff_set_password(uuid) from public, anon;
revoke all on function public.staff_delete_user(uuid) from public, anon;
revoke all on function public.sync_student_progress(uuid) from public, anon;

grant execute on function public.staff_create_user(text, text, public.app_role) to authenticated;
grant execute on function public.staff_set_password(uuid) to authenticated;
grant execute on function public.staff_delete_user(uuid) to authenticated;
grant execute on function public.sync_student_progress(uuid) to authenticated;
