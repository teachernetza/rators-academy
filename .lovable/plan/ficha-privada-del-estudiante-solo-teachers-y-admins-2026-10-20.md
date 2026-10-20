# Ficha privada del estudiante (solo teachers y admins)

## Qué se verá
En la página de cada alumno (Clases y horas → alumno) habrá una nueva tarjeta llamada **Ficha del estudiante** con:
- **Teléfono**: se puede editar y tiene un botón para abrir WhatsApp.
- **Email**: se muestra el que ya tiene su cuenta (solo lectura).
- **Objetivos personales y orientaciones**: texto libre, escrito por ti como resumen.
- **Diagnóstico (perfil académico)**: texto libre. Ahí puedes poner el nivel, sus fortalezas y lo que debe reforzar. Opcionalmente puedes indicar el nivel MCER (A1–C2).
- Abajo dirá "Última actualización: fecha y quién la hizo".

## Quién puede hacer qué
- **Admin:** ve y edita la ficha de cualquier alumno.
- **Teacher:** ve la ficha de sus alumnos asignados y puede editarla.
- **Alumno:** nunca la ve. No aparece en su Hub y la app no se la entrega.

Si prefieres que el teacher solo pueda leerla, sin editar, dímelo.

## Detalles técnicos
- Tabla nueva `student_profiles_private` (student_id PK, phone, goals_summary, diagnosis, cefr_level, updated_by, updated_at), con GRANT a authenticated y RLS: select/insert/update si `private.is_admin(auth.uid())` o `private.teacher_has_student(auth.uid(), student_id)`. No hay ninguna política para el alumno. Va en una tabla aparte porque RLS no puede ocultar columnas.
- Funciones de lectura y guardado (upsert) en `src/lib/classes.ts`, y un componente `student-info-card.tsx` dentro de `staff-student-hub.tsx`.
- Se prueba con SQL simulando a un admin, a un teacher asignado, a un teacher no asignado y al alumno.
