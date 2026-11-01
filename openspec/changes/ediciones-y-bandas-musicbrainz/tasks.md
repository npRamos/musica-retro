## 1. Ediciones por formato (#4)

- [x] 1.1 `ordenarEdiciones(ediciones, formato)` en `discografia.js`: devuelve `{ delFormato, otras }`, ordenadas con la clave de prioridad. Sin formato, todas van a `delFormato`. `elegirEdicion` pasa a usarla.
- [x] 1.2 Tests de `ordenarEdiciones`:
  - separa por formato y respeta la prioridad (tapa, contratapa, AR, la más vieja);
  - sin formato no separa;
  - `elegirEdicion` sigue eligiendo lo mismo que antes.
- [x] 1.3 `HojaEdiciones` en `Formulario.jsx`:
  - grupo "En vinilo"/"En CD" con "Ver otros formatos (N)";
  - grupo "Otros formatos" al expandir, que abre ya expandido si la elegida es de otro formato;
  - grupo único "Ediciones" si no hay del formato o no hay formato;
  - opción "Ninguna" con texto configurable.
- [x] 1.4 Usar `HojaEdiciones` en `FormDisco.jsx` (alta) y en `Completar.jsx` (completar un disco y pendientes).
- [x] 1.5 `FormDisco`: al cambiar el formato, si la edición elegida a mano no es del formato nuevo, volver a la automática ("Ninguna" se respeta).

## 2. Enlazar la banda desde su edición (#5)

- [x] 2.1 `CampoBanda` con prop `banda` (modo edición):
  - etiqueta "Nombre";
  - sin sugerirse a sí misma, y buscando en MusicBrainz aunque el texto sea el de la propia banda;
  - artista actual marcado y artistas de otras bandas filtrados;
  - ayuda con el estado de enlace ("Enlazada a…", "Sin enlazar…", "Se enlaza a «X» al guardar", "Ya existe «X»: al guardar te ofrece unirlas").
- [x] 2.2 `EditarBanda`:
  - reemplazar el `Campo` del nombre por `CampoBanda` con `conMusicbrainz = online`;
  - guardar `artistaMb` y soltarlo si el texto deja de coincidir (normalizado) con su nombre.
- [x] 2.3 `SelectorGeneros` y `SelectorLogo` reciben `mbid = artistaMb?.id ?? banda.mbid`. Las sugerencias de géneros traídas se descartan si cambia el artista.
- [x] 2.4 Guardar:
  - después de renombrar sin conflicto, si el artista elegido es distinto del actual: `enlazarBanda`, después `buscarGenerosSiFalta`;
  - con conflicto, no enlazar;
  - al unir, enlazar la banda que queda si no tenía `mbid`.
- [x] 2.5 Exponer `buscarGenerosSiFalta` en el contexto si hace falta, sin cambiar su guarda (solo actúa con géneros pendientes).

## 3. Verificación

- [x] 3.1 Tests y build en verde.
- [ ] 3.2 Probar en el celular:
  - alta de un vinilo con un disco de muchas ediciones (ver otros formatos, elegir, cambiar el formato);
  - completar un disco;
  - editar una banda sin enlazar y enlazarla (logo y géneros);
  - volver a enlazar a otro artista;
  - elegir un artista que choca con otra banda, y unir y cancelar;
  - sin conexión.
- [ ] 3.3 Sincronizar las specs y archivar el change. Cerrar los issues #4 y #5.
