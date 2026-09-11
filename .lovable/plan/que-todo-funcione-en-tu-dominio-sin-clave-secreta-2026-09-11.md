# Que todo funcione en tu dominio, sin clave secreta

## Qué vas a obtener

Entras a https://teachernetza.online con **teacher.netza.varo@gmail.com**, y desde ahí creas teachers y students, armas cursos, asignas actividades y **asignas Labs a tus alumnos** con seguimiento de quién lo terminó. En Vercel ya no hará falta ninguna clave secreta: solo dos valores públicos.

## Por qué hoy no funciona en tu dominio

Casi toda la app (crear cuentas, cursos, actividades, calificar, constancias) está escrita para ejecutarse con la "clave secreta" de la base. En el enlace de Lovable esa clave llega automática; en Vercel no existe, así que todo falla. Además hay un enlace público (`/api/public/seed`) que crea cuentas de prueba con contraseñas conocidas: en tu dominio cualquiera podría entrar con ellas.

## 1. Nuevas reglas y funciones en la base

- **Crear cuenta** (`staff_create_user`): solo personal verificado. Un admin crea teachers, students o admins; un teacher solo students. Genera una contraseña temporal fuerte, deja el correo ya confirmado y crea el perfil. Devuelve la contraseña una sola vez para que la muestres.
- **Nueva contraseña** (`staff_set_password`): admin a cualquiera; teacher solo a sus alumnos.
- **Eliminar cuenta** (`staff_delete_user`): solo admin, nunca la propia. Si la cuenta tiene historial, avisa y sugiere desactivarla.
- **Progreso y constancia** (`sync_student_progress`): el porcentaje se recalcula en la base comprobando las lecciones realmente completadas, y la constancia se emite sola al llegar al 100%.
- **Correo del perfil**: la ficha de cada persona guarda su correo (se rellena con los 4 usuarios existentes) para poder listar usuarios sin acceso privilegiado.
- **Preguntas en lecciones**: un alumno podrá mandar una tarea pendiente a su teacher (hoy eso lo hacía el acceso privilegiado).

Todas verifican el rol dentro de la base y quedan cerradas para quien no tenga sesión iniciada.

## 2. Labs como recursos asignables

Nueva tabla de asignaciones de Lab: nivel y nombre del Lab, alumno, quien lo asignó, estado (pendiente / completado), fecha límite opcional, nota del teacher y fecha de completado.

- **Alumnos**: ven solo sus Labs, marcan "Completado", y no pueden cambiar a quién pertenece la asignación ni sus datos.
- **Teachers y admins**: asignan (uno o varios alumnos a la vez), reasignan, quitan y ven el seguimiento.
- Menú nuevo **"Mis Labs"** para el alumno, botón **"Asignar Lab"** dentro de cada Lab del catálogo y vista de seguimiento para teacher y admin con pendiente/completado por alumno.

## 3. La app deja de pedir la clave secreta

- Todas las operaciones (cursos, secciones, lecciones, inscripciones, actividades, entregas, revisiones, notas, anuncios, constancias, calendario, comentarios, invitaciones, progreso) pasan a ejecutarse como el usuario que inició sesión, con las reglas de acceso que ya existen.
- El panel de administración (crear/eliminar/desactivar usuarios, cambiar rol, restablecer contraseña, inscribir) se reescribe sobre las funciones nuevas.
- Se borra el enlace público de datos de prueba.
- Se revisa que ninguna pantalla vuelva a pedir la clave secreta.

## 4. Tu cuenta de administradora

- La cuenta **teacher.netza.varo@gmail.com** (hoy con rol teacher) pasa a **admin**, con el nombre corregido ("Netza Varo") y una contraseña temporal que te doy en el chat; la cambias dentro de la app (añado un bloque "Cambiar contraseña" en tu perfil).
- La cuenta de prueba `admin@ratorsacademy.com` (contraseña conocida) queda desactivada para que nadie entre con ella. Se puede reactivar si la quieres.

## 5. Vercel (2 minutos, una sola vez)

En tu proyecto de Vercel → Settings → Environment Variables, agrega estos dos valores con dos nombres cada uno:

| Valor | Dónde va |
|---|---|
| Dirección de tu base | `SUPABASE_URL` y `VITE_SUPABASE_URL` |
| Clave pública | `SUPABASE_PUBLISHABLE_KEY` y `VITE_SUPABASE_PUBLISHABLE_KEY` |

Ambos ya están en la configuración del proyecto y son públicos por diseño. **No** se necesita `SUPABASE_SERVICE_ROLE_KEY`. Después: publicar de nuevo y entrar desde tu dominio.

## Cómo verifico que quedó funcionando

Con un navegador automatizado: entrar como admin, crear un student, crear un curso, asignar una actividad y un Lab, entrar como el alumno, completar el Lab y entregar la actividad, revisar la bandeja del teacher y descargar la constancia. Y una comprobación final de que ningún archivo vuelve a usar el acceso privilegiado.

## Detalles técnicos

- **Migración**: `profiles.email` + índice + `handle_new_user` guarda el correo; funciones `SECURITY DEFINER` `public.staff_create_user`, `public.staff_set_password`, `public.staff_delete_user`, `public.sync_student_progress` (alta directa en `auth.users` + `auth.identities` con hash bcrypt y `email_confirmed_at = now()`); política de inserción en `pending_tasks` para alumnos→teacher; tabla `public.lab_assignments` con `GRANT`s, RLS activado, índices, restricciones de estado, disparo de protección para alumnos y `updated_at`. Ejecución de las funciones solo a `authenticated`.
- **Código**: `src/lib/*.functions.ts` cambian el cliente privilegiado por `context.supabase` de `requireSupabaseAuth`; `src/lib/admin.functions.ts` usa `supabase.rpc(...)`; `admin-helpers.server.ts` sin `client.server`; se elimina `src/routes/api/public/seed.ts` y el uso de `@/integrations/supabase/client.server` (el archivo autogenerado no se toca).
- **Labs**: nuevo `src/lib/labs.functions.ts` (`assignLab`, `listMyLabAssignments`, `listLabAssignmentsForStaff`, `setLabAssignmentStatus`, `deleteLabAssignment`), `assign-lab-dialog.tsx`, páginas `student/labs`, `teacher/labs`, `admin/labs`, entradas nuevas en el menú lateral y bloque "Cambiar contraseña" en el perfil.
- **Cuenta admin**: actualización de rol/contraseña de tu cuenta y desactivación de la cuenta de prueba, aplicados al terminar la migración.
