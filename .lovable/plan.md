# Simplificar el LMS en torno a las clases

## La idea
Hoy el menú tiene secciones que se repiten o ya no se usan: Dashboard, Labs del LMS, Labs asignados, Progreso de Labs, Pending, Calendar y Announcements. Todo eso ya vive, o debería vivir, dentro de "Clases". El LMS queda armado alrededor de **una sola cosa: la próxima clase de cada alumno**.

## Menú nuevo

```text
Admin:    Inicio | Alumnos y clases | Biblioteca de labs | Equipo (teachers + students) | Ajustes
Teacher:  Inicio (mis clases de hoy) | Mis alumnos | Biblioteca (solo ver) | Perfil
Alumno:   Mi clase | Mis tareas | Perfil
```

Se quitan del menú: Dashboard antiguo, Labs asignados, Progreso de Labs como página aparte (pasa a la ficha del alumno), Pending (se junta con las tareas), Calendar y Announcements. Announcements se vuelve un aviso corto arriba del Inicio. No se borra ningún dato.

## Flujo del admin (3 clics)
1. En **Alumnos y clases** cada alumno es una tarjeta: plan, teacher, horas del mes y una etiqueta con **"Próxima clase: Lección 3"**.
2. Al abrirla aparece un panel claro de la próxima lección con dos casillas grandes: **Lab de clase** y **Lab de tarea**. Cada una tiene un botón "Subir HTML" o "Elegir de biblioteca", y hay un campo para el link de slides.
3. Las demás lecciones se ven abajo en una lista plegada.

## Flujo del teacher (ver lab y registrar)
1. En **Inicio** ve sus alumnos con la próxima clase de cada uno, con un botón **"Empezar clase"**.
2. "Empezar clase" abre el Lab de clase en pantalla completa, con las slides a un lado si existen.
3. Al terminar, el botón **"Registrar clase"** abre un formulario corto: lab usado (ya viene llenado), fecha (hoy por defecto), horas (1 o 2) y comentario. Con un switch opcional se activa la tarea en ese mismo paso.
4. Después revisa las capturas de tarea desde la misma ficha: Aprobar o Pedir corrección.

## Flujo del alumno
- **Mi clase:** la próxima lección con sus slides, el comentario del teacher y sus horas del mes.
- **Mis tareas:** tarjetas con su estado. Ahí el alumno abre el lab y sube su captura, y lee la respuesta del teacher. Así teacher y alumno se comunican dentro de la app.

## Interacción entre teacher y alumno
- Cada lección tiene un hilo de comentarios corto que ven los dos: el teacher deja notas o material extra y el alumno puede preguntar.
- La campanita de avisos aparece cuando hay tarea nueva, captura nueva o una clase registrada.

## Datos de demostración
Opcional: un alumno y un teacher de ejemplo con un plan, 2 lecciones con labs, una clase registrada y una tarea entregada. Sirven para mostrar la app completa. Se pueden borrar con un botón.

## Detalles técnicos
- `dashboard-layout.tsx`: se reducen los arrays de nav. Las rutas viejas siguen existiendo; las que se ocultan redirigen a la nueva vista equivalente.
- `/admin/dashboard`, `/teacher/dashboard` y `/student/dashboard` se reescriben como Inicio, usando `src/lib/classes.ts`. El progreso de labs pasa como pestaña dentro de `staff-student-hub`.
- `staff-student-hub.tsx` (597 líneas) se divide así: `NextLessonPanel` (admin asigna labs), `StartClassView` (teacher, lab en pantalla completa) y `LogClassDialog`. Este último crea `class_sessions` con fecha, horas y lab, y activa la tarea.
- Si hace falta, se agrega una migración: tabla `lesson_comments` con GRANTs y RLS (alumno dueño, teacher asignado, admin), y la columna `lab_used` en `class_sessions`.
- Las reglas de permisos actuales no cambian. Se actualizan `plans.test.ts` si cambia algo de horas.
