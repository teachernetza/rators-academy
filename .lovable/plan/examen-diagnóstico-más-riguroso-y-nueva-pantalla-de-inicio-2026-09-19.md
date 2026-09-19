# Examen diagnóstico más riguroso y nueva pantalla de inicio

## Lo que confirmó la auditoría

- El examen completo tiene 66 reactivos: 35 de Listening, 15 de Reading y 16 de Vocabulary & Use of English. La versión rápida tiene 29.
- Los 7 audios existen, las opciones se barajan de forma estable y las preguntas omitidas valen cero.
- El problema principal de validez es estructural: cada pregunta ofrece dos respuestas correctas y otorga más nivel a la redacción más sofisticada. Esto puede medir preferencia de vocabulario o intuición sobre el examen, no comprensión real.
- La versión rápida concentra material más sencillo y no es una muestra equivalente de la completa; hoy ambas pueden parecer igualmente concluyentes.
- El banco tiene saltos desiguales entre niveles, especialmente B1–C1, y Vocabulary no cubre A1–C1 de manera uniforme.
- El resultado general promedia por igual secciones de tamaños distintos y no informa cuando el resultado está cerca del límite entre dos niveles.
- No hay pruebas automáticas que detecten identificadores repetidos, respuestas ambiguas, archivos de audio faltantes o desequilibrios por nivel.
- Como no se evalúan Speaking ni Writing, el resultado debe presentarse como una estimación de habilidades receptivas y uso del idioma, no como certificación oficial de dominio integral.

## 1. Reconstruir el modelo de preguntas

- Cada reactivo tendrá **una sola respuesta correcta**; el nivel CEFR pertenecerá a la dificultad del reactivo, no a una opción “más elegante”.
- Añadir metadatos internos por pregunta: nivel objetivo, habilidad, subhabilidad y tipo de evidencia (detalle, idea principal, inferencia, gramática, colocación, registro, etc.).
- Revisar y reescribir los 66 reactivos actuales, eliminando pares casi equivalentes, pistas por longitud, distractores absurdos y saltos injustificados de nivel.
- Distribuir los reactivos de forma gradual entre A1, A2, B1, B2 y C1, con especial refuerzo de A2 y B2.
- Mantener los dos formatos, pero convertir el rápido en una muestra estratificada de todos los niveles y habilidades.

## 2. Mejorar la puntuación y la fidelidad del resultado

- Separar acierto de dificultad: una respuesta correcta suma según el nivel objetivo del reactivo; una incorrecta no suma.
- Calcular cada habilidad con una escala normalizada y combinar el resultado según el número y dificultad de reactivos, evitando que una sección pequeña pese lo mismo que Listening.
- Exigir evidencia mínima por nivel: un nivel alto no se asignará por pocos aciertos aislados si fallan bloques inferiores o faltan respuestas.
- Mostrar un rango cuando el resultado esté cerca de un corte, por ejemplo `B1 alto / B2 en desarrollo`, junto con una confianza `orientativa`, `moderada` o `alta` según versión, cobertura y consistencia.
- La versión rápida entregará una **estimación inicial**; la completa será la recomendada para una ubicación más precisa.
- Actualizar los textos de pantalla y PDF para explicar que se evaluaron Listening, Reading y Use of English, y que Speaking/Writing requieren evaluación adicional.

## 3. Mejorar cobertura y calidad de los reactivos

- Listening: conservar los 7 audios, pero equilibrar preguntas de detalle, intención, inferencia, actitud y significado contextual; evitar que varias preguntas del mismo audio midan lo mismo.
- Reading: combinar detalle, propósito, inferencia, referencia, tono y síntesis; ajustar longitud y dificultad real de los textos por nivel.
- Use of English: equilibrar gramática, vocabulario, colocaciones, phrasal verbs y registro mediante pares adyacentes A1/A2, A2/B1, B1/B2 y B2/C1.
- Incorporar instrucciones breves de práctica antes de comenzar, con un reactivo sin puntaje que enseñe el formato sin revelar patrones.
- Permitir finalizar solo tras confirmar los reactivos sin responder, evitando resultados accidentales incompletos.

## 4. Imágenes e ilustraciones con propósito

- Añadir 2–3 ilustraciones educativas coherentes para acompañar lecturas seleccionadas y hacer la experiencia más atractiva.
- Las imágenes serán contextuales, con texto alternativo, compresión adecuada y sin mostrar datos que delaten la respuesta.
- Añadir al menos un reactivo de lectura funcional basado en un recurso visual controlado —por ejemplo un horario, aviso o menú— para medir comprensión cotidiana; este recurso se diseñará con texto legible, no con texto generado dentro de una fotografía.
- No añadir imágenes a todas las preguntas ni convertirlas en decoración repetitiva que aumente el tiempo o distraiga.

## 5. Nueva pantalla para iniciar el examen

Aplicar la dirección visual elegida **Professional clarity**, adaptada a la identidad actual:

- Paleta bloqueada: azul `#0756D8`, celeste `#19A7CE`, amarillo `#FFD447` y blanco `#FFFFFF` mediante tokens semánticos.
- Tipografías Sora para títulos y Manrope para lectura.
- Composición bento clara dentro de un panel académico: encabezado azul directo, campo de nombre, dos tarjetas de modalidad y botón principal visible.
- Marcar **Examen completo** como recomendado y explicar con precisión la diferencia de confianza, duración, audios y reactivos; conservar los conteos reales, no los números ilustrativos del prototipo.
- Resumen compacto de Listening, Reading y Use of English, más una nota visible de “resultado estimado, no certificación oficial”.
- Usar una ilustración pequeña como apoyo lateral o de esquina, nunca detrás de información esencial.
- Reducir bordes, sombras y tarjetas redundantes; mantener contraste, foco de teclado y buena lectura en móvil.
- Microtransiciones suaves al elegir modalidad y al mostrar los módulos, respetando la preferencia de movimiento reducido.

## 6. Controles de calidad

- Crear validaciones automáticas para comprobar: identificadores únicos, una respuesta correcta por reactivo, niveles válidos, cobertura mínima por habilidad/nivel, conteos de cada modalidad y existencia de audios/imágenes.
- Añadir pruebas del cálculo de nivel, límites entre bandas, respuestas incompletas y diferencias entre examen rápido/completo.
- Verificar visualmente inicio, lecturas con imágenes, preguntas, resultados y PDF en escritorio y móvil.
- Subir la versión del progreso guardado para descartar de forma segura respuestas antiguas incompatibles con el banco nuevo.

## Alcance de la validación

Esta mejora dará **validez de contenido y mayor consistencia interna**, pero no puede convertir el examen en una prueba oficialmente validada solo con código. Para afirmar precisión psicométrica será necesario, en una fase posterior, pilotearlo con suficientes estudiantes, analizar dificultad y discriminación por reactivo y recalibrar los cortes CEFR con resultados reales.

## Archivos principales

- `src/lib/diagnostic-bank.ts`: banco, metadatos, selección por modalidad y puntuación.
- `src/routes/diagnostic-exam.tsx`: inicio, instrucciones, control de preguntas incompletas, imágenes y resultados.
- `src/lib/diagnostic-pdf.ts`: lenguaje de estimación, rango y nivel de confianza.
- `src/styles.css`: tokens de la paleta elegida y detalles visuales reutilizables.
- `src/assets/`: ilustraciones optimizadas para las lecturas y el inicio.
- Pruebas nuevas para integridad del banco y cálculo de resultados.
