# sorteo Specification

## Purpose
Sortear un disco de la colección para decidir qué escuchar, filtrando por formato y género, y volver a sortear sin repetir; funciona sin conexión.
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
Al tocar "Sortear", el sistema SHALL elegir al azar, con la misma probabilidad para cada uno, un disco entre los que cumplen los filtros. Un mismo título de la misma banda que se tiene en vinilo y en CD MUST contar como un solo disco, y la cantidad de copias MUST NOT influir. El resultado SHALL mostrar la tapa, la banda, el título, el año (si lo tiene), los formatos en que se tiene y los géneros de la banda, con las acciones "Escuchar en Spotify", "Ver disco" y "Otro". La aparición del resultado SHALL tener una transición breve, que MUST omitirse si el dispositivo pide reducir el movimiento.

#### Scenario: Resultado
- **WHEN** la usuaria toca "Sortear" y sale "Rust in Peace" de Megadeth en CD
- **THEN** ve la tapa, "Megadeth", "Rust in Peace · 1990", el formato CD, los géneros de Megadeth y las tres acciones

#### Scenario: Mismo disco en dos formatos
- **WHEN** la usuaria tiene "Signos" en vinilo y en CD y sortea con "Todos"
- **THEN** "Signos" tiene las mismas chances que cualquier otro disco, y si sale muestra los dos formatos

#### Scenario: Escuchar
- **WHEN** la usuaria toca "Escuchar en Spotify" en el resultado
- **THEN** el sistema abre el disco en Spotify como desde su detalle

#### Scenario: Ver el disco
- **WHEN** la usuaria toca "Ver disco"
- **THEN** el sistema abre el detalle de ese disco (el vinilo, si lo tiene en los dos formatos), y atrás vuelve al sorteo con el mismo resultado

#### Scenario: Movimiento reducido
- **WHEN** el dispositivo tiene activado reducir el movimiento
- **THEN** el resultado aparece sin transición

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

