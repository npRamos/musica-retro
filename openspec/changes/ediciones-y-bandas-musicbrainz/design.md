## Context

- **Ediciones:**
  - `elegirEdicion` (`src/lib/discografia.js`) ya ordena por formato, tapa, contratapa, Argentina y fecha, pero solo para quedarse con la primera.
  - El selector de edición es una `Hoja` armada a mano en dos lugares: `FormDisco.jsx` (alta) y `Completar.jsx` (completar un disco y completar pendientes). Los dos listan `ediciones` en el orden en que llegan de MusicBrainz.
  - Un disco popular trae decenas de ediciones (el pedido es de hasta 100), muchas digitales o sin formato.
- **Bandas:**
  - `EditarBanda.jsx` usa un `Campo` de texto simple.
  - `CampoBanda` (`Formulario.jsx`) ya resuelve la lista combinada de catálogo y MusicBrainz, el filtro de artistas ya enlazados, la pausa al escribir y el "usar tal cual". Sus textos de ayuda hablan del alta ("Banda nueva: se agrega al guardar").
  - `enlazarBanda` (contexto) actualiza `mbid` y busca el logo si falta. Los géneros no se buscan ahí, a propósito, por "Completar géneros".
  - `renombrar_banda` devuelve `conflicto` cuando el nombre coincide con otra banda, y `fusionar_bandas` le deja a la banda que queda `coalesce(mbid, origen.mbid)`.

## Goals / Non-Goals

**Goals:**
- En el selector de edición, la edición del formato correcto tiene que estar arriba y a un toque.
- Enlazar, o volver a enlazar, una banda a MusicBrainz desde su edición, reusando el campo del alta.

**Non-Goals:**
- Desenlazar una banda (dejarla sin `mbid`).
- Reemplazar el logo o los géneros que ya tiene la banda al volver a enlazarla: solo se completan si faltan.
- Filtrar ediciones en el pedido a MusicBrainz: se sigue pidiendo todo y se ordena en el navegador.
- Pedir más de 100 ediciones.

## Decisions

### Ediciones: una función pura que ordena y separa

`ordenarEdiciones(ediciones, formato)` devuelve `{ delFormato, otras }`, las dos listas ordenadas con la misma clave que usa hoy `elegirEdicion`. `elegirEdicion` pasa a tomar `delFormato[0] ?? otras[0]`, así la elección automática y el orden de la lista no pueden quedar desparejos. Si no hay formato elegido (alta con el formato sin tocar), todas van a `delFormato`, porque no hay nada que separar.

**Alternativa descartada:** filtrar las ediciones de otros formatos sin poder verlas. Hay discos editados en vinilo cuya edición en MusicBrainz figura sin formato, o como "12\"" en algún medio raro. Tienen que seguir siendo elegibles.

### Un componente `HojaEdiciones` compartido

Va en `Formulario.jsx`, con estas props:

```
{ ediciones, formato, valor, onElegir, alCerrar, ninguna }
```

`ninguna` es el texto de la opción final ("Ninguna (solo banda y título)" en el alta, "Ninguna (solo año)" al completar).

- **Cómo se ve:** usa `Hoja` con grupos. El primero se titula "En vinilo" o "En CD" y lleva las ediciones del formato. Si hay otras, el grupo termina con una opción "Ver otros formatos (N)", que cambia un estado local y agrega el grupo "Otros formatos".
- **Casos sin separación:** si `delFormato` está vacío, o el formato es nulo, se muestra un solo grupo "Ediciones" con todas.
- **Edición elegida de otro formato:** si la elegida (`valor`) es de otro formato, la hoja abre con los otros formatos ya visibles, para que se vea marcada.
- **"Ninguna" siempre al final:** con los otros formatos cerrados va después de "Ver otros formatos (N)"; abiertos, al final de "Otros formatos".

**Alternativa descartada:** dos pestañas. Agregan una interacción más para el caso raro y no aprovechan la `Hoja` existente.

### Cambiar el formato en el alta

En `FormDisco`, al cambiar el formato, si `edicionManual` es un id cuya edición no coincide con el formato nuevo, se vuelve a `null` (elección automática). "Ninguna" se respeta, porque es una decisión explícita de no usar edición. En `Completar` el formato es el del disco y no cambia, así que no aplica.

### Editar banda: reusar `CampoBanda` con un modo edición

`CampoBanda` suma la prop `banda` (la que se está editando). Con ella:

