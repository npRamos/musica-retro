## Why

Cargar un disco hoy es escribir banda y título a mano y sacar dos fotos. Para ~125 discos (y los que vengan) eso es lento y propenso a errores, y el detalle del disco no muestra lo que más se consulta: la lista de temas. MusicBrainz y Cover Art Archive tienen esos datos gratis, sin clave y accesibles desde el navegador, así que se pueden sumar sin servidor propio.

## What Changes

- **Alta asistida:** al escribir la banda, además de las bandas del catálogo se sugieren artistas de MusicBrainz. Elegida la banda, se listan sus discos **agrupados** (Estudio · EP · En vivo · Compilados, cada grupo por año).
- **Edición elegida sola:** según el formato (vinilo/CD), la app elige la edición más adecuada y precarga **tapa, contratapa, lista de temas y año**. La edición se puede cambiar o descartar.
- **Todo se guarda con el disco:** temas y año en la base; tapa y contratapa copiadas al bucket privado (se ven sin señal), igual que las fotos propias.
- **Ingreso libre siempre:** si la banda, el disco o las imágenes no están, o MusicBrainz no responde, se carga a mano como hoy. MusicBrainz sugiere, nunca obliga.
- **Completar discos existentes:** "Completar desde MusicBrainz" en la edición de un disco, y un modo **"Completar pendientes"** que recorre de a uno los discos sin datos (✓ Sí / Otro / ✗ No es). Es el camino para la colección importada como texto.
- **Año del disco:** nuevo dato, editable a mano. Dentro de una banda, el orden por defecto pasa a ser **por año** (discografía); la grilla de bandas sigue A→Z.
- **Detalle:** muestra el año y la lista de temas (por lado o disco cuando hay varios).
- Spotify sin cambios (búsqueda web, sin API).

## Capabilities

### New Capabilities
- `musicbrainz`: búsqueda de bandas y discos en MusicBrainz, elección de edición, precarga de datos e imágenes, completar discos existentes y pendientes, tolerancia a fallas y límite de pedidos.

### Modified Capabilities
- `catalogo`: el alta y la edición incluyen año y temas; los datos que vienen de MusicBrainz tienen su propia regla de formato de nombres; la normalización iguala comillas tipográficas.
- `consulta`: la pantalla de banda ordena por año por defecto y suma la opción "Por año"; el detalle muestra año y temas.
- `imagenes`: tapa y contratapa pueden venir de Cover Art Archive, con el mismo procesamiento y almacenamiento que las fotos.

## Impact

- **Base:** migration nueva. `bandas.mbid`; `discos.anio`, `discos.temas` (jsonb), `discos.mb_release_group`, `discos.mb_release`, `discos.mb_estado`. `agregar_disco` recibe los datos opcionales; RPC nueva para completar un disco.
- **Código:** módulo nuevo `src/lib/musicbrainz.js` (cliente con cola de 1 pedido/s); cambios en `FormDisco`, `CampoBanda`, `Disco`, `Banda`, `catalogoContexto`, `preferencias`, `catalogo.js`; pantalla nueva de pendientes y ruta `#/completar`.
- **Externos:** `musicbrainz.org/ws/2` y `coverartarchive.org` (CORS abierto, sin clave). Sin dependencias npm nuevas.
- **Storage:** ~200 KB por disco con tapa y contratapa, igual que con fotos propias.
- **Importación:** sin cambios en este change; la colección se puede importar ya y completarse después.
