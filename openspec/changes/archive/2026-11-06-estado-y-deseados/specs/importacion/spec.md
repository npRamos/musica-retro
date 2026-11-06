## MODIFIED Requirements

### Requirement: Importar lista pegada
El sistema SHALL permitir pegar un texto, o elegir un archivo `.csv`, con una línea por disco. Sin fila de encabezado, cada línea MUST tener el formato `banda; disco; formato`. Si la primera línea es un encabezado con las columnas Banda y Disco, el sistema MUST tomar las columnas por su nombre, aceptando además Formato, Copias, Año, Cargado, Spotify, Estado y Observación, e ignorar las columnas desconocidas. La columna Estado MUST tener etiquetas válidas para el formato de la línea, separadas por coma, sin distinguir mayúsculas ni tildes. El separador MUST poder ser `;` o tabulación, los campos entre comillas MUST interpretarse correctamente y las líneas vacías MUST ignorarse.

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

#### Scenario: Estado válido
- **WHEN** una línea de CD tiene "rayado, Caja Rota" en la columna Estado
- **THEN** el sistema interpreta las etiquetas "Rayado" y "Caja rota"

#### Scenario: Estado inválido
- **WHEN** una línea de CD tiene "Tapa rota" en la columna Estado
- **THEN** la vista previa la marca como inválida e indica el motivo

#### Scenario: Planilla sin esas columnas
- **WHEN** se importa una planilla exportada antes de sumar Estado y Observación
- **THEN** los discos se importan sin estado

### Requirement: Importación atómica
El sistema MUST guardar la importación completa o no guardar nada. Los discos creados MUST guardar el año, la fecha de carga, el link de Spotify, el estado y la observación de la lista cuando vienen; si no, la fecha de carga es la del momento. Al terminar SHALL informar cuántos discos y bandas se crearon y cuántas copias se sumaron.

#### Scenario: Error durante la importación
- **WHEN** ocurre un error al guardar uno de los ítems
- **THEN** no se guarda ningún ítem y el sistema muestra el error, conservando el texto pegado

#### Scenario: Importación exitosa
- **WHEN** la importación termina bien
- **THEN** el sistema muestra el resumen y el catálogo refleja los discos importados

#### Scenario: Conservar la fecha de carga
- **WHEN** se importa una planilla con "Cargado" 15/03/2025 en un disco nuevo
- **THEN** el disco queda con esa fecha y se ordena con ella en "Última compra"

#### Scenario: Conservar el estado
- **WHEN** se importa una planilla con "Rayado" en Estado y una observación en un disco nuevo
- **THEN** el disco queda con ese estado y esa observación
