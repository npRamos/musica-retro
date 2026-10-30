## Why

Al abrir la tapa o la contratapa de un disco, la ✕ no cierra la imagen (ni en el navegador ni en Android) y el botón atrás del celular termina saliendo de la app. El visor usa el historial para simular una pantalla: agrega una entrada con `pushState` y se cierra con `popstate`. Pero el router también escucha `popstate`, se ejecuta primero y hace que el visor se vuelva a renderizar. Al renderizarse, el visor quita su propio listener antes de que se ejecute y agrega otra entrada al historial. Ver una imagen debería ser una capa encima del detalle, no navegación. Además, los diálogos (por ejemplo, "¿Borrar este disco?") y las hojas de opciones no manejan el botón atrás: apretarlo con uno abierto te saca de la pantalla.

## What Changes

- Las tres capas (visor de imágenes, `Dialogo` y `Hoja`) pasan a usar el `<dialog>` nativo con `showModal()`: fondo sombreado con `::backdrop`, foco dentro de la capa y Escape para cerrar, sin z-index.
- **El visor deja de tocar el historial**: se eliminan `pushState`, el listener de `popstate` y `history.back()`. La ✕ cierra con estado de React.
- El botón atrás de Android cierra la capa abierta sin navegar (Chrome lo resuelve con el `<dialog>` nativo). En navegadores que no lo soportan (Firefox Android), atrás vuelve a la pantalla anterior, como hoy con los diálogos.
- Tocar fuera del contenido cierra cualquiera de las tres capas, como ya pasa con el diálogo y la hoja.
- El visor pasa a ser un lightbox: la imagen se ve entera y centrada sobre el detalle oscurecido, en lugar de una pantalla negra con la imagen a todo el ancho.
- **Zoom simple**: tocar la imagen alterna entre verla entera y ampliada al doble, con scroll dentro de la capa. Se deja de depender del zoom de dos dedos de la página.

## Capabilities

### New Capabilities
<!-- ninguna -->

### Modified Capabilities
- `imagenes`: el escenario "Leer los temas" de la contratapa cambia: ya no se abre a pantalla completa con zoom de dos dedos, sino en una capa sobre el detalle, con zoom al tocar y las formas de cerrarla.
- `consulta`: requisito nuevo, "Capas sobre la pantalla". Visor, diálogos y hojas se cierran con ✕ o Cancelar, tocando fuera, con Escape o con atrás, y nunca navegan ni sacan de la app.

## Impact

- **Código:** `src/componentes/ui.jsx` (capa base nueva; `Dialogo` y `Hoja` sobre `<dialog>`; se va `useEscape`) y `src/componentes/Carrusel.jsx` (el `Visor` se reescribe sin historial). Las pantallas que usan `Dialogo` y `Hoja` (Disco, Banda, Inicio, FormDisco, EditarBanda, Completar) no cambian la forma de usarlos.
- **Estilos:** reseteo de los estilos por defecto de `<dialog>` y bloqueo del scroll del fondo mientras hay una capa abierta (`src/index.css`).
- Sin dependencias npm nuevas. El router (`src/lib/router.js`) no cambia.
