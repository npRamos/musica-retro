## ADDED Requirements

### Requirement: Descargar el catálogo como planilla
El sistema SHALL permitir, desde Ajustes, descargar el catálogo como planilla CSV eligiendo el alcance: Todo, Vinilos o CDs. La planilla MUST tener una fila por disco, con las columnas Banda, Disco, Formato, Copias, Año, Cargado y Spotify, ordenadas por banda, año y título.

#### Scenario: Descargar todo
- **WHEN** la usuaria elige "Todo" y toca "Descargar planilla"
- **THEN** el sistema genera un archivo con todos los discos de los dos formatos

#### Scenario: Solo vinilos
- **WHEN** la usuaria elige "Vinilos"
- **THEN** la planilla tiene solo los discos en vinilo y el nombre del archivo incluye "vinilos"

#### Scenario: Datos vacíos
- **WHEN** un disco no tiene año ni link de Spotify
- **THEN** esas celdas quedan vacías

### Requirement: Compatible con Excel en español
La planilla MUST usar `;` como separador, codificación UTF-8 con BOM y comillas en los campos que contengan `;`, comillas o saltos de línea, para que Excel en español y Google Sheets la abran en columnas y con las tildes correctas. La fecha de carga MUST escribirse como `dd/mm/aaaa`.

#### Scenario: Abrir en Excel
- **WHEN** la usuaria abre el archivo con doble clic en Excel en español
- **THEN** ve una columna por dato y "Canción Animal" con la tilde correcta

#### Scenario: Título con punto y coma
- **WHEN** un título contiene ";"
- **THEN** la celda aparece completa en una sola columna

### Requirement: Compartir o guardar
En el celular, el sistema SHALL abrir la hoja de compartir del sistema con el archivo (WhatsApp, mail, Drive). Donde no se puede compartir archivos, MUST descargarlo. Cancelar la hoja de compartir MUST NOT mostrar un error.

#### Scenario: Compartir por WhatsApp
- **WHEN** la usuaria toca "Descargar planilla" en el celular
- **THEN** se abre la hoja de compartir con el archivo CSV adjunto

#### Scenario: Computadora
- **WHEN** la usuaria toca "Descargar planilla" en un navegador que no comparte archivos
- **THEN** el archivo se descarga

### Requirement: Exportar sin conexión
La exportación MUST funcionar sin conexión, con los datos de la copia local del catálogo.

#### Scenario: Sin señal
- **WHEN** la usuaria exporta sin conexión
- **THEN** obtiene la planilla con los datos de la última sincronización
