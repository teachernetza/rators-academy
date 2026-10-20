# Página que no abre en una red de Infinitum

## Qué está pasando
La app funciona. Si abre con otra red pero no con ese Infinitum, el problema está en el camino entre ese módem o la red de Telmex y Vercel, que es quien sirve tu dominio. No es un error del código y no se arregla cambiando la app.

Las causas más comunes con Infinitum:
- **El DNS de Telmex** (el "directorio" que traduce el nombre a la dirección) guarda una dirección vieja o falla al buscar tu dominio.
- **La ruta de Telmex hacia los servidores de Vercel** está lenta o cortada en esa zona.
- **El módem** tiene un filtro o "control parental" activado.

## Pasos para esa persona (en orden)
1. Reiniciar el módem (desconectarlo 30 segundos).
2. Probar **www.teachernetza.online** y también **rators-academy-hub.lovable.app**. Si la segunda abre y la primera no, el problema es la ruta hacia Vercel.
3. Cambiar el DNS del teléfono o la compu a 1.1.1.1 o 8.8.8.8. En Android: Ajustes > Redes > DNS privado > `one.one.one.one`. En iPhone se puede usar la app 1.1.1.1. Si con eso abre, la causa era el DNS de Telmex.
4. Si nada funciona, llamar a Telmex al 800 123 2222 y reportar que no pueden abrir ese sitio.

## Lo que puedo hacer yo después de que aprueben
- Revisar de nuevo tu dominio para confirmar que todos sus registros estén bien y no queden direcciones viejas.
- Si el paso 2 confirma que lo que falla es Vercel con Infinitum, tienes otra opción: conectar teachernetza.online directo a Lovable en vez de Vercel. Así el dominio usa otros servidores. Te explicaría los pasos antes de mover nada.

## Lo que necesito de ti
Que esa persona haga el paso 2 y el 3 y me diga qué pasó en cada uno.
