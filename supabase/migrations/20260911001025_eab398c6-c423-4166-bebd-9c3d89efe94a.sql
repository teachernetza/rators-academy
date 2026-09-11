-- ============================================================
-- El directorio de docentes pasa de vista (security definer) a
-- funcion interna protegida + fachada publica sin privilegios.
-- ============================================================
drop view if exists public.staff_directory;

create or replace function private.staff_directory()
returns table(id uuid, full_name text, avatar_url text)
language sql
stable
security definer
set search_path to 'public', 'pg_temp'
as $$
  select p.id, p.full_name, p.avatar_url
    from public.profiles p
   where p.role in ('teacher', 'admin');
$$;

revoke all on function private.staff_directory() from public, anon;
grant execute on function private.staff_directory() to authenticated;

create or replace function public.staff_directory()
returns table(id uuid, full_name text, avatar_url text)
language sql
stable
security invoker
set search_path to 'public', 'pg_temp'
as $$
  select * from private.staff_directory();
$$;

revoke all on function public.staff_directory() from public, anon;
grant execute on function public.staff_directory() to authenticated;
