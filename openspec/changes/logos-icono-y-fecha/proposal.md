## Why

Con la colección importada, la grilla de bandas muestra casi solo nombres: sin fotos propias ni tapas todavía, cada tarjeta es tipográfica. El logo de la banda la hace reconocible de un vistazo. Además, el ícono de la app (disco oscuro sobre fondo oscuro) casi no se ve en la pantalla de inicio del celular. Y todos los discos importados quedaron con la fecha de la importación, lo que vuelve inútil el orden "Última compra" hasta poder corregir la fecha.

## What Changes

- **Logo de banda:** se busca automáticamente en Wikidata (propiedad "logo") cuando una banda se enlaza con MusicBrainz, se guarda en el bucket privado y se muestra en la tarjeta de la banda, con sus colores, sobre el mosaico de tapas oscurecido o el fondo tipográfico (los logos oscuros se invierten para que se lean). Desde Editar banda se puede buscar, subir uno propio o quitarlo.
- **Ícono de la app:** el mismo dibujo del vinilo sobre un fondo violeta tipo vidrio líquido, en las versiones normal y maskable (Android) y en el favicon.
- **Ver todos los discos sin agrupar:** en las pestañas Vinilos y CDs se puede elegir entre la vista actual, agrupada por banda, y una vista con todos los discos del formato (por ejemplo: Dio – Holy Diver, Dio – The Last in Line…). La elección se recuerda en el dispositivo.
- **Fecha de carga editable:** en Editar disco, dentro de una sección plegada "Más datos", para corregir la fecha de los discos importados.

## Capabilities

### New Capabilities
<!-- Ninguna: todo entra en capacidades existentes. -->

### Modified Capabilities
- `imagenes`: logo de banda (búsqueda en Wikidata, logo propio, almacenamiento con transparencia).
- `consulta`: la tarjeta de banda muestra el logo cuando lo hay; las pestañas pueden mostrar los discos agrupados por banda o todos juntos.
- `identidad-visual`: ícono de la aplicación.
- `catalogo`: la edición de un disco permite cambiar la fecha de carga.

## Impact

- **Base:** migration con `bandas.logo_path`, `bandas.logo_invertir` y `bandas.logo_buscado_en`.
- **Código:** `src/lib/musicbrainz.js` (artista → Wikidata → Commons), `src/lib/imagen.js` (procesamiento con transparencia), `Portadas.jsx` (tarjeta con logo), `EditarBanda.jsx`, `FormDisco.jsx`, `Inicio.jsx`, `catalogo.js`, `preferencias.js`, `catalogoContexto.jsx`; `public/icono*.{svg,png}`.
- **Externos:** `wikidata.org` y `commons.wikimedia.org` (CORS abierto, sin clave).
- **Depende de `datos-musicbrainz`:** usa el enlace de las bandas a MusicBrainz y modifica el requisito "Edición de disco" en la versión de ese change. Hay que archivar `datos-musicbrainz` antes que este.
