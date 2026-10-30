# catalogo Specification

## Purpose
Cargar y mantener los discos y las bandas: altas con autocompletado, normalización de nombres para comparar, formato tipo título, detección de duplicados, edición, corrección y unión de bandas y borrado, con las escrituras habilitadas solo con conexión.
## Requirements
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

### Requirement: Autocompletado y creación de bandas
El sistema SHALL sugerir bandas existentes mientras la usuaria escribe. Si no elige ninguna, la banda MUST crearse al guardar el disco y desde ese momento quedar disponible para elegirla.

#### Scenario: Elegir banda existente
- **WHEN** la usuaria escribe "soda" y ya existe "Soda Stereo"
- **THEN** el sistema sugiere "Soda Stereo" y, al elegirla, el disco se asocia a esa banda

#### Scenario: Banda nueva
- **WHEN** la usuaria escribe una banda que no existe y guarda
- **THEN** el sistema crea la banda y la ofrece como sugerencia en las altas siguientes

#### Scenario: Banda escrita con otra forma
- **WHEN** existe "Soda Stereo" y la usuaria escribe "soda  stéreo " sin elegir la sugerencia
- **THEN** el sistema asocia el disco a "Soda Stereo" y no crea una banda nueva

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

### Requirement: Detección de duplicados
El sistema MUST detectar un alta de un disco que ya existe con la misma banda, el mismo título (normalizado) y el mismo formato. En ese caso MUST NOT crearlo y SHALL ofrecer sumar copias al existente.

#### Scenario: Disco regalado que ya tenía
- **WHEN** la usuaria carga "Soda Stereo – Signos – CD" y ya tiene ese disco con 1 copia
- **THEN** el sistema avisa "Ya lo tenés (1 copia)" y ofrece "Sumar copia" o "Cancelar"

#### Scenario: Sumar copia
- **WHEN** la usuaria acepta "Sumar copia" en el aviso de duplicado
- **THEN** el disco existente pasa a tener 2 copias y no se crea un ítem nuevo

#### Scenario: Mismo disco en otro formato
- **WHEN** la usuaria tiene "Signos" en CD y carga "Signos" en vinilo
- **THEN** el sistema lo guarda como un disco nuevo, sin aviso de duplicado

### Requirement: Edición de disco
El sistema SHALL permitir modificar el título, la banda, el formato, las copias (entero ≥ 1), el año (entre 1900 y 2100, opcional), la tapa, la contratapa, un link de Spotify opcional (que MUST pertenecer a `open.spotify.com`) y, dentro de una sección plegada "Más datos", la fecha de carga (que MUST NOT ser futura). El título editado MUST guardarse exactamente como se escribió. Si la edición lo convierte en un disco que ya existe, el sistema MUST NOT guardarla y SHALL ofrecer ir al disco existente.

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

#### Scenario: Fecha de carga oculta
- **WHEN** la usuaria abre la edición de un disco
- **THEN** la fecha de carga no se ve hasta que abre "Más datos"

#### Scenario: Corregir la fecha de carga
- **WHEN** la usuaria cambia la fecha de carga de un disco importado al 15/03/2019 y guarda
- **THEN** el detalle muestra "15 de marzo de 2019" y el disco se ordena con esa fecha en "Última compra"

#### Scenario: Fecha futura
- **WHEN** la usuaria elige una fecha posterior a hoy
- **THEN** el sistema no guarda e indica que la fecha no puede ser futura

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

### Requirement: Borrado de disco
El sistema SHALL permitir borrar un disco previa confirmación explícita. Al borrarlo, MUST borrarse también su tapa.

#### Scenario: Borrar con confirmación
- **WHEN** la usuaria elige borrar un disco y confirma
- **THEN** el sistema elimina el disco y su tapa, y deja de mostrarlo

#### Scenario: Cancelar borrado
- **WHEN** la usuaria elige borrar un disco y cancela la confirmación
- **THEN** el disco no se modifica

### Requirement: Escritura solo con conexión
El sistema MUST deshabilitar el alta, la edición, el borrado, la importación y la subida de imágenes cuando no hay conexión con la base de datos, e indicar el motivo.

#### Scenario: Intento de alta sin conexión
- **WHEN** el dispositivo no tiene conexión
- **THEN** el botón de agregar disco aparece deshabilitado con el aviso "Sin conexión"

