## ADDED Requirements

### Requirement: Máximo de géneros configurable
El sistema SHALL permitir elegir en Ajustes el máximo de géneros por banda, entre 1 y 5, con 3 por defecto. El máximo MUST ser del catálogo: el mismo para todos los miembros y en todos los dispositivos. Cambiarlo MUST requerir conexión. Sin conexión, el sistema MUST usar el último valor conocido. Bajar el máximo MUST NOT quitar géneros a ninguna banda, y subirlo MUST NOT agregarlos.

#### Scenario: Subir el máximo
- **WHEN** la usuaria elige 5 en "Géneros por banda"
- **THEN** puede agregar hasta 5 géneros a cualquier banda, y las bandas ya revisadas conservan los que tenían

#### Scenario: Bajar el máximo
- **WHEN** "Megadeth" tiene 3 géneros y la usuaria elige 2
- **THEN** "Megadeth" sigue con sus 3 géneros y, al editarla, el sistema avisa que tiene más que el máximo y no deja agregar otro hasta quitar alguno

#### Scenario: Compartido
- **WHEN** una persona del catálogo cambia el máximo a 4
- **THEN** las demás ven 4 en Ajustes al sincronizar

#### Scenario: Sin conexión
- **WHEN** la usuaria abre Ajustes sin conexión
- **THEN** ve el máximo actual, pero no puede cambiarlo

## MODIFIED Requirements

### Requirement: Géneros de una banda
Cada banda SHALL poder tener entre 0 géneros y el máximo de géneros del catálogo. Los géneros MUST guardarse con el nombre tal como vienen de MusicBrainz (en inglés) o como se escribieron, sin espacios sobrantes. El sistema MUST considerar iguales dos géneros que solo difieren en mayúsculas, tildes o espacios. Al agregar un género que ya existe en el catálogo escrito de otra forma, el sistema MUST usar la forma existente. Una banda MUST NOT tener dos veces el mismo género. Una banda que tiene más géneros que el máximo (porque el máximo se bajó) MUST conservarlos y mostrarlos todos.

#### Scenario: Máximo de tres
- **WHEN** el máximo del catálogo es 3 y la banda ya tiene 3 géneros
- **THEN** el sistema no permite agregar un cuarto e indica "Máximo 3"

#### Scenario: Máximo de cinco
- **WHEN** el máximo del catálogo es 5 y la banda tiene 4 géneros
- **THEN** el sistema permite agregar un quinto

#### Scenario: Género escrito de otra forma
- **WHEN** el catálogo ya usa "thrash metal" y la usuaria agrega "Thrash  Metal" a otra banda
- **THEN** la banda queda con "thrash metal"

#### Scenario: Género repetido
- **WHEN** la banda tiene "heavy metal" y la usuaria agrega "Heavy Metal"
- **THEN** el sistema no lo agrega otra vez

#### Scenario: Sin conexión
- **WHEN** la usuaria abre una banda sin conexión
- **THEN** ve sus géneros, como el resto del catálogo

### Requirement: Géneros propuestos por MusicBrainz
Para una banda enlazada, el sistema SHALL obtener de MusicBrainz los géneros del artista con sus votos y proponer, como máximo, tantos como el máximo de géneros del catálogo: los más votados que tengan al menos el 20% de los votos del primero. Los géneros sin votos positivos MUST descartarse. Los pedidos MUST respetar el límite de pedidos a MusicBrainz.

#### Scenario: Banda con muchos votos
- **WHEN** el máximo es 3 y MusicBrainz da para Megadeth thrash metal (42), heavy metal (19), speed metal (10), metal (9), rock (2) y hard rock (1)
- **THEN** el sistema propone "thrash metal", "heavy metal" y "speed metal"

#### Scenario: Máximo mayor
- **WHEN** el máximo es 5 y MusicBrainz da para Megadeth los mismos votos
- **THEN** el sistema propone "thrash metal", "heavy metal", "speed metal" y "metal", porque "rock" no llega al 20% de los votos del primero

#### Scenario: Máximo menor
- **WHEN** el máximo es 1 y MusicBrainz da para Megadeth los mismos votos
- **THEN** el sistema propone solo "thrash metal"

#### Scenario: Banda con pocos votos
- **WHEN** el máximo es 3 y MusicBrainz da para La Renga hard rock (2), blues (1) y blues rock (1)
- **THEN** el sistema propone los tres

#### Scenario: Sin géneros
- **WHEN** MusicBrainz no tiene géneros para el artista
- **THEN** el sistema no propone ninguno
