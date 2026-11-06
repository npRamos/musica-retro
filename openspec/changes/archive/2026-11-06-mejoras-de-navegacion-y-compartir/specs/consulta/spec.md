## MODIFIED Requirements

### Requirement: Abrir en Spotify
El detalle de disco SHALL ofrecer la acción "Escuchar en Spotify". Si el disco tiene guardado un link de álbum, MUST abrir ese álbum con un link limpio, sin parámetros, sin importar quién cargó el link. Si no tiene link, o el link guardado no es de un álbum, MUST abrir la búsqueda web de Spotify con banda y título.

#### Scenario: Disco sin link guardado
- **WHEN** la usuaria elige "Escuchar en Spotify" en "Sumo – Llegando los Monos"
- **THEN** el sistema abre `https://open.spotify.com/search/` con "Sumo Llegando los Monos" codificado en la URL

#### Scenario: Disco con link guardado
- **WHEN** el disco tiene un link de álbum de Spotify guardado
- **THEN** el sistema abre ese álbum

#### Scenario: Link con parámetros
- **WHEN** el link guardado es `https://open.spotify.com/album/abc?si=123`
- **THEN** el sistema abre `https://open.spotify.com/album/abc`

#### Scenario: Link con idioma
- **WHEN** el link guardado es `https://open.spotify.com/intl-es/album/abc`
- **THEN** el sistema abre `https://open.spotify.com/album/abc`

#### Scenario: Link que no es de un álbum
- **WHEN** el link guardado es de un perfil de Spotify
- **THEN** el sistema abre la búsqueda con banda y título

### Requirement: Índice al desplazarse
Cuando la lista de la pantalla principal es larga (más de tres pantallas de alto), el sistema SHALL mostrar al desplazarse un índice pegado al costado derecho, con una manija que se arrastra y las marcas de la lista. Las marcas MUST verse redondas: las letras en círculo y los textos largos en píldora. El índice MUST empezar debajo de la barra de la lista, para no tapar el orden ni el cambio de vista. Con menos de dos marcas distintas, MUST mostrarse solo la manija. El índice MUST esconderse solo después de un momento sin desplazarse ni tocarlo. Mientras está escondido, MUST NOT capturar toques.

Las marcas dependen de cómo se ve la lista:
- **A → Z o Z → A** (por banda o todos los discos): la primera letra de la banda, sin tildes. Los nombres que empiezan con número o signo van en `#`.
- **Agrupada u ordenada por género:** una marca por cada título de género que se ve.
- **Última compra:** el mes y el año.

Cada marca MUST ubicarse a la altura proporcional a su posición en la lista. Si dos marcas quedan demasiado cerca, el sistema SHALL mostrar solo una.

Interacción:
- Arrastrar la manija MUST desplazar la lista y mostrar una burbuja con la marca donde se está.
- Tocar una marca MUST llevar la lista a su primer elemento, sin que lo tape el encabezado.

El índice MUST NOT aparecer al buscar, en la pantalla de una banda ni con listas cortas.

En Ajustes, la usuaria SHALL poder elegir si se muestra el índice (por defecto) o no. La elección MUST guardarse en el dispositivo, como el resto de las preferencias de vista.

#### Scenario: Aparece al desplazarse
- **WHEN** la usuaria tiene 120 bandas en vinilo, A → Z, y desplaza la lista
- **THEN** aparece el índice a la derecha con las letras de sus bandas, y desaparece al rato de dejar de desplazarse

#### Scenario: Arrastrar la manija
- **WHEN** la usuaria arrastra la manija hacia abajo hasta la altura de la "R"
- **THEN** la lista se desplaza a la par y la burbuja muestra "R"

#### Scenario: Tocar una letra
- **WHEN** con el índice visible la usuaria toca la "S"
- **THEN** la lista queda con la primera banda que empieza con S justo debajo del encabezado

#### Scenario: Números y tildes
- **WHEN** el catálogo tiene "2 Minutos" y "Él Mató a un Policía Motorizado"
- **THEN** "2 Minutos" está bajo "#" y "Él Mató…" bajo "E"

