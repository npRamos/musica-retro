## ADDED Requirements

### Requirement: Índice al desplazarse
Cuando la lista de la pantalla principal es larga (más de tres pantallas de alto), el sistema SHALL mostrar al desplazarse un índice pegado al costado derecho, con una manija que se arrastra y las marcas de la lista. Las marcas MUST verse redondas: las letras en círculo y los textos largos en píldora. El índice MUST empezar debajo de la barra de la lista, para no tapar el orden ni el cambio de vista. Con menos de dos marcas distintas, MUST mostrarse solo la manija. El índice MUST esconderse solo después de un momento sin desplazarse ni tocarlo. Mientras está escondido, MUST NOT capturar toques.

Las marcas dependen de cómo se ve la lista:
- **A → Z o Z → A** (por banda o todos los discos): la primera letra de la banda, sin tildes. Los nombres que empiezan con número o signo van en `#`.
- **Agrupada por género:** una marca por sección.
- **Ordenada por género sin agrupar:** el género principal de la banda, o "Sin género".
- **Última compra:** el mes y el año.

Cada marca MUST ubicarse a la altura proporcional a su posición en la lista. Si dos marcas quedan demasiado cerca, el sistema SHALL mostrar solo una.

Interacción:
- Arrastrar la manija MUST desplazar la lista y mostrar una burbuja con la marca donde se está.
- Tocar una marca MUST llevar la lista a su primer elemento, sin que lo tape el encabezado.

El índice MUST NOT aparecer al buscar, en la pantalla de una banda ni con listas cortas.

En Ajustes, la usuaria SHALL poder elegir cómo se ve el índice: con letras (manija y marcas, por defecto), solo la manija (con la burbuja al arrastrar) o no mostrarlo. La elección MUST guardarse en el dispositivo, como el resto de las preferencias de vista.

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
- **WHEN** la lista está agrupada por género
- **THEN** las marcas del índice son los géneros de las secciones

#### Scenario: Última compra
- **WHEN** la lista está ordenada por última compra
- **THEN** las marcas son meses como "nov 2026", "oct 2026"

#### Scenario: Todo del mismo mes
- **WHEN** la lista larga está ordenada por última compra y todos los discos se cargaron el mismo mes
- **THEN** al desplazarse aparece la manija sola, sin marcas

#### Scenario: No tapa la barra de la lista
- **WHEN** la usuaria vuelve al principio de la lista y el índice todavía está visible
- **THEN** el cambio entre cuadrícula y lista se puede tocar sin esperar a que el índice se esconda

#### Scenario: Solo la manija
- **WHEN** la usuaria eligió "Solo manija" en Ajustes y desplaza una lista larga
- **THEN** aparece la manija sin las marcas, y al arrastrarla la burbuja muestra dónde está

#### Scenario: Sin índice
- **WHEN** la usuaria eligió "No" en Ajustes y desplaza una lista larga
- **THEN** el índice no aparece

#### Scenario: Lista corta
- **WHEN** la lista entra en menos de tres pantallas
- **THEN** el índice no aparece al desplazarse

#### Scenario: Buscando
- **WHEN** la usuaria está buscando
- **THEN** el índice no aparece
