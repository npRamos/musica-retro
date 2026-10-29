# consulta Specification

## Purpose
TBD - created by archiving change catalogo-discos-mvp. Update Purpose after archive.
## Requirements
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
Dentro de cada pestaña, el sistema SHALL mostrar las bandas como tarjetas grandes en cuadrícula (estilo álbumes) o como lista compacta. La vista por defecto MUST ser cuadrícula y la elección SHALL recordarse en el dispositivo. Cada tarjeta MUST mostrar el nombre de la banda, la cantidad de discos en ese formato y una imagen: la de la banda si tiene; si no, y la banda tiene logo, el logo sobre el mosaico oscurecido de sus tapas de ese formato (o sobre un fondo de color si no hay tapas); si no tiene logo, el mosaico con las tapas, y si no hay tapas, una tarjeta tipográfica con su nombre. El logo MUST mostrarse sobre un fondo oscuro, con sus colores originales, salvo los logos oscuros con fondo transparente, que MUST mostrarse invertidos para que se lean.

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
- **WHEN** una banda no tiene imagen propia ni logo y 3 de sus CDs tienen tapa
- **THEN** en la pestaña "CDs" su tarjeta muestra un mosaico con esas tapas

#### Scenario: Banda sin imágenes
- **WHEN** ni la banda ni sus discos de ese formato tienen imagen, y la banda no tiene logo
- **THEN** la tarjeta muestra el nombre de la banda en grande

#### Scenario: Banda con logo
- **WHEN** "Iron Maiden" tiene logo y no tiene imagen propia
- **THEN** su tarjeta muestra el logo con sus colores sobre el mosaico oscurecido de sus tapas, y el nombre debajo

#### Scenario: Logo oscuro
- **WHEN** el logo de "Metallica" es un trazo negro sobre fondo transparente
- **THEN** la tarjeta lo muestra invertido (blanco) sobre el fondo oscuro

#### Scenario: Tema claro
- **WHEN** la usuaria usa el tema claro
- **THEN** las tarjetas con logo mantienen el fondo oscuro y el logo se lee igual

### Requirement: Orden elegible
El sistema SHALL permitir ordenar las bandas y los resultados de búsqueda por nombre A→Z (por defecto), Z→A o última compra (lo más reciente primero). Dentro de la pantalla de una banda, el sistema SHALL ofrecer además el orden "Por año", que MUST ser el orden por defecto en esa pantalla. Cada elección (grilla de bandas y pantalla de banda) SHALL recordarse en el dispositivo por separado. El orden alfabético MUST ignorar mayúsculas y tildes.

#### Scenario: Orden por defecto
- **WHEN** la usuaria nunca eligió un orden
- **THEN** las bandas se muestran de la A a la Z

#### Scenario: Última compra
- **WHEN** la usuaria elige "Última compra" en la pestaña "Vinilos"
- **THEN** primero aparece la banda cuyo vinilo se cargó más recientemente

#### Scenario: Z a A
- **WHEN** la usuaria elige Z→A
- **THEN** las bandas se muestran en orden alfabético inverso

#### Scenario: Órdenes independientes
- **WHEN** la usuaria elige A→Z dentro de la pantalla de una banda
- **THEN** la grilla de bandas conserva su propio orden, y las demás bandas se abren con A→Z

### Requirement: Pantalla de banda
Al tocar una banda, el sistema SHALL mostrar sus discos del formato de la pestaña activa, en la vista (cuadrícula o lista) elegida y ordenados por año (del más antiguo al más nuevo) salvo que la usuaria elija otro orden, con la tapa, el título, el año y la cantidad de copias de cada disco. Los discos sin año MUST ir al final, ordenados por título. El botón atrás del dispositivo MUST volver a la grilla de bandas.

#### Scenario: Entrar a una banda
- **WHEN** la usuaria toca "Soda Stereo" en la pestaña "CDs"
- **THEN** el sistema muestra solo los CDs de Soda Stereo

#### Scenario: Discografía por año
- **WHEN** la usuaria tiene en CD "Doble Vida" (1988), "Signos" (1986) y "Dynamo" (1992) y entra a Soda Stereo
- **THEN** los discos aparecen en el orden Signos, Doble Vida, Dynamo

#### Scenario: Discos sin año
- **WHEN** la banda tiene un disco sin año
- **THEN** ese disco aparece después de los que tienen año

#### Scenario: Volver
- **WHEN** la usuaria usa el botón atrás del celular en la pantalla de banda
- **THEN** el sistema vuelve a la grilla de bandas de la misma pestaña

#### Scenario: Agregar desde la banda
- **WHEN** la usuaria toca "+" dentro de la pantalla de una banda
- **THEN** el formulario de alta se abre con la banda y el formato precargados

### Requirement: Detalle de disco
Al tocar un disco, el sistema SHALL mostrar su detalle con la tapa grande, banda, título, año (si lo tiene), formato, cantidad de copias, fecha de carga, la lista de temas (si la tiene) y las acciones "Escuchar en Spotify", "Editar" y "Borrar". La lista de temas MUST mostrar el número y la duración de cada tema, y separar los medios cuando hay más de uno.

#### Scenario: Abrir detalle
- **WHEN** la usuaria toca "Signos" en la pantalla de Soda Stereo
- **THEN** el sistema muestra el detalle de ese disco con sus datos y acciones

#### Scenario: Deslizar a la contratapa
- **WHEN** el disco tiene contratapa y la usuaria desliza la tapa hacia un costado
- **THEN** se muestra la contratapa, con un indicador de cuál de las dos se está viendo

#### Scenario: Volver desde el detalle
- **WHEN** la usuaria usa el botón atrás en el detalle
- **THEN** el sistema vuelve a la pantalla de la banda

#### Scenario: Lista de temas
- **WHEN** la usuaria abre el detalle de "Signos" completado desde MusicBrainz
- **THEN** ve los 8 temas con su número y duración, empezando por "1 Sin sobresaltos 4:24"

#### Scenario: Disco doble
- **WHEN** el disco tiene dos medios
- **THEN** los temas se muestran separados bajo "Disco 1" y "Disco 2"

#### Scenario: Sin temas
- **WHEN** el disco no tiene lista de temas
- **THEN** el detalle no muestra esa sección

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

### Requirement: Agrupar por banda o ver todos los discos
En cada pestaña de formato, el sistema SHALL permitir elegir entre mostrar las bandas (agrupado, por defecto) o todos los discos de ese formato sin agrupar, cada uno con el nombre de su banda. La elección SHALL recordarse en el dispositivo y aplicarse a las dos pestañas. Sin agrupar, el orden A→Z MUST ordenar por banda y, dentro de cada banda, por año (los discos sin año al final) y título.

#### Scenario: Por defecto agrupado
- **WHEN** la usuaria nunca eligió cómo mostrar
- **THEN** cada pestaña muestra las bandas

#### Scenario: Todos los discos
- **WHEN** la usuaria elige "Todos los discos" en la pestaña "CDs"
- **THEN** ve un disco por tarjeta (por ejemplo, "Holy Diver" de Dio y "The Last in Line" de Dio por separado), con el nombre de la banda en cada uno

#### Scenario: Discografía dentro del A→Z
- **WHEN** la vista es "Todos los discos" con orden A→Z y tiene en CD "The Last in Line" (1984) y "Holy Diver" (1983) de Dio
- **THEN** aparece primero "Holy Diver" y después "The Last in Line"

#### Scenario: Recordar la elección
- **WHEN** la usuaria eligió "Todos los discos" y vuelve a abrir la app
- **THEN** las pestañas muestran todos los discos

