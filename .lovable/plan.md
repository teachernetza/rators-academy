# 5 audios cortos nuevos + respuestas en orden aleatorio

## Qué cambia para el estudiante

- La sección Listening pasa de 2 a **7 audios reales** (35 preguntas en total), ordenados por dificultad:
  1. A1/A2 — The Coffee Shop (pedir en una cafetería)
  2. A2/B1 — Lost in the City (pedir indicaciones)
  3. B1 — Rescheduling (mover una reunión de trabajo)
  4. B1/B2 — Tech Support (llamada de soporte técnico)
  5. B2 — Weekend Recap (charla del lunes)
  6. B1 — Plans for the Weekend (ya existente)
  7. B2/C1 — AI in Daily Life (ya existente)
- Cada audio nuevo lleva **5 preguntas** basadas en su script (qué pide el cliente, para llevar o para tomar ahí, dónde está la estación, por qué se mueve la reunión, qué solución propone el soporte, qué hizo el amigo el fin de semana, etc.), con el mismo formato del examen: 4 opciones, 2 incorrectas y 2 correctas de distinto nivel.
- **Las respuestas correctas ya no caen siempre al final**: en todo el examen (Listening, Reading y Vocabulary) las 4 opciones se barajan, de forma estable para cada pregunta, así que la correcta puede aparecer en cualquier posición.
- Los textos que dicen "2 audios reales · 10 preguntas" se actualizan al nuevo conteo; el cálculo de nivel se ajusta solo.

## Detalles técnicos

- Copiar los 5 MP3 a `public/audio/` con los nombres actuales (`A1_Shorts_1.mp3`, `B1_Shorts_2.mp3`, `B1_Shorts_3.mp3`, `B2_Shorts_4.mp3`, `B2_Shorts_5.mp3`) y referenciarlos como rutas `/audio/...`, igual que los dos existentes (funciona en Lovable y Vercel).
- `src/lib/diagnostic-bank.ts`: añadir 5 `AudioItem` nuevos al inicio del arreglo `listening`, cada uno con `src`, `title`, `subtitle` y 5 `Question`. Verificar congruencia de cada pregunta contra su script.
- Barajado determinista: función `shuffledOpts(question)` que ordena las opciones con un hash del `id` de la pregunta (semilla fija). Se aplica al construir el banco (una sola vez, exportado ya barajado), de modo que el índice guardado en `answers` sigue apuntando a la opción correcta y el scoring, el PDF y la revisión no cambian de fórmula.
- `src/routes/diagnostic-exam.tsx`: actualizar la descripción de la tarjeta Listening al nuevo conteo. El resto del render ya usa `q.opts`, así que hereda el orden barajado.
- Revisar `src/lib/diagnostic-pdf.ts` por menciones al número de reactivos.
