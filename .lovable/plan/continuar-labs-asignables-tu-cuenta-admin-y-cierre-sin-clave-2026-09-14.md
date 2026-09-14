# Continuar: Labs asignables, tu cuenta admin y cierre sin clave secreta

Estado confirmado hoy: el correo en las fichas, las funciones protegidas (crear cuenta, contraseña nueva, eliminar, progreso/constancia), el directorio de teachers y la tabla de Labs asignados ya están aplicados. Falta la parte visible y tu cuenta.

## 1. Lista del curso para los comentarios

La función de "lista del curso" (que permite ver el nombre de quien comenta sin abrir las fichas de todos) quedó sin aplicar por un error de sintaxis. Se vuelve a crear correctamente: admins, el teacher del curso y los alumnos inscritos pueden ver nombre y rol de los miembros de ese curso, nada más.

Después se conectan tres pantallas para que usen las listas seguras en vez de leer fichas protegidas:
- Catálogo de cursos (nombre del teacher)
- Lista de cursos (nombre del teacher)
- Comentarios de lección (nombre del autor)

## 2. Labs asignables (lo principal que falta)

- **Botón "Asignar Lab"** dentro de cada Lab del catálogo y en el listado por nivel, visible solo para teacher y admin. Permite elegir uno o varios alumnos, fecha límite opcional y una nota.
- **"Mis Labs"** para el alumno: lista de Labs asignados con nivel, fecha límite, nota del teacher, acceso directo al Lab y botón "Marcar como completado".
- **Seguimiento** para teacher y admin: quién tiene qué Lab, pendiente o completado, con opción de quitar o reasignar.
- Entradas nuevas en el menú lateral de los tres roles.

## 3. Tu cuenta de administradora

- `teacher.netza.varo@gmail.com` pasa de teacher a **admin**, con nombre "Netza Varo" y una contraseña temporal que te doy en el chat.
- Se añade el bloque **"Cambiar contraseña"** en la página de perfil para que la cambies de inmediato.
- La cuenta de prueba `admin@ratorsacademy.com` (contraseña conocida públicamente) se desactiva.

## 4. Comprobación

Con un navegador automatizado: entrar como admin, crear un alumno, asignar un Lab, entrar como ese alumno, marcarlo como completado y ver el seguimiento. Además, una revisión final de que ningún archivo pide la clave secreta.

## 5. Lo único que queda de tu lado (Vercel)

En Settings → Environment Variables agrega dos valores, cada uno con dos nombres:

| Valor | Nombres |
|---|---|
| Dirección de la base | `SUPABASE_URL` y `VITE_SUPABASE_URL` |
| Clave pública | `SUPABASE_PUBLISHABLE_KEY` y `VITE_SUPABASE_PUBLISHABLE_KEY` |

No hace falta ninguna clave secreta. Luego, volver a publicar.

## Detalles técnicos

- Migración: `private.course_roster(uuid)` SECURITY DEFINER + envoltorio `public.course_roster(uuid)` SECURITY INVOKER, con `revoke ... on function public.course_roster(uuid) from public, anon` (la firma con `=>` fue el error anterior) y `grant execute ... to authenticated`.
- Código: `catalog.functions.ts` y `courses.functions.ts` usan `rpc("staff_directory")`; `comments.functions.ts` usa `rpc("course_roster", { p_course_id })` con el `courseId` que ya devuelve `assertCanAccessLesson`.
- Labs: nuevo `src/lib/labs.functions.ts` (`assignLab`, `listMyLabAssignments`, `listLabAssignmentsForStaff`, `setLabAssignmentStatus`, `deleteLabAssignment`) sobre `lab_assignments` con `requireSupabaseAuth` + `userClient()`; `src/components/labs/assign-lab-dialog.tsx` modelado sobre `assign-activity-dialog.tsx`; rutas `src/routes/student/labs.tsx`, `teacher/labs.tsx`, `admin/labs.tsx` con `RoleGuard`; enlaces en `dashboard-layout.tsx`.
- Cuenta: `update public.profiles` a rol admin + `staff_set_password` para la temporal; desactivar la cuenta demo con `is_active = false`.
