-- ============================================================
-- 1) Los alumnos pueden ver los cursos publicados (catalogo)
-- ============================================================
drop policy if exists "courses_public_catalog" on public.courses;
create policy "courses_public_catalog" on public.courses
  for select to authenticated
  using (status = 'published');

-- ============================================================
-- 2) Directorio publico de docentes: solo nombre y foto
--    (el correo y el resto de la ficha siguen privados)
-- ============================================================
create or replace view public.staff_directory as
select id, full_name, avatar_url
  from public.profiles
 where role in ('teacher', 'admin');

revoke all on public.staff_directory from public, anon;
grant select on public.staff_directory to authenticated;
