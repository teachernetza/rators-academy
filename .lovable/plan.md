# Recuperar contraseña por correo + acceso a tu cuenta admin

## Lo que veo

Tu cuenta `teacher.netza.varo@gmail.com` sí existe, está **activa**, con rol **administradora** y correo confirmado. Lo que falla es la contraseña: el último ingreso exitoso fue en mayo. Hoy la app no tiene ninguna forma de recuperarla, así que no hay manera de entrar sin restablecerla.

## 1. "¿Olvidaste tu contraseña?" en la pantalla de inicio

- Enlace debajo del formulario de acceso.
- Al pulsarlo, pides tu correo y recibes un mensaje con un enlace para crear una contraseña nueva.
- Por seguridad el mensaje en pantalla es siempre el mismo ("si el correo existe, te enviamos el enlace"), así nadie puede averiguar qué correos están registrados.

## 2. Página nueva para crear la contraseña

- Se abre desde el enlace del correo, sin necesidad de estar dentro.
- Pide la nueva contraseña dos veces (mínimo 8 caracteres) y, al guardarla, te lleva directo a tu panel.
- Si el enlace ya caducó o se usó, te lo dice y ofrece pedir otro.

## 3. Acceso inmediato a tu cuenta

Para que no dependas del correo desde ya, te genero una **contraseña temporal** para `teacher.netza.varo@gmail.com` y te la doy en el chat. Entras con ella y la cambias desde tu perfil (el bloque "Cambiar contraseña" ya existe) o con el flujo nuevo.

## 4. Correos

Los correos de recuperación salen con la plantilla estándar de la plataforma y el remitente por defecto. Si más adelante quieres que lleguen desde tu propio dominio y con tu marca, se configura aparte.

## 5. Comprobación

Pruebo en el navegador: pedir el enlace, abrir la página de contraseña nueva, guardarla y entrar al panel de administradora.

## Detalles técnicos

- `src/routes/login.tsx`: enlace a `/forgot-password`; nueva ruta `src/routes/forgot-password.tsx` con `supabase.auth.resetPasswordForEmail(email, { redirectTo: \`${window.location.origin}/reset-password\` })`.
- Nueva ruta pública `src/routes/reset-password.tsx`: detecta el evento `PASSWORD_RECOVERY` / hash `type=recovery`, llama `supabase.auth.updateUser({ password })` (sin `current_password` en recuperación) y redirige con `dashboardPathFor`.
- `head()` propio en ambas rutas (título y descripción únicos).
- Contraseña temporal aplicada con la rutina protegida `staff_set_password` o vía actualización directa del hash en la base.
- Para que funcione también en tu dominio de Vercel siguen faltando las variables `SUPABASE_URL`, `VITE_SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PUBLISHABLE_KEY`.
