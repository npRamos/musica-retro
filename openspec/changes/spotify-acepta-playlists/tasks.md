## 1. Link de Spotify

- [x] 1.1 `catalogo.js`: `limpiarLinkSpotify(url)` reconoce `/album/<id>` y `/playlist/<id>` (con prefijo de idioma opcional) y devuelve `https://open.spotify.com/<tipo>/<id>` sin parámetros. Actualizar el comentario de la función.
- [x] 1.2 `FormDisco.jsx`: el error dice "Tiene que ser el link de un álbum o una playlist de open.spotify.com".
- [x] 1.3 `importar.js`: el error dice "El link de Spotify tiene que ser de un álbum o una playlist".

## 2. Tests

- [x] 2.1 `catalogo.test.js`:
  - `limpiarLinkSpotify` con una playlist, una playlist con `?si=` y una playlist con `/intl-es/`;
  - siguen dando `null` un tema, un perfil y un artista;
  - `linkSpotify` abre la playlist guardada.
- [x] 2.2 `importar.test.js`: una línea con playlist se importa limpia, y los mensajes de error usan el texto nuevo.
- [x] 2.3 `exportar.test.js`: un disco con playlist exporta el link limpio.
- [x] 2.4 Correr toda la suite de tests.

## 3. Verificación

- [x] 3.1 En la app, editar un disco con una playlist guardada, cambiarle el estado a "Rayado" y guardar sin tocar el link: guarda y conserva la playlist.
- [x] 3.2 En el detalle de ese disco, "Escuchar en Spotify" abre la playlist.
