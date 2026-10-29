## MODIFIED Requirements

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
