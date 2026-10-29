# exportacion Specification

## Purpose
TBD - created by archiving change exportar-csv. Update Purpose after archive.
## Requirements
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

### Requirement: Compartir el catálogo como texto
El sistema SHALL permitir copiar o enviar por WhatsApp el catálogo como texto legible: desde Ajustes, con el alcance Todo, Vinilos o CDs; y desde la pantalla de una banda, solo los discos de esa banda en los dos formatos. El texto MUST agrupar los discos por banda (nombre en negrita con la sintaxis de WhatsApp), con un disco por línea con su año y sus copias cuando son más de una, y el formato de cada disco cuando el alcance incluye los dos. "WhatsApp" MUST abrir el enlace de compartir de WhatsApp con el texto. Si el texto es demasiado largo para un mensaje, el sistema MUST deshabilitar WhatsApp y sugerir copiar o descargar la planilla.

#### Scenario: Copiar los CDs
- **WHEN** la usuaria elige "CDs" y toca "Copiar"
- **THEN** el portapapeles tiene la lista de CDs agrupada por banda y el sistema avisa "Copiado"

#### Scenario: Una banda por WhatsApp
- **WHEN** en la pantalla de Black Sabbath la usuaria toca "Compartir esta banda" y después "WhatsApp"
- **THEN** se abre WhatsApp para elegir el chat, con el mensaje "*Black Sabbath*" y sus discos, por ejemplo "• Sabotage (1975) · CD ×2"

#### Scenario: Todo el catálogo
- **WHEN** el alcance es "Todo"
- **THEN** cada disco indica si es vinilo o CD

#### Scenario: Sin conexión
- **WHEN** la usuaria copia el catálogo sin señal
- **THEN** el texto se copia con los datos de la última sincronización

