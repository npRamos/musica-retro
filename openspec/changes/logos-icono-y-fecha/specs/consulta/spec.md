## ADDED Requirements

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

## MODIFIED Requirements

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
