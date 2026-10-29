## Why

El catálogo solo se puede ver dentro de la app. Hace falta poder sacar una planilla para mirarla en Excel o Google Sheets y, si hiciera falta, volver a cargarla en la app. También, mandar la lista por WhatsApp como texto (por ejemplo, para que alguien sepa qué discos ya tenés antes de regalar uno), completa o de una sola banda.

## What Changes

- **Descargar planilla** desde Ajustes: Todo, Vinilos o CDs. Archivo CSV con `;` y BOM UTF-8 para que Excel en español lo abra bien, con las columnas `Banda;Disco;Formato;Copias;Año;Cargado;Spotify`.
- Se arma en el celular (funciona sin conexión) y se **comparte** con la hoja de compartir del sistema (WhatsApp, mail, Drive) o se descarga.
- **La importación acepta esa planilla:** reconoce la fila de encabezado y toma copias, año, fecha de carga y link de Spotify por nombre de columna. Se puede pegar el texto o elegir el archivo `.csv`.
- Sin encabezado, la importación sigue igual que hoy (`banda; disco; formato`).
- **Copiar o compartir por WhatsApp como texto:** el catálogo completo (Todo, Vinilos o CDs) desde Ajustes, o los discos de una banda desde su pantalla. Lista legible, agrupada por banda, con año y copias.
- Solo planilla y texto: no hay respaldo completo (temas e imágenes no se exportan).

## Capabilities

### New Capabilities
- `exportacion`: descarga del catálogo como planilla CSV y envío como texto (copiar o WhatsApp), del catálogo completo o de una banda.

### Modified Capabilities
- `importacion`: acepta un archivo o texto con encabezado y columnas adicionales (copias, año, fecha de carga, Spotify), con campos entre comillas.

## Impact

- **Código:** nuevo `src/lib/exportar.js` (CSV y texto, con tests), sección "Compartir el catálogo" en `Ajustes`, acción en la pantalla de banda, cambios en `src/lib/importar.js` y `Importar.jsx`.
- **Base:** `importar_discos` recibe por ítem `anio`, `fecha_carga` y `spotify_url` además de `copias`.
- Usa `discos.anio` de `datos-musicbrainz` (ya archivado).
- Sin dependencias npm nuevas.
