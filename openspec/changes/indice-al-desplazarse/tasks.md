## 1. Marcas

- [x] 1.1 `src/lib/indice.js`: `criterioDe(orden, agrupar)` (`letra` | `genero` | `mes` | `null` si las marcas son secciones), `marcaDe(banda, fecha, criterio)` → el texto de la marca, `primerasMarcas` (solo el primero de cada tramo) y `ralear(marcas, separacion)`
- [x] 1.2 Tests:
  - letras con tildes, ñ, números y signos (`#`);
  - Z → A;
  - género principal y "Sin género";
  - meses con fecha local;
  - raleo que conserva la primera;
  - sin marcas repetidas consecutivas.

## 2. Componente

- [x] 2.1 `src/componentes/Indice.jsx`:
  - lee `[data-marca]` y mide posiciones (`ResizeObserver` sobre `main` y la prop `version`);
  - barra entre el encabezado pegado y el botón +;
  - condición de lista larga (3 pantallas, 2 marcas).
- [x] 2.2 Mostrar al desplazarse (`scroll` pasivo + `requestAnimationFrame`) y esconder a los 1,5 s. Sin captura de toques mientras está escondido. Desvanecido anulado con `prefers-reduced-motion`.
- [x] 2.3 Manija arrastrable (pointer events con captura) que desplaza la página, con burbuja de la marca actual mientras se arrastra.
- [x] 2.4 Marcas raleadas y tocables, que saltan al elemento menos el alto del encabezado. Separadas del borde derecho por el gesto de atrás.

## 3. Integración

- [x] 3.1 `Tarjetas.jsx`: `TarjetaBanda` y `TarjetaDisco` aceptan `marca` y la ponen como `data-marca` en el `li`.
- [x] 3.2 `Inicio.jsx`:
  - marcar el primer elemento de cada marca en bandas y en discos sueltos;
  - en las secciones por género, el `h2`;
  - montar `Indice` solo sin búsqueda.

## 4. Verificación

- [x] 4.1 Tests y build en verde.
- [ ] 4.2 Probar en el celular:
  - grilla y lista, A → Z, Z → A, por género (agrupado y ordenado) y última compra;
  - arrastrar, tocar marcas, pestañas Vinilos y CDs;
  - que no interfiera con el gesto de atrás ni con el botón +;
  - ajustar el umbral de 3 pantallas y la separación del raleo.
- [ ] 4.3 Sincronizar las specs, archivar el change y cerrar el issue #2.
