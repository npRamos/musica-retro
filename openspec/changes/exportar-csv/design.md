## Context

En el diseño de la etapa 1 la exportación quedó pensada pero afuera: CSV con `;` y BOM UTF-8, alcance todo/vinilos/CDs, generado en el cliente, compartido con `navigator.share` o descargado, y reimportable. La usuaria eligió **solo planilla** (sin respaldo completo con temas). El catálogo completo ya está en memoria y en la caché local, así que no hace falta pedir nada a la base.

El importador actual (`src/lib/importar.js`) exige exactamente 3 campos por línea, separados por `;` o tabulación, y combina las líneas repetidas sumando copias.

## Goals / Non-Goals

**Goals:**
- Una planilla que se abra bien con doble clic en Excel en español y en Google Sheets.
- Exportar y compartir sin conexión.
- Que la misma planilla se pueda volver a importar sin perder copias, año, fecha de carga ni Spotify.

**Non-Goals:**
- Respaldo completo (temas, enlaces a MusicBrainz, imágenes).
- Exportar a `.xlsx` o PDF.
- Importar imágenes.

## Decisions

### 1. Formato del archivo
- Separador `;`, BOM UTF-8 (`﻿`) y finales de línea `\r\n`: con eso Excel en configuración regional española separa las columnas y muestra bien las tildes al abrirlo con doble clic. Google Sheets también lo detecta.
- Columnas, en este orden:

  ```
  Banda;Disco;Formato;Copias;Año;Cargado;Spotify
  Soda Stereo;Signos;CD;1;1986;28/10/2026;
  Sumo;Llegando los Monos;Vinilo;2;1986;28/10/2026;
  ```
- `Formato`: `Vinilo` / `CD`. `Cargado`: `dd/mm/aaaa` en hora local. `Año` y `Spotify` quedan vacíos si no hay dato.
- Comillas RFC 4180: un campo que contiene `;`, `"` o un salto de línea va entre comillas, con `""` para las comillas internas.
- Orden de las filas: banda A→Z, después año y título (como la discografía en la app).
- Nombre: `musica-retro-<todo|vinilos|cds>-<aaaa-mm-dd>.csv`.
- **Alternativa descartada:** coma como separador. Excel en español usa `;` como separador de listas y abriría todo en una sola columna.

### 2. Compartir o descargar
- Se arma un `File` (`text/csv`). Si `navigator.canShare({ files: [file] })` da verdadero (Android e iOS), el botón abre la hoja de compartir. Si no (escritorio), se descarga con un `<a download>` y `URL.createObjectURL`.
- Si la usuaria cancela la hoja de compartir (`AbortError`), no se muestra ningún error.
- Funciona sin conexión porque usa el catálogo en memoria.

### 3. Importación con encabezado
- El parser revisa la primera línea no vacía: si, normalizada, tiene las columnas `banda` y `disco`, es un **encabezado**. Las columnas se mapean por nombre, con alias: `año|anio|ano`, `cargado|fecha|fecha_carga`, `spotify|spotify_url`, `copias`, `formato`. Las columnas desconocidas se ignoran.
- Sin encabezado: comportamiento actual (exactamente 3 campos posicionales, `;` o tabulación).
- Parser de campos con comillas (el mismo criterio RFC 4180 que la exportación), tolerando BOM al inicio.
- Validación por línea, con motivo: copias entero ≥ 1, año de 4 cifras entre 1900 y 2100, fecha `dd/mm/aaaa` válida, Spotify de `open.spotify.com`. Un valor inválido invalida la línea (se ve en la vista previa, como hoy).
- **Repetidas:** se combinan como hoy, sumando las copias de cada línea (1 si no hay columna). Para el resto de los datos queda la primera línea.
- **Archivo:** además del área de texto, un botón "Elegir archivo" (`accept=".csv,text/csv,text/plain"`) que lee el archivo con `File.text()` y lo pone en el área de texto, así la vista previa es la misma.
- Banda y título siguen pasando por `formatearTitulo()`. Lo exportado ya está formateado, así que no cambia.

### 4. RPC `importar_discos`
- Cada ítem acepta además `anio`, `fecha_carga` y `spotify_url`. Al crear un disco: el año va en `p_datos` de `agregar_disco`; la fecha de carga y Spotify se escriben con un `update` en la misma transacción. Si no vienen, quedan los valores por defecto (`now()`, null).
- Duplicados con "sumar como copias": solo suman copias, igual que hoy; no pisan año, fecha ni Spotify del disco existente.

## Risks / Trade-offs

- [Excel con configuración regional en inglés abre todo en una columna] → La usuaria usa español. Google Sheets lo abre bien en cualquier caso.
- [Excel puede reformatear la fecha o el año al guardar] → La importación acepta `d/m/aaaa` y `dd/mm/aaaa`. El año es un número de 4 cifras, que Excel no altera.
- [Una planilla editada a mano con columnas renombradas] → Lo desconocido se ignora; si faltan Banda o Disco, se trata como texto sin encabezado y la vista previa lo muestra como inválido.
- [`navigator.share` con archivos no disponible en algunos navegadores] → Se cae a la descarga.

## Migration Plan

1. Migration que reemplaza `importar_discos` (misma firma, ítems con campos opcionales nuevos). Requiere `discos.anio` de `datos-musicbrainz`.
2. Deploy del front. Rollback: el front viejo sigue mandando ítems sin los campos nuevos y funciona igual.

## Open Questions

- Ninguna por ahora.
