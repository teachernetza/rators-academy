# Examen en dos versiones: Rápido (7 min) y Completo (15–20 min)

## Lo que encontré al revisar

- Los 5 audios nuevos (Coffee Shop, Lost in the City, Rescheduling, Tech Support, Weekend Recap) sí tienen clave de respuestas completa: cada pregunta tiene 2 opciones incorrectas (`level: null`) y 2 correctas con nivel distinto (una menor, una mayor). El total actual es 35 preguntas de Listening, 9 de Reading y 12 de Vocabulary = 56.
- Las opciones ya se barajan de forma determinista, así que la correcta no cae siempre al final.
- Problema real confirmado: **la opción correcta de mayor nivel casi siempre es la más larga** (es una paráfrasis extendida de la correcta simple). Eso delata la respuesta aunque se barajen las posiciones.

## Qué se va a hacer

### 1. Equilibrar la longitud de las opciones (todo el examen)
Reescribir las opciones de las 56 preguntas actuales para que la longitud no marque la respuesta: la opción de mayor nivel se acorta (léxico más preciso, no más palabras) y los distractores se alargan cuando haga falta. Meta: en cada pregunta, la diferencia de longitud entre la opción más corta y la más larga sea pequeña, y la más larga no sea la de mayor nivel en más de ~1 de cada 4 preguntas.

### 2. 10 preguntas nuevas (Reading y Vocabulary, no Listening)
- Reading: 1 lectura corta nueva + 3 preguntas, y 3 preguntas adicionales repartidas en las lecturas existentes → Reading pasa de 9 a 15.
- Vocabulary & Use of Language: 4 preguntas nuevas (colocaciones, phrasal verbs, condicionales, registro) → pasa de 12 a 16.
- Mismo formato: 4 opciones, 2 incorrectas y 2 correctas con niveles distintos, con longitudes equilibradas.

### 3. Dos versiones del examen

| | Examen rápido (~7 min) | Examen completo (~15–20 min) |
|---|---|---|
| Listening | Solo los 5 audios cortos, 3 preguntas de cada uno = 15 | Los 7 audios, 35 preguntas |
| Reading | 1 lectura corta + 1 corta (6 preguntas) | 4 lecturas, 15 preguntas |
| Vocabulary | 8 preguntas | 16 preguntas |
| Total | 29 preguntas | 66 preguntas |

Cada pregunta llevará una marca `quick: true` para saber si entra en la versión corta; no se duplica contenido.

En la pantalla de inicio del examen aparecerán dos tarjetas para elegir versión (rápido / completo), con su duración, número de audios y de preguntas. La versión elegida se guarda junto con el progreso; el botón "Rehacer examen" regresa a la selección.

### 4. Certificado (PDF)
Añadir una línea/etiqueta que indique la modalidad y su duración, por ejemplo `Examen rápido · ~7 min · 29 reactivos` o `Examen completo · 15–20 min · 66 reactivos`, junto al desglose por habilidad. Sin otros cambios de diseño.

## Detalles técnicos

- `src/lib/diagnostic-bank.ts`: agregar `quick?: boolean` a `Question`, tipo `ExamMode = "quick" | "full"`, y funciones `sectionQuestions(section, mode)` / `totalQuestions(mode)`. `computeResult(answers, mode)` puntúa solo sobre las preguntas de la versión elegida y `ExamResult` incluye `mode`. Se mantiene el barajado determinista por `id`.
- `src/routes/diagnostic-exam.tsx`: paso 0 pide nombre y versión; el progreso y las secciones se filtran por `mode`. `SavedState` sube a `version: 3` (las sesiones v2 guardadas se descartan y el examen empieza limpio).
- `src/lib/diagnostic-pdf.ts`: imprime la etiqueta de modalidad tomada de `result.mode`.
