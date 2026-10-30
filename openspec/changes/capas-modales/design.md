## Context

La app tiene tres capas que se abren sobre una pantalla:

- **Visor** (`Carrusel.jsx`): tapa o contratapa a pantalla completa. Para que el botón atrás lo cierre, agrega una entrada con `history.pushState` en un `useEffect` que depende de `alCerrar`, se cierra escuchando `popstate`, y la ✕ y Escape llaman a `history.back()`.
- **`Dialogo`** y **`Hoja`** (`ui.jsx`): `div` fijos con `z-50`, que se cierran tocando fuera o con Escape (`useEscape`). No manejan el botón atrás.

El router (`router.js`) también escucha `popstate` y, como se registra antes, se ejecuta primero. React procesa `popstate` como evento discreto: renderiza y ejecuta los efectos pendientes en la microtarea que corre entre un listener y el siguiente. Por eso, antes de que llegue el listener del visor:

```
popstate ─▶ router: setRuta(objeto nuevo)
              └─ render síncrono → Visor recibe un alCerrar nuevo
                   └─ efecto: limpieza (quita el listener del visor) + pushState otra vez
         ─▶ listener del visor: ya quitado → no se ejecuta → el visor no se cierra
```

La ✕ queda en un ciclo: vuelve atrás y el visor agrega la entrada de nuevo. Con el atrás del sistema pasa lo mismo, pero el `pushState` ocurre sin un gesto de la usuaria. Chrome marca esas entradas como salteables, y el gesto de atrás puede saltearlas hasta salir de la app.

La usuaria usa Android (Chrome y la app instalada). Firefox Android es secundario.

## Goals / Non-Goals

**Goals:**
- Que la ✕ del visor cierre siempre, en cualquier navegador.
- Que el atrás de Android cierre la capa abierta (visor, diálogo u hoja) sin navegar ni salir de la app.
- Visor como lightbox: imagen entera sobre el detalle oscurecido.
- Poder leer los temas de una contratapa con una ampliación simple.
- Un solo mecanismo para las tres capas.

**Non-Goals:**
- Zoom con dos dedos dentro de la imagen, o zoom continuo.
- Deslizar entre tapa y contratapa dentro del visor (se sigue haciendo en el carrusel del detalle).
- Que atrás cierre la capa en navegadores sin soporte de `<dialog>` + CloseWatcher (Firefox Android): ahí atrás vuelve a la pantalla anterior.
- Cambios en el router o en cómo se navega entre pantallas.

## Decisions

### 1. `<dialog>` nativo con `showModal()` para las tres capas
Un componente base `Capa` en `ui.jsx` envuelve un `<dialog>`. Se monta cuando la capa está abierta y se desmonta al cerrarse (igual que hoy: el estado de cada pantalla decide si se renderiza). En el montaje llama a `showModal()`.

Lo que trae gratis: capa superior (sin z-index), `::backdrop` para el sombreado, foco atrapado, Escape (evento `cancel` → `close`) y, en Chrome Android, el gesto de atrás, que cierra el diálogo modal abierto sin tocar el historial (CloseWatcher).

- **Alternativa descartada: arreglar el `pushState`** (una sola entrada con un ref estable y la ✕ cerrando por estado). Sigue compitiendo con el router por `popstate`, suma entradas que el router lee como navegación y queda expuesta a la intervención de Chrome sobre entradas sin gesto. Es frágil por diseño.
- **Alternativa descartada: no manejar atrás.** Con el visor abierto, atrás te sacaría del disco.

