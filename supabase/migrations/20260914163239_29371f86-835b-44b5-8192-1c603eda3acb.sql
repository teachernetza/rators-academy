create or replace function private.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = _user_id and role = _role)
$$;

create or replace function private.is_course_teacher(_user_id uuid, _course_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.courses where id = _course_id and teacher_id = _user_id)
$$;

create or replace function private.is_enrolled(_user_id uuid, _course_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.enrollments where student_id = _user_id and course_id = _course_id)
$$;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable set search_path = public, pg_temp as $$
  select private.has_role(_user_id, _role)
$$;

create or replace function public.is_course_teacher(_user_id uuid, _course_id uuid)
returns boolean language sql stable set search_path = public, pg_temp as $$
  select private.is_course_teacher(_user_id, _course_id)
$$;

create or replace function public.is_enrolled(_user_id uuid, _course_id uuid)
returns boolean language sql stable set search_path = public, pg_temp as $$
  select private.is_enrolled(_user_id, _course_id)
$$;

create or replace function public.teacher_has_student(_teacher_id uuid, _student_id uuid)
returns boolean language sql stable set search_path = public, pg_temp as $$
  select private.teacher_has_student(_teacher_id, _student_id)
$$;

grant execute on function private.has_role(uuid, app_role) to authenticated;
grant execute on function private.is_course_teacher(uuid, uuid) to authenticated;
grant execute on function private.is_enrolled(uuid, uuid) to authenticated;
grant execute on function private.teacher_has_student(uuid, uuid) to authenticated;
grant execute on function public.has_role(uuid, app_role) to authenticated;
grant execute on function public.is_course_teacher(uuid, uuid) to authenticated;
grant execute on function public.is_enrolled(uuid, uuid) to authenticated;
grant execute on function public.teacher_has_student(uuid, uuid) to authenticated;