# sorteo Specification

## Purpose
Sortear un disco de la colección para decidir qué escuchar, filtrando por formato y género, con la animación de hojear una batea y sacar el disco de su funda, y volver a sortear sin repetir; funciona sin conexión.
## Requirements
### Requirement: Acceso al sorteo
El encabezado de la pantalla principal SHALL ofrecer la acción "Sortear un disco", que abre la pantalla de sorteo. El sorteo MUST funcionar sin conexión con el catálogo guardado en el dispositivo.

#### Scenario: Abrir el sorteo
- **WHEN** la usuaria toca "Sortear un disco" en la pantalla principal
- **THEN** el sistema muestra la pantalla de sorteo con los últimos filtros usados

#### Scenario: Sin conexión
- **WHEN** la usuaria sortea un disco sin conexión
- **THEN** el sorteo funciona y muestra la tapa guardada del disco

### Requirement: Filtros del sorteo
La pantalla de sorteo SHALL permitir elegir el formato (Todos, Vinilos o CDs; Todos por defecto) y ninguno, uno o varios géneros. Los géneros ofrecidos MUST ser los de las bandas con discos en el formato elegido, cada uno con la cantidad de discos, ordenados de mayor a menor cantidad. Con varios géneros elegidos, MUST entrar todo disco cuya banda tenga alguno de ellos; sin géneros elegidos, MUST entrar todo disco del formato. El sistema MUST mostrar cuántos discos entran y SHALL recordar los filtros en el dispositivo. Si hay géneros elegidos y quedan discos afuera porque su banda no tiene géneros, el sistema SHALL avisarlo con un acceso a "Completar géneros".

#### Scenario: Solo vinilos
- **WHEN** la usuaria elige "Vinilos"
- **THEN** solo entran al sorteo los vinilos, y los géneros ofrecidos son los de las bandas con vinilos

#### Scenario: Varios géneros
- **WHEN** la usuaria elige "thrash metal" y "speed metal"
- **THEN** entran los discos de las bandas que tienen cualquiera de los dos

#### Scenario: Recordar filtros
- **WHEN** la usuaria eligió "CDs" y "thrash metal" y vuelve a abrir el sorteo otro día
- **THEN** el sorteo abre con "CDs" y "thrash metal"

#### Scenario: Discos sin género
- **WHEN** hay un género elegido y 12 discos son de bandas sin géneros
- **THEN** el sistema avisa que 12 discos sin género no entran y ofrece ir a "Completar géneros"

#### Scenario: Ningún disco
- **WHEN** ningún disco cumple los filtros
- **THEN** el sistema indica "No hay discos con esos filtros" y no permite sortear

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

### Requirement: Volver a sortear sin repetir
"Otro" SHALL sortear otro disco entre los que todavía no salieron con los filtros actuales. Cuando ya salieron todos, el sistema MUST indicarlo y ofrecer "Empezar de nuevo". Cambiar un filtro MUST empezar de cero. Los discos que ya salieron MUST conservarse al ir al detalle del disco y volver.

#### Scenario: Otro
- **WHEN** salió "Rust in Peace" y la usuaria toca "Otro"
- **THEN** sale otro disco distinto de "Rust in Peace"

#### Scenario: Se agotaron
- **WHEN** con 3 discos en el sorteo ya salieron los 3 y la usuaria toca "Otro"
- **THEN** el sistema indica que ya salieron los 3 y ofrece "Empezar de nuevo"

#### Scenario: Cambiar el filtro
- **WHEN** ya salieron varios discos y la usuaria cambia el formato
- **THEN** el sorteo empieza de cero con el nuevo filtro

#### Scenario: Volver del detalle
- **WHEN** la usuaria abre el disco sorteado, vuelve y toca "Otro"
- **THEN** no sale ninguno de los discos que ya habían salido

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

