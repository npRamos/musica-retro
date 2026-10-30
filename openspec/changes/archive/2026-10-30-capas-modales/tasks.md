## 1. Capa base

- [x] 1.1 `src/index.css`: resetear estilos por defecto de `dialog` (margen, borde, padding, max-width/max-height, fondo, color) y bloquear el scroll con `html:has(dialog[open]) { overflow: hidden }`
- [x] 1.2 `src/componentes/ui.jsx`: componente `Capa` sobre `<dialog>`: `showModal()` en `useLayoutEffect` sin dependencias y solo si `!open` (sin `close()` en la limpieza), `onClose` → `alCerrar`, `onCancel` con `preventDefault()` cuando no se puede cerrar, clic con `target` en el propio `<dialog>` → `alCerrar`
- [x] 1.3 Verificar con `StrictMode` en desarrollo que la capa abre una sola vez y no se cierra sola al montarse

## 2. Diálogo y hoja

- [x] 2.1 `Dialogo` sobre `Capa`: contenido centrado, `backdrop:bg-black/70`, mismo aspecto que hoy; sacar el `div` de fondo y el `stopPropagation`
- [x] 2.2 `Hoja` sobre `Capa`: contenido pegado abajo a todo el ancho, `backdrop:bg-black/60`, safe area inferior
- [x] 2.3 Borrar `useEscape` (lo cubre el `<dialog>`)
- [x] 2.4 Mientras se borra un disco, Escape, tocar fuera y el primer atrás no cierran el diálogo (`Disco.jsx` ya ignora `alCerrar` con `borrando`; revisar que `Capa` lo respete)
- [x] 2.5 Revisar que los usos en Disco, Banda, Inicio, FormDisco, EditarBanda y Completar se vean y se comporten igual

## 3. Visor de imágenes

- [x] 3.1 `Carrusel.jsx`: reescribir `Visor` sobre `Capa`, sin `pushState`, `popstate`, `keydown` ni `history.back()`
- [x] 3.2 Lightbox: imagen entera y centrada (`object-contain`, márgenes de safe area), `backdrop:bg-black/85`, ✕ arriba a la derecha que llama a `alCerrar`
- [x] 3.3 Estado `ampliada`: tocar la imagen alterna entre entera y el doble de ancho con scroll dentro de la capa; tocar fuera de la imagen cierra
- [x] 3.4 Cambiar el texto de ayuda a "Tocá la imagen para ampliar"

## 4. Verificación

- [x] 4.1 `npm run build` y `npm test` sin errores
- [x] 4.2 Escritorio: la ✕, tocar fuera y Escape cierran el visor, el diálogo y la hoja; el historial no cambia (atrás después de cerrar vuelve a la banda)
- [x] 4.3 Chrome Android (navegador y app instalada): atrás cierra el visor, "¿Borrar este disco?" y la hoja de orden sin salir de la pantalla; un segundo atrás vuelve a la banda
- [x] 4.4 Contratapa: ampliar y desplazar para leer los temas; volver a verla entera
