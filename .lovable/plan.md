# Labs dentro del LMS, con puntaje y hoja de progreso

## Qué vas a tener

1. **Labs propios del LMS por nivel** (A1, A2, B1, B2, C1): uno nuevo de cada nivel, con la misma estructura:
   - Tema y objetivos del lab
   - Vocabulario + práctica de vocabulario
   - Gramática + práctica de gramática
   - Explicaciones, ejercicios y **puntaje final**
2. Estos labs del LMS **solo los ven los alumnos que los tienen asignados** (no aparecen en el catálogo público). Los labs públicos actuales siguen igual, abiertos para todos.
3. **Puntaje automático**: cuando el alumno termina el lab, el puntaje se guarda solo (no hace falta que marque nada a mano). Si lo repite, se guarda el mejor intento y se cuenta cuántos intentos hizo.
4. **Hoja de progreso** nueva, para admin y teacher: una tabla por alumno con labs asignados, labs completados, porcentaje de avance y promedio de puntaje, y al abrir un alumno se ve el detalle lab por lab (puntaje, intentos, fecha). El alumno ve su propia versión resumida en "Mis Labs".

## Los 5 labs de prueba

| Nivel | Tema | Foco gramatical |
|---|---|---|
| A1 | Daily routine & time | Present simple + adverbios de frecuencia |
| A2 | Travel & transport | Past simple (regular/irregular) |
| B1 | Work & career | Present perfect vs past simple |
| B2 | Media & technology | Voz pasiva y reported speech |
| C1 | Environment & society | Estructuras condicionales avanzadas e inversión |

Cada uno: 5 secciones, ~20 ejercicios calificables (opción múltiple, completar, emparejar, ordenar), barra de progreso, retroalimentación inmediata y pantalla final con puntaje y desglose por sección.

## Cómo asignar y seguir

- Desde **Labs asignados** (admin/teacher) habrá un catálogo interno donde eliges cualquier lab (LMS o público) y lo asignas a uno o varios alumnos con fecha límite y nota — igual que hoy, pero sin tener que entrar al lab.
- El alumno entra en **Mis Labs**, abre el lab, lo resuelve y su puntaje aparece de inmediato en el seguimiento.
- Cuando me pases labs nuevos, los integro con el mismo formato y quedan listos para asignar.

## Detalles técnicos

**Base de datos** (migración):
- `lab_assignments`: agregar `best_score`, `last_score`, `max_score`, `attempts`, `last_attempt_at`; `status` pasa a permitir `in_progress`.
- Nueva tabla `lab_attempts` (assignment_id, student_id, lab_level, lab_slug, score, max_score, section_breakdown jsonb, completed_at) con GRANTs y RLS: el alumno inserta/lee lo suyo; admin/teacher leen los de sus alumnos.

**Puente de puntaje**: los HTML de los labs emiten `postMessage({ type: "tn-lab-result", score, max, sections })` al terminar. `labs.$level.$slug.tsx` escucha el mensaje y llama a un server fn nuevo `submitLabResult` que registra el intento y actualiza la asignación (mejor puntaje, intentos, estado). Sin sesión o sin asignación, el lab funciona igual pero no guarda nada.

**Catálogo**: `src/lib/labs.ts` gana `scope: "public" | "lms"` y metadatos (objetivos, número de ejercicios). `labs.index.tsx` filtra a `public`; el asignador y el visor aceptan ambos. El visor de un lab `lms` exige sesión y asignación (o rol staff).

**Archivos nuevos**: `public/labs/lms/<nivel>-<slug>.html` (5), `src/lib/lab-progress.functions.ts`, `src/components/labs/lab-progress-page.tsx`, ruta de detalle por alumno, más el diálogo de asignación reutilizado desde la página de seguimiento.
