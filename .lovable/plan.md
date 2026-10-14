# Ruleta de niveles y temas (link escondido)

## Qué vas a tener
Una página privada en **/ruleta** (ningún botón ni menú la enlaza, y no aparece en Google). Solo entras con el link:
`https://teachernetza.online/ruleta` (y en Lovable: `https://rators-academy-hub.lovable.app/ruleta`).

## Cómo funciona
1. **Ruleta 1 – Nivel**: 6 segmentos (A1, A2, B1, B2, C1, C2) con los colores de cada nivel. Botón "Girar": gira varias vueltas con desaceleración suave, puntero que "tiembla" al pasar segmentos y se detiene en un nivel al azar.
2. Al caer el nivel, aparece abajo con animación la **Ruleta 2 – Tema**: 15 temas de ese nivel (gramática, vocabulario y habilidades, según MCER).
3. Al caer el tema, aparece una **tarjeta de resultado**:
   - Nombre del tema y nivel.
   - Descripción muy corta (1–2 líneas) con el objetivo de aprenderlo.
   - **Bibliografía**: 3–4 enlaces donde aprenderlo.
4. Botón "Volver a girar" en cada ruleta. Funciona bien en celular y escritorio.

## Bibliografía (reglas)
- Solo fuentes confiables con páginas actuales: British Council LearnEnglish, Cambridge Dictionary (Grammar), BBC Learning English, Oxford Learner's Dictionaries, Perfect English Grammar, EnglishClub, etc.
- Cada enlace se revisará uno por uno antes de entregar: debe responder correctamente (sin "not found" ni redirecciones a la portada) y tener fecha de publicación o actualización de **2022 en adelante**. Los que no cumplan se descartan y se reemplazan.
- Solo se muestran: título, sitio y año.

Total: 90 temas (15 × 6 niveles), con unos 300 enlaces verificados.

## Recomendaciones extra (para que decidas)
- **Historial**: guardar en el navegador los últimos temas que te salieron, para no repetir.
- **"No repetir"**: excluir de la ruleta los temas que ya salieron hasta completar los 15.
- **Sonido de clic** al girar y confeti suave al terminar.
- **Asignar como tarea**: botón para convertir el tema en actividad para un estudiante (solo si estás dentro de tu cuenta).
- **Protegerla con tu sesión de admin** en vez de solo esconder el link.

## Detalles técnicos
- Nueva ruta `src/routes/ruleta.tsx` con `head()` propio y `robots: noindex, nofollow`; sin enlaces desde ninguna página.
- Datos en `src/lib/roulette-topics.ts` (nivel → 15 temas con descripción y enlaces).
- Ruletas en SVG con rotación CSS (`cubic-bezier` de desaceleración), resultado aleatorio con `crypto.getRandomValues`, respeta "reducir movimiento".
- Verificación de enlaces con un script (curl: status 200 final + fecha 2022+ en la página/metadatos); se ejecuta antes de entregar.
- Colores con los tokens actuales (cobalto/limón).
