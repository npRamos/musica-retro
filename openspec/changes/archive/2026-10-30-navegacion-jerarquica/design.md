## Context

El router (`src/lib/router.js`) es un router de hash mínimo:

- `navegar(destino)` hace `pushState({ app: true }, …)` y `navegar(destino, { reemplazar: true })` hace `replaceState`. En los dos casos dispara un `hashchange` para que `useRuta` relea la ruta.
- `volver(alternativa)`, usado por la flecha ← de `Encabezado`, hace `history.back()` si la entrada actual es de la app, y si no, reemplaza por `alternativa`.
- `useRuta` escucha `hashchange` y `popstate`.

El problema está en las acciones que **suben** en la jerarquía. Hoy reemplazan la entrada actual por el destino, aunque el destino ya esté más atrás en el historial:

```
 banda → disco → editar → [Guardar]   navegar('disco/1', { reemplazar: true })
 historial:  inicio · banda · disco · disco      ← detalle repetido
```

| Dónde | Hoy | Atrás después |
|---|---|---|
| Guardar en Editar disco (`FormDisco.jsx`) | reemplaza por el detalle | detalle repetido |
| Guardar en Editar banda (`EditarBanda.jsx`, `irABanda`) | reemplaza por la banda | banda repetida |
| Unir bandas (`EditarBanda.jsx`, `unir`) | reemplaza por la otra banda | banda borrada ("No encontramos esa banda") |
| Completar un disco (`Completar.jsx`, `siguiente`) | reemplaza por el detalle | formulario de edición |
| Nombre de la banda en el detalle (`Disco.jsx`) | agrega la banda | desde la banda, atrás vuelve al disco |
| Borrar un disco (`Disco.jsx`) | `volver` si quedan discos; si no, reemplaza por el inicio | si era el último, la banda vacía sigue detrás |

La jerarquía de pantallas:

```
 inicio (''/vinilos/cd)
  ├─ <formato>/banda/:id ── banda/:id/editar
  │   └─ disco/:id ──────── disco/:id/editar ── disco/:id/completar
  ├─ ajustes ── ajustes/clave · importar · completar (pendientes)
  └─ agregar
```

La usuaria eligió que los saltos laterales (un disco desde el buscador, "Ir al existente", un disco desde la lista de Editar banda) vuelvan a donde se estaba, y no a la banda del disco.

## Goals / Non-Goals

**Goals:**
- Que ninguna acción de subir deje pantallas repetidas ni pantallas viejas en el historial.
- Que, después de guardar, completar, borrar o unir, el atrás del celular siga la jerarquía.
- Que la flecha ← y el atrás del celular lleven siempre al mismo lugar.
- Que la lógica de la pila sea pura y se pueda probar con vitest.

**Non-Goals:**
- Jerarquía estricta para los saltos laterales: desde un disco abierto con el buscador, atrás vuelve al buscador.
- Agregar entradas intermedias (por ejemplo, banda y disco en un mismo toque) para fabricar la jerarquía.
- Cambiar la forma de las URL o pasar a un router con rutas declaradas.
- Que el atrás del celular en la primera entrada de la app (link directo o app recién abierta) suba en lugar de salir: eso lo decide el sistema.

## Decisions

### 1. Cada entrada guarda el camino que tiene detrás
El estado de cada entrada pasa de `{ app: true }` a `{ app: true, pila: [...] }`. `pila` es la lista de rutas de las entradas de la app que hay detrás, de la más vieja a la más nueva. Al bajar (`navegar` con push), la nueva entrada lleva `pila = [...pilaActual, rutaActual]`. Al reemplazar, conserva la `pila` de la entrada reemplazada. Una entrada sin `pila` (la primera de la sesión, o una creada antes de esta versión) cuenta como `[]`.

- **Alternativa descartada: llevar la pila en memoria** (un array en el módulo del router). Se pierde al recargar la página y se desincroniza con atrás y adelante del navegador. `history.state` viaja con cada entrada.

### 2. `subir(destino)`: retroceder hasta el destino o reemplazar
Una función nueva del router para todas las acciones que suben:

1. Busca en `pila` la entrada más cercana (desde el final) cuya **clave de jerarquía** coincide con la del destino.
2. Si la encuentra a `n` pasos, hace `history.go(-n)`. Si la URL de esa entrada no es exactamente la del destino (otra pestaña de formato, otra banda tras unir), la reemplaza por el destino al llegar.
3. Si no la encuentra, hace `replaceState` del destino sobre la entrada actual, con la misma `pila`.

La clave de jerarquía identifica la pantalla sin los detalles que pueden cambiar:
- `''`, `vinilos` y `cd` → inicio.
- `<formato>/banda/:id` → `banda/:id`, sin el formato.
- El resto, la ruta sin la consulta (`?…`).

