## MODIFIED Requirements

### Requirement: Sortear un disco
Al tocar "Sortear", el sistema SHALL elegir al azar, con la misma probabilidad para cada uno, un disco entre los que cumplen los filtros. Un mismo título de la misma banda que se tiene en vinilo y en CD MUST contar como un solo disco, y la cantidad de copias MUST NOT influir. El resultado SHALL mostrar la tapa con el disco asomado de su funda (el vinilo, si lo tiene en ese formato; si no, el CD), la banda, el título, el año (si lo tiene), los formatos en que se tiene y los géneros de la banda, con las acciones "Escuchar en Spotify", "Compartir", "Ver disco" y "Otro". El resultado SHALL aparecer con la animación de la batea.

#### Scenario: Resultado
- **WHEN** la usuaria toca "Sortear" y sale "Rust in Peace" de Megadeth en CD
- **THEN** ve la tapa con el CD asomado, "Megadeth", "Rust in Peace · 1990", el formato CD, los géneros de Megadeth y las cuatro acciones

#### Scenario: Mismo disco en dos formatos
- **WHEN** la usuaria tiene "Signos" en vinilo y en CD y sortea con "Todos"
- **THEN** "Signos" tiene las mismas chances que cualquier otro disco, y si sale muestra los dos formatos, con el vinilo asomado

#### Scenario: Escuchar
- **WHEN** la usuaria toca "Escuchar en Spotify" en el resultado
- **THEN** el sistema abre el disco en Spotify como desde su detalle

#### Scenario: Ver el disco
- **WHEN** la usuaria toca "Ver disco"
- **THEN** el sistema abre el detalle de ese disco (el vinilo, si lo tiene en los dos formatos), y atrás vuelve al sorteo con el mismo resultado, sin repetir la animación

## ADDED Requirements

### Requirement: Compartir el disco sorteado
La acción "Compartir" del resultado del sorteo SHALL generar una imagen vertical de 1080×1920 con la tapa, el disco asomado, la banda, el título, el año (si lo tiene) y el nombre de la app, y abrir con ella el menú de compartir del dispositivo. Si el dispositivo no permite compartir archivos, MUST descargar la imagen. La imagen MUST verse con fondo oscuro sin importar el tema elegido. La acción MUST estar deshabilitada mientras dura la animación y mientras se prepara la imagen. Cancelar el menú MUST NOT mostrar un error. La acción MUST funcionar sin conexión con las tapas guardadas.

#### Scenario: Compartir en Instagram
- **WHEN** la usuaria toca "Compartir" en el resultado "Rust in Peace" y elige Instagram en el menú del celular
- **THEN** Instagram recibe la imagen vertical del disco

#### Scenario: Sin poder compartir archivos
- **WHEN** la usuaria toca "Compartir" en un navegador que no permite compartir archivos
- **THEN** el sistema descarga la imagen

#### Scenario: Cancelar
- **WHEN** la usuaria abre el menú de compartir y lo cierra sin elegir nada
- **THEN** sigue en el resultado del sorteo, sin ningún error

#### Scenario: Disco sin tapa
- **WHEN** el disco sorteado no tiene tapa
- **THEN** la imagen muestra el ícono de su formato en lugar de la tapa

#### Scenario: Durante la animación
- **WHEN** la batea todavía está pasando tapas
- **THEN** la acción "Compartir" está deshabilitada

#### Scenario: Tema claro
- **WHEN** la usuaria usa el tema claro y comparte un disco
- **THEN** la imagen se genera con fondo oscuro
