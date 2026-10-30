## ADDED Requirements

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

## MODIFIED Requirements

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
