# Examen diagnóstico más estricto y fiel al nivel real

## Por qué salía C1

Al revisar el examen encontré tres causas que inflan el resultado:

1. Cada pregunta tiene solo 3 opciones: acertar al azar da 33% de probabilidad. Un alumno B1 que contesta bien todo lo básico y adivina lo difícil llega al rango de B2/C1 sin dominarlo.
2. El banco tiene poco material alto: de 66 reactivos, solo 15 son B2 y 4 son C1. Con tan pocos reactivos altos, unos cuantos aciertos con suerte bastan para "probar" C1.
3. El filtro de evidencia es débil: basta con 67% de los reactivos C1 (3 de 4) para conservar C1, y no exige dominio consolidado del nivel inferior.

## Qué voy a cambiar

### 1. Cuatro opciones en todas las preguntas
Se añade un distractor plausible a cada reactivo de Listening, Reading y Use of English. El acierto por azar baja de 33% a 25%, y los distractores nuevos serán errores típicos reales (falso amigo, tiempo verbal cercano, detalle mencionado pero que no responde la pregunta), no rellenos obvios.

### 2. Más reactivos difíciles y mejor repartidos
Se agregan reactivos B2 y C1 hasta llegar a una distribución aproximada de A1 5, A2 16, B1 26, B2 24, C1 14 en el examen completo. Así el nivel alto se sostiene en suficiente evidencia, no en 4 preguntas.

### 3. Regla de dominio muy estricta
Un nivel solo se otorga cuando hay evidencia clara, en cascada:

- Para recibir un nivel, el alumno debe acertar al menos 75% de los reactivos de ese nivel **y** al menos 85% de todos los reactivos de los niveles inferiores.
- Si falla el nivel inferior, baja de nivel aunque el puntaje global sea alto (no se premia acertar cosas difíciles sueltas mientras se falla lo básico).
- Se corrige el azar: al puntaje se le descuenta la parte atribuible a adivinar, de modo que contestar todo al azar dé cerca de cero, no 25%.
- Se sube el corte global de cada banda para acompañar la corrección anterior.
- El nivel general nunca puede superar en más de un escalón a la habilidad más débil (si Listening sale B1, el general no puede ser C1).

### 4. El examen rápido llega máximo a B2
La versión de 7 minutos queda marcada como estimación inicial con tope B2; si el alumno da evidencia de más, el resultado dirá "B2+ · requiere examen completo para confirmar". Solo el examen completo puede entregar C1.

### 5. Textos de resultado y PDF
El resultado y el certificado explicarán el criterio: nivel otorgado solo con dominio comprobado, rango cuando esté en el límite, y nivel de confianza. Se mantiene la nota de que es un diagnóstico de comprensión y uso del idioma, no una certificación oficial.

## Verificación

- Pruebas automáticas nuevas: un perfil simulado "B1 real" (acierta A1–B1, adivina lo alto) debe dar B1, nunca C1; un perfil que contesta todo al azar debe dar A1; un perfil perfecto debe dar C1 solo en el examen completo.
- Validaciones del banco: 4 opciones y una sola respuesta correcta por reactivo, ids únicos, y conteo mínimo por nivel.
- Revisión visual del examen y del PDF en escritorio y celular.

## Archivos principales

- `src/lib/diagnostic-bank.ts`: cuarta opción, reactivos nuevos, corrección por azar, cascada de dominio, tope del modo rápido.
- `src/lib/diagnostic-bank.test.ts`: perfiles simulados y validaciones del banco.
- `src/routes/diagnostic-exam.tsx` y `src/lib/diagnostic-pdf.ts`: textos de criterio, rango y confianza; subida de versión del progreso guardado para descartar intentos viejos.
