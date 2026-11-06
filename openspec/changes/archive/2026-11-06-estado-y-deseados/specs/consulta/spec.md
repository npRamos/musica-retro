## ADDED Requirements

### Requirement: Estado en el detalle
Si un disco tiene etiquetas de estado u observación, su detalle SHALL ofrecer una sección "Más datos", plegada por defecto, que las muestra al abrirla. Sin etiquetas ni observación, el detalle MUST NOT mostrar esa sección. Las tarjetas y filas de las listas de la colección MUST NOT mostrar el estado.

#### Scenario: Disco con estado
- **WHEN** la usuaria abre un CD con "Rayado" y la observación "Salta en el tema 3"
- **THEN** el detalle muestra "Más datos" plegado, sin la etiqueta ni la observación a la vista

#### Scenario: Abrir el estado
- **WHEN** la usuaria abre "Más datos" en ese CD
- **THEN** ve "Rayado" y "Salta en el tema 3"

#### Scenario: Disco sin estado
- **WHEN** la usuaria abre un disco sin etiquetas ni observación
- **THEN** el detalle no muestra la sección "Más datos"

#### Scenario: Tarjetas
- **WHEN** la usuaria ve la lista de discos de una banda
- **THEN** las tarjetas no muestran el estado

### Requirement: Discos con estado
Ajustes SHALL ofrecer la entrada "Discos con estado", con la cantidad, deshabilitada si no hay ninguno, que abre una pantalla con los discos de los dos formatos que tienen etiquetas u observación, ordenados por banda, año y título. Cada fila MUST mostrar el disco, la banda, el formato y sus etiquetas, y tocarla MUST abrir el detalle. La pantalla SHALL permitir filtrar con chips en píldora, con selección múltiple, por las etiquetas que estén en uso y por "Con observación"; sin chips activos, MUST mostrar todos. La pantalla MUST funcionar sin conexión.

#### Scenario: Ver los que tienen problemas
- **WHEN** la usuaria abre "Discos con estado" y tres discos tienen algún estado
- **THEN** ve esos tres discos con sus etiquetas

#### Scenario: Filtrar por etiqueta
- **WHEN** la usuaria activa "Necesita funda" y "Tapa rota"
- **THEN** ve solo los discos con alguna de esas dos etiquetas

#### Scenario: Solo con observación
- **WHEN** un disco no tiene etiquetas y tiene una observación
- **THEN** aparece en la lista, y también al activar "Con observación"

#### Scenario: Abrir un disco
- **WHEN** la usuaria toca un disco de la lista y usa atrás
- **THEN** ve el detalle del disco y, después, vuelve a la lista con el mismo filtro

#### Scenario: Ninguno con estado
- **WHEN** ningún disco tiene estado
- **THEN** la entrada de Ajustes aparece deshabilitada

#### Scenario: Sin conexión
- **WHEN** la usuaria abre la pantalla sin conexión
- **THEN** ve los discos con estado de la copia guardada
