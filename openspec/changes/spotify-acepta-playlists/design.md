## Context

- `limpiarLinkSpotify(url)` en `src/lib/catalogo.js` es la única fuente de verdad sobre los links de Spotify. Devuelve `https://open.spotify.com/album/<id>` o `null`, y la usan:
  - el formulario de edición (`FormDisco.jsx`), para validar y guardar;
  - la importación (`importar.js`), para validar y guardar;
  - `linkSpotify` (detalle y sorteo), para abrir el link o caer en la búsqueda;
  - la exportación (`exportar.js`), para la columna Spotify.
- Antes del #11 se validaba con `esLinkSpotifyValido`, que aceptaba cualquier ruta de `open.spotify.com`. Por eso hay discos guardados con playlists.
- El formulario valida todos los campos al guardar, incluido el link que no se tocó.

## Goals / Non-Goals

**Goals:**

- Que un disco con una playlist guardada se pueda editar y que su botón abra la playlist.
- Mantener la limpieza de parámetros (`?si=`) del #11 también para las playlists.

**Non-Goals:**

- Aceptar links de tema (`/track/`), artista o perfil.
- Validar el link solo cuando cambia: con las playlists aceptadas ya no hace falta, y no queremos datos que la app ignora sin avisar.
- Migrar los datos guardados.

## Decisions

### Ampliar `limpiarLinkSpotify` a álbum o playlist

La expresión de la ruta pasa a reconocer el tipo además del id: `/(intl-xx/)?(album|playlist)/<id>/?`. La función devuelve `https://open.spotify.com/<tipo>/<id>`, sin parámetros ni prefijo de idioma.

Como los cuatro usos pasan por esta función, el cambio les llega a todos sin tocarlos. Solo cambian los textos de error del formulario y de la importación.

**Alternativa descartada:** validar el link solo si la usuaria lo cambió. Destraba la edición, pero el botón seguiría abriendo la búsqueda y la planilla seguiría dejando la celda vacía.

**Alternativa descartada:** aceptar también temas. Un disco es un álbum o, como mucho, una playlist que lo arma. No hay un caso real de tema suelto.

### Lista explícita de tipos

Los tipos aceptados son una lista cerrada (`album`, `playlist`), no "cualquier cosa menos perfil". Así un tipo nuevo de Spotify (por ejemplo, `episode` o `show`) no entra sin que lo decidamos.

## Risks / Trade-offs

- [Una playlist puede cambiar o borrarse en Spotify, a diferencia de un álbum] → Es decisión de quien carga el link; el botón abre lo que haya.
- [Ids de playlist con un formato distinto al de álbum] → Las dos usan el mismo id base62 alfanumérico; los tests cubren uno real (`0JAGbTK5y60Xj4V…`).
