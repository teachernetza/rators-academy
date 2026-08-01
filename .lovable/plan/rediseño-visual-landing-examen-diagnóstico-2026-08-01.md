# Rediseño visual: Landing + Examen Diagnóstico

Solo se tocan `/` (landing) y `/diagnostic-exam`. El login y el resto del LMS quedan intactos.

## 1. Logo con glow verde (arregla el borde blanco)

El logo se ve con un recuadro/borde porque el PNG tiene fondo blanco sobre un fondo casi blanco. Solución:

- Envolver el logo del hero y el del header en un contenedor con halo verde menta difuso (doble capa: blur exterior + anillo interior), de modo que el borde blanco se lea como parte del glow y no como un recorte.
- El glow respira suavemente (animación `pulse` lenta) y se intensifica en hover.
- Mismo tratamiento, más sutil, para el icono del header.

Se añade un token nuevo de acento verde menta (`--mint`) más brillante que el `--teal` actual, para que el glow contraste contra el azul marino `#0f3b4b`.

## 2. Sistema visual más moderno

**Tokens nuevos en `src/styles.css`:**
- `--mint` (verde brillante del logo) + variantes glow
- Gradiente `--gradient-hero` (marino → teal → menta)
- Sombras `--glow-mint`, `--glow-primary`
- Keyframes: `float`, `glow-pulse`, `shimmer`, `reveal-up`

**Efectos aplicados a landing y examen:**
- Fondo con degradado animado suave y blobs que flotan lentamente detrás del hero.
- Barra de progreso de scroll fija arriba (gradiente marino → menta).
- Header que cambia de transparente a sólido con blur y sombra al hacer scroll.
- Secciones que aparecen con fade + subida al entrar en viewport (IntersectionObserver, hook reutilizable `useReveal`).
- Tarjetas con hover elevado, borde que se ilumina en menta y brillo que sigue al cursor.
- Nav links con subrayado animado y estado activo según la sección visible durante el scroll.
- Botones con transición de gradiente y glow al hover.
- Botón flotante de WhatsApp con anillo pulsante.
- Todo respeta `prefers-reduced-motion`.

## 3. Precios corregidos

Tarifa base: **$149 MXN / hora**.

Tres paquetes mensuales (4 semanas), con descuento creciente:

| Paquete | Horas/sem | Horas/mes | Precio lista | Desc. | Precio final | Por hora |
|---|---|---|---|---|---|---|
| Essential | 2 | 8 | $1,192 | 10% | **$1,073** | $134 |
| Progress | 3 | 12 | $1,788 | 15% | **$1,520** | $127 |
| Intensive | 4 | 16 | $2,384 | 20% | **$1,907** | $119 |

El descuento escalonado (10/15/20%) da motivo real para subir de paquete; el 20% que pediste queda en el paquete top. Si prefieres 20% plano en los tres, dilo y ajusto: $954 / $1,430 / $1,907.

**Sección de planes rediseñada:**
- 1 tarjeta "Clase Suelta" ($149/hora, sin compromiso) + las 3 tarjetas mensuales.
- "Progress" marcada como más popular con borde en gradiente y glow.
- Cada tarjeta muestra precio tachado, precio final, ahorro mensual y precio por hora.
- Toggle "ver precio por hora / precio total" con animación de números.
- Cada botón abre WhatsApp con mensaje precargado del paquete específico.

## 4. Página del examen

Mismo lenguaje visual: fondo con gradiente animado, barra de progreso del examen con relleno gradiente y glow, tarjetas de sección con estado (pendiente / en curso / completa) en color, opciones de respuesta con feedback de color al seleccionar, transición entre secciones, y pantalla de resultados con el radar chart sobre un panel oscuro con glow menta.

## Detalles técnicos

- `src/styles.css`: tokens nuevos, keyframes, utilidades `@utility` (`glow-logo`, `card-hover`, `reveal`).
- `src/hooks/use-reveal.ts`: IntersectionObserver para animaciones de entrada.
- `src/hooks/use-scroll-progress.ts`: progreso de scroll + sección activa.
- `src/lib/pricing.ts`: constantes y cálculo de paquetes (fuente única de precios).
- `src/routes/index.tsx`: header, hero, secciones, planes.
- `src/routes/diagnostic-exam.tsx`: solo capa de presentación; la lógica del examen y el PDF no se tocan.

Sin cambios de backend, ni de rutas, ni de lógica de negocio.
