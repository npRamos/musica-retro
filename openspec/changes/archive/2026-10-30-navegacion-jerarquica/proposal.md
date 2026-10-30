## Why

El botón atrás no siempre lleva a donde se espera. Al guardar la edición de un disco, la app reemplaza el formulario por el detalle en lugar de volver al detalle que ya estaba en el historial, y el detalle queda repetido: el primer atrás "no hace nada" y recién el segundo vuelve a la banda. Si se pasó por "Completar" desde la edición, atrás vuelve al formulario. Lo mismo pasa al guardar una banda, al unir dos bandas (atrás lleva a una banda que ya no existe) y al tocar el nombre de la banda en el detalle. La navegación tiene que seguir la jerarquía de pantallas: edición → detalle → banda → inicio.

## What Changes

- **Subir nunca agrega pantallas.** Guardar, cancelar, completar, borrar, unir bandas y tocar el nombre de la banda en el detalle llevan a una pantalla de más arriba en la jerarquía. Si esa pantalla ya está más atrás en el historial, la app retrocede hasta ella. Si no está, reemplaza la entrada actual.
- **Cada entrada del historial sabe qué tiene detrás**: guarda en su estado el camino de pantallas de la app que la precede, para poder retroceder la cantidad justa.
- **Bajar y los saltos laterales siguen agregando una entrada**: abrir una banda, un disco o una edición, abrir un disco desde el buscador, "Ir al existente" y abrir un disco desde la lista de Editar banda. Desde ahí, atrás vuelve a donde se estaba (por ejemplo, al buscador con la búsqueda).
- Al unir bandas o al cambiar de pestaña la banda editada, la entrada de la banda vieja se reemplaza por la nueva: no queda en el historial.
- Al borrar el último disco de una banda en ese formato, la app vuelve al inicio sin dejar la banda vacía en el historial.
- La flecha ← del encabezado y el atrás del celular llevan siempre al mismo lugar.

## Capabilities

### New Capabilities
<!-- ninguna -->

### Modified Capabilities
- `consulta`: requisito nuevo, "Navegación jerárquica", con los escenarios de volver desde la edición de un disco, el detalle, la edición de una banda, Completar, el borrado, la unión de bandas y el buscador. Los requisitos existentes de banda y detalle ("Volver" y "Volver desde el detalle") no cambian.

`catalogo` no cambia: borrar un disco y unir bandas hacen lo mismo con los datos; solo cambia a qué pantalla se llega y qué queda en el historial, y eso queda en `consulta`.

## Impact

- **Código:** `src/lib/router.js` (estado de cada entrada con el camino previo, función `subir(destino)` y lógica pura de la pila con tests), `src/componentes/ui.jsx` (flecha ← de `Encabezado`), y las pantallas que suben: `FormDisco.jsx`, `EditarBanda.jsx`, `Completar.jsx` y `Disco.jsx`.
- Sin dependencias npm nuevas. No cambia la forma de las URL (`#/disco/:id`, `#/cd/banda/:id`, …).
- Las entradas que ya están en el historial cuando se actualiza la app no tienen el camino guardado: se tratan como si no tuvieran nada detrás de la app.
