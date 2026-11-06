## MODIFIED Requirements

### Requirement: Descargar el catálogo como planilla
El sistema SHALL permitir, desde Ajustes, descargar el catálogo como planilla CSV eligiendo el alcance: Todo, Vinilos o CDs. La planilla MUST tener una fila por disco, con las columnas Banda, Disco, Formato, Copias, Año, Cargado, Spotify, Estado y Observación, ordenadas por banda, año y título. La columna Estado MUST listar las etiquetas separadas por coma.

#### Scenario: Descargar todo
- **WHEN** la usuaria elige "Todo" y toca "Descargar planilla"
- **THEN** el sistema genera un archivo con todos los discos de los dos formatos

#### Scenario: Solo vinilos
- **WHEN** la usuaria elige "Vinilos"
- **THEN** la planilla tiene solo los discos en vinilo y el nombre del archivo incluye "vinilos"

#### Scenario: Datos vacíos
- **WHEN** un disco no tiene año, link de Spotify, estado ni observación
- **THEN** esas celdas quedan vacías

#### Scenario: Disco con estado
- **WHEN** un CD tiene "Rayado" y "Caja rota" y la observación "Salta en el tema 3"
- **THEN** su fila muestra "Rayado, Caja rota" en Estado y "Salta en el tema 3" en Observación
