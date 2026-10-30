## ADDED Requirements

### Requirement: Géneros de una banda
Cada banda SHALL poder tener entre 0 y 3 géneros. Los géneros MUST guardarse con el nombre tal como vienen de MusicBrainz (en inglés) o como se escribieron, sin espacios sobrantes. El sistema MUST considerar iguales dos géneros que solo difieren en mayúsculas, tildes o espacios. Al agregar un género que ya existe en el catálogo escrito de otra forma, el sistema MUST usar la forma existente. Una banda MUST NOT tener dos veces el mismo género.

#### Scenario: Máximo de tres
- **WHEN** la banda ya tiene 3 géneros
- **THEN** el sistema no permite agregar un cuarto e indica "Máximo 3"

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
Para una banda enlazada, el sistema SHALL obtener de MusicBrainz los géneros del artista con sus votos y proponer como máximo 3: los más votados que tengan al menos el 20% de los votos del primero. Los géneros sin votos positivos MUST descartarse. Los pedidos MUST respetar el límite de pedidos a MusicBrainz.

#### Scenario: Banda con muchos votos
- **WHEN** MusicBrainz da para Megadeth thrash metal (42), heavy metal (19), speed metal (10), metal (9), rock (2) y hard rock (1)
- **THEN** el sistema propone "thrash metal", "heavy metal" y "speed metal"

#### Scenario: Banda con pocos votos
- **WHEN** MusicBrainz da para La Renga hard rock (2), blues (1) y blues rock (1)
- **THEN** el sistema propone los tres

#### Scenario: Sin géneros
- **WHEN** MusicBrainz no tiene géneros para el artista
- **THEN** el sistema no propone ninguno

### Requirement: Géneros automáticos al enlazar
Cuando una banda queda enlazada a MusicBrainz al dar de alta un disco, completar un disco o completar pendientes, y sus géneros todavía no fueron revisados, el sistema SHALL traer los géneros propuestos y guardarlos sin preguntar, dándolos por revisados. Si MusicBrainz no tiene géneros o no responde, la banda MUST quedar sin revisar y el alta o el completado MUST NOT bloquearse ni mostrar error. El sistema MUST NOT reemplazar géneros ya revisados o editados.

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

### Requirement: Completar géneros
El sistema SHALL ofrecer un modo "Completar géneros", accesible desde Ajustes con la cantidad de bandas sin géneros revisados, que las recorre de a una en orden alfabético. Para una banda no enlazada, MUST proponer primero un artista de MusicBrainz (con país y desambiguación) con las acciones "Sí", "Otra", "No está" y "Saltar"; "Sí" MUST enlazar la banda a ese artista. Después MUST mostrar los géneros de MusicBrainz (los propuestos ya marcados y el resto activables), permitir agregar géneros a mano y ofrecer "Guardar" y "Saltar". Al guardar, la banda MUST quedar con los géneros marcados y darse por revisada, aunque no tenga ninguno. Una banda salteada MUST seguir pendiente. El modo SHALL poder dejarse en cualquier momento y retomarse con las bandas que quedan, y MUST requerir conexión.

#### Scenario: Banda enlazada
- **WHEN** la siguiente banda pendiente es "Megadeth", que está enlazada
- **THEN** el sistema muestra directamente sus géneros, con "thrash metal", "heavy metal" y "speed metal" marcados y "metal" para activar

#### Scenario: Banda sin enlazar
- **WHEN** la siguiente banda pendiente es "La Renga", que no está enlazada
- **THEN** el sistema pregunta "¿Es esta?" con "La Renga · Argentina" y, al tocar "Sí", la enlaza y muestra sus géneros

#### Scenario: Elegir otro artista
- **WHEN** la usuaria toca "Otra"
- **THEN** el sistema muestra los artistas encontrados con su país y desambiguación, y un campo para buscar con otro nombre

#### Scenario: La banda no está en MusicBrainz
- **WHEN** la usuaria toca "No está"
- **THEN** el sistema pasa a los géneros sin propuestas, para cargarlos a mano, y la banda queda sin enlazar

#### Scenario: Corregir los propuestos
- **WHEN** en "La Renga" la usuaria desmarca "blues" y "blues rock", agrega "rock nacional" y toca "Guardar"
- **THEN** la banda queda con "hard rock" y "rock nacional", sale de los pendientes y aparece la banda siguiente

#### Scenario: Guardar sin géneros
- **WHEN** la usuaria desmarca todos los géneros y toca "Guardar"
- **THEN** la banda queda sin géneros y sale de los pendientes

#### Scenario: Saltar
- **WHEN** la usuaria toca "Saltar"
- **THEN** aparece la banda siguiente y la salteada vuelve a estar en los pendientes la próxima vez

#### Scenario: Saltar después de enlazar
- **WHEN** la usuaria toca "Sí" en el artista de "La Renga" y después "Saltar" en sus géneros
- **THEN** la banda queda enlazada, sin géneros guardados, y sigue en los pendientes

#### Scenario: Retomar
- **WHEN** la usuaria revisó 20 bandas, sale del modo y vuelve a entrar
- **THEN** el modo sigue con las bandas que quedan pendientes

#### Scenario: Enlazar habilita el logo
- **WHEN** la usuaria enlaza una banda que no tiene logo
- **THEN** el sistema busca su logo como al enlazar una banda en el alta

### Requirement: Editar géneros de una banda
La edición de una banda SHALL mostrar sus géneros como chips que se pueden quitar, y un campo para agregar géneros con sugerencias: primero los géneros del catálogo que coinciden con lo escrito, con la cantidad de bandas que los usan, y siempre la opción de agregar el texto escrito. Si la banda está enlazada, MUST ofrecer "Traer de MusicBrainz", que muestra sus géneros como sugerencias activables, sin reemplazar los actuales. Al guardar con géneros cambiados, la banda MUST darse por revisada.

#### Scenario: Sugerencias del catálogo
- **WHEN** la usuaria escribe "thr" en el campo de géneros y el catálogo tiene 6 bandas con "thrash metal"
- **THEN** el sistema sugiere primero "thrash metal (6)"

#### Scenario: Género nuevo
- **WHEN** la usuaria escribe "rock nacional", que nadie usa, y elige "Agregar «rock nacional»"
- **THEN** el género se suma a la banda

#### Scenario: Traer de MusicBrainz
- **WHEN** la banda tiene "rock nacional" y la usuaria toca "Traer de MusicBrainz"
- **THEN** ve los géneros de MusicBrainz para activar, y "rock nacional" sigue marcado

#### Scenario: Quitar un género
- **WHEN** la usuaria toca la ✕ de "blues" y guarda
- **THEN** la banda deja de tener "blues"
