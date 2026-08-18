# Reproductor de audio propio para el examen diagnóstico

## Problema
Los audios se cargan hoy desde el almacenamiento de assets de Lovable (`/__l5e/...`). Esas URLs son de infraestructura: caducan, exigen validación y no existen en el deploy de Vercel. Por eso el reproductor aparece vacío (0:00 / 0:00) y, cuando funciona, solo lo hace una vez. Además el `<audio controls>` nativo se ve distinto en cada navegador y en móvil bloquea la precarga.

## Solución
1. **Servir los MP3 desde el propio proyecto**: copiar los dos audios a `public/audio/` (`B1_Plans_for_the_weekend.mp3`, `B2_C1_Audio_AI_Use.mp3`) y referenciarlos como rutas fijas `/audio/....mp3`. Quedan dentro del repositorio (≈1.8 MB en total), viajan a GitHub y a Vercel, y se sirven como archivos estáticos públicos sin ningún filtro ni token.
2. **Reproductor propio** (`src/components/AudioPlayer.tsx`) con el estilo de la plataforma (azul marino / turquesa, modo claro y oscuro):
   - Botón grande play/pausa, barra de progreso arrastrable, tiempo actual / duración.
   - Botones de −10s / +10s y control de velocidad (0.75x / 1x / 1.25x), útiles para comprensión auditiva.
   - Estado de carga y mensaje de error con botón "Reintentar" si el archivo no responde.
   - Compatible con móvil: carga bajo demanda al primer toque (evita el bloqueo de autoplay/preload en iOS) y usa `playsInline`.
3. **Integración**: reemplazar el `<audio controls>` en la sección de Listening de `src/routes/diagnostic-exam.tsx` por este componente.
4. **Limpieza**: eliminar los `*.mp3.asset.json` de `src/assets` y sus imports en `src/lib/diagnostic-bank.ts`.

## Verificación
Prueba automatizada en navegador: abrir el examen, llegar a Listening, pulsar play en ambos audios y confirmar que la duración y el tiempo avanzan; repetir play/pausa varias veces y revisar la consola por errores de red.

## Notas técnicas
- Las rutas quedan absolutas (`/audio/...`), sin imports de bundler, para que sean idénticas en Lovable y Vercel.
- El componente usa un único elemento `<audio>` oculto controlado por React (`timeupdate`, `loadedmetadata`, `error`), sin dependencias nuevas.
