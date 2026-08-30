# Hero con imagen en diagonal + examen diagnóstico más claro

## 1. Hero rediseñado (`/`)

- Vuelve el **logo** al hero, colocado en la zona limpia (fuera del corte diagonal), con su halo coral suave.
- Layout en dos capas:
  - Bloque izquierdo: badge, titular, subtítulo, botones (Examen gratis / WhatsApp) y logo como firma de marca.
  - Bloque derecho: **imagen recortada en diagonal** (`clip-path`) que entra desde el borde derecho, con degradado marino encima para que el texto siempre se lea.
- En móvil la diagonal pasa a ser horizontal (imagen arriba, texto abajo) para que nada se encime.
- Se conservan las figuras geométricas y la cinta diagonal actuales, pero se reducen donde compitan con la foto.

## 2. Imágenes

Dos imágenes principales, en estilo fotográfico cálido y coherente con la paleta (marino #0F3B4B, coral #FF6B4A, mostaza #FFB830):

1. Hero: estudiante/clase online en laptop con luz cálida (la del corte diagonal).
2. Sección Metodología o Planes: segunda imagen de apoyo, también con corte diagonal más sutil.

Se generan a medida para la marca y se guardan como assets del proyecto (mejor encaje de color que un banco genérico). Si prefieres fotos de banco reales, dilo y las sustituyo por imágenes de Unsplash.

## 3. Página del examen diagnóstico (`/diagnostic-exam`)

Solo presentación, sin tocar preguntas, puntajes ni el PDF:

- **Encabezado** con banda marina, patrón geométrico y logo pequeño, en vez del bloque plano actual.
- **Selección de versión (Rápido / Completo)**: tarjetas más grandes tipo "radio card", con icono, duración, número de audios y preguntas, check visible en la seleccionada, borde coral y elevación en hover. Queda obvio cuál está activa.
- **Tarjetas de secciones** (Listening / Reading / Vocabulary): icono en círculo de color propio, conteo destacado y jerarquía tipográfica mejor definida.
- **Campo de nombre y botón de inicio** dentro de un panel claro, con paso 1 / 2 numerado para que el flujo se entienda.
- **Durante el examen**: barra de progreso más legible, cabecera de sección con icono y contador "pregunta X de Y", opciones de respuesta con estado seleccionado más marcado y mejor espaciado en móvil.
- **Pantalla de resultados**: tarjetas de puntaje ordenadas en rejilla con el radar y el botón de descarga bien separados.

## Detalles técnicos

- `src/routes/index.tsx`: hero reestructurado, logo restaurado, imagen con `clip-path`.
- `src/routes/diagnostic-exam.tsx`: solo capa visual (StartScreen, secciones, resultados).
- `src/styles.css`: utilidades nuevas `tn-clip-diagonal`, `tn-media-frame` y estilos de radio-card.
- Imágenes en `src/assets` como asset pointers; sin cambios de backend ni de lógica.
