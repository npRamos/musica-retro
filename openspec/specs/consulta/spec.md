# consulta Specification

## Purpose
Recorrer y buscar la colección desde el celular: pestañas de vinilos y CDs, bandas en cuadrícula o lista, orden elegible, pantallas de banda y de disco, buscador, enlace a Spotify, consulta sin conexión e instalación en la pantalla de inicio.
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
El sistema SHALL permitir ordenar las bandas y los resultados de búsqueda por nombre A→Z (por defecto), Z→A, última compra (lo más reciente primero) o género. El orden por género MUST ordenar por el primer género de cada banda y después por nombre, con las bandas sin géneros al final; los discos sueltos y los resultados de búsqueda MUST ordenarse por el primer género de su banda y, dentro de cada género, como en A→Z. Dentro de la pantalla de una banda, el sistema SHALL ofrecer además el orden "Por año", que MUST ser el orden por defecto en esa pantalla, y MUST NOT ofrecer el orden por género. Cada elección (grilla de bandas y pantalla de banda) SHALL recordarse en el dispositivo por separado. El orden alfabético MUST ignorar mayúsculas y tildes.

#### Scenario: Orden por defecto
- **WHEN** la usuaria nunca eligió un orden
- **THEN** las bandas se muestran de la A a la Z

#### Scenario: Última compra
- **WHEN** la usuaria elige "Última compra" en la pestaña "Vinilos"
- **THEN** primero aparece la banda cuyo vinilo se cargó más recientemente

#### Scenario: Z a A
- **WHEN** la usuaria elige Z→A
- **THEN** las bandas se muestran en orden alfabético inverso

#### Scenario: Por género
- **WHEN** la usuaria elige "Género" y tiene La Renga (hard rock), Megadeth (thrash metal), Anthrax (thrash metal) y Sumo (sin géneros)
- **THEN** las bandas aparecen en el orden La Renga, Anthrax, Megadeth, Sumo

#### Scenario: Órdenes independientes
- **WHEN** la usuaria elige A→Z dentro de la pantalla de una banda
- **THEN** la grilla de bandas conserva su propio orden, y las demás bandas se abren con A→Z

### Requirement: Pantalla de banda
Al tocar una banda, el sistema SHALL mostrar sus géneros (si tiene) bajo el encabezado y sus discos del formato de la pestaña activa, en la vista (cuadrícula o lista) elegida y ordenados por año (del más antiguo al más nuevo) salvo que la usuaria elija otro orden, con la tapa, el título, el año y la cantidad de copias de cada disco. Los discos sin año MUST ir al final, ordenados por título. El botón atrás del dispositivo MUST volver a la grilla de bandas.

#### Scenario: Entrar a una banda
- **WHEN** la usuaria toca "Soda Stereo" en la pestaña "CDs"
- **THEN** el sistema muestra solo los CDs de Soda Stereo

#### Scenario: Géneros de la banda
- **WHEN** la usuaria entra a "Megadeth", que tiene "thrash metal", "heavy metal" y "speed metal"
- **THEN** ve esos tres géneros bajo el encabezado

#### Scenario: Banda sin géneros
- **WHEN** la banda no tiene géneros
- **THEN** la pantalla no muestra la fila de géneros

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
En cada pestaña de formato, el sistema SHALL permitir elegir entre mostrar las bandas (agrupado, por defecto), las bandas en secciones por género o todos los discos de ese formato sin agrupar, cada uno con el nombre de su banda. La elección SHALL recordarse en el dispositivo y aplicarse a las dos pestañas. Por género, las secciones MUST ir en orden alfabético, cada una con su nombre y la cantidad de bandas, con una sección "Sin género" al final para las bandas sin géneros; una banda con varios géneros MUST aparecer en la sección de cada uno, y dentro de cada sección las bandas MUST seguir el orden elegido. Sin agrupar, el orden A→Z MUST ordenar por banda y, dentro de cada banda, por año (los discos sin año al final) y título.

#### Scenario: Por defecto agrupado
- **WHEN** la usuaria nunca eligió cómo mostrar
- **THEN** cada pestaña muestra las bandas

#### Scenario: Todos los discos
- **WHEN** la usuaria elige "Todos los discos" en la pestaña "CDs"
- **THEN** ve un disco por tarjeta (por ejemplo, "Holy Diver" de Dio y "The Last in Line" de Dio por separado), con el nombre de la banda en cada uno

