grant usage on schema private to authenticated;
grant execute on function public.has_role(uuid, app_role) to authenticated;
grant execute on function private.teacher_has_student(uuid, uuid) to authenticated;
grant execute on function public.is_course_teacher(uuid, uuid) to authenticated;
grant execute on function public.is_enrolled(uuid, uuid) to authenticated;
grant execute on function public.teacher_has_student(uuid, uuid) to authenticated;