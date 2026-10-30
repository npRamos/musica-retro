## MODIFIED Requirements

### Requirement: Corrección de bandas
El sistema SHALL permitir renombrar una banda y cambiar o quitar su imagen. El nombre editado MUST guardarse exactamente como se escribió. Si el nombre nuevo coincide (normalizado) con otra banda existente, el sistema SHALL ofrecer unir ambas. Al unir, la banda que queda MUST conservar sus géneros si ya estaban revisados; si no, MUST tomar los de la banda que desaparece.

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
