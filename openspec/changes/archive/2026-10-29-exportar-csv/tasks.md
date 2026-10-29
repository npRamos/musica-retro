## 1. Exportación (con tests)

- [x] 1.1 `src/lib/exportar.js`: filas por alcance (todo, vinilo, cd), ordenadas por banda, año y título
- [x] 1.2 Serializar CSV: `;`, BOM, `\r\n`, comillas RFC 4180, fecha `dd/mm/aaaa`, formato `Vinilo`/`CD`, celdas vacías para datos que faltan
- [x] 1.3 Nombre de archivo `musica-retro-<alcance>-<aaaa-mm-dd>.csv`
- [x] 1.4 Tests: comillas y `;` en títulos, tildes, alcance, orden y celdas vacías

## 2. Pantalla de Ajustes

- [x] 2.1 Sección "Descargar" con selector Todo / Vinilos / CDs y botón "Descargar planilla"
- [x] 2.2 Compartir con `navigator.share({ files })` si `canShare` lo permite; si no, descarga con `<a download>`; ignorar `AbortError`
- [x] 2.3 Verificar que funciona sin conexión

## 3. Texto para copiar o compartir (con tests)

- [x] 3.1 `textoCatalogo(discos, bandasPorId, { alcance, titulo })` en `exportar.js`: bandas en `*negrita*`, `• Título (año) · formato ×n`, orden por banda, año y título
- [x] 3.2 Enlace `wa.me/?text=` y límite de largo (60.000 caracteres)
- [x] 3.3 Tests: alcance, formato solo con Todo, copias, discos sin año, banda sola

## 4. Pantallas de compartir

- [x] 4.1 Ajustes: sección "Compartir el catálogo" con alcance, "Descargar planilla", "Copiar" y "WhatsApp"
- [x] 4.2 Pantalla de banda: botón "Compartir esta banda" al final con una hoja Copiar / WhatsApp
- [x] 4.3 Aviso "Copiado" y manejo de error del portapapeles

## 5. Importación (con tests)

- [x] 5.1 Parser de campos con comillas (`;` o tabulación) que tolera BOM
- [x] 5.2 Detección de encabezado (Banda + Disco) y mapeo por nombre con alias; sin encabezado, el comportamiento actual de 3 campos
- [x] 5.3 Validar copias, año, fecha `d/m/aaaa` y Spotify, con motivo por línea
- [x] 5.4 Combinar repetidas sumando copias, conservando año, fecha y Spotify de la primera
- [x] 5.5 Tests: reimportar la salida de `exportar.js` da los mismos datos (ida y vuelta), columnas en otro orden, comillas, datos inválidos

## 6. Base de datos

- [x] 6.1 Migration: `importar_discos` acepta por ítem `anio`, `fecha_carga` y `spotify_url`; los escribe solo en discos creados; "sumar como copias" no los pisa
- [x] 6.2 Aplicar y probar por SQL con y sin los campos nuevos

## 7. Pantalla de importación

- [x] 7.1 Botón "Elegir archivo" (`.csv`) que carga el contenido en el área de texto
- [x] 7.2 La vista previa muestra copias, año y fecha cuando vienen en la lista
- [x] 7.3 Actualizar el texto de ayuda: formato simple o planilla exportada

## 8. Verificación

- [x] 8.1 `npm test` y `npm run build` sin errores
- [x] 8.2 Exportar desde el celular, abrir en Excel en español y en Google Sheets, y compartir el archivo por WhatsApp
- [x] 8.3 Reimportar el archivo exportado en un catálogo de prueba y comparar copias, año, fechas y Spotify
- [x] 8.4 Copiar el catálogo y mandarlo por WhatsApp (completo y de una banda) y ver cómo se lee en el chat
