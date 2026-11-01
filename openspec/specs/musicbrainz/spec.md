# musicbrainz Specification

## Purpose
Sugerir y completar datos de bandas, discos, temas, año y tapas desde MusicBrainz al dar de alta o editar discos, y listar los discos importados con datos pendientes de revisar.
## Requirements
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

### Requirement: Discos agrupados de la banda
Elegida una banda de MusicBrainz, el sistema SHALL listar sus discos agrupados en Estudio, EP, En vivo y Compilados, en ese orden, con todos los grupos visibles y cada grupo ordenado por año. El texto escrito en el campo del disco MUST filtrar la lista. El sistema MUST mostrar siempre la opción de usar el título escrito.

#### Scenario: Lista agrupada
- **WHEN** la usuaria elige "Soda Stereo" de MusicBrainz y toca el campo del disco
- **THEN** el sistema muestra primero los discos de estudio desde "Soda Stereo (1984)" y después los grupos En vivo y Compilados

#### Scenario: Filtrar
- **WHEN** la usuaria escribe "sig" en el campo del disco
- **THEN** la lista muestra solo los discos cuyo título contiene "sig"

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

### Requirement: Precarga de datos del disco
Con una edición elegida, el sistema SHALL precargar la lista de temas, el año del disco, la tapa y la contratapa (si existen en Cover Art Archive). Todo lo precargado MUST poder revisarse y las imágenes MUST poder reemplazarse antes de guardar. Al guardar, el sistema MUST guardar los temas, el año y el enlace a MusicBrainz junto con el disco.

#### Scenario: Guardar con datos
- **WHEN** la usuaria guarda "Soda Stereo – Signos – CD" con la edición precargada
- **THEN** el disco queda guardado con año 1986, sus 8 temas, tapa y contratapa

#### Scenario: Reemplazar la tapa precargada
- **WHEN** la usuaria saca una foto en el lugar de la tapa precargada y guarda
- **THEN** el disco se guarda con su foto y con los temas y el año de MusicBrainz

### Requirement: Carga libre cuando no hay datos
El sistema MUST permitir guardar un disco aunque la banda o el disco no estén en MusicBrainz, aunque falten imágenes o aunque MusicBrainz no responda. En esos casos el formulario SHALL funcionar como en la carga manual.

#### Scenario: Banda inexistente
- **WHEN** la usuaria escribe una banda que MusicBrainz no conoce y elige "Usar tal cual"
- **THEN** el sistema permite escribir el título y guardar el disco sin temas ni imágenes precargadas

#### Scenario: MusicBrainz no responde
- **WHEN** MusicBrainz devuelve un error o no responde a tiempo
- **THEN** el sistema muestra un aviso discreto y el formulario sigue funcionando para la carga manual

#### Scenario: Sin contratapa
- **WHEN** la edición elegida tiene tapa pero no contratapa
- **THEN** el lugar de la contratapa queda vacío para sacar una foto

### Requirement: Límite de pedidos
El sistema MUST hacer como máximo un pedido por segundo a MusicBrainz, cancelar los pedidos que ya no sirven (por ejemplo, al seguir escribiendo) y reintentar una vez ante una respuesta de servidor ocupado. Las sugerencias SHALL pedirse recién después de 2 caracteres y una pausa al escribir.

#### Scenario: Escritura rápida
- **WHEN** la usuaria escribe "los piojos" de corrido
- **THEN** el sistema hace un solo pedido de búsqueda, después de la pausa

#### Scenario: Servidor ocupado
- **WHEN** MusicBrainz responde que está ocupado
- **THEN** el sistema reintenta una vez y, si vuelve a fallar, muestra el aviso de que no responde

### Requirement: Sin conexión
Sin conexión, el sistema MUST NOT mostrar sugerencias ni datos de MusicBrainz. Los temas y el año ya guardados MUST verse sin conexión, como el resto del catálogo.

#### Scenario: Temas sin señal
- **WHEN** la usuaria abre el detalle de un disco completado estando sin conexión
- **THEN** ve la lista de temas y el año

### Requirement: Completar un disco existente
Desde la edición de un disco, el sistema SHALL ofrecer "Completar desde MusicBrainz", con la banda, el título y el formato del disco ya cargados. Antes de guardar MUST mostrar qué se va a sumar. Al completar, el sistema MUST NOT cambiar la banda ni el título del disco, y MUST NOT reemplazar imágenes propias salvo que la usuaria lo elija.

#### Scenario: Completar un disco importado
- **WHEN** la usuaria completa "Sumo – Llegando los Monos – vinilo", que no tiene imágenes, y confirma
- **THEN** el disco suma año, temas, tapa y contratapa (si existen), y mantiene su título

#### Scenario: Disco con foto propia
- **WHEN** el disco ya tiene una tapa sacada por la usuaria y completa desde MusicBrainz sin elegir reemplazarla
- **THEN** la tapa propia se conserva

### Requirement: Completar pendientes
El sistema SHALL ofrecer un modo "Completar pendientes", accesible desde Ajustes con la cantidad de discos pendientes, que recorre de a uno los discos sin datos de MusicBrainz. Para cada uno MUST proponer un candidato (tapa, año, edición y cantidad de temas) con las acciones "Sí", "Otro", "No es" y "Saltar". Un disco marcado "No es" MUST NOT volver a aparecer en los pendientes. El modo SHALL poder dejarse en cualquier momento y retomarse donde quedó.

#### Scenario: Confirmar el candidato
- **WHEN** el candidato de "Soda Stereo – Signos – CD" es correcto y la usuaria toca "Sí"
- **THEN** el disco se completa y aparece el siguiente pendiente

#### Scenario: Elegir otro
- **WHEN** la usuaria toca "Otro"
- **THEN** el sistema muestra los discos y las ediciones de esa banda para elegir

#### Scenario: No es
- **WHEN** la usuaria toca "No es"
- **THEN** el disco sale de los pendientes y queda marcado como sin coincidencia

#### Scenario: Sin candidato
- **WHEN** el sistema no encuentra el disco en MusicBrainz
- **THEN** muestra "No lo encontramos" con las opciones de buscar a mano o marcarlo sin datos

#### Scenario: Retomar
- **WHEN** la usuaria completó 20 discos, cierra la app y vuelve a entrar al modo
- **THEN** el modo sigue con los discos que quedan pendientes