- **Etiqueta y ayuda:** la etiqueta pasa a ser "Nombre". El texto de ayuda deja de hablar de "banda nueva" y muestra el estado de enlace:
  - "Enlazada a MusicBrainz: «nombre» · país", o
  - "Sin enlazar a MusicBrainz", o
  - "Se enlaza a «X» al guardar", si se eligió un artista.
  - Cuando el texto coincide con otra banda del catálogo: "Ya existe «X»: al guardar te ofrece unirlas".
- **Sugerencias del catálogo:** la banda que se edita no se sugiere a sí misma.
- **Búsqueda en MusicBrainz:** se hace aunque el texto coincida exactamente con la banda actual, porque es justamente el caso de enlazar una banda que ya está bien escrita. Para eso, `exacta` excluye a la banda que se edita.
- **Artistas ya enlazados:** se siguen filtrando los enlazados a *otras* bandas. El artista al que ya está enlazada esta banda sí se muestra, marcado como el actual.

La búsqueda arranca cuando el campo tiene foco. Al entrar en la pantalla el campo no se enfoca solo, así que no se gasta un pedido de búsqueda por abrir la edición.

**Nombre del artista enlazado:** la base solo guarda el `mbid`. Para mostrar "Enlazada a MusicBrainz: «nombre» · país", una banda enlazada pide su artista al abrir la edición (con conexión): un solo pedido, `artist/<mbid>?inc=genres`, el mismo que usa "Traer de MusicBrainz", así queda en caché para los géneros. Mientras llega, o sin conexión, dice "Enlazada a MusicBrainz".

**Alternativa descartada:** un botón aparte "Enlazar a MusicBrainz" que abra un buscador. Duplica una UI que ya existe, y el issue pide explícitamente "lo mismo que cuando se crea".

### Guardar: enlazar después de renombrar

`EditarBanda` guarda el artista elegido en `artistaMb` mientras su nombre normalizado siga igual al del campo, con la misma regla que `artistaElegido` en `FormDisco`. Si se escribe otra cosa, el artista elegido se suelta. Al guardar:

1. Imagen, logo y géneros, como hoy.
2. Renombrar si cambió el nombre. Si hay conflicto, se abre el diálogo de unir y la banda **todavía no se enlaza**.
3. Si no hubo conflicto y `artistaMb.id !== banda.mbid`: `enlazarBanda(banda, artistaMb.id)`, que busca el logo si falta, seguido de `buscarGenerosSiFalta`, que solo actúa si los géneros no están revisados y no se cambiaron a mano en este guardado.
4. **Si se une:** después de `fusionarBandas`, si la banda que queda no tiene `mbid`, se la enlaza al artista elegido.

Enlazar después de renombrar evita que cancelar la unión deje enlazada una banda que no se renombró.

**Banda al día para el logo y los géneros:** la banda que tiene la pantalla no refleja lo que se acaba de guardar (un logo elegido o quitado, géneros cambiados) ni lo que heredó al unir. Por eso `enlazarBanda` devuelve la fila como quedó en la base, y el logo y los géneros se buscan con esa. El logo sigue la regla de siempre: se busca solo si no hay y nunca se buscó. Al volver a enlazar una banda cuyo logo ya se buscó, no se busca solo; "Buscar en Wikidata" queda a mano con el artista nuevo.

### Géneros y logo con el artista recién elegido

`SelectorGeneros` y `SelectorLogo` reciben `mbid = artistaMb?.id ?? banda.mbid` en vez de leer `banda.mbid`. Así "Traer de MusicBrainz" y "Buscar en Wikidata" aparecen apenas se elige el artista. Si se cambia de artista después de traer géneros, las sugerencias traídas se descartan.

### Géneros automáticos también al enlazar desde la edición

Se suma este caso a "Géneros automáticos al enlazar" por coherencia: enlazar una banda no revisada trae sus géneros. No contradice "Completar géneros", porque ahí el enlace se hace desde su propia pantalla, que sigue sin buscarlos.

## Risks / Trade-offs

- **[Volver a enlazar a un artista equivocado]** → El estado de enlace queda visible bajo el campo, y se puede corregir eligiendo otro artista. No se borran el logo ni los géneros ya puestos.
- **[`CampoBanda` con dos modos se vuelve más complejo]** → El modo edición se limita a `banda` (excluir la propia), los textos de ayuda y el artista actual. La lógica de búsqueda no cambia.
- **[Ediciones sin formato en MusicBrainz quedan en "Otros formatos"]** → Siguen a un toque, y si no hay ninguna del formato se ven todas directamente.
