## Context

La app es una PWA pensada para el celular, con router de hash propio y catálogo cacheado en el dispositivo. Las capturas de los issues son de Android.

- **Spotify:** el link se guarda por disco y es igual para todos los miembros (`linkSpotify`). Solo llega por la edición o la importación, y la validación acepta cualquier ruta de `open.spotify.com`.
- **Detalle de disco:** el carrusel de tapa y contratapa ya usa el deslizamiento horizontal con scroll nativo.
- **Géneros:** el título de la sección usa `text-sm` y el nombre de la banda `text-base`. Con el orden "Género" sin agrupar no hay títulos, solo marcas del índice.
- **Compartir:** `compartirPlanilla` ya resuelve "compartir o descargar" con la Web Share API.

## Goals / Non-Goals

**Goals:**

- Publicar las cinco mejoras sin tocar la base.
- Corregir los links de Spotify ya guardados sin migrar datos.
- Mantener el historial de navegación según la jerarquía actual.

**Non-Goals:**

- Publicar directamente en Instagram o usar su API.
- Cambiar de disco siguiendo otra lista que no sea la de la banda (búsqueda, "Todos los discos", sorteo).
- Filtrar por género en la pantalla de una banda o en la búsqueda.
- Buscar el link de Spotify automáticamente.

## Decisions

### Spotify: normalizar al leer y al guardar

Una función `limpiarLinkSpotify(url)` devuelve `https://open.spotify.com/album/<id>` o `null`. Acepta el prefijo de idioma (`/intl-es/album/…`) y descarta los parámetros.

- `linkSpotify` la usa al abrir: si da `null`, abre la búsqueda. Así se corrigen los links guardados sin migración.
- La edición y la importación solo aceptan lo que la función reconoce, y guardan el link limpio.
- La planilla exporta el link limpio, para no repartir el identificador `si` de quien lo copió.

**Alternativa descartada:** migrar los datos en la base. Haría falta correrla y no cubriría los links que entraran después por otro camino.

**Causa sin confirmar:** el identificador `si` es la explicación más probable del #11, y el arreglo también cubre un link a un perfil. Si en un disco afectado el campo está vacío, la causa es la búsqueda de Spotify y este arreglo no alcanza (ver Open Questions).

### Gesto: pointer events en el detalle, fuera del carrusel

Un hook `useDeslizar` escucha pointer events en el `main` del detalle, con `touch-action: pan-y` para que el scroll vertical siga siendo nativo.

Un gesto cuenta si cumple todo esto:

- empieza fuera del carrusel y fuera de cualquier `<dialog>`: React propaga los eventos de las capas hacia sus componentes padres, así que hay que excluirlas explícitamente;
- empieza a más de 24 px de los bordes de la pantalla, que quedan para el gesto de atrás del sistema;
- recorre más de 60 px en horizontal, y al menos 1,5 veces lo que recorre en vertical.

La decisión de si un movimiento cuenta queda en una función pura, para poder testearla. El carrusel mantiene su scroll nativo y no participa del gesto.

**Alternativa descartada:** que la imagen pase al disco siguiente al llegar al extremo. La usuaria pidió que sobre la imagen solo se cambie de cara.

### Vecinos: los discos de la banda en ese formato

`discosDeBanda(discos, bandaId, formato, orden)` sale de `Banda.jsx` y la usan las dos pantallas, así que el detalle sigue el mismo orden (`ordenBanda`) que la lista. El recorrido no da la vuelta: en el primero y el último, el gesto no hace nada.

**Alternativa descartada:** seguir la lista desde la que se llegó. Obliga a pasar esa lista por la ruta y no aporta tanto como para justificarlo, porque la flecha ← ya va a la banda.

### Historial: reemplazar la entrada

Cambiar de disco usa `navegar(..., { reemplazar: true })`, que conserva lo que hay detrás. Atrás vuelve a la pantalla desde donde se abrió el detalle, sin recorrer los discos que se pasaron. Como `Disco` se monta por `key`, el carrusel vuelve a la tapa.