#### Scenario: Discografía dentro del A→Z
- **WHEN** la vista es "Todos los discos" con orden A→Z y tiene en CD "The Last in Line" (1984) y "Holy Diver" (1983) de Dio
- **THEN** aparece primero "Holy Diver" y después "The Last in Line"

#### Scenario: Por género
- **WHEN** la usuaria elige "Por género" en "Vinilos" y Megadeth tiene "thrash metal" y "heavy metal"
- **THEN** ve las secciones de género en orden alfabético, con Megadeth en "heavy metal" y en "thrash metal", y al final "Sin género"

#### Scenario: Recordar la elección
- **WHEN** la usuaria eligió "Todos los discos" y vuelve a abrir la app
- **THEN** las pestañas muestran todos los discos

### Requirement: Capas sobre la pantalla
El visor de imágenes, los diálogos de confirmación y las hojas de opciones SHALL abrirse como capas sobre la pantalla actual, con el fondo oscurecido, y MUST NOT agregar entradas al historial de navegación. Cada capa MUST cerrarse con su botón de cerrar o cancelar, tocando fuera de su contenido y con la tecla Escape. En Android con Chrome (en el navegador o con la app instalada), el botón atrás del celular MUST cerrar la capa abierta y dejar a la usuaria en la misma pantalla. En ningún navegador, el botón atrás con una capa abierta MUST sacar a la usuaria de la app. Una capa que no se puede cerrar todavía (por ejemplo, mientras se borra un disco) SHALL ignorar Escape, tocar fuera y el primer atrás.

#### Scenario: Atrás cierra el visor
- **WHEN** la usuaria abre la tapa de un disco en Chrome para Android y usa el botón atrás
- **THEN** se cierra la imagen y sigue en el detalle del disco

#### Scenario: Atrás otra vez después de cerrar
- **WHEN** la usuaria cerró el visor con atrás y vuelve a usar atrás
- **THEN** el sistema vuelve a la pantalla de la banda, sin pasos intermedios

#### Scenario: Atrás cierra la confirmación de borrado
- **WHEN** la usuaria tiene abierto "¿Borrar este disco?" en Chrome para Android y usa el botón atrás
- **THEN** se cierra el diálogo sin borrar nada y sigue en el detalle del disco

#### Scenario: Atrás cierra una hoja de opciones
- **WHEN** la usuaria tiene abierta la hoja de orden en la pantalla principal y usa el botón atrás
- **THEN** se cierra la hoja y la pantalla principal queda igual

#### Scenario: Tocar fuera
- **WHEN** la usuaria toca el fondo oscurecido fuera del contenido de una capa
- **THEN** la capa se cierra

#### Scenario: Escape en escritorio
- **WHEN** la usuaria aprieta Escape con una capa abierta en la computadora
- **THEN** la capa se cierra y la pantalla de atrás no cambia

#### Scenario: Navegador sin soporte
- **WHEN** la usuaria usa atrás con una capa abierta en un navegador que no cierra capas con atrás (por ejemplo, Firefox para Android)
- **THEN** el sistema vuelve a la pantalla anterior de la app, sin salir de ella

### Requirement: Navegación jerárquica
Las pantallas SHALL seguir una jerarquía: inicio → banda → detalle de disco → edición del disco → Completar; inicio → banda → edición de la banda; inicio → sorteo; inicio → Ajustes → sus pantallas. Las acciones que llevan a una pantalla de más arriba (guardar, completar, borrar, unir bandas, tocar el nombre de la banda en el detalle) MUST volver a la entrada de esa pantalla si ya está en el historial, y MUST NOT agregar una entrada nueva. Ninguna acción SHALL dejar en el historial una pantalla repetida ni una pantalla de algo que ya no existe. Los saltos laterales (abrir un disco desde el buscador, "Ir al existente", abrir un disco desde la edición de una banda, abrir el disco sorteado, ir a "Completar géneros" desde el sorteo) SHALL agregar una entrada, y atrás MUST volver a la pantalla desde donde se saltó. La flecha ← del encabezado MUST llevar al mismo lugar que el botón atrás del celular.

#### Scenario: Guardar la edición de un disco
- **WHEN** la usuaria entra a Soda Stereo, abre "Signos", toca "Editar" y guarda
- **THEN** el sistema vuelve al detalle de "Signos", y un solo atrás la lleva a la pantalla de Soda Stereo

