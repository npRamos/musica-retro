## 1. Exportación (con tests)

- [ ] 1.1 `src/lib/exportar.js`: filas por alcance (todo, vinilo, cd), ordenadas por banda, año y título
- [ ] 1.2 Serializar CSV: `;`, BOM, `\r\n`, comillas RFC 4180, fecha `dd/mm/aaaa`, formato `Vinilo`/`CD`, celdas vacías para datos que faltan
- [ ] 1.3 Nombre de archivo `musica-retro-<alcance>-<aaaa-mm-dd>.csv`
- [ ] 1.4 Tests: comillas y `;` en títulos, tildes, alcance, orden y celdas vacías

## 2. Pantalla de Ajustes

- [ ] 2.1 Sección "Descargar" con selector Todo / Vinilos / CDs y botón "Descargar planilla"
- [ ] 2.2 Compartir con `navigator.share({ files })` si `canShare` lo permite; si no, descarga con `<a download>`; ignorar `AbortError`
- [ ] 2.3 Verificar que funciona sin conexión

## 3. Importación (con tests)

- [ ] 3.1 Parser de campos con comillas (`;` o tabulación) que tolera BOM
- [ ] 3.2 Detección de encabezado (Banda + Disco) y mapeo por nombre con alias; sin encabezado, el comportamiento actual de 3 campos
- [ ] 3.3 Validar copias, año, fecha `d/m/aaaa` y Spotify, con motivo por línea
- [ ] 3.4 Combinar repetidas sumando copias, conservando año, fecha y Spotify de la primera
- [ ] 3.5 Tests: reimportar la salida de `exportar.js` da los mismos datos (ida y vuelta), columnas en otro orden, comillas, datos inválidos

## 4. Base de datos

- [ ] 4.1 Migration: `importar_discos` acepta por ítem `anio`, `fecha_carga` y `spotify_url`; los escribe solo en discos creados; "sumar como copias" no los pisa
- [ ] 4.2 Aplicar y probar por SQL con y sin los campos nuevos

## 5. Pantalla de importación

- [ ] 5.1 Botón "Elegir archivo" (`.csv`) que carga el contenido en el área de texto
- [ ] 5.2 La vista previa muestra copias, año y fecha cuando vienen en la lista
- [ ] 5.3 Actualizar el texto de ayuda: formato simple o planilla exportada

## 6. Verificación

- [ ] 6.1 `npm test` y `npm run build` sin errores
- [ ] 6.2 Exportar desde el celular, abrir en Excel en español y en Google Sheets, y compartir por WhatsApp
- [ ] 6.3 Reimportar el archivo exportado en un catálogo de prueba y comparar copias, año, fechas y Spotify
