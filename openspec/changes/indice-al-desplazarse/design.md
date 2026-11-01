## Context

- **Cómo scrollea la lista:** el inicio scrollea con la página entera (`window`). Tiene el encabezado pegado arriba (título, buscador y pestañas) y el botón + fijo abajo a la derecha.
- **Qué hay en la lista:**
  - Contenido: tarjetas de bandas, discos sueltos o secciones por género. Las secciones tienen un `h2`, y una banda con varios géneros aparece en varias secciones.
  - Vista: grilla de 2 a 6 columnas, o lista.
- **Cómo se ordena:**
  - `ordenarBandas` y `ordenarDiscos` usan `localeCompare('es')`.
  - "Todos los discos" A → Z ordena por banda y, dentro de cada banda, como discografía.
  - "Última compra" ordena por `ultima` (bandas) o `fecha_carga` (discos).
- **Pedido:** la usuaria pidió que sea general (letras, géneros y meses), que aparezca con cualquier scroll (sin medir velocidad) y que sea con manija, al estilo de Google Fotos.
- **Celular:** usa Android. Con navegación por gestos, deslizar desde el borde derecho es "atrás".

## Goals / Non-Goals

**Goals:**
- Llegar a cualquier parte de una lista larga en un gesto.
- El mismo componente para letras, géneros y meses.
- Que no estorbe: invisible con la lista quieta o corta.

**Non-Goals:**
- Pantalla de una banda y resultados de búsqueda (listas cortas).
- Vibración al pasar por una marca (se descartó en la batea; se mantiene el criterio).
- Medir la velocidad del scroll.

## Decisions

### Marcas calculadas en `lib/indice.js`, puras y testeables

- **`marcaDe(banda, fecha, criterio)`** devuelve el texto de la marca, que también sirve de clave. Para las bandas se le pasa la banda y su última compra; para los discos sueltos, la banda del disco y su fecha de carga. `criterio` es uno de estos:
  - **`letra`** (az/za): la primera letra de `normalizar(nombre de la banda)`, en mayúscula. Si no es una letra, `#`. La ñ cae en la N porque `normalizar` le quita la tilde, y es contigua porque `localeCompare('es')` la ordena después de la n.
  - **`genero`** (orden por género sin agrupar): `generoPrincipal(banda)`, o "Sin género".
  - **`mes`** (reciente): "nov 2026", con la fecha local, como el resto de la app.
- **`primerasMarcas(marcas)`** deja la marca solo en el primer elemento de cada tramo (`null` en el resto).
- **`criterioDe(orden, agrupar)`** elige el criterio. Agrupado por género no usa criterio por elemento: las marcas son los títulos de sección.
- **`ralear(marcas, alto, separacion)`:** recibe marcas con posición en px sobre la barra y descarta las que quedan a menos de `separacion` de la anterior mostrada. Siempre se queda con la primera.

### Las marcas viven en el DOM como `data-marca`

`Inicio` recorre la lista ya ordenada y pone `data-marca="<texto>"` en el primer elemento de cada marca: el `li` de la tarjeta, o el `h2` de cada sección por género. `Indice` las lee con `querySelectorAll('[data-marca]')` y mide su `offsetTop` relativo al documento.

- **Por qué en el DOM:** la grilla tiene columnas variables según el ancho, y calcular alturas a mano sería frágil. Medir lo que se ve es exacto en grilla y en lista.
- **Cuándo se vuelve a medir:** con un `ResizeObserver` sobre `main`, que cubre la carga de imágenes, el cambio de vista y la rotación, y cuando cambian los datos (prop `version`).

### Geometría: la barra mapea todo el scroll

- **La barra:** va desde 64 px debajo del encabezado pegado (se mide su alto), para no tapar la barra de la lista (orden y vista), hasta arriba del botón +. Un punto de la barra corresponde a `fracción × (scrollHeight − innerHeight)`.
- **Cada marca:** se ubica en `(offsetTop − altoEncabezado) / máximoScroll`, recortado a [0, 1].
- **La manija:** está donde está el scroll actual.
- **La burbuja:** muestra la última marca cuyo `offsetTop` quedó por encima del borde inferior del encabezado.

### Interacción

- **Aparición:** con cualquier evento `scroll` (pasivo) se muestra. Se esconde después de 1,5 s sin scroll y sin interacción, con un desvanecido corto que se anula con `prefers-reduced-motion`.
- **Arrastrar la manija:** con `pointerdown` + `setPointerCapture` y `pointermove`, el scroll pasa a `window.scrollTo({ top })` instantáneo. La burbuja aparece a la izquierda de la manija, con la marca actual en letra grande (fuente de títulos), y desaparece al soltar.
- **Tocar una marca:** salta con `scrollTo` a la posición del elemento menos el alto del encabezado, para que no quede tapado.
- **Tocar la barra fuera de la manija y de las marcas:** no hace nada. Así un toque sin querer, cerca del borde, no mueve la lista.
- **Pegado al costado** (pedido al probarlo: separado quedaba invasivo): la manija es una línea fina en el borde y las marcas van justo a su izquierda.
- **Gesto de "atrás":** La zona táctil mide 44 px de ancho, pero solo existe mientras el índice está visible. Con el índice escondido no captura nada, y el gesto de atrás funciona normal.

### Cuándo existe el índice

- **Condiciones:** solo si `scrollHeight > 3 × innerHeight`, no hay búsqueda y la lista tiene elementos. Con menos de 2 marcas distintas (por ejemplo, todo cargado el mismo mes) queda la manija sola, que igual sirve para ir rápido.
- **Por qué 3 pantallas:** con ~55 bandas en grilla de 2 columnas está en el borde. En lista ya aparece. Es una constante fácil de ajustar al probar.

### Estilo

- Respeta la identidad visual: bordes finos (`border-metal`), sin sombras difusas y sin emojis.
- **Manija:** una píldora vertical con el acento.
- **Marcas:** redondas (letras en círculo, textos largos en píldora), con texto chico en `etiqueta` sobre `bg-fondo/85` para que se lean sobre las tapas.

**Alternativas descartadas:**
- Una columna A–Z siempre visible, al estilo de los contactos: la usuaria eligió la manija.
- Marcas repartidas parejo: con pocas bandas por letra se pierde la noción de dónde está cada cosa. Google Fotos usa la posición real.

### Preferencia en Ajustes

A alguien le puede resultar incómodo. Por eso se suma la preferencia `indice` (por dispositivo, como la vista y el orden), que se elige en Ajustes con un `Segmentado` de tres opciones:
- "Con letras" (`completo`, por defecto);
- "Solo manija" (`manija`): sin marcas, pero con la burbuja al arrastrar, que solo aparece mientras se arrastra;
- "No": el índice no se monta.

## Risks / Trade-offs

- **[Con muchas marcas juntas (meses de un mismo año, géneros chicos) se ralean y no todas son tocables]** → La burbuja al arrastrar muestra siempre la marca exacta. Las raleadas se alcanzan arrastrando.
- **[Conflicto con el gesto de atrás de Android]** → El índice solo captura toques mientras está visible, y la manija queda separada del borde.
- **[Medir el DOM en cada scroll]** → Las posiciones se miden solo al cambiar el tamaño o los datos. En el scroll solo se lee `scrollY`, y se actualiza con `requestAnimationFrame`.
- **[Por género, una banda aparece en varias secciones]** → Las marcas son las secciones, y eso no afecta.
