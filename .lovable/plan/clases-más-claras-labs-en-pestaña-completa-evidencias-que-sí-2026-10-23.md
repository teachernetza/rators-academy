# Clases más claras: labs en pestaña completa, evidencias que sí llegan y tarjetas simples

## 1. Labs en pestaña completa (escalados)

- El botón "Abrir lab" abre una página propia del lab, a pantalla completa, en una pestaña nueva.
- El lab se ajusta solo al tamaño de la pantalla (celular, laptop, proyector) en vez de verse en una ventanita.
- Arriba, una barra delgada con: título del lab, botón "Pantalla completa" y "Cerrar".
- Para el alumno, en esa misma barra aparece "Subir evidencia" para no tener que regresar.
- Se mantiene el aislamiento de seguridad del HTML subido.

## 2. Evidencia de tarea (alumno sube, teacher ve)

- Primero se prueba el flujo real de punta a punta (alumno sube captura → teacher la ve) para encontrar qué está fallando hoy y arreglarlo.
- Alumno: botón grande "Subir evidencia", acepta varias capturas a la vez, vista previa antes de enviar, mensaje opcional y confirmación clara de "Enviada". (también si tiene tareas en las que no sibió evidencia, que se indique para subirlas)
- Teacher/admin: en cada lección un bloque "Evidencias" con miniaturas; al tocarlas se ven en grande. Botones "Pedir corrección" (con comentario) y "Marcar terminada".
- Contador "por revisar" visible en la lista de alumnos y en la lección.
- El alumno ve el comentario del teacher y el estado (Pendiente, Entregada, Corregir, Terminada).

## 3. Tarjetas de clases más simples

- Cada tarjeta de lección muestra solo: número y tema, estado, fecha y teacher (si ya se dio), y dos botones: "Abrir lab" y "Evidencias".
- Lo demás (slides, material, notas, mensajes) se abre al tocar la tarjeta.

## 4. Información correcta para el alumno

- Resumen arriba: horas del plan, horas tomadas, **horas que le quedan**, horas por reponer.
- "Historial de clases": por cada clase dada → fecha, horas, **con qué teacher**, tema de la lección, lab de tarea usado y comentario del teacher.
- Próxima clase destacada con su tema y slides.

## 5. Vista del teacher y admin

- Lista de alumnos con: próxima lección, horas restantes y evidencias por revisar.
- Dentro del alumno: lección actual arriba (lab de clase, registrar clase, activar tarea, evidencias), historial abajo.

## Qué voy a comprobar

- Como alumno: abrir el lab en pestaña completa y subir una captura.
- Como teacher: ver esa captura, comentar y marcar terminada.
- Que las horas restantes y el historial cuadren con lo registrado.
- Borro los datos de prueba al final.

## Detalles técnicos

- Nueva ruta `/lab/$labFileId` (y catálogo vía ref) que carga el HTML con `loadLabHtml` en iframe `srcdoc` sandbox, `w-screen h-screen`; viewport meta inyectado al HTML para escalar.
- Diagnóstico del upload: revisar políticas de `storage.objects` para `homework-shots` (lectura de staff vía `can_manage_student`) y `homework_submissions`; corregir con migración si falta acceso del teacher asignado.
- Estado "Corregir": reutilizar `reviewed` con feedback (sin cambiar esquema) o añadir valor si hace falta.
- Historial: `class_sessions` unido a `class_lessons` y `staff_directory` para nombre del teacher.
- Cambios en `student-hub.tsx`, `staff-student-hub.tsx`, `student-class-list.tsx`, `lab-frame.tsx`, `classes.ts`.