### 2. React decide si la capa está abierta; el `<dialog>` avisa cuando se cierra solo
- Las acciones propias (✕, Cancelar, tocar fuera) llaman a `alCerrar`, que cambia el estado de la pantalla y desmonta la capa. Desmontar un `<dialog>` abierto lo saca de la capa superior sin efectos colaterales.
- Escape y el atrás de Android cierran el `<dialog>` de forma nativa y disparan `close`. Se escucha con la prop `onClose` de React, sin `addEventListener` ni efectos con dependencias. Así se evita repetir el error del visor actual.
- Si la pantalla no quiere cerrar (por ejemplo, `Dialogo` mientras se borra un disco), `alCerrar` no hace nada y `onCancel` llama a `preventDefault()` para que Escape o el primer atrás no lo cierren.
- `showModal()` se llama en un `useLayoutEffect` sin dependencias y solo si `!dialog.open`. En la limpieza **no** se llama a `close()`: con `StrictMode`, cerrar y reabrir dispararía un `close` asíncrono que cerraría la capa recién montada.

### 3. Tocar fuera
El `<dialog>` ocupa toda la pantalla, transparente, y el fondo sombreado es su `::backdrop`. Un clic cuyo `target` es el propio `<dialog>`, y no su contenido, cuenta como "fuera" y llama a `alCerrar`. Para el visor, "fuera" es todo lo que no es la imagen. Esto reemplaza el `onClick` del `div` de fondo y el `stopPropagation` del contenido.

### 4. Estilos
- Resetear los estilos por defecto de `dialog` (margen, borde, padding, `max-width`/`max-height`, fondo, color) para que cada capa ponga los suyos con Tailwind. El sombreado va con la variante `backdrop:` (`backdrop:bg-black/70`, como hoy).
- `Dialogo`: contenido centrado, mismo aspecto actual.
- `Hoja`: contenido pegado abajo, a todo el ancho, con `pb-[env(safe-area-inset-bottom)]` como hoy.
- Bloquear el scroll de la pantalla de atrás mientras hay una capa abierta: `html:has(dialog[open]) { overflow: hidden }` en `index.css`.

### 5. Visor como lightbox con ampliación al tocar
- Imagen centrada, entera: `max-w-full max-h-full object-contain` dentro de la capa, con un margen respecto de los bordes seguros. El fondo es `backdrop:bg-black/85`: se intuye el detalle detrás.
- La ✕ queda arriba a la derecha dentro de la capa, como hoy (respeta `safe-area-inset-top`).
- Un estado `ampliada` (booleano). Tocar la imagen lo alterna: entera ↔ al doble del ancho que entra en pantalla, con scroll dentro de la capa en los dos ejes. Con una contratapa de hasta 1200 px de lado mayor, el doble en un celular (~400 px de ancho) usa ~800 px, sin pixelado.
- El texto "Pellizcá para hacer zoom" pasa a "Tocá la imagen para ampliar".
- **Alternativa descartada: zoom con dos dedos propio** (pointer events, cálculo de escala y desplazamiento). Es más código y más casos borde, para un uso ocasional.
- **Alternativa descartada: mantener el zoom nativo de la página.** Amplía todo el viewport: la ✕ queda fuera de la vista y la página sigue ampliada al cerrar.

## Risks / Trade-offs

- [Firefox Android no cierra la capa con atrás] → Atrás vuelve a la pantalla anterior y la capa se desmonta con ella. No sale de la app. Es aceptado.
- [Chrome deja frenar el cierre por atrás una sola vez sin un gesto nuevo; si se insiste, cierra igual sin `cancel`] → Solo afecta a `Dialogo` mientras borra. Llega `close`, se llama a `alCerrar` y no hace nada. El `<dialog>` queda cerrado pero montado hasta que el borrado termina y la pantalla navega (si sale bien) o pone `confirmando` en falso (si falla). No queda nada colgado a la vista.
- [Estilos por defecto de `<dialog>` distintos entre navegadores] → Reset explícito en `index.css`. Revisar en Chrome Android y en escritorio.
- [`html:has(...)` en navegadores viejos] → Si no se soporta, el fondo scrollea detrás de la capa, como hoy. Sin impacto funcional.
- [Las capas pierden el `z-50` y la capa superior cambia el orden de apilado] → Las capas pasan a estar siempre por encima de todo, que es lo que se busca. Nada de la app necesita quedar sobre un modal.
