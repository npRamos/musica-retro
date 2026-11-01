## MODIFIED Requirements

### Requirement: Corrección de bandas
El sistema SHALL permitir renombrar una banda y cambiar o quitar su imagen. El nombre editado MUST guardarse exactamente como se escribió. Si el nombre nuevo coincide (normalizado) con otra banda existente, el sistema SHALL ofrecer unir ambas. Al unir, la banda que queda MUST conservar sus géneros si ya estaban revisados; si no, MUST tomar los de la banda que desaparece.

Con conexión, la edición SHALL permitir enlazar la banda a un artista de MusicBrainz eligiéndolo entre las sugerencias del nombre, o volver a enlazarla a otro artista. Elegir un artista MUST poner su nombre tal como lo escribe MusicBrainz. La banda MUST enlazarse al guardar, y solo si el guardado termina sin conflicto. Si se unen dos bandas, la que queda MUST enlazarse al artista elegido cuando no estaba enlazada. Al enlazar, el sistema MUST buscar el logo si a la banda le falta, y MUST NOT reemplazar un logo existente. La edición MUST mostrar si la banda está enlazada y a qué artista.

#### Scenario: Renombrar
- **WHEN** la usuaria cambia "Soda Estereo" por "Soda Stereo" y no existe otra banda con ese nombre
- **THEN** el sistema renombra la banda, y todos sus discos la muestran con el nombre nuevo

#### Scenario: Unir bandas
- **WHEN** la usuaria renombra "Soda Estereo" a "Soda Stereo", ya existe "Soda Stereo", y confirma la unión
- **THEN** todos los discos pasan a "Soda Stereo" y la banda "Soda Estereo" deja de existir

#### Scenario: Unir con discos repetidos
- **WHEN** las dos bandas que se unen tienen el mismo disco en el mismo formato
- **THEN** queda un solo disco con la suma de las copias

#### Scenario: Unir conserva los géneros
- **WHEN** "Soda Stereo" no tiene géneros revisados, "Soda Estereo" tiene "new wave" y "pop rock", y se unen en "Soda Stereo"
- **THEN** "Soda Stereo" queda con "new wave" y "pop rock"

#### Scenario: Cancelar unión
- **WHEN** la usuaria cancela el diálogo de unión
- **THEN** ninguna banda se modifica

#### Scenario: Enlazar desde la edición
- **WHEN** la usuaria edita "Sabbath", sin enlazar, elige "Black Sabbath · GB" de las sugerencias de MusicBrainz y guarda
- **THEN** la banda se llama "Black Sabbath", queda enlazada a ese artista y, si no tenía logo, el sistema lo busca

#### Scenario: Escribir otra cosa después de elegir
- **WHEN** la usuaria elige "Black Sabbath" de MusicBrainz y después cambia el texto a "Black Sabbath (tributo)"
- **THEN** al guardar, la banda se renombra y no se enlaza a ese artista

#### Scenario: Enlazar y unir
- **WHEN** la usuaria elige de MusicBrainz un artista cuyo nombre coincide con otra banda sin enlazar del catálogo y confirma la unión
- **THEN** la banda que queda está enlazada al artista elegido

#### Scenario: Cancelar unión después de elegir un artista
- **WHEN** la usuaria elige de MusicBrainz un artista cuyo nombre coincide con otra banda del catálogo y cancela la unión
- **THEN** la banda no se renombra ni se enlaza
