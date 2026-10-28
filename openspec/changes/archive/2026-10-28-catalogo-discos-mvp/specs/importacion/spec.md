## ADDED Requirements

### Requirement: Importar lista pegada
El sistema SHALL permitir pegar un texto con una línea por disco con el formato `banda; disco; formato`. El separador MUST poder ser `;` o tabulación. Las líneas vacías MUST ignorarse.

#### Scenario: Pegar desde una planilla
- **WHEN** la usuaria pega tres filas copiadas de una planilla con columnas banda, disco y formato
- **THEN** el sistema interpreta tres discos

### Requirement: Formato tolerante
El sistema MUST aceptar, sin distinguir mayúsculas, `vinilo`, `vinil`, `lp` o `v` como vinilo, y `cd` o `c` como CD.

#### Scenario: Abreviaturas
- **WHEN** una línea dice `Sumo; After Chabón; LP`
- **THEN** el sistema la interpreta como vinilo

### Requirement: Vista previa antes de guardar
El sistema SHALL mostrar, antes de guardar, cada línea clasificada como: disco nuevo, disco nuevo con banda nueva, ya existe en el catálogo, repetida en la lista o inválida (con el motivo). El sistema MUST NOT guardar nada hasta que la usuaria confirme.

#### Scenario: Línea inválida
- **WHEN** una línea no tiene tres campos o tiene un formato desconocido
- **THEN** la vista previa la marca como inválida, indica el motivo y la excluye de la importación

#### Scenario: Banda nueva en la lista
- **WHEN** una línea tiene una banda que no está en el catálogo
- **THEN** la vista previa la marca como "banda nueva"

#### Scenario: Resumen
- **WHEN** se muestra la vista previa
- **THEN** el sistema muestra los totales de discos a crear, bandas nuevas, duplicados e inválidas

### Requirement: Repetidos dentro de la lista
El sistema SHALL combinar las líneas con la misma banda, título y formato (normalizados) dentro de la misma lista en un único disco, con tantas copias como líneas.

#### Scenario: Dos líneas iguales
- **WHEN** la lista contiene dos veces `Soda Stereo; Signos; CD`
- **THEN** la vista previa muestra un solo disco con 2 copias

### Requirement: Duplicados contra el catálogo
Por defecto, el sistema SHALL omitir los discos que ya existen en el catálogo, y MUST ofrecer una opción para sumarlos como copias del existente.

#### Scenario: Omitir por defecto
- **WHEN** la usuaria confirma la importación sin cambiar la opción y una línea ya existe en el catálogo
- **THEN** ese disco no se modifica

#### Scenario: Sumar como copias
- **WHEN** la usuaria activa "Sumar duplicados como copias" y confirma
- **THEN** los discos existentes incrementan sus copias en la cantidad indicada por la lista

### Requirement: Importación atómica
El sistema MUST guardar la importación completa o no guardar nada. Al terminar SHALL informar cuántos discos y bandas se crearon y cuántas copias se sumaron.

#### Scenario: Error durante la importación
- **WHEN** ocurre un error al guardar uno de los ítems
- **THEN** no se guarda ningún ítem y el sistema muestra el error, conservando el texto pegado

#### Scenario: Importación exitosa
- **WHEN** la importación termina bien
- **THEN** el sistema muestra el resumen y el catálogo refleja los discos importados