#### Scenario: Por género
- **WHEN** la lista está agrupada u ordenada por género
- **THEN** las marcas del índice son los títulos de género que se ven

#### Scenario: Géneros filtrados
- **WHEN** la lista por género está filtrada por "thrash metal" y "speed metal"
- **THEN** el índice solo tiene las marcas de esos títulos

#### Scenario: Última compra
- **WHEN** la lista está ordenada por última compra
- **THEN** las marcas son meses como "nov 2026", "oct 2026"

#### Scenario: Todo del mismo mes
- **WHEN** la lista larga está ordenada por última compra y todos los discos se cargaron el mismo mes
- **THEN** al desplazarse aparece la manija sola, sin marcas

#### Scenario: No tapa la barra de la lista
- **WHEN** la usuaria vuelve al principio de la lista y el índice todavía está visible
- **THEN** el cambio entre cuadrícula y lista se puede tocar sin esperar a que el índice se esconda

#### Scenario: Sin índice
- **WHEN** la usuaria eligió "No mostrar" en Ajustes y desplaza una lista larga
- **THEN** el índice no aparece

#### Scenario: Lista corta
- **WHEN** la lista entra en menos de tres pantallas
- **THEN** el índice no aparece al desplazarse

#### Scenario: Buscando
- **WHEN** la usuaria está buscando
- **THEN** el índice no aparece

## ADDED Requirements

### Requirement: Cambiar de disco deslizando
En el detalle de un disco, deslizar horizontalmente fuera de la imagen SHALL pasar al disco anterior o siguiente de la misma banda y el mismo formato, en el orden elegido para la pantalla de la banda. Deslizar sobre la imagen MUST cambiar solo entre tapa y contratapa, y MUST NOT cambiar de disco, aunque el disco no tenga contratapa. El gesto MUST NOT tener botones ni indicadores visibles. En el primer y el último disco, deslizar hacia el extremo MUST NOT hacer nada. Cambiar de disco MUST NOT agregar entradas al historial. Con una capa abierta, el gesto MUST NOT cambiar de disco. El desplazamiento vertical MUST seguir funcionando igual.

#### Scenario: Disco siguiente
- **WHEN** la usuaria está en "Signos", con "Doble Vida" después en el orden de la banda, y desliza hacia la izquierda sobre los datos del disco
- **THEN** el sistema muestra el detalle de "Doble Vida", desde la tapa y desde arriba

#### Scenario: Disco anterior
- **WHEN** la usuaria está en "Doble Vida" y desliza hacia la derecha sobre los datos del disco
- **THEN** el sistema muestra el detalle de "Signos"

#### Scenario: Sobre la imagen
- **WHEN** la usuaria desliza sobre la tapa de un disco con contratapa
- **THEN** se muestra la contratapa y sigue en el mismo disco

#### Scenario: Sobre la imagen en el extremo
- **WHEN** la usuaria está viendo la contratapa y sigue deslizando hacia el mismo lado sobre la imagen
- **THEN** sigue en el mismo disco

#### Scenario: Disco sin contratapa
- **WHEN** el disco solo tiene tapa y la usuaria desliza sobre ella
- **THEN** sigue en el mismo disco

#### Scenario: Último disco
- **WHEN** la usuaria está en el último disco de la banda en ese formato y desliza hacia la izquierda
- **THEN** sigue en el mismo disco

#### Scenario: Solo discos del mismo formato
- **WHEN** la usuaria está en un CD de una banda que también tiene vinilos
- **THEN** al deslizar solo pasa por los CDs de esa banda

#### Scenario: Atrás después de deslizar
- **WHEN** la usuaria entra a Soda Stereo, abre "Signos", desliza dos discos y usa atrás
- **THEN** el sistema vuelve a la pantalla de Soda Stereo

#### Scenario: Con el visor abierto
- **WHEN** la usuaria tiene la tapa ampliada y la desliza
- **THEN** sigue en el visor del mismo disco

