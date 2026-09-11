# Que tu app funcione completa en teachernetza.online (sin clave secreta)

## Resultado esperado

Entras a https://teachernetza.online, inicias sesión con tu correo y puedes hacer todo lo que hoy solo funciona desde el enlace de Lovable: crear teachers y students, crear cursos, asignar actividades, calificar, y ahora también **asignar Labs a tus alumnos**. Nada de claves secretas, nada que pagar: solo dos valores públicos que ya tienes.

## Por qué hoy no funciona en tu dominio

La app está escrita para pedir siempre una "clave secreta" (la que Lovable no te deja ver en el plan gratuito) para casi cualquier operación, aunque sea una lectura sencilla. En el enlace de Lovable esa clave llega sola; en Vercel no existe, y por eso la pantalla se queda sin datos. Además hay un enlace público (`/api/public/seed`) que crea cuentas de prueba con contraseñas conocidas: en tu dominio publicado cualquiera podría entrar con ellas.

## 1. Cuentas de usuario sin clave secreta

Se agregan a la base de datos tres funciones internas protegidas (solo las puede ejecutar personal verificado, y la base comprueba el rol antes de dejar pasar):

- **Crear usuario** (admin crea teachers/students/admins; teacher solo students): genera una contraseña temporal fuerte, confirma el correo y registra el perfil.
- **Restablecer contraseña**: entrega una contraseña temporal nueva.
- **Eliminar cuenta**: solo admin, nunca la propia.

Para poder mostrar los correos en la lista de usuarios sin la clave secreta, la tabla de perfiles gana una columna `email`, que se llena con los correos de las 4 cuentas existentes y se mantiene al día al crear o registrar gente.

## 2. La app deja de depender de la clave secreta

- Todas las lecturas y escrituras (cursos, secciones, lecciones, actividades, entregas, calificaciones, notas, anuncios, certificaciones, calendario, comentarios, invitaciones, progreso) pasan a ejecutarse **como el usuario que inició sesión**, usando las reglas de acceso que ya existen (las 20 tablas tienen protección activada y 103 reglas).
- Las cuatro cosas que sí requerían privilegio (crear cuenta, cambiar contraseña, borrar cuenta, ver correos) se cambian a las funciones del punto 1.
- Se elimina el endpoint público de datos de prueba y todo el código que pedía la clave secreta.
- Se prueban los flujos reales y se completan las reglas de acceso que queden cortas (por ejemplo, que un admin pueda cambiar el rol o el nombre de otra persona).

*Respaldo honesto:* la alta directa de cuentas se valida creando una cuenta de verdad en el primer paso. Si la plataforma la bloqueara, el plan B es el flujo de invitaciones que ya tienes (la persona se registra ella misma y tú le das el rol), sin cambiar nada más.

## 3. Tu cuenta de administradora

- Se crea **teacher.netza.varo@gmail.com** con rol admin y correo ya confirmado, con una contraseña temporal fuerte que te doy en el chat; la cambias en cuanto entres.
- Desde esa cuenta creas teachers, students y cursos.
- Paso aparte (dime si lo quieres): **eliminar las cuentas de prueba** que quedaron creadas (`admin@ratorsacademy.com`, `teacher@ratorsacademy.com`, `student@ratorsacademy.com`), que hoy tienen contraseñas débiles y conocidas.

## 4. Los Labs se vuelven recursos asignables

Hoy los Labs (12, de A1 a B2) son solo una vitrina pública. Pasan a ser recursos que puedes asignar y whose seguimiento ves:

- **Nueva tabla de asignaciones de Lab**: qué Lab (nivel y nombre), a qué alumno, quién lo asignó, estado (pendiente / completado), fecha límite opcional y fecha de completado.
- **Quién puede qué**: los alumnos ven únicamente sus Labs y pueden marcarlos completados; los admins asignan a cualquiera; los teachers asignan solo a sus alumnos inscritos (usa la regla de curso que ya existe).
- **Menú del alumno**: nueva entrada "Mis Labs" con sus Labs asignados, estado, fecha límite y acceso directo al Lab.
- **Asignar**: botón "Asignar Lab" desde el catálogo de Labs y desde la ficha de un alumno, con selección de uno o varios alumnos y fecha límite.
- **Seguimiento**: vista "Labs asignados" para teacher y admin con quién lo tiene pendiente o ya lo completó, más un contador de Labs pendientes en el panel del alumno.
- El catálogo público de Labs sigue igual: abierto, sin registro.

## 5. Vercel (lo que harás tú, 2 minutos)

En tu proyecto de Vercel, Settings → Environment Variables, agrega estos dos valores con dos nombres cada uno (uno lo lee el servidor, el otro el navegador):

| Valor | Nombres donde va |
|---|---|
| Dirección de tu base de datos | `SUPABASE_URL` y `VITE_SUPABASE_URL` |
| Clave pública | `SUPABASE_PUBLISHABLE_KEY` y `VITE_SUPABASE_PUBLISHABLE_KEY` |

Ambos valores ya están en el archivo de configuración del proyecto y no son secretos (la clave pública está pensada para ser visible). **No** hace falta `SUPABASE_SERVICE_ROLE_KEY`. Después de configurar, se vuelve a publicar y se prueba en tu dominio.

## Cómo verifico que quedó funcionando

Con un navegador automatizado, en local y luego en tu dominio publicado: entrar con tu cuenta admin, crear un student, crear un curso, asignar una actividad y un Lab, entrar como el alumno, completar el Lab y entregar la actividad, calificar como teacher, y confirmar que ninguna pantalla vuelve a pedir la clave secreta.

## Detalles técnicos

- Migración nueva: funciones `private.staff_create_user`, `private.staff_set_password`, `private.staff_delete_user` (`SECURITY DEFINER`, guarda hash bcrypt con pgcrypto, `email_confirmed_at = now()`, inserta en `auth.users` + `auth.identities`, y el disparador existente crea el perfil); columna `profiles.email` con respaldo desde `auth.users`; `handle_new_user` guarda el correo; tabla `public.lab_assignments` con `GRANT`s, RLS activado y políticas apoyadas en `private.has_role` / `private.teacher_has_student`.
- Código: `src/lib/*.functions.ts` cambian del cliente privilegiado al cliente de sesión (`requireSupabaseAuth`); `src/lib/admin.functions.ts` usa las nuevas funciones; se borra `src/routes/api/public/seed.ts` y deja de usarse `client.server` (el archivo autogenerado no se toca).
- Labs: nuevo `src/lib/labs.functions.ts`, diálogo `assign-lab-dialog.tsx`, pantallas `student/labs`, `teacher/labs`, `admin/labs`, y entradas nuevas en el menú lateral de cada rol.
