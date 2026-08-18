# Listening real con audio MP3 (AI in Daily Life, B2–C1)

Reemplazamos por completo la sección de Listening del examen diagnóstico: se eliminan los 5 audios sintéticos (text-to-speech) y sus 10 preguntas, y queda un solo audio real —el MP3 que subiste— con 5 preguntas de comprensión auditiva.

## Qué cambia para el estudiante

- La sección Listening muestra ahora **1 audio real** con un reproductor normal (play, pausa, barra de avance, repetir las veces que quiera). Ya no hay botón de voz sintética.
- **5 preguntas** sobre la entrevista de Sarah y Dr. Evans acerca del uso de la inteligencia artificial: impacto en salud, tareas de trabajo automatizadas, el significado de "double-edged sword", los riesgos mencionados y la conclusión sobre aumentar (no reemplazar) la creatividad humana.
- Igual que el resto del examen, cada pregunta tiene 4 opciones: 2 incorrectas y 2 correctas asociadas a niveles distintos (por ser un audio B2–C1, las correctas se mapean a B1/B2 y B2/C1).
- Los textos de la pantalla y del PDF que decían "5 audios · 10 preguntas" pasan a "1 audio real · 5 preguntas"; el conteo total de reactivos del examen y el cálculo de nivel se ajustan solos.
- La estructura queda lista para ir agregando los siguientes audios que mandes: basta con sumar otro bloque de audio con sus preguntas.

## Detalles técnicos

- Subir `B2_C1_Audio_AI_Use.mp3` al CDN de Lovable con `lovable-assets` y guardar el puntero en `src/assets/B2_C1_Audio_AI_Use.mp3.asset.json` (el binario no se copia al repo).
- `src/lib/diagnostic-bank.ts`:
  - Cambiar `AudioItem` de `audio: string` (texto para TTS) a `{ src: string; title: string; transcriptHint?: string }`.
  - Borrar los 5 items TTS (`a1`–`a5`) y dejar un item `ai-use` con `src` = URL del asset y 5 preguntas nuevas en el formato de 4 opciones / 2 correctas.
- `src/routes/diagnostic-exam.tsx`:
  - Quitar `SpeechSynthesisUtterance`, el estado `playing` y el botón "Escuchar"; renderizar `<audio controls preload="metadata">` con el `src` del audio.
  - Actualizar la descripción de la sección y la tarjeta del resumen ("Listening — 1 audio · 5 preguntas").
- Revisar `src/lib/diagnostic-pdf.ts` por si menciona el número de reactivos de Listening.
- El scoring ya promedia sobre las preguntas existentes de cada sección, así que no requiere cambios de fórmula.
