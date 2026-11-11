## Why

Antes del #11 se aceptaba cualquier link de `open.spotify.com`, y quedaron discos guardados con el link de una playlist (por ejemplo, un CD doble armado como playlist). Desde el #11 solo se reconocen links de álbum. Por eso esos discos no se pueden editar: al cambiarles el estado o la observación, el formulario rechaza el link aunque nadie lo haya tocado. Además, "Escuchar en Spotify" abre la búsqueda en vez de la playlist.

## What Changes

- Los links de **playlist** de `open.spotify.com` pasan a ser válidos, igual que los de álbum. También con prefijo de idioma (`/intl-es/playlist/…`).
- Se guardan, se abren y se exportan limpios, sin parámetros (`https://open.spotify.com/playlist/<id>`), igual que los de álbum.
- Siguen rechazados los links de tema, artista o perfil.
- Los mensajes de error dicen "álbum o playlist":
  - formulario: "Tiene que ser el link de un álbum o una playlist de open.spotify.com";
  - importación: "El link de Spotify tiene que ser de un álbum o una playlist".
- Los discos que ya tienen una playlist guardada vuelven a poder editarse, y su botón abre la playlist. No hace falta migrar nada.

## Capabilities

### New Capabilities

_Ninguna._

### Modified Capabilities

- `catalogo`: "Edición de disco" acepta links de álbum o de playlist.
- `consulta`: "Abrir en Spotify" abre también la playlist guardada.
- `importacion`: "Link de Spotify al importar" acepta álbum o playlist.
- `exportacion`: "Link de Spotify en la planilla" exporta también la playlist.

## Impact

- **Sin migración:** no cambia la base ni las dependencias.
- **`src/lib/catalogo.js`:** `limpiarLinkSpotify` reconoce álbum y playlist. Con tests.
- **`src/pantallas/FormDisco.jsx` y `src/lib/importar.js`:** cambian el texto del error. Con tests de importación.
- **`src/lib/exportar.js`, `src/pantallas/Disco.jsx` y `src/pantallas/Sorteo.jsx`:** no cambian; toman lo nuevo a través de `limpiarLinkSpotify`. Se suma un test de exportación con playlist.
