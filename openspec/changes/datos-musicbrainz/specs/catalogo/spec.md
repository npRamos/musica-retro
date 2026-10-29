## MODIFIED Requirements

### Requirement: Alta de disco
El sistema SHALL permitir agregar un disco indicando banda, título y formato (`vinilo` o `cd`), con tapa, contratapa, año y lista de temas opcionales. La fecha de carga MUST registrarse automáticamente con el momento del alta y la cantidad de copias MUST valer 1 por defecto, editable antes de guardar.

#### Scenario: Alta con valores por defecto
- **WHEN** la usuaria carga banda "Sumo", título "Divididos por la felicidad", formato CD, y guarda sin tocar las copias
- **THEN** el sistema guarda el disco con 1 copia y la fecha de carga del momento

#### Scenario: Alta con varias copias
- **WHEN** la usuaria indica 2 copias antes de guardar
- **THEN** el sistema guarda el disco con 2 copias

#### Scenario: Campos obligatorios
- **WHEN** la usuaria intenta guardar sin banda, sin título o sin formato
- **THEN** el sistema no guarda e indica qué campo falta

#### Scenario: Alta con datos de MusicBrainz
- **WHEN** la usuaria guarda un disco elegido de MusicBrainz
- **THEN** el disco queda guardado con su año, su lista de temas y el enlace a la edición elegida

### Requirement: Normalización para comparar
El sistema MUST considerar iguales dos nombres de banda, o dos títulos, que solo difieren en mayúsculas, tildes, espacios sobrantes o comillas tipográficas (’ ‘ “ ” frente a ' ").

#### Scenario: Comparación normalizada
- **WHEN** se compara "Él Mató a un Policía Motorizado" con "el mato a un policia motorizado"
- **THEN** el sistema los considera el mismo nombre

#### Scenario: Comillas tipográficas
- **WHEN** se compara "Don’t Stop" (de MusicBrainz) con "Don't Stop" (escrito a mano)
- **THEN** el sistema los considera el mismo título

### Requirement: Formato tipo título al crear
Al crear una banda o un disco (alta o importación), el sistema SHALL guardar el nombre y el título en formato tipo título: mayúscula inicial en cada palabra y conectores (de, la, los, y, the, of…) en minúscula salvo al inicio. El sistema MUST respetar las palabras escritas enteras en mayúsculas, salvo que todo el texto tenga varias palabras y esté en mayúsculas. Los nombres de banda elegidos de MusicBrainz MUST guardarse tal como vienen; los títulos de disco elegidos de MusicBrainz SHALL pasar por el mismo formato tipo título.

#### Scenario: Texto en minúsculas
- **WHEN** la usuaria crea la banda "los piojos"
- **THEN** el sistema la guarda y muestra como "Los Piojos"

#### Scenario: Conectores
- **WHEN** la usuaria crea el disco "divididos por la felicidad"
- **THEN** el sistema lo guarda como "Divididos por la Felicidad"

#### Scenario: Siglas
- **WHEN** la usuaria crea la banda "AC/DC"
- **THEN** el sistema la guarda como "AC/DC"

#### Scenario: Todo en mayúsculas
- **WHEN** la usuaria crea la banda "SODA STEREO"
- **THEN** el sistema la guarda como "Soda Stereo"

#### Scenario: Banda de MusicBrainz
- **WHEN** la usuaria elige de MusicBrainz la banda "Patricio Rey y sus Redonditos de Ricota"
- **THEN** el sistema la guarda exactamente así

#### Scenario: Título de MusicBrainz
- **WHEN** la usuaria elige de MusicBrainz el disco "Canción animal"
- **THEN** el sistema lo guarda como "Canción Animal"

### Requirement: Edición de disco
El sistema SHALL permitir modificar el título, la banda, el formato, las copias (entero ≥ 1), el año (entre 1900 y 2100, opcional), la tapa, la contratapa y un link de Spotify opcional (que MUST pertenecer a `open.spotify.com`). El título editado MUST guardarse exactamente como se escribió. Si la edición lo convierte en un disco que ya existe, el sistema MUST NOT guardarla y SHALL ofrecer ir al disco existente.

#### Scenario: Corregir título
- **WHEN** la usuaria cambia el título "Sigons" por "Signos" y guarda
- **THEN** el sistema guarda "Signos" tal cual

#### Scenario: Copias inválidas
- **WHEN** la usuaria intenta guardar 0 copias
- **THEN** el sistema no guarda e indica que el mínimo es 1

#### Scenario: Link de Spotify inválido
- **WHEN** la usuaria pega un link que no es de `open.spotify.com`
- **THEN** el sistema no lo guarda e indica el error

#### Scenario: Edición que genera duplicado
- **WHEN** la usuaria cambia el formato de "Signos" de CD a vinilo y ya tiene "Signos" en vinilo
- **THEN** el sistema no guarda, avisa "Ya tenés ese disco" y ofrece ir al existente

#### Scenario: Año a mano
- **WHEN** la usuaria escribe el año 1994 en un disco que no está en MusicBrainz y guarda
- **THEN** el disco queda con año 1994 y se ordena con ese año dentro de su banda

#### Scenario: Año inválido
- **WHEN** la usuaria escribe el año 94
- **THEN** el sistema no guarda e indica que el año tiene que tener 4 cifras
