# Labs propios dentro de la app (sin GitHub)

Los 7 HTML que subiste se integran directamente en la aplicación, ya clasificados por nivel, con el estilo visual de la marca aplicado encima y todas sus funciones intactas.

## Clasificación y tarjetas

**Básico**
- Saludos y Familia — presentaciones, saludos, miembros de la familia y conversación básica. (`greetings_family_master_class_1.html`)
- Familia, Comida, Ropa y Posesivos — vocabulario esencial y adjetivos posesivos. (`english_master_class.html`)

**Intermedio**
- Presente Simple, Profesiones y Rutinas — rutinas diarias, profesiones, lugares y habilidades. (`tarea_presente_simple_y_lugares_2.html`)
- Verbos Modales — can, must, should, may: permiso, obligación y consejo. (`Modal_Verbs.html`)
- Preposiciones de Lugar y Movimiento — in, on, at, into, through y más, con ejercicios visuales. (`Prepositions_Place_Movement.html`)
- Storytelling: Pasado y Futuro — narrar historias con pasado simple, continuo y futuro. (`Story_Telling.html`)

**Avanzado**
- Los 4 Condicionales — zero, first, second y third conditional con práctica guiada. (`Conditionals.html`)

## Qué cambia

- Se elimina la dependencia del repositorio de GitHub: el catálogo de labs pasa a ser una lista local en el código, y los HTML viven dentro del proyecto.
- Cada tarjeta muestra título, nivel y una descripción corta del tema (las de arriba), más un ícono acorde.
- El visor `/labs/$level/$slug` sigue funcionando igual (pantalla completa dentro de la app, con barra para volver), pero cargando el archivo local en vez de bajarlo de GitHub. Se quita el botón "abrir en GitHub".
- Búsqueda y contadores por nivel siguen funcionando.

## Restyling de los HTML

Cada lab conserva su estructura, ejercicios, animaciones y JavaScript. Lo que se cambia es la capa visual:

- Se reemplazan las fuentes de cada archivo (Nunito / Plus Jakarta) por la tipografía de la marca (Plus Jakarta Sans para títulos, DM Sans para texto).
- Fondo, tarjetas, bordes, sombras y radios se alinean con el sistema visual del sitio (superficies claras, sombras suaves, esquinas redondeadas grandes, borde menta al hover).
- La barra de navegación interna y botones primarios adoptan el teal `#0f3b4b` con acentos menta.
- Se conservan los colores propios de cada lab donde comunican significado: verde de acierto, rojo de error, y los colores por categoría (p. ej. los 4 condicionales, tipos de preposición, tiempos verbales). Solo se ajustan levemente para que armonicen con la paleta.
- Se mantiene el comportamiento responsive y móvil de cada lab.

## Detalles técnicos

- Los archivos se copian a `public/labs/<nivel>/<slug>.html` (nivel: `basico`, `intermedio`, `avanzado`).
- Se inyecta en cada archivo un `<link>` a una hoja compartida `public/labs/_brand.css` con las variables y overrides de marca, colocada después de Tailwind CDN para que gane precedencia; ahí se centraliza el restyling en vez de editar cada archivo a mano. Ajustes puntuales por lab se hacen en su bloque `<style>`.
- `src/lib/labs.ts`: el catálogo pasa a ser un array estático con `level`, `slug`, `title`, `description`, `file`.
- Se elimina `src/lib/labs.functions.ts` (fetch a GitHub y caché) y sus llamadas; `/labs` y el visor leen el catálogo local.
- El visor usa un `<iframe src="/labs/...">` (mismo origen, sin `srcDoc`), así los scripts, TTS y estados internos funcionan normalmente.
- `head()` de cada ruta se actualiza para usar el título y descripción reales del lab.

Sin cambios de backend ni base de datos.
