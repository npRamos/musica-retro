## ADDED Requirements

### Requirement: Pestañas por formato
La pantalla principal SHALL tener dos pestañas, "Vinilos" y "CDs", cada una con la cantidad de discos de ese formato. Cada pestaña MUST mostrar solo las bandas que tienen al menos un disco en ese formato. El sistema SHALL recordar en el dispositivo la última pestaña elegida.

#### Scenario: Cambiar de pestaña
- **WHEN** la usuaria toca la pestaña "CDs"
- **THEN** el sistema muestra solo las bandas con al menos un CD

#### Scenario: Banda con un solo formato
- **WHEN** una banda tiene discos solo en vinilo
- **THEN** aparece en la pestaña "Vinilos" y no en "CDs"

#### Scenario: Recordar pestaña
- **WHEN** la usuaria cierra la app estando en "CDs" y la vuelve a abrir
- **THEN** el sistema abre en la pestaña "CDs"

### Requirement: Bandas en cuadrícula o lista
Dentro de cada pestaña, el sistema SHALL mostrar las bandas como tarjetas grandes en cuadrícula (estilo álbumes) o como lista compacta. La vista por defecto MUST ser cuadrícula y la elección SHALL recordarse en el dispositivo. Cada tarjeta MUST mostrar el nombre de la banda, la cantidad de discos en ese formato y una imagen: la de la banda si tiene, si no un mosaico con las tapas de sus discos de ese formato, y si no hay tapas, una tarjeta tipográfica con su nombre.

#### Scenario: Vista por defecto
- **WHEN** la usuaria abre la app por primera vez
- **THEN** las bandas se muestran en cuadrícula de tarjetas grandes

#### Scenario: Cambiar a lista
- **WHEN** la usuaria elige la vista lista
- **THEN** las bandas se muestran como filas compactas con miniatura, y la próxima vez la app abre en lista

#### Scenario: Contador por formato
- **WHEN** "Soda Stereo" tiene 4 CDs y 1 vinilo y la usuaria está en "CDs"
- **THEN** la tarjeta de "Soda Stereo" indica 4 discos

#### Scenario: Banda sin imagen con tapas
- **WHEN** una banda no tiene imagen propia y 3 de sus CDs tienen tapa
- **THEN** en la pestaña "CDs" su tarjeta muestra un mosaico con esas tapas

#### Scenario: Banda sin imágenes
- **WHEN** ni la banda ni sus discos de ese formato tienen imagen
- **THEN** la tarjeta muestra el nombre de la banda en grande

### Requirement: Orden elegible
El sistema SHALL permitir ordenar las bandas y los discos por nombre A→Z (por defecto), Z→A o última compra (lo más reciente primero). La elección SHALL recordarse en el dispositivo. El orden alfabético MUST ignorar mayúsculas y tildes.

#### Scenario: Orden por defecto
- **WHEN** la usuaria nunca eligió un orden
- **THEN** las bandas se muestran de la A a la Z

#### Scenario: Última compra
- **WHEN** la usuaria elige "Última compra" en la pestaña "Vinilos"
- **THEN** primero aparece la banda cuyo vinilo se cargó más recientemente

#### Scenario: Z a A
- **WHEN** la usuaria elige Z→A
- **THEN** las bandas se muestran en orden alfabético inverso

### Requirement: Pantalla de banda
Al tocar una banda, el sistema SHALL mostrar sus discos del formato de la pestaña activa, en la vista (cuadrícula o lista) y el orden elegidos, con la tapa, el título y la cantidad de copias de cada disco. El botón atrás del dispositivo MUST volver a la grilla de bandas.

#### Scenario: Entrar a una banda
- **WHEN** la usuaria toca "Soda Stereo" en la pestaña "CDs"
- **THEN** el sistema muestra solo los CDs de Soda Stereo

#### Scenario: Volver
- **WHEN** la usuaria usa el botón atrás del celular en la pantalla de banda
- **THEN** el sistema vuelve a la grilla de bandas de la misma pestaña

#### Scenario: Agregar desde la banda
- **WHEN** la usuaria toca "+" dentro de la pantalla de una banda
- **THEN** el formulario de alta se abre con la banda y el formato precargados

### Requirement: Detalle de disco
Al tocar un disco, el sistema SHALL mostrar su detalle con la tapa grande, banda, título, formato, cantidad de copias, fecha de carga y las acciones "Escuchar en Spotify", "Editar" y "Borrar".

