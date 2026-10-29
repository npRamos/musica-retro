## ADDED Requirements

### Requirement: Logo de banda
Cada banda SHALL poder tener un logo, además de su imagen propia. Cuando una banda queda enlazada a MusicBrainz y nunca se buscó su logo, el sistema SHALL buscarlo en Wikidata y, si existe, guardarlo en el almacenamiento privado sin recortarlo y conservando la transparencia. Desde la edición de la banda, el sistema SHALL permitir buscar el logo en Wikidata, elegir un archivo propio o quitarlo. Un logo quitado MUST NOT volver a buscarse solo. Al reemplazar o quitar un logo, o al unir o borrar la banda, el archivo anterior MUST borrarse del almacenamiento.

#### Scenario: Logo automático
- **WHEN** la usuaria completa desde MusicBrainz el primer disco de Iron Maiden
- **THEN** la banda queda con el logo de Iron Maiden de Wikidata, sin que haga nada más

#### Scenario: Banda sin logo en Wikidata
- **WHEN** una banda enlazada no tiene logo en Wikidata
- **THEN** la banda queda sin logo, no se vuelve a buscar automáticamente y la tarjeta se ve como antes

#### Scenario: Logo propio
- **WHEN** la usuaria elige un PNG con fondo transparente en "Elegir archivo"
- **THEN** el sistema lo guarda como logo de la banda, con la transparencia

#### Scenario: Quitar
- **WHEN** la usuaria quita el logo de una banda
- **THEN** el logo se borra y no reaparece al completar otros discos de esa banda

#### Scenario: Wikidata no responde
- **WHEN** la búsqueda automática falla por un error de red
- **THEN** la banda queda sin logo y la búsqueda se reintenta en la próxima oportunidad
