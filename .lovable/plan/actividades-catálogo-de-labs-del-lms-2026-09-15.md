# Actividades = catálogo de Labs del LMS

La sección **Actividades** (admin y teacher) deja de ser la biblioteca de plantillas y pasa a ser el espacio de tus Labs: el catálogo interno del LMS, organizado por nivel, desde donde asignas.

## Lo que verás

**Actividades → Labs del LMS**

- Pestañas por nivel: **A1, A2, B1, B2, C1, C2**.
- En cada pestaña, las tarjetas de los labs del LMS de ese nivel: título, tema, objetivos, número de ejercicios y la etiqueta "con puntaje".
- Cada tarjeta con dos acciones: **Abrir lab** (lo ves como lo ve el alumno) y **Asignar** (abre el diálogo de asignación que ya existe: alumnos, fecha límite y nota).
- Buscador por título, como ahora.
- Botón arriba **Ver catálogo público**, que lleva al catálogo abierto (`/labs`), separado del interno.
- Enlace directo a **Progreso de Labs** para ver puntajes.
- Niveles sin labs todavía (C2, y cualquier otro por llenar) muestran un aviso: "Aún no hay labs en este nivel — pásame el material y lo integro".

## Detalles técnicos

- `src/components/activities/activities-library.tsx` se reescribe como catálogo de labs del LMS: lee `LMS_LABS` de `src/lib/labs.ts` filtrado por nivel, sin consultar la base de datos. Reutiliza `AssignLabDialog` con el prop `lab`.
- `src/lib/labs.ts`: se añade `"c2"` al tipo `LabLevel` y a `LAB_LEVELS` (etiqueta "C2 · Maestría", sin labs aún), para que el catálogo cubra A1–C2.
- El menú lateral en `src/components/dashboard-layout.tsx` renombra "Activities" a "Labs" para admin y teacher; las rutas `/admin/activities` y `/teacher/activities` se conservan.
- Nada se borra: las rutas del editor de actividades (`/admin/activities/$id`) y sus funciones de servidor quedan intactas, solo dejan de estar enlazadas desde este listado.
- El catálogo público (`/labs`) y sus labs abiertos siguen igual.

## Después

Cuando me pases los labs nuevos, los acoplo al nivel que indiques y aparecen automáticamente en este catálogo.
