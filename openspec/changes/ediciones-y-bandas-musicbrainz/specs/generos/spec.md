## MODIFIED Requirements

### Requirement: Géneros automáticos al enlazar
Cuando una banda queda enlazada a MusicBrainz al dar de alta un disco, completar un disco, completar pendientes o editar la banda, y sus géneros todavía no fueron revisados, el sistema SHALL traer los géneros propuestos y guardarlos sin preguntar, dándolos por revisados. Si MusicBrainz no tiene géneros o no responde, la banda MUST quedar sin revisar y el alta, el completado o la edición MUST NOT bloquearse ni mostrar error. El sistema MUST NOT reemplazar géneros ya revisados o editados.

#### Scenario: Alta de una banda nueva
- **WHEN** la usuaria agrega un disco eligiendo de MusicBrainz la banda "Megadeth", que no estaba en el catálogo
- **THEN** la banda queda con "thrash metal", "heavy metal" y "speed metal", sin que el sistema pregunte

#### Scenario: Géneros editados
- **WHEN** la usuaria cambió los géneros de "La Renga" a "rock nacional" y después completa un disco de La Renga desde MusicBrainz
- **THEN** la banda conserva "rock nacional"

#### Scenario: MusicBrainz sin géneros
- **WHEN** se enlaza una banda cuyo artista no tiene géneros en MusicBrainz
- **THEN** la banda sigue apareciendo en "Completar géneros"

#### Scenario: MusicBrainz no responde
- **WHEN** MusicBrainz no responde al buscar los géneros durante un alta
- **THEN** el disco se guarda igual y la banda sigue apareciendo en "Completar géneros"

#### Scenario: Enlazar desde la edición de la banda
- **WHEN** la usuaria edita "Megadeth", que no tiene géneros revisados, elige su artista de MusicBrainz y guarda sin tocar los géneros
- **THEN** la banda queda con "thrash metal", "heavy metal" y "speed metal"
