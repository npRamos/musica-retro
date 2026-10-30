## MODIFIED Requirements

### Requirement: Sortear un disco
Al tocar "Sortear", el sistema SHALL elegir al azar, con la misma probabilidad para cada uno, un disco entre los que cumplen los filtros. Un mismo título de la misma banda que se tiene en vinilo y en CD MUST contar como un solo disco, y la cantidad de copias MUST NOT influir. El resultado SHALL mostrar la tapa con el disco asomado de su funda (el vinilo, si lo tiene en ese formato; si no, el CD), la banda, el título, el año (si lo tiene), los formatos en que se tiene y los géneros de la banda, con las acciones "Escuchar en Spotify", "Ver disco" y "Otro". El resultado SHALL aparecer con la animación de la batea.

#### Scenario: Resultado
- **WHEN** la usuaria toca "Sortear" y sale "Rust in Peace" de Megadeth en CD
- **THEN** ve la tapa con el CD asomado, "Megadeth", "Rust in Peace · 1990", el formato CD, los géneros de Megadeth y las tres acciones

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

### Requirement: Animación de la batea
Al sortear, el sistema SHALL mostrar una batea de discos cuyas tapas caen hacia adelante una tras otra, cada vez más despacio, hasta dejar al frente el disco sorteado. Después, el disco sorteado MUST salir de la batea, el disco MUST asomar de la funda (el vinilo girando, o el CD) y recién entonces SHALL aparecer los datos y las acciones, que MUST estar deshabilitadas mientras dura la animación. La animación MUST durar entre 3 y 4 segundos y terminar siempre en el disco sorteado. Cada funda MUST distinguirse del fondo en los dos temas, aunque su tapa sea negra o no tenga tapa. Si el dispositivo pide reducir el movimiento, el sistema MUST mostrar el resultado sin animación y con el disco quieto.

#### Scenario: Hojear la batea
- **WHEN** la usuaria toca "Sortear" con 34 discos en el sorteo
- **THEN** pasan varias tapas cada vez más despacio, la última es la del disco sorteado, el vinilo asoma girando y aparecen los datos

#### Scenario: Tapas negras en tema oscuro
- **WHEN** pasan tapas casi negras en el tema oscuro
- **THEN** cada funda se distingue por su borde y por los bordes de los discos de atrás

#### Scenario: Un solo disco
- **WHEN** en el sorteo entra un solo disco
- **THEN** el sistema muestra directamente el final, con el disco saliendo de la funda

#### Scenario: Disco sin tapa
- **WHEN** el disco sorteado no tiene tapa
- **THEN** la funda muestra el ícono de su formato y el disco asoma igual

#### Scenario: Movimiento reducido
- **WHEN** el dispositivo tiene activado reducir el movimiento
- **THEN** el resultado aparece enseguida, con el disco asomado y quieto

### Requirement: Sonido del sorteo
Durante la animación, el sistema SHALL hacer un sonido corto por cada tapa que cae y un golpe suave cuando el disco sale de la funda. La pantalla de sorteo MUST ofrecer silenciarlo y volver a activarlo, y la elección SHALL recordarse en el dispositivo. Por defecto el sonido MUST estar activado. Si el navegador no puede reproducir sonido, la animación MUST seguir igual. Con movimiento reducido, MUST NOT sonar.

#### Scenario: Silenciar
- **WHEN** la usuaria toca el botón de silencio y sortea
- **THEN** la animación no suena, y la próxima vez que abre el sorteo sigue silenciado

#### Scenario: Sin sonido disponible
- **WHEN** el navegador no permite reproducir sonido
- **THEN** la animación se ve completa, sin errores

### Requirement: Saltar la animación
Mientras dura la animación, tocar la batea MUST terminarla y mostrar enseguida el resultado, con el disco asomado de su funda. La pantalla SHALL indicar que se puede tocar para saltar.

#### Scenario: Saltar
- **WHEN** la usuaria toca la batea mientras pasan las tapas
- **THEN** el sistema muestra enseguida el disco sorteado con sus datos y acciones habilitadas
