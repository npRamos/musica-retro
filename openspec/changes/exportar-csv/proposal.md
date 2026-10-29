## Why

El catálogo solo se puede ver dentro de la app. Hace falta poder sacar una planilla para mirarla en Excel o Google Sheets, compartirla (por ejemplo, para que alguien sepa qué discos ya tenés antes de regalar uno) y, si hiciera falta, volver a cargarla en la app.

## What Changes

- **Descargar planilla** desde Ajustes: Todo, Vinilos o CDs. Archivo CSV con `;` y BOM UTF-8 para que Excel en español lo abra bien, con las columnas `Banda;Disco;Formato;Copias;Año;Cargado;Spotify`.
- Se arma en el celular (funciona sin conexión) y se **comparte** con la hoja de compartir del sistema (WhatsApp, mail, Drive) o se descarga.
- **La importación acepta esa planilla:** reconoce la fila de encabezado y toma copias, año, fecha de carga y link de Spotify por nombre de columna. Se puede pegar el texto o elegir el archivo `.csv`.
- Sin encabezado, la importación sigue igual que hoy (`banda; disco; formato`).
- Solo planilla: no hay respaldo completo (temas e imágenes no se exportan).

## Capabilities

### New Capabilities
- `exportacion`: descarga y envío del catálogo como planilla CSV, con alcance Todo, Vinilos o CDs.

### Modified Capabilities
- `importacion`: acepta un archivo o texto con encabezado y columnas adicionales (copias, año, fecha de carga, Spotify), con campos entre comillas.

## Impact

- **Código:** nuevo `src/lib/exportar.js` (con tests), sección en `Ajustes`, cambios en `src/lib/importar.js` y `Importar.jsx`.
- **Base:** `importar_discos` recibe por ítem `anio`, `fecha_carga` y `spotify_url` además de `copias`.
- **Depende de `datos-musicbrainz`** para la columna Año (`discos.anio`). Conviene implementarlo después de ese change; si se hace antes, la columna Año queda para cuando exista.
- Sin dependencias npm nuevas.
