# Fix del examen en blanco + sección Labs + más animaciones

## 1. Por qué el examen se queda en blanco (causa confirmada)

El examen guarda tu progreso en el navegador (`netza.diagnostic.v1`). Al terminarlo, guarda el paso 6 (resultados), pero **no guarda las calificaciones**. Al volver a entrar, la página restaura "paso 6" con las calificaciones vacías y ese caso no dibuja nada: por eso ves un parpadeo y luego pantalla blanca. A tu novia le carga porque su navegador no tiene ese estado guardado, y borrar la caché no borra el almacenamiento local del sitio.

**Arreglo:**
- Al restaurar el estado, si el paso guardado es el de resultados, se recalculan las calificaciones desde las respuestas guardadas y se muestran normalmente.
- Si las respuestas guardadas están corruptas o incompletas, se limpia el estado y se vuelve a la pantalla inicial en lugar de quedar en blanco.
- Se guarda también el resultado calculado, junto con una versión del formato, para que estados viejos se descarten solos.
- Red de seguridad: si por cualquier motivo no hay nada que renderizar, se muestra una pantalla con botón "Empezar de nuevo" (nunca blanco).

## 2. Nueva sección: Labs (reemplaza Conversation Clubs)

Labs son prácticas interactivas **gratuitas para visitantes**, junto al examen diagnóstico como segundo highlight de la página principal.

**Cómo funciona con tu GitHub:**
- Repositorio público: `teachernetza/labs`, con las carpetas `básico`, `intermedio` y `avanzado`.
- Cada archivo `.html` que subas a una carpeta genera automáticamente una tarjeta en ese nivel.
- El título de la tarjeta viene del nombre del archivo: `verbo-to-be.html` → "Verbo To Be" (guiones, guiones bajos y acentos se manejan bien).
- No hay que tocar la app cuando subes un lab nuevo: aparece solo (con una caché corta de unos minutos).

**Páginas nuevas:**
- `/labs` — hero + tres bloques (Básico / Intermedio / Avanzado) con las tarjetas de cada carpeta, buscador y contador de labs por nivel. Estado vacío amable si una carpeta aún no tiene archivos.
- `/labs/$level/$slug` — abre el lab a pantalla completa dentro de la app, con barra superior para volver. También un botón para abrirlo en pestaña nueva.

**En la página principal:**
- Se quita la tarjeta "Conversation Clubs" de Metodología y se pone "Labs interactivos".
- Bloque destacado de Labs al lado del examen diagnóstico (dos highlights).
- Enlace "Labs" en el menú del header y en el meta description.

## 3. Más mejoras visuales y animaciones

- Entradas escalonadas por tarjeta (no todas a la vez) en landing, Labs y examen.
- Tarjetas con brillo que sigue al cursor y borde en degradado menta al hover; en móvil, pulsación con escala.
- Contadores animados (precios, número de labs, puntaje del examen).
- Transición suave entre secciones del examen (fade + desplazamiento) y feedback de color al elegir respuesta.
- Barra de progreso del examen con relleno degradado y brillo que avanza.
- Blobs de fondo con parallax suave al hacer scroll.
- Botones con brillo tipo "shine" al pasar el cursor y micro-rebote al presionar.
- Skeletons animados mientras cargan los labs.
- Todo respeta `prefers-reduced-motion`.

## Detalles técnicos

- `src/routes/diagnostic-exam.tsx`: hidratación segura del estado (recalcular resultados, validar versión, fallback sin pantalla blanca) + capa visual.
- `src/lib/labs.functions.ts`: server function que consulta la API de contenidos de GitHub para `teachernetza/labs` en las tres carpetas, filtra `.html`, deriva título desde el nombre y devuelve la lista con caché en memoria (~5 min). Sin token: repo público.
- `src/lib/labs.ts`: helpers de slug/título y tipos compartidos.
- `src/routes/labs/index.tsx` y `src/routes/labs/$level.$slug.tsx`: listado y visor. El visor descarga el HTML crudo del archivo en el servidor y lo muestra en un iframe aislado (`sandbox`), así funciona aunque no actives GitHub Pages.
- `src/routes/index.tsx`: metodología, highlights y nav.
- `src/styles.css`: nuevas keyframes y utilidades para las animaciones.

Sin cambios de backend ni de base de datos.