#### Scenario: Abrir detalle
- **WHEN** la usuaria toca "Signos" en la pantalla de Soda Stereo
- **THEN** el sistema muestra el detalle de ese disco con sus datos y acciones

#### Scenario: Deslizar a la contratapa
- **WHEN** el disco tiene contratapa y la usuaria desliza la tapa hacia un costado
- **THEN** se muestra la contratapa, con un indicador de cuál de las dos se está viendo

#### Scenario: Volver desde el detalle
- **WHEN** la usuaria usa el botón atrás en el detalle
- **THEN** el sistema vuelve a la pantalla de la banda

### Requirement: Buscador
El sistema SHALL ofrecer un buscador siempre visible que filtra por título de disco o nombre de banda dentro de la pestaña activa, ignorando mayúsculas, tildes y espacios sobrantes. Con texto en el buscador, MUST mostrar directamente los discos que coinciden. Si hay coincidencias en el otro formato, MUST avisarlo con un acceso que lleve a esa pestaña con la misma búsqueda.

#### Scenario: Buscar por título
- **WHEN** la usuaria, en "CDs", escribe "senales"
- **THEN** el sistema muestra "Señales" de Callejeros, si lo tiene en CD

#### Scenario: Lo tiene en el otro formato
- **WHEN** la usuaria, en "Vinilos", busca "signos" y solo lo tiene en CD
- **THEN** el sistema indica que no lo tiene en vinilo y muestra "También lo tenés en CD (1)", que lleva a esa pestaña con la búsqueda

#### Scenario: Sin resultados en ningún formato
- **WHEN** la búsqueda no coincide con ningún disco de ninguna pestaña
- **THEN** el sistema indica "No lo tenés" y ofrece agregarlo con el texto buscado y el formato de la pestaña precargados

### Requirement: Abrir en Spotify
El detalle de disco SHALL ofrecer la acción "Escuchar en Spotify". Si el disco tiene un link guardado, MUST abrir ese link. Si no, MUST abrir la búsqueda web de Spotify con banda y título.

#### Scenario: Disco sin link guardado
- **WHEN** la usuaria elige "Escuchar en Spotify" en "Sumo – Llegando los Monos"
- **THEN** el sistema abre `https://open.spotify.com/search/` con "Sumo Llegando los Monos" codificado en la URL

#### Scenario: Disco con link guardado
- **WHEN** el disco tiene un link de Spotify guardado
- **THEN** el sistema abre ese link

### Requirement: Consulta sin conexión
El sistema SHALL guardar en el dispositivo el último catálogo obtenido (datos e imágenes de todos los discos y bandas, aunque no se hayan mirado) y mostrarlo sin conexión, indicando la fecha de esa copia. Al abrir la app MUST mostrar primero la copia local y después actualizarla desde la base. El sistema SHALL pedir al navegador almacenamiento persistente para que la copia no se borre.

#### Scenario: Abrir sin señal
- **WHEN** la usuaria abre la app sin conexión en un dispositivo donde ya la usó
- **THEN** el sistema muestra el catálogo guardado, con sus tapas, y el aviso "Sin conexión · datos del <fecha>"

#### Scenario: Tapas no vistas
- **WHEN** la usuaria sincronizó con conexión sin entrar a la banda "Sumo" y después abre esa banda sin conexión
- **THEN** las tapas de Sumo se ven igual

#### Scenario: Buscar sin señal
- **WHEN** la usuaria busca un disco sin conexión
- **THEN** la búsqueda funciona sobre la copia local, incluido el aviso de otro formato

#### Scenario: Recuperar conexión
- **WHEN** vuelve la conexión
- **THEN** el sistema actualiza el catálogo desde la base y quita el aviso

#### Scenario: Primera vez sin conexión
- **WHEN** no hay copia local y no hay conexión
- **THEN** el sistema indica que hace falta conexión para la primera carga

### Requirement: Instalable en el celular
La app SHALL poder agregarse a la pantalla de inicio del celular y abrir su interfaz sin conexión.

#### Scenario: Abrir desde el ícono sin red
- **WHEN** la usuaria abre la app desde el ícono de inicio sin conexión
- **THEN** la interfaz carga y muestra el catálogo guardado
