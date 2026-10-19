# LMS de clases particulares: planes, horas, lecciones y labs por alumno

## La idea
Reemplazar los repos de GitHub por un **Hub por alumno** dentro del LMS. Así puedes controlar cada plan mensual, sus horas y lecciones, los Labs de Clase y de Tarea, y las capturas de resultados.

## Cómo funciona

```text
Admin: crea alumno -> le asigna un plan del mes -> le asigna un teacher
     -> sube o elige labs (de Clase / de Tarea) para cada lección
Teacher: ve sus alumnos -> abre el Lab de Clase y lo presenta
     -> registra la clase (horas + comentario + material) -> activa la tarea
Alumno: ve su Hub (slides + tarjetas de tareas) -> hace el lab
     -> sube la captura de su resultado
Teacher/Admin: revisa la captura -> marca la tarea y la lección como terminadas
```

## 1. Planes y control de horas
- Cada alumno tiene un **plan mensual activo**: Essential (2 h/sem, 4 lecciones), Progress (3 h/sem, 6 lecciones) o Intensive (4 h/sem, 8 lecciones). Cada lección dura 2 h.
- **Registro de clase**: fecha, horas dadas (0.5, 1, 1.5, 2...), comentario y lección vista.
- **Saldo de horas**: se muestran las horas contratadas, las dadas y las pendientes. Si una semana solo hay 1 o 2 horas, la diferencia queda como horas por reponer y se ve claramente.
- Al cerrar el mes, las horas que falten se pueden **arrastrar al mes siguiente** con un botón y una nota del motivo (por ejemplo, un acuerdo mutuo).
- Habrá un historial de meses por alumno.

## 2. Lecciones y labs
- Cada mes tiene sus lecciones (Lección 1…N) y cada lección tiene:
  - **Lab de Clase**: solo lo ven el teacher y el admin, y sirve como presentación.
  - **Lab de Tarea**: lo ve el alumno cuando el teacher lo **activa**.
  - **Link de Google Slides** opcional, que se muestra embebido igual que en el hub de Nicole.
  - Material extra o comentarios del teacher.
- Los labs se pueden **subir como HTML** o elegir del catálogo existente (labs del LMS o públicos). Los HTML subidos quedan en una biblioteca y se pueden reutilizar con otros alumnos y organizarse por nivel o bloque.

## 3. Hub del alumno (reemplaza al repo)
- La portada tiene la presentación de slides y tarjetas de tareas agrupadas por bloque o mes, con su estado: Pendiente, Entregada, Revisada o Terminada.
- Cada tarjeta abre el lab y tiene un botón **"Subir captura de resultados"**, así ya no hace falta WhatsApp.
- El alumno también ve sus horas del mes: dadas y por reponer.

## 4. Vista del teacher
- Ve solo los alumnos que tú le asignaste, con su lección de hoy, el Lab de Clase y la tarea por activar.
- Puede registrar las horas y comentarios y revisar las capturas para marcarlas como terminadas.

## 5. Panel admin
- Tabla de alumnos con plan, teacher, horas del mes (dadas/contratadas), horas por reponer, lecciones terminadas y tareas por revisar.
- Desde ahí asignas el teacher, el plan y los labs.

## Qué conservar y qué quitar
| Hoy | Propuesta |
|---|---|
| Labs del LMS + puntaje automático | Se quedan y se pueden usar como lab de tarea |
| Catálogo público de labs, examen diagnóstico, ruleta, landing | Se quedan |
| Cursos / secciones / inscripciones / certificados | Se ocultan del menú, porque no encajan con clases 1 a 1. Los datos no se borran. |
| Actividades con revisión iterativa | Se ocultan del menú. Las capturas de tareas cubren este caso. |
| Anuncios, calendario, notificaciones | Se quedan y el calendario muestra las clases registradas |

## Mejoras extra (para que las apruebes después)
- Aviso cuando a un alumno le queden pocas horas o tenga muchas por reponer.
- Reporte mensual en PDF por alumno con horas, lecciones y comentarios, para enviarlo a padres o al alumno.
- Duplicar las lecciones de un alumno a otro del mismo nivel.
- Registrar pagos del plan, solo como registro manual.

## Detalles técnicos
- Tablas nuevas, con GRANTs y RLS basadas en roles existentes y en `teacher_has_student`:
  - `student_teachers` (student_id, teacher_id)
  - `student_plans` (student_id, plan_id, month, hours_contracted, lessons_total, carried_hours, status)
  - `class_sessions` (plan_id, student_id, teacher_id, date, hours, comment, lesson_id)
  - `class_lessons` (plan_id, order, title, slides_url, class_lab_ref, homework_lab_ref, homework_active, status, notes)
  - `lab_files` (id, title, level, block, storage_path, uploaded_by)
  - `homework_submissions` (lesson_id, student_id, screenshot_path, status, feedback, reviewed_by)
- Storage privado: `lab-html` para los labs subidos, que se sirven por URL firmada en un iframe con sandbox, y `homework-shots` para las capturas.
- Server functions en `src/lib/classes.functions.ts`. Rutas `/admin/students/$id` (hub de gestión), `/teacher/students/$id` y `/student/hub`. Las reglas de horas y lecciones irán en `src/lib/plans.ts` con sus tests.
- Se ajustan los menús de `dashboard-layout.tsx` para ocultar Cursos, Actividades y Certificados.
