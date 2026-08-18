# Reconectar GitHub y reactivar el deploy en Vercel

## Diagnóstico

Los cambios de audio **sí están en el código**: el último commit del proyecto es `Added weekend plans audio` e incluye los dos MP3 reales (B1 "Plans for the Weekend" y B2–C1 "AI in Daily Life") con sus 10 preguntas y el reproductor HTML5.

El problema no es el código, es la tubería: al mover el proyecto a otro workspace, la conexión de GitHub no se transfiere. Ahora mismo este proyecto solo empuja a su repositorio interno de Lovable, así que `teachernetza/rators-academy-hub` no recibe commits nuevos y Vercel, que despliega desde ese repo, nunca ve cambios.

Esto se resuelve desde la interfaz de Lovable y de Vercel — no hay nada que programar.

## Pasos para ti

1. **Reconectar GitHub en este workspace**
   - En el chat, abre el menú **+** (abajo a la izquierda) → **GitHub** → conectar proyecto.
   - Autoriza la app de Lovable en la cuenta `teachernetza` (solo puede haber una cuenta de GitHub conectada a la vez; si estaba ligada al workspace anterior, autorízala de nuevo aquí).
   - Al elegir destino, apunta al repositorio existente `teachernetza/rators-academy-hub`, no crees uno nuevo.

2. **Verificar que llegó el commit**
   - Abre `https://github.com/teachernetza/rators-academy-hub/commits` y confirma que aparece el commit con los audios.
   - Si no aparece, en Lovable haz un cambio mínimo para forzar un push y vuelve a revisar.

3. **Verificar Vercel**
   - En el proyecto de Vercel → Settings → Git: confirma que apunta a `teachernetza/rators-academy-hub` y a la rama correcta (`main`).
   - En Deployments, confirma que el push disparó un build nuevo. Si no, usa **Redeploy** una vez.

4. **Variables de entorno en Vercel**
   - El backend necesita en Vercel: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`. Sin ellas la app compila pero falla al cargar datos.
   - Las funciones de administración (crear usuarios) además requieren `SUPABASE_SERVICE_ROLE_KEY`, que no está disponible en el plan gratuito de Lovable Cloud.

## Después de reconectar

Cuando confirmes que el repo ya recibe commits, reviso que el build de Vercel pase y que los dos audios se reproduzcan en `/diagnostic-exam` en la URL de Vercel.

## Nota

Mientras tanto, la app publicada de Lovable (`rators-academy-hub.lovable.app`) sí puede actualizarse hoy mismo con el botón de publicar, sin depender de GitHub ni Vercel.
