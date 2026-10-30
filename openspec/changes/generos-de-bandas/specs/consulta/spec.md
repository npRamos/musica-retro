## MODIFIED Requirements

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
