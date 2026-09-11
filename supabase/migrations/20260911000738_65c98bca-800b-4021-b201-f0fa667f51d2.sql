-- ============================================================
-- 1) Mover las funciones privilegiadas al esquema interno `private`
--    (no expuesto por la API pública)
-- ============================================================
alter function public.staff_create_user(text, text, public.app_role) set schema private;
alter function public.staff_set_password(uuid) set schema private;
alter function public.staff_delete_user(uuid) set schema private;
alter function public.sync_student_progress(uuid) set schema private;

revoke all on function private.staff_create_user(text, text, public.app_role) from public, anon;
revoke all on function private.staff_set_password(uuid) from public, anon;
revoke all on function private.staff_delete_user(uuid) from public, anon;
revoke all on function private.sync_student_progress(uuid) from public, anon;

grant execute on function private.staff_create_user(text, text, public.app_role) to authenticated;
grant execute on function private.staff_set_password(uuid) to authenticated;
grant execute on function private.staff_delete_user(uuid) to authenticated;
grant execute on function private.sync_student_progress(uuid) to authenticated;

-- ============================================================
-- 2) Fachadas publicas SIN privilegios propios (SECURITY INVOKER)
--    que simplemente reenvian la orden a la funcion interna
-- ============================================================
create or replace function public.staff_create_user(p_full_name text, p_email text, p_role public.app_role)
returns jsonb
language sql
security invoker
set search_path to 'public', 'pg_temp'
as $$
  select private.staff_create_user(p_full_name, p_email, p_role);
$$;

create or replace function public.staff_set_password(p_user_id uuid)
returns jsonb
language sql
security invoker
set search_path to 'public', 'pg_temp'
as $$
  select private.staff_set_password(p_user_id);
$$;

create or replace function public.staff_delete_user(p_user_id uuid)
returns jsonb
language sql
security invoker
set search_path to 'public', 'pg_temp'
as $$
  select private.staff_delete_user(p_user_id);
$$;

create or replace function public.sync_student_progress(p_course_id uuid)
returns jsonb
language sql
security invoker
set search_path to 'public', 'pg_temp'
as $$
  select private.sync_student_progress(p_course_id);
$$;

revoke all on function public.staff_create_user(text, text, public.app_role) from public, anon;
revoke all on function public.staff_set_password(uuid) from public, anon;
revoke all on function public.staff_delete_user(uuid) from public, anon;
revoke all on function public.sync_student_progress(uuid) from public, anon;

grant execute on function public.staff_create_user(text, text, public.app_role) to authenticated;
grant execute on function public.staff_set_password(uuid) to authenticated;
grant execute on function public.staff_delete_user(uuid) to authenticated;
grant execute on function public.sync_student_progress(uuid) to authenticated;
