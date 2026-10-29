# importacion Specification

## Purpose
TBD - created by archiving change catalogo-discos-mvp. Update Purpose after archive.
## Requirements
### Requirement: Importar lista pegada
El sistema SHALL permitir pegar un texto, o elegir un archivo `.csv`, con una línea por disco. Sin fila de encabezado, cada línea MUST tener el formato `banda; disco; formato`. Si la primera línea es un encabezado con las columnas Banda y Disco, el sistema MUST tomar las columnas por su nombre, aceptando además Formato, Copias, Año, Cargado y Spotify, e ignorar las columnas desconocidas. El separador MUST poder ser `;` o tabulación, los campos entre comillas MUST interpretarse correctamente y las líneas vacías MUST ignorarse.

#### Scenario: Pegar desde una planilla
- **WHEN** la usuaria pega tres filas copiadas de una planilla con columnas banda, disco y formato
- **THEN** el sistema interpreta tres discos

#### Scenario: Reimportar una planilla exportada
- **WHEN** la usuaria elige un archivo exportado por la app con la fila "Sumo;Llegando los Monos;Vinilo;2;1986;28/10/2026;"
- **THEN** la vista previa muestra ese disco con 2 copias, año 1986 y fecha de carga 28/10/2026

#### Scenario: Columnas en otro orden
- **WHEN** el encabezado es "Disco;Banda;Formato"
- **THEN** el sistema toma cada dato de su columna por nombre

#### Scenario: Campo entre comillas
- **WHEN** una línea tiene el título `"Uno; Dos"` entre comillas
- **THEN** el sistema interpreta el título "Uno; Dos" y no un campo de más

#### Scenario: Dato inválido en una columna
- **WHEN** una línea tiene copias "0" o un año "86"
- **THEN** la vista previa la marca como inválida e indica el motivo

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
El sistema SHALL combinar las líneas con la misma banda, título y formato (normalizados) dentro de la misma lista en un único disco, sumando las copias de cada línea (1 por línea si no hay columna Copias).

#### Scenario: Dos líneas iguales
- **WHEN** la lista contiene dos veces `Soda Stereo; Signos; CD`
- **THEN** la vista previa muestra un solo disco con 2 copias

#### Scenario: Líneas repetidas con copias
- **WHEN** una planilla con encabezado tiene dos filas de "Signos" en CD, con 2 y 1 copias
- **THEN** la vista previa muestra un solo disco con 3 copias

### Requirement: Duplicados contra el catálogo
Por defecto, el sistema SHALL omitir los discos que ya existen en el catálogo, y MUST ofrecer una opción para sumarlos como copias del existente.

#### Scenario: Omitir por defecto
- **WHEN** la usuaria confirma la importación sin cambiar la opción y una línea ya existe en el catálogo
- **THEN** ese disco no se modifica

#### Scenario: Sumar como copias
- **WHEN** la usuaria activa "Sumar duplicados como copias" y confirma
- **THEN** los discos existentes incrementan sus copias en la cantidad indicada por la lista

### Requirement: Importación atómica
El sistema MUST guardar la importación completa o no guardar nada. Los discos creados MUST guardar el año, la fecha de carga y el link de Spotify de la lista cuando vienen; si no, la fecha de carga es la del momento. Al terminar SHALL informar cuántos discos y bandas se crearon y cuántas copias se sumaron.

#### Scenario: Error durante la importación
- **WHEN** ocurre un error al guardar uno de los ítems
- **THEN** no se guarda ningún ítem y el sistema muestra el error, conservando el texto pegado

#### Scenario: Importación exitosa
- **WHEN** la importación termina bien
- **THEN** el sistema muestra el resumen y el catálogo refleja los discos importados

#### Scenario: Conservar la fecha de carga
- **WHEN** se importa una planilla con "Cargado" 15/03/2025 en un disco nuevo
- **THEN** el disco queda con esa fecha y se ordena con ella en "Última compra"

