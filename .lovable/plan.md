# Labs mejor proporcionados + hero más limpio

## 1. Diseño interno de los labs (escritorio)

Hoy la barra superior, el contenido y la barra inferior "Atrás / Siguiente lección" usan anchos distintos, así que en pantallas grandes las barras se ven anchísimas y el contenido queda como una columna delgada al centro.

Cambios (todos en la hoja de marca compartida, sin tocar ejercicios ni JavaScript):

- Un ancho de contenido único para los tres bloques (barra superior, contenido, barra inferior), centrado y con el mismo padding lateral, para que se lean como una sola columna alineada.
- Ese ancho crece de forma controlada en pantallas grandes (hasta ~1100 px) en vez de dejar el contenido en una franja angosta.
- Los bloques internos que hoy se encogen a un ancho menor (intros, cajas de fórmula, quizzes) se alinean al mismo ancho o a un porcentaje de él, para que no queden "flotando" muy angostos.
- La barra inferior deja de ser una banda de borde a borde: se vuelve una barra flotante centrada con el mismo ancho del contenido, esquinas redondeadas y sombra suave.
- Más aire vertical entre secciones y menos espacio muerto arriba/abajo.

## 2. Diseño de los labs en teléfono

- Barra superior más baja y con título recortado si es largo, para que no empuje el contenido.
- Botones de la barra inferior a ancho completo repartido, siempre visibles y sin salirse (nada de scroll horizontal).
- Rejillas de ejercicios de 2 columnas pasan a 1 columna en pantallas chicas.
- Padding lateral consistente, tipografía y botones con tamaño táctil cómodo.
- Modales/paneles que hoy ocupan 85% de alto se ajustan mejor a pantallas bajas.

## 3. Landing page

- Se elimina el bloque grande de Labs con las tres opciones "Básico / Intermedio / Avanzado" (ya no corresponde: los niveles ahora son A1–C1 y viven en la página de Labs).
- Queda únicamente la tarjeta de Labs dentro del trío principal del hero: Examen · Labs · Planes.
- Las tres tarjetas del hero dejan de compartir el mismo degradado: cada una recibe su propio color e ícono, todos derivados de la paleta de la marca (teal profundo, menta, y un azul-cian intermedio), manteniendo la armonía.
- Se ajusta la mención a "básico, intermedio y avanzado" en la sección de metodología para hablar de niveles A1–C1.

## 4. Animaciones al hacer scroll

- Las secciones y tarjetas aparecen con fundido + desplazamiento suave y retardo escalonado, con un umbral que dispara la animación un poco antes de llegar al elemento (hoy algunas aparecen tarde o de golpe).
- Movimiento sutil de acompañamiento en las tarjetas al entrar y al pasar el cursor.
- Se respeta la preferencia del sistema de "reducir movimiento".

## Detalles técnicos

- `public/labs/_brand.css`: se añade un sistema de ancho compartido (variable de ancho de columna) aplicado a `nav > div`, `main`, y al contenedor de la barra fija inferior; overrides responsive para las utilidades de Tailwind embebidas (`max-w-2xl/3xl/4xl`, `grid-cols-2`), y un bloque de media queries para móvil. No se editan los HTML de cada lab.
- `src/routes/labs.$level.$slug.tsx`: el iframe se mantiene a pantalla completa; solo se afina la altura para móvil (usar altura dinámica en vez de `100vh` fijo) y la cabecera del visor.
- `src/routes/index.tsx`: se borra la sección `#labs` completa y su entrada en la navegación/`SECTION_IDS`; las tarjetas del hero pasan a llevar `color` propio por tarjeta.
- `src/hooks/use-reveal.ts`: umbral/margen ajustados y soporte de `prefers-reduced-motion`.

Sin cambios de backend ni base de datos.
