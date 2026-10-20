# Que teachernetza.online abra también en esa red de Infinitum

## Qué significa el error
"ERR_ADDRESS_UNREACHABLE" quiere decir que esa red de Infinitum no encuentra el camino hacia el servidor. No es un problema de la app, porque la página sí llega a esa red. El problema es que la red no logra conectarse con las direcciones nuevas de Vercel (216.198.79.x y 64.29.17.x). Por eso falla en Chrome y en Edge, y funciona bien con otra red.

## Qué propongo (de lo más rápido a lo más completo)

1. **Prueba rápida para esa persona (5 min):** que reinicie el módem de Infinitum. Si no se arregla, que cambie el DNS de su computadora a 1.1.1.1 / 8.8.8.8. Así confirmamos que el problema es de la red.
2. **Cambio en Vercel (lo recomiendo):** en el panel de dominios de Vercel, apuntar las direcciones a sus servidores clásicos, que son los que Telmex suele tener bien conectados:
   - `www` → registro CNAME `cname.vercel-dns.com`
   - dominio principal → registro A `76.76.21.21`
   Te paso los pasos exactos para hacerlo, uno por uno. Yo no tengo acceso a tu Vercel, así que esta parte la haces tú.
3. **Alternativa:** mover el dominio para que lo sirva Lovable en lugar de Vercel. Así usa otra red de servidores. Te guío para conectarlo aquí.

## Después
Cuando hagas el cambio, verifico desde aquí que el dominio apunte a las nuevas direcciones. Luego le pides a esa persona que lo pruebe otra vez con su Infinitum.

No se modifica nada de la app.
