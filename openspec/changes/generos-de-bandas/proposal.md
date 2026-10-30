## Why

A veces no sabemos qué escuchar de lo que tenemos. Por eso viene un sorteo de discos (hitos 2 y 3: `sorteo-de-discos` y `batea`), y para que se pueda sortear por estilo, las bandas tienen que tener género. Hoy el catálogo no guarda géneros. Además, solo unas 15 de las ~55 bandas están enlazadas a MusicBrainz, y la única forma de enlazar una banda es completar uno de sus discos.

## What Changes

- **Géneros por banda:** cada banda tiene hasta 3 géneros (por ejemplo "thrash metal", "heavy metal"), con los nombres en inglés tal como vienen de MusicBrainz o escritos a mano. Se comparan normalizados, para que "Thrash Metal" y "thrash metal" sean el mismo.
- **Automáticos al enlazar:** cuando una banda queda enlazada a MusicBrainz (alta, completar un disco o pendientes) y todavía no tiene géneros revisados, se traen los más votados y se guardan sin preguntar.
- **Completar géneros:** desde Ajustes, un modo que recorre de a una las bandas sin géneros. Si la banda no está enlazada, primero propone el artista de MusicBrainz y, al confirmarlo, la enlaza (lo que también habilita buscar su logo). Después muestra los géneros propuestos para elegir y permite agregar otros a mano. Se puede dejar y retomar.
- **Editar géneros:** en Editar banda, chips editables (máximo 3), con autocompletado que sugiere primero los géneros ya usados en el catálogo, y "Traer de MusicBrainz" si la banda está enlazada.
- **Mostrar géneros:** como chips en la pantalla de la banda, también sin conexión.
- **Unir bandas** conserva los géneros.
- **Agrupar y ordenar por género:** en las pestañas, "Por género" muestra las bandas en secciones por género (una banda aparece en cada uno de sus géneros, y las que no tienen van a "Sin género"), y el orden "Género" ordena por el primer género de cada banda.

## Capabilities

### New Capabilities
- `generos`: géneros de las bandas: modelo y reglas (máximo 3, comparación normalizada), obtención desde MusicBrainz, modo "Completar géneros" (incluido el enlace de bandas a MusicBrainz), edición y visualización.

### Modified Capabilities
- `catalogo`: "Corrección de bandas": unir dos bandas conserva sus géneros.
- `consulta`: "Pantalla de banda" muestra los géneros de la banda; "Orden elegible" suma el orden por género; "Agrupar por banda o ver todos los discos" suma las secciones por género.

## Impact

- **Base:** migration con `bandas.generos text[]` (máximo 3) y `bandas.generos_estado` (`pendiente` | `listo`); nueva versión de `fusionar_bandas`.
- **Código:** `src/lib/musicbrainz.js` (`generosDeArtista`), `src/lib/discografia.js` (elegir los géneros propuestos), un módulo nuevo `src/lib/generos.js` (normalizar, sugerir), `catalogoContexto.jsx` (select, `cambiarGenerosBanda`, `enlazarBanda`, búsqueda automática al enlazar), pantalla nueva `src/pantallas/CompletarGeneros.jsx` y ruta `#/generos`, `Ajustes.jsx`, `EditarBanda.jsx`, `Banda.jsx`, componente de chips.
- **Externos:** MusicBrainz `artist/<mbid>?inc=genres`, por la cola de 1 pedido por segundo que ya existe.
- **Sin cambios** en exportación ni importación CSV.
- **Prepara** `sorteo-de-discos`, que va a filtrar por estos géneros.
