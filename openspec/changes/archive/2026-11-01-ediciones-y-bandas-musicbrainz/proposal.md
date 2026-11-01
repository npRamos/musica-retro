## Why

Dos problemas al usar MusicBrainz, reportados en los issues #4 y #5:
- **Ediciones (#4):** al cargar un vinilo y abrir el selector de edición, la lista mezcla CD, Enhanced CD, Digital Media y "Sin formato". Además sigue el orden de MusicBrainz, así que hay que buscar a ojo la edición en vinilo para traer su tapa.
- **Bandas (#5):** editar el nombre de una banda no busca en MusicBrainz como el alta. No hay forma de enlazar una banda desde su edición, que es justo donde se la corrige. Hoy solo se enlaza al cargar o completar un disco, o desde "Completar géneros".

## What Changes

- **Selector de edición** (alta de disco, completar un disco y completar pendientes):
  - Muestra primero, o solo, las ediciones del formato del disco, ordenadas con la misma prioridad que la elección automática: tapa, contratapa, Argentina y la más antigua.
  - Las de otros formatos quedan detrás de "Ver otros formatos (N)".
  - Si ninguna coincide con el formato, o el formato todavía no se eligió, muestra todas en ese orden.
- **Cambiar el formato en el alta:** si la edición elegida a mano no es del formato nuevo, se vuelve a la elección automática.
- **Editar banda:**
  - El campo Nombre sugiere, mientras se escribe, las bandas del catálogo y los artistas de MusicBrainz, igual que el alta. Sigue habiendo la opción de usar el texto tal cual.
  - Elegir un artista pone su nombre y, al guardar, enlaza la banda (o la vuelve a enlazar si estaba enlazada a otro artista). Si le falta, busca su logo, y trae los géneros si no estaban revisados.
  - Debajo del campo se ve si la banda está enlazada y a qué artista.
  - Con el artista elegido, "Traer de MusicBrainz" (géneros) y "Buscar en Wikidata" (logo) quedan disponibles enseguida, sin tener que guardar antes.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `musicbrainz`:
  - "Elección automática de la edición" suma cómo se listan las ediciones en el selector, y qué pasa al cambiar el formato después de elegir una a mano.
  - "Sugerencias de bandas desde MusicBrainz" pasa a valer también al editar una banda.
- `catalogo`: "Corrección de bandas" suma enlazar la banda a MusicBrainz desde su edición.
- `generos`: "Géneros automáticos al enlazar" suma el enlace desde la edición de la banda.

## Impact

- `src/lib/discografia.js`: ordenar las ediciones con la prioridad de `elegirEdicion` y separarlas por formato. Con tests.
- `src/pantallas/FormDisco.jsx` y `src/pantallas/Completar.jsx`: el selector de edición y el cambio de formato.
- `src/componentes/Formulario.jsx`: `CampoBanda` se adapta para usarse en la edición (textos de ayuda y estado de enlace).
- `src/pantallas/EditarBanda.jsx`: campo de nombre con MusicBrainz, enlace al guardar, y géneros y logo con el artista elegido.
- `src/lib/catalogoContexto.jsx`: enlazar al renombrar, incluido el caso de unir bandas.
- No hay migraciones: `bandas.mbid` ya existe y la actualización directa está permitida a los miembros.
