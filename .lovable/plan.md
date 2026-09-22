# Promedio más justo del nivel general

## Qué está pasando

El caso que describes (Listening C1, Reading B1, Vocabulary A2 → general A2) no es un error de las preguntas: es cómo se combina el resultado final.

Hoy el nivel general se calcula juntando **todas** las preguntas en una sola bolsa y exigiendo dominio en cascada: para dar B1 hay que acertar el 85% de todo lo de niveles inferiores. Como el alumno falló varios reactivos básicos de Vocabulary, la cascada se rompe en A2 y arrastra al general hacia abajo, aunque Listening esté claramente en C1 y Reading en B1. En la práctica, el nivel general termina siendo casi el nivel de la habilidad más débil, no un promedio.

## Qué voy a cambiar

### 1. Promedio real por habilidades
El nivel general pasa a calcularse a partir de los niveles de las tres habilidades (Listening, Reading, Use of English), cada una con su propio criterio estricto (eso no cambia), y no de una bolsa única de preguntas.

Con el caso real: C1 (5) + B1 (3) + A2 (2) = promedio 3.3 → **B1**, en vez de A2.

### 2. Reglas que evitan inflar el resultado
- El general nunca supera en más de un escalón a la habilidad más débil (esta regla se mantiene).
- El general nunca supera el promedio redondeado hacia abajo cuando el puntaje global queda por debajo del corte de esa banda: si el promedio da B1 pero el puntaje global es de A2, se queda en A2.
- El examen rápido sigue con tope B2.

### 3. Perfil desigual señalado explícitamente
Cuando la diferencia entre la habilidad más fuerte y la más débil sea de 2 niveles o más, el resultado y el certificado indicarán "perfil desigual": se muestra el nivel general más el rango real (ej. "B1 · perfil desigual: A2–C1") y una nota de que conviene reforzar la habilidad baja antes de asumir el nivel general.

### 4. Textos del resultado y del PDF
Se explica en una línea que el nivel general es un promedio de las tres habilidades y que cada habilidad tiene su propio nivel, que es el dato más accionable para planear clases.

## Verificación

Pruebas automáticas con perfiles simulados:
- Listening C1 / Reading B1 / Use A2 → general B1 con marca de perfil desigual (hoy da A2).
- Perfil parejo B1 → B1.
- Todo al azar → A1.
- Examen completo perfecto → C1; examen rápido perfecto → B2 con nota de confirmación.

Revisión visual del resultado y del PDF en escritorio y celular.

## Archivos principales

- `src/lib/diagnostic-bank.ts`: nuevo cálculo del nivel general por promedio de habilidades, topes y detección de perfil desigual.
- `src/lib/diagnostic-bank.test.ts`: perfiles simulados nuevos.
- `src/routes/diagnostic-exam.tsx` y `src/lib/diagnostic-pdf.ts`: textos de promedio, rango y perfil desigual.
