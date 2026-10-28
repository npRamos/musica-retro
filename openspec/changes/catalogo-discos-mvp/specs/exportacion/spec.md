## ADDED Requirements

### Requirement: Exportar el catálogo a CSV
El sistema SHALL permitir exportar el catálogo a un archivo CSV eligiendo el alcance: todo, solo vinilos o solo CDs. El archivo MUST tener una fila de encabezado y las columnas `banda;disco;formato;copias;fecha_carga;spotify_url`, una fila por disco, ordenadas por formato, banda y título (A→Z).

#### Scenario: Exportar todo
- **WHEN** la usuaria elige "Exportar CSV" con el alcance "Todo"
- **THEN** el sistema genera un CSV con todos los discos de las dos pestañas y la columna de formato completa

#### Scenario: Exportar solo vinilos
- **WHEN** la usuaria elige el alcance "Solo vinilos"
- **THEN** el CSV contiene únicamente los vinilos

#### Scenario: Nombre del archivo
- **WHEN** se exporta el 28/10/2026 con alcance "Solo CDs"
- **THEN** el archivo se llama `musica-retro-cds-2026-10-28.csv`

### Requirement: Compatible con planillas
El CSV MUST usar `;` como separador, codificación UTF-8 con BOM (para que Excel muestre bien tildes y eñes) y fechas en formato `AAAA-MM-DD`. Los campos que contengan `;`, comillas o saltos de línea MUST ir entre comillas dobles, con las comillas internas duplicadas.

#### Scenario: Título con punto y coma
- **WHEN** un disco se llama `Uno; Dos`
- **THEN** el campo se escribe como `"Uno; Dos"` y la planilla lo muestra en una sola celda

#### Scenario: Abrir en Excel
- **WHEN** se abre el archivo en Excel o Google Sheets configurado en español
- **THEN** cada campo queda en su columna y "Señales" se lee correctamente

### Requirement: Exportar sin conexión y compartir
La exportación SHALL funcionar sin conexión, usando la copia local del catálogo. En los dispositivos que permitan compartir archivos, el sistema SHALL ofrecer compartir el CSV (por ejemplo, por WhatsApp o Drive). En los demás, MUST descargarlo.

#### Scenario: Exportar sin señal
- **WHEN** la usuaria exporta sin conexión
- **THEN** el CSV se genera con los datos guardados en el dispositivo

#### Scenario: Compartir desde el celular
- **WHEN** el navegador del celular permite compartir archivos
- **THEN** se abre el menú de compartir del sistema con el CSV adjunto

#### Scenario: Descargar en la compu
- **WHEN** el navegador no permite compartir archivos
- **THEN** el CSV se descarga
