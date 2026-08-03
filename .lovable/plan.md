# Examen diagnóstico v2 + Constancia de Nivel en PDF

## 1. Nueva lógica de puntuación por niveles

Cada reactivo tendrá **4 opciones**: 2 incorrectas (sin valor) y 2 correctas, cada una asociada a un nivel distinto (por ejemplo, una correcta "básica" que otorga B1 y otra más sofisticada que otorga C1).

- Escala: A1, A2, B1, B2, C1 (valores internos 1–5).
- Cada respuesta correcta suma el valor del nivel de la opción elegida; las incorrectas no suman.
- Nivel por rubro = promedio de los niveles obtenidos en ese rubro, ajustado por cuántas preguntas se acertaron (una persona que acierta pocas no puede salir C1).
- Nivel general = promedio ponderado de los tres rubros, redondeado a la etiqueta CEFR más cercana.
- Se elimina el botón de traducción y su penalización.
- Se elimina la sección de Writing del examen.

## 2. Estructura del examen

| Sección | Contenido | Preguntas |
|---|---|---|
| Listening | 5 audios (text-to-speech), 2 preguntas por audio | 10 |
| Reading | 2 lecturas cortas + 1 lectura larga, 3 preguntas cada una | 9 |
| Vocabulary & Use of Language | gramática, uso real, modismos, colocaciones | 12 |

Total: 31 reactivos, todos de opción múltiple con el formato de 4 opciones descrito arriba. El contenido existente se adapta (se le añaden la segunda opción correcta y los niveles) y se escriben los reactivos faltantes.

Flujo: pantalla inicial → Listening → Reading → Vocabulary → Resultados. Se conserva el guardado de progreso en el navegador, con la clave versionada (`netza.diagnostic.v2`) para que el estado viejo se descarte solo.

## 3. Pantalla de resultados

- Nivel general destacado (badge grande).
- Tres tarjetas: Nivel de Listening, Nivel de Reading, Nivel de Vocabulary/Use of Language.
- Radar con el perfil por rubro.
- Botón "Descargar mi constancia" y CTA de WhatsApp.
- Ya no se muestra la lista de aciertos/errores.

## 4. Constancia de Nivel (PDF rediseñado)

PDF tipo certificado, A4 horizontal, con:

- Marco decorativo doble y fondo con degradado sutil en los colores de marca (teal profundo `#0f3b4b` + acento menta).
- Zona superior con el logotipo de Teacher Netza Varo y el nombre de la academia.
- Título "Constancia de Nivel de Inglés" y el nombre del alumno en tipografía grande.
- Nivel General en un sello circular destacado.
- Tres bloques con el nivel por rubro (Listening / Reading / Vocabulary & Use of Language) y una barra que muestra la posición en la escala A1–C1.
- Pie con fecha de emisión, firma "Teacher Netza Varo" y un folio único para compartir.
- Sin listado de respuestas.

## Detalles técnicos

- `src/lib/diagnostic-bank.ts`: nuevos tipos (`Option { text, level | null }`), banco reescrito (listening con 5 audios y 2 preguntas c/u, reading con 3 pasajes × 3 preguntas, vocabulary con 12 reactivos) y `computeLevels()` que devuelve nivel por rubro y general.
- `src/routes/diagnostic-exam.tsx`: elimina Writing y el toggle de traducción, pasa a 3 secciones, renderiza 4 opciones por pregunta, actualiza radar y pantalla de resultados; conserva la hidratación segura con fallback.
- `src/lib/diagnostic-pdf.ts`: reescrito como generador de constancia (jsPDF, landscape, primitivas vectoriales + logo embebido).
- `src/routes/index.tsx`: se actualiza la descripción del examen en el highlight.

Sin cambios de backend ni base de datos.