Para las acciones que además **sacan** una pantalla del camino, `subir` recibe la entrada que hay que reemplazar: `subir(destino, { en: rutaVieja })`. Retrocede hasta `rutaVieja` y la cambia por el destino. Se usa:
- **Al unir bandas:** `subir('cd/banda/B', { en: 'banda/A' })`. La banda A desaparece del historial y atrás lleva al inicio.
- **Al cambiar de formato la banda editada:** `EditarBanda` puede terminar en `vinilos/banda/1` habiendo entrado por `cd/banda/1`. La clave coincide, así que alcanza con el paso 2.

La lógica pura vive aparte de `history`: `claveDe(ruta)` y `pasosHasta(pila, clave)` → `n | null`. Se prueba con vitest como el resto de `src/lib`.

- **Alternativa descartada: `history.back()` fijo al guardar.** Sirve para Editar disco, pero no para Completar (hay que retroceder 2), ni para la unión, ni para un formulario abierto desde un link directo (sin nada detrás).

### 3. Quién usa qué
| Acción | Antes | Después |
|---|---|---|
| Guardar edición de disco | `navegar(disco, reemplazar)` | `subir('disco/:id')` |
| Completar un disco | `navegar(disco, reemplazar)` | `subir('disco/:id')` (retrocede 2 si se entró desde la edición) |
| Guardar edición de banda | `navegar(banda, reemplazar)` | `subir('<formato>/banda/:id')` |
| Unir bandas | `navegar(otra banda, reemplazar)` | `subir('<formato>/banda/:otra', { en: 'banda/:id' })` |
| Nombre de la banda en el detalle | `navegar(banda)` | `subir('<formato>/banda/:id')` |
| Borrar disco, quedan otros | `volver(banda)` | `subir('<formato>/banda/:id')` |
| Borrar el último disco de la banda | `navegar(inicio, reemplazar)` | `subir('<formato>')` (la banda vacía queda adelante y se descarta con el próximo push) |
| Alta de disco y "Sumar copia" | `navegar(disco, reemplazar)` | sin cambios: el formulario se reemplaza por el detalle y atrás vuelve a donde se abrió el alta |
| "Ir al existente", disco desde el buscador o desde Editar banda | `navegar(disco)` | sin cambios: salto lateral |

### 4. Flecha ← del encabezado
Tiene que hacer lo mismo que el atrás del celular. `volver(alternativa)` sigue igual de simple: si hay una entrada de la app detrás (`pila.length > 0`), `history.back()`; si no, `replaceState` con la pantalla padre. Hoy mira `history.state?.app`, que es verdadero también en entradas reemplazadas sin nada detrás. Con `pila` la condición es exacta.

### 5. Reemplazo después de `history.go(-n)` dentro del router
`history.go(-n)` es asíncrono: la entrada cambia cuando llega el `popstate`. Cuando hay que reemplazar la URL al llegar (paso 2), el reemplazo **no** se hace con un listener nuevo de `popstate` en la pantalla. Se hace así:
- `subir` deja un reemplazo pendiente en una variable del módulo del router.
- El único listener de `popstate` que ya existe (el de `useRuta`, registrado una vez, sin dependencias) aplica el `replaceState` pendiente **antes** de leer la ruta y actualizar el estado.

Así no se ve un render intermedio con la banda borrada, y no hay listeners que dependan de funciones que cambian en cada render. Fue el error que rompía la ✕ del visor en `capas-modales`.

## Risks / Trade-offs

- [`history.go(-n)` asíncrono y `popstate` compartido con el router] → El reemplazo pendiente lo aplica el listener del router, y no se suman listeners por pantalla. Si llega un `popstate` del usuario (atrás del celular) antes que el de `subir`, el pendiente se aplica a una entrada equivocada. Para evitarlo, el pendiente guarda la clave esperada y se descarta si la entrada a la que se llegó no la tiene.
- [Entradas sin `pila` (sesión anterior a la actualización)] → Cuentan como `[]`: `subir` reemplaza en lugar de retroceder. Puede quedar alguna repetida solo durante esa sesión.
- [Retroceder varias entradas al completar o al unir] → Las entradas que quedan adelante (formulario, banda vieja) se descartan con el próximo push. "Adelante" en el navegador de escritorio podría mostrarlas un momento. Es aceptable.
- [Scroll al volver] → La posición se recupera por ruta (`App.jsx`), así que al retroceder con `go(-n)` vuelve donde estaba, igual que con atrás.
- [Formularios con cambios sin guardar] → Igual que hoy: atrás y la flecha ← salen sin preguntar. Fuera de alcance.