#### Scenario: Atrás desde la edición de un disco
- **WHEN** la usuaria usa atrás en la edición de "Signos" sin guardar
- **THEN** el sistema vuelve al detalle de "Signos"

#### Scenario: Completar desde la edición
- **WHEN** la usuaria, desde la edición de "Signos", abre "Completar" y confirma el candidato
- **THEN** el sistema vuelve al detalle de "Signos" y atrás la lleva a la pantalla de Soda Stereo, sin pasar por el formulario de edición

#### Scenario: Guardar la edición de una banda
- **WHEN** la usuaria abre Soda Stereo, toca "Editar banda" y guarda
- **THEN** el sistema vuelve a la pantalla de Soda Stereo, y un solo atrás la lleva a la grilla de bandas

#### Scenario: Unir bandas
- **WHEN** la usuaria renombra "Soda Estereo" a "Soda Stereo" desde su edición y confirma la unión
- **THEN** el sistema muestra la pantalla de Soda Stereo, y atrás la lleva a la grilla de bandas sin pasar por "Soda Estereo"

#### Scenario: Nombre de la banda en el detalle
- **WHEN** la usuaria entra a Soda Stereo, abre "Signos" y toca el nombre de la banda
- **THEN** el sistema vuelve a la pantalla de Soda Stereo, y atrás la lleva a la grilla de bandas, no al detalle

#### Scenario: Borrar un disco
- **WHEN** la usuaria borra "Signos" y Soda Stereo tiene otros CDs
- **THEN** el sistema vuelve a la pantalla de Soda Stereo, y atrás la lleva a la grilla de bandas

#### Scenario: Borrar el último disco de la banda
- **WHEN** la usuaria borra el único CD de Soda Stereo
- **THEN** el sistema vuelve a la grilla de CDs, y la pantalla vacía de Soda Stereo no queda en el historial

#### Scenario: Disco desde el buscador
- **WHEN** la usuaria busca "signos" en el inicio, abre el disco y usa atrás
- **THEN** el sistema vuelve al inicio con la búsqueda y los resultados como estaban

#### Scenario: Disco sorteado
- **WHEN** la usuaria sortea "Rust in Peace", toca "Ver disco" y usa atrás
- **THEN** el sistema vuelve al sorteo con "Rust in Peace" como resultado, y otro atrás la lleva al inicio

#### Scenario: Flecha y atrás coinciden
- **WHEN** la usuaria toca la flecha ← del encabezado en cualquier pantalla de la app que tenga otra pantalla de la app detrás
- **THEN** el sistema lleva al mismo lugar que el botón atrás del celular

#### Scenario: Entrada directa a una pantalla
- **WHEN** la app se abre directamente en el detalle de "Signos" y la usuaria toca la flecha ←
- **THEN** el sistema muestra la pantalla de Soda Stereo

### Requirement: Barra de la lista
El encabezado de la pantalla principal SHALL tener solo las acciones de la app: sortear un disco y Ajustes. El encabezado de la pantalla de banda SHALL tener solo las acciones de la banda (editar). En las dos pantallas, los controles de la lista MUST estar en una barra al principio de la lista, que se desplaza con ella. La barra muestra la cantidad que se ve (bandas, discos o resultados de búsqueda) junto con el orden actual, que al tocarlo abre las opciones de orden (y, en la principal, de agrupación), y el cambio entre cuadrícula y lista.

#### Scenario: Leer el orden sin abrir nada
- **WHEN** la usuaria está en "CDs" con 18 bandas ordenadas A→Z
- **THEN** la barra muestra "18 bandas · A → Z"

#### Scenario: Cambiar el orden desde la barra
- **WHEN** la usuaria toca el orden en la barra
- **THEN** se abre la hoja con las opciones de mostrar y ordenar, como antes

#### Scenario: Buscando
- **WHEN** la usuaria busca "signos" y hay 2 coincidencias en la pestaña
- **THEN** la barra muestra "2 resultados" con el orden actual

#### Scenario: Pantalla de banda
- **WHEN** la usuaria entra a Soda Stereo en "CDs"
- **THEN** el encabezado muestra el nombre, "CDs" y "Editar banda", y la barra muestra "4 discos · Por año" y el cambio de vista

#### Scenario: Pantalla angosta
- **WHEN** la app se abre en una pantalla de 360px
- **THEN** el título "Música Retro" se lee completo junto a las acciones de sortear y Ajustes