### Géneros: tamaño y no color

El título pasa a `text-xl`, con un separador fino arriba. **No usa el color de acento**, porque el spec `identidad-visual` lo reserva para la acción primaria, la pestaña activa, los avisos y la selección. Los chips activos sí lo usan, porque son selección.

### Títulos también en el orden "Género"

Sin agrupar, cada banda sigue apareciendo una sola vez, y la lista se parte en secciones por género.

- Sin filtro, el título es su género principal.
- Con filtro, es el primero de sus géneros que esté elegido. Si no, una banda filtrada por "heavy metal" aparecería bajo "hard rock", y parecería un error del filtro.
- Vale igual para "Todos los discos" ordenado por género.

Como ahora hay títulos, el índice toma las marcas de ellos: `criterioDe` devuelve `null` también para `orden === 'genero'`, y se quita ese caso de `marcaDe`.

### Filtro: chips con selección múltiple

La fila aparece solo cuando la lista se ve por género (`agrupar === 'generos'` u `orden === 'genero'`) y no se está buscando.

- Es una fila horizontal de chips en píldora, al principio de la lista, que se desplaza con ella. Se ordena como las secciones, con "Sin género" al final.
- Cada chip muestra cuántas bandas tiene o, en "Todos los discos", cuántos discos.
- La selección se guarda en la preferencia `generosFiltro`. Un género que no existe en el formato actual se ignora sin borrarse, para que siga elegido al volver a la otra pestaña. El sorteo descarta los elegidos solo al mostrarlos y usa su propia lista.
- La barra de la lista cuenta lo filtrado, y `Indice` recibe la selección en `version` para volver a medir.
- Al aparecer o cambiar de pestaña, la fila se desplaza hasta el primer chip activo. Si no, al volver a abrir la app parecería no tener nada elegido.

**Alternativa descartada:** chips que saltan a una sección, porque el índice lateral ya hace eso. Filtrar con un solo género también sirve para ir directo a él.

### Imagen para compartir: canvas generado antes del toque

`navigator.share` exige un gesto reciente de la usuaria, así que la imagen se genera cuando termina la animación, no al tocar. El botón muestra "Preparando…" hasta tenerla, y el toque llama a `share` de forma síncrona.

- **Formato:** JPEG de 1080×1920, siempre con fondo oscuro para que no dependa del tema.
- **Contenido:** tapa con el disco asomado, banda, título, año y "Música Retro".
- **Tapa:** se carga con `crossOrigin="anonymous"`, igual que el resto de la app, para no contaminar el canvas. Sin tapa o si falla la carga, usa el ícono del formato.
- **Fuentes:** espera `document.fonts.load` para las fuentes de la app. Si no están disponibles sin conexión, usa la fuente alternativa.
- **Botón:** dice "Compartir" y no "Instagram", porque el destino lo elige la usuaria en el menú del sistema.

`compartirPlanilla` se generaliza a `compartirArchivo(archivo, titulo)`, que comparte o descarga, y cancelar el menú no es un error.

## Risks / Trade-offs

- **Instagram puede no ofrecer historias para una imagen compartida desde la web** → Es lo primero que se prueba en un celular real. Si no aparece, la imagen igual se puede publicar desde otra opción del menú o guardarse.
- **El gesto puede dispararse sin querer al hacer scroll** → Los umbrales de recorrido y proporción lo reducen, y se ajustan al probar en el celular.
- **Discos con links que no son de álbum (por ejemplo, un tema) pasan a abrir la búsqueda** → Es lo que se busca: el botón promete el disco. El link queda guardado hasta que se edite.
- **El scroll guardado por pantalla podría abrir un disco ya visitado a mitad de página** → Al cambiar de disco con el gesto se borra la posición guardada de ese disco, para que abra arriba.
- **Una fila horizontal de chips puede esconder géneros** → Sin barra de scroll, el corte del último chip indica que hay más.

## Open Questions

Ninguna. La usuaria probó en el celular el enlace a Spotify (#11) y compartir el disco sorteado (#9), y los dio por buenos.
