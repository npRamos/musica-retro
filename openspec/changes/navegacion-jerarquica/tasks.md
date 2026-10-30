## 1. Lógica de la pila (con tests)

- [x] 1.1 `src/lib/router.js`: `claveDe(ruta)` (inicio para `''`/`vinilos`/`cd`, `banda/:id` sin formato, ruta sin consulta para el resto)
- [x] 1.2 `pasosHasta(pila, clave)`: pasos hasta la entrada más cercana con esa clave, o `null`
- [x] 1.3 Tests en `src/lib/router.test.js`: claves de inicio y de banda con distinto formato, consulta ignorada, entrada más cercana, sin coincidencia, pila vacía o ausente

## 2. Router

- [x] 2.1 `navegar` con push guarda `{ app: true, pila: [...pilaActual, rutaActual] }`; con reemplazo conserva la `pila` de la entrada actual
- [x] 2.2 `subir(destino, { en })`: `history.go(-n)` si la clave está en la pila; si no, `replaceState` con la misma pila
- [x] 2.3 Reemplazo pendiente aplicado por el listener de `popstate` de `useRuta` antes de leer la ruta, solo si la entrada a la que se llegó tiene la clave esperada
- [x] 2.4 `volver(alternativa)`: `history.back()` si `pila.length > 0`; si no, reemplazar por la pantalla padre

## 3. Pantallas

- [x] 3.1 `FormDisco.jsx`: guardar la edición con `subir('disco/:id')` (el alta y "Sumar copia" siguen reemplazando el formulario)
- [x] 3.2 `Completar.jsx`: al terminar un disco, `subir('disco/:id')`
- [x] 3.3 `EditarBanda.jsx`: guardar con `subir('<formato>/banda/:id')`; unir con `subir('<formato>/banda/:otra', { en: 'banda/:id' })`
- [x] 3.4 `Disco.jsx`: nombre de la banda con `subir(rutaBanda)`; borrar con `subir(rutaBanda)` o `subir('<formato>')` si era el último
- [x] 3.5 Revisar que los saltos laterales (buscador, "Ir al existente", disco desde Editar banda) sigan con `navegar` push

## 4. Verificación

- [x] 4.1 `npm run build` y `npm test` sin errores
- [x] 4.2 Escritorio: recorrer cada escenario de "Navegación jerárquica" mirando `history.length` y `history.state.pila` (sin pantallas repetidas)
- [ ] 4.3 Chrome Android (navegador y app instalada): banda → disco → editar → guardar → atrás → banda → atrás → inicio; completar desde la edición; unir bandas; borrar el último disco