#### Scenario: Scroll vertical
- **WHEN** la usuaria desplaza el detalle hacia abajo con un movimiento apenas inclinado
- **THEN** la pantalla se desplaza y sigue en el mismo disco

### Requirement: Títulos de género en la lista
Cuando la lista de la pantalla principal se ve agrupada u ordenada por género, cada título de género MUST verse más grande que el nombre de la banda, y MUST NOT usar el color de acento. Ordenada por género sin agrupar, la lista MUST mostrar un título por cada tramo y cada banda o disco MUST aparecer una sola vez, bajo su género principal o, con un filtro activo, bajo el primero de sus géneros que esté elegido. Los elementos sin géneros MUST ir bajo "Sin género", al final. Al buscar, MUST NOT mostrarse títulos de género.

#### Scenario: Agrupada por género
- **WHEN** la usuaria elige "Por género"
- **THEN** cada título de género se ve más grande que los nombres de las bandas

#### Scenario: Ordenada por género
- **WHEN** la usuaria elige el orden "Género" con la vista "Por banda" y Megadeth tiene "thrash metal" y "heavy metal"
- **THEN** ve títulos de género, con Megadeth una sola vez, bajo "thrash metal"

#### Scenario: Ordenada por género con filtro
- **WHEN** la lista ordenada por género está filtrada por "heavy metal" y Megadeth tiene "thrash metal" y "heavy metal"
- **THEN** Megadeth aparece bajo "heavy metal"

### Requirement: Filtrar la lista por género
Cuando la lista de la pantalla principal se ve agrupada u ordenada por género, el sistema SHALL mostrar al principio de la lista una fila de chips en píldora, que se desplaza horizontalmente, con los géneros del formato activo y, si corresponde, "Sin género" al final. Cada chip MUST mostrar cuántas bandas tiene o, en "Todos los discos", cuántos discos. Tocar un chip MUST activarlo o desactivarlo. Sin chips activos, MUST verse toda la lista; con chips activos, MUST verse solo lo que tenga alguno de esos géneros. La barra de la lista MUST contar lo que queda visible. La selección SHALL recordarse en el dispositivo y aplicarse a las dos pestañas; un género que no existe en la pestaña activa MUST ignorarse sin perder la selección. Al buscar, la fila MUST NOT aparecer y el filtro MUST NOT aplicarse.

#### Scenario: Ver un solo género
- **WHEN** la usuaria toca "thrash metal" en la fila de chips
- **THEN** ve solo las bandas con ese género, y la barra cuenta esas bandas

#### Scenario: Varios géneros
- **WHEN** la usuaria activa "thrash metal" y "speed metal"
- **THEN** ve las bandas que tienen alguno de los dos

#### Scenario: Banda con varios géneros
- **WHEN** la lista agrupada está filtrada por "thrash metal" y Megadeth también tiene "heavy metal"
- **THEN** Megadeth aparece solo en la sección "thrash metal"

#### Scenario: Solo sin género
- **WHEN** la usuaria activa "Sin género"
- **THEN** ve solo las bandas sin géneros

#### Scenario: Quitar el filtro
- **WHEN** la usuaria desactiva el último chip activo
- **THEN** vuelve a ver toda la lista

#### Scenario: Recordar la selección
- **WHEN** la usuaria eligió "thrash metal" y vuelve a abrir la app
- **THEN** la lista por género sigue filtrada por "thrash metal"

#### Scenario: Género de la otra pestaña
- **WHEN** "new wave" está elegido y la usuaria pasa a una pestaña donde ninguna banda lo tiene
- **THEN** ese género no aparece ni filtra, y sigue elegido al volver a la pestaña anterior

#### Scenario: Otra vista
- **WHEN** la lista se ve por banda con orden A → Z
- **THEN** no aparece la fila de chips y se ve toda la lista

#### Scenario: Buscando con filtro
- **WHEN** la lista está filtrada por "thrash metal" y la usuaria busca "signos"
- **THEN** ve todos los resultados de la búsqueda, sin la fila de chips
