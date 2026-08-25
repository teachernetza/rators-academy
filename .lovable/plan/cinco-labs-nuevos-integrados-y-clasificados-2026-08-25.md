# Cinco labs nuevos integrados y clasificados

Los 5 HTML que subiste se agregan al catálogo de Labs, con el estilo de la marca aplicado encima, sus funciones intactas y ubicados en el nivel correcto.

## Clasificación

**A2 · Básico**
- Profesiones, Can/Can't y Conectores — habilidades, profesiones y unir ideas con *so* y *but*. (`Can_Can_t_professions_so_and_But.html`)

**B1 · Intermedio**
- Present Progressive en Acción — acciones en curso, conversaciones y práctica guiada. (`Present_Progressive.html`)
- Fonética de los Verbos Regulares (-ed) — los tres sonidos /t/, /d/, /ɪd/ con escucha y práctica. (`Regular_Verbs_Phonetics.html`)

**B2 · Intermedio alto**
- Pasados y Conectores Narrativos — pasado simple, continuo, perfecto y conectores de historia. (`Past_Tenses_Narrative_Connections.html`)
- Voz Pasiva: Presente y Pasado — transformación activa/pasiva con flashcards y retos. (`Passive_Voice_present_and_past.html`)

## Qué se hace

- Se copian los archivos a `public/labs/` (carpetas `basico`, `intermedio`, `avanzado` según el nivel ya usado por el proyecto) con nombres en slug.
- A cada archivo se le inyecta en el `<head>`, después de Tailwind CDN, el `<link>` a `/labs/_brand.css` y el `<script src="/labs/_brand.js">`, igual que los labs existentes. Así heredan tipografía de marca, superficies, acentos teal/menta y el modo oscuro sincronizado con la app.
- Se conservan los colores semánticos propios de cada lab (verde acierto, rojo error, colores por sonido /t/ /d/ /ɪd/, colores por tiempo verbal). Solo se ajusta el fondo y los paneles para armonizar.
- Se agregan las 5 entradas a `src/lib/labs.ts` con `level`, `slug`, `title`, `description`, `icon` (lucide) y `color`. Con eso las páginas de nivel, contadores y el visor `/labs/$level/$slug` los toman automáticamente; no hace falta tocar rutas.

## Correcciones detectadas

- `Present_Progressive.html` y `Past_Tenses_Narrative_Connections.html` usan `max-w: 85%` en CSS (propiedad inexistente, es sintaxis de Tailwind): se corrige a `max-width: 85%` para que las burbujas de chat no se estiren a todo el ancho.
- Se quitan/neutralizan los `@import` de fuentes propias (Outfit, Poppins, Nunito, Inter, Merriweather) que compiten con la tipografía de marca, dejando solo las de la marca.
- Fondos fijos con blobs muy saturados (índigo/cian en el lab de fonética, ámbar/teal en el de profesiones) se atenúan vía overrides en su bloque `<style>` para no chocar con el marco de la app y mantener legibilidad en oscuro.
- Se revisa que cada archivo no tenga scripts rotos ni referencias a recursos externos faltantes antes de publicarlo; si alguno usa text-to-speech del navegador, se deja tal cual (funciona en el iframe del mismo origen).

## Detalles técnicos

- Archivos destino:
  - `public/labs/basico/profesiones-can-conectores.html`
  - `public/labs/intermedio/present-progressive.html`
  - `public/labs/intermedio/fonetica-verbos-regulares.html`
  - `public/labs/avanzado/pasados-conectores-narrativos.html`
  - `public/labs/avanzado/voz-pasiva-presente-pasado.html`
- Solo cambios de frontend/contenido estático. Sin backend ni base de datos.
