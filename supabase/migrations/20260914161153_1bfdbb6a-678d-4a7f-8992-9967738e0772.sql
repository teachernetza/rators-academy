create or replace function private.course_roster(p_course_id uuid)
returns table(id uuid, full_name text, role app_role)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.full_name, p.role
  from public.profiles p
  where (
      public.has_role(auth.uid(), 'admin')
      or public.is_course_teacher(auth.uid(), p_course_id)
      or public.is_enrolled(auth.uid(), p_course_id)
    )
    and (
      p.id = (select c.teacher_id from public.courses c where c.id = p_course_id)
      or exists (
        select 1 from public.enrollments e
        where e.course_id = p_course_id and e.student_id = p.id
      )
    )
$$;

create or replace function public.course_roster(p_course_id uuid)
returns table(id uuid, full_name text, role app_role)
language sql
stable
set search_path = public, pg_temp
as $$
  select * from private.course_roster(p_course_id);
$$;

revoke all on function public.course_roster(uuid) from public, anon;
grant execute on function public.course_roster(uuid) to authenticated;