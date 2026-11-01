## MODIFIED Requirements

### Requirement: Sugerencias de bandas desde MusicBrainz
Mientras la usuaria escribe la banda en el alta, o el nombre al editar una banda, el sistema SHALL mostrar primero las bandas del catálogo y después artistas de MusicBrainz, con su país o desambiguación. El sistema MUST mostrar siempre la opción de usar el texto escrito tal cual. Un artista de MusicBrainz ya enlazado a una banda del catálogo MUST mostrarse como esa banda, sin duplicarla. Al editar una banda, la propia banda MUST NOT sugerirse, y el sistema MUST buscar en MusicBrainz aunque el nombre escrito sea el de la propia banda.

#### Scenario: Banda que no está en el catálogo
- **WHEN** la usuaria escribe "soda st" y no tiene discos de Soda Stereo
- **THEN** el sistema sugiere "Soda Stereo · Argentina" desde MusicBrainz y la opción "Usar «soda st» tal cual"

#### Scenario: Banda ya enlazada
- **WHEN** la banda "Soda Stereo" del catálogo está enlazada a su artista de MusicBrainz y la usuaria escribe "soda"
- **THEN** el sistema la sugiere una sola vez, como banda del catálogo

#### Scenario: Elegir una banda local sin enlazar
- **WHEN** la usuaria elige del catálogo una banda que no está enlazada a MusicBrainz
- **THEN** el sistema busca sus discos en MusicBrainz por nombre de banda y título mientras escribe el disco

#### Scenario: Editar una banda bien escrita sin enlazar
- **WHEN** la usuaria edita "Los Piojos", que no está enlazada, y toca el campo del nombre
- **THEN** el sistema sugiere "Los Piojos · Argentina" desde MusicBrainz, sin sugerir la propia banda del catálogo

### Requirement: Elección automática de la edición
Al elegir un disco de MusicBrainz, el sistema SHALL elegir una edición priorizando, en orden: que coincida con el formato elegido (vinilo o CD), que tenga tapa, que tenga contratapa, que sea de Argentina y que sea la más antigua. El sistema MUST mostrar la edición elegida y permitir cambiarla por otra o por "Ninguna". Si ninguna edición coincide con el formato, MUST avisarlo.

El selector de edición MUST listar primero las ediciones del formato del disco, en ese mismo orden de prioridad, y dejar las de otros formatos detrás de una opción "Ver otros formatos" con su cantidad. Si ninguna edición coincide con el formato, o el formato todavía no se eligió, MUST listar todas en ese orden.

Si la usuaria cambia el formato después de elegir a mano una edición que no es del formato nuevo, el sistema MUST volver a la elección automática. "Ninguna" MUST respetarse.

#### Scenario: CD de Signos
- **WHEN** la usuaria elige "Signos" con formato CD
- **THEN** el sistema elige el CD argentino de 1986, que tiene tapa y contratapa

#### Scenario: Cambiar el formato
- **WHEN** con "Signos" elegido la usuaria cambia el formato a vinilo sin haber elegido la edición a mano
- **THEN** el sistema elige el vinilo argentino de 1986

#### Scenario: Cambiar el formato después de elegir a mano
- **WHEN** la usuaria eligió a mano un CD de "Signos" y después cambia el formato a vinilo
- **THEN** el sistema elige el vinilo argentino de 1986

#### Scenario: Sin edición en ese formato
- **WHEN** el disco elegido no tiene ediciones en vinilo y el formato es vinilo
- **THEN** el sistema elige la mejor edición disponible y avisa que no encontró la edición en vinilo

#### Scenario: Ninguna edición
- **WHEN** la usuaria elige "Ninguna" en el selector de edición
- **THEN** el sistema conserva banda y título, y quita los temas y las imágenes precargadas

#### Scenario: Selector con el formato elegido
- **WHEN** la usuaria carga un vinilo de un disco con 3 ediciones en vinilo y 8 en otros formatos (CD, Digital Media, sin formato) y abre el selector de edición
- **THEN** ve las 3 ediciones en vinilo, la que tiene tapa primero, y la opción "Ver otros formatos (8)"

#### Scenario: Ver otros formatos
- **WHEN** la usuaria toca "Ver otros formatos (8)"
- **THEN** el selector muestra también las 8 ediciones de otros formatos, debajo de las del vinilo

#### Scenario: Ninguna del formato
- **WHEN** la usuaria carga un vinilo de un disco sin ediciones en vinilo y abre el selector de edición
- **THEN** ve todas las ediciones en orden de prioridad, sin la opción "Ver otros formatos"
