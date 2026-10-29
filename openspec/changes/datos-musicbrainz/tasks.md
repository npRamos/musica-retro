## 1. Base de datos

- [x] 1.1 Migration `supabase/migrations/<fecha>_musicbrainz.sql`: `bandas.mbid uuid`; `discos.anio smallint` (check 1900–2100), `discos.temas jsonb`, `discos.mb_release_group uuid`, `discos.mb_release uuid`, `discos.mb_estado text not null default 'pendiente'` con check (`pendiente`, `enlazado`, `sin_coincidencia`)
- [x] 1.2 `normalizar()` en SQL: equiparar `’ ‘ “ ”` con `' "`, y recalcular `nombre_norm` / `titulo_norm` existentes
- [x] 1.3 `drop function` de la firma vieja de `agregar_disco` y crearla con `p_datos jsonb default null` (asigna `mbid` a la banda nueva o sin enlazar; guarda `anio`, `temas`, `mb_*` y `mb_estado = 'enlazado'` cuando hay `mb_release`). Verificar que `importar_discos` sigue funcionando
- [x] 1.4 RPC `completar_disco(p_disco uuid, p_datos jsonb)` (`security invoker`): escribe año, temas, `mb_*`, `enlazado` y el `mbid` de la banda si falta; devuelve el disco
- [x] 1.5 `fusionar_bandas`: el destino hereda el `mbid` del origen si no tiene
- [x] 1.6 Grants a `authenticated` y aplicar la migration; probar por SQL alta con y sin `p_datos`, `completar_disco` y que `anon` no accede

## 2. Utilidades puras (con tests)

- [x] 2.1 `normalizar()` en JS con las mismas comillas que la SQL
- [x] 2.2 Agrupar release-groups en Estudio / EP / En vivo / Compilados, ordenados por año, y filtrar por texto
- [x] 2.3 Elegir la edición: formato coincidente, tapa, contratapa, país AR, fecha más vieja; indicar si no hubo coincidencia de formato
- [x] 2.4 Convertir la respuesta de `release?inc=recordings` al formato de `temas` (medios con número, título y ms) y extraer el año del release-group
- [x] 2.5 Duración `m:ss` y títulos de medio ("Disco 1", "Disco 2") para el detalle
- [x] 2.6 `ordenarDiscos` con el orden `anio` (más viejo primero, sin año al final por título)
- [x] 2.7 Elegir el candidato para pendientes: artista por `mbid` o por nombre normalizado igual con score ≥ 90; release-group por título normalizado

## 3. Cliente de MusicBrainz y Cover Art Archive

- [x] 3.1 `src/lib/musicbrainz.js`: cola serial con ≥ 1100 ms entre pedidos, `AbortController`, timeout de 8 s, un reintento ante `503`, caché en memoria por URL, `fmt=json`
- [x] 3.2 Funciones: `buscarArtistas`, `discosDeArtista` (paginado, tope 3 páginas), `buscarDiscos(banda, titulo)`, `edicionesDeDisco`, `temasDeEdicion`
- [x] 3.3 Cover Art Archive (fuera de la cola): imágenes `Front` y `Back` de una edición en 1200 px como `Blob`, pasadas por `procesarImagen` (tapa recortada a 600, contratapa sin recorte)
- [x] 3.4 Tests del cliente con `fetch` simulado (espaciado de la cola, cancelación, reintento, error)

## 4. Datos en el cliente

- [x] 4.1 `catalogoContexto`: sumar `mbid` al select de bandas y `anio, temas, mb_estado, mb_release` al de discos (llegan a la caché offline)
- [x] 4.2 `agregarDisco` y `actualizarDisco` aceptan año y datos de MB; `sumarCopia` completa el disco existente si estaba `pendiente`
- [x] 4.3 `completarDisco(disco, datos, imagenes)`: llama a `completar_disco` y sube solo las imágenes de lugares vacíos o elegidas para reemplazar
- [x] 4.4 `marcarSinCoincidencia(disco)`
- [x] 4.5 Preferencia `ordenBanda` (por defecto `anio`) separada de `orden`

## 5. Alta asistida

- [x] 5.1 `CampoBanda`: bloque "En MusicBrainz" (2+ caracteres, 500 ms de pausa) debajo de las del catálogo, artistas ya enlazados mostrados como banda local y "Usar «x» tal cual"
- [x] 5.2 Mover Formato antes de Disco en `FormDisco`
- [x] 5.3 Campo Disco con lista agrupada (banda con `mbid`) o búsqueda por banda + título (banda sin `mbid`), y "Usar lo que escribí"
- [x] 5.4 Selector "Edición ▾" con la elección automática, todas las ediciones y "Ninguna"; volver a elegir al cambiar el formato si no se eligió a mano; aviso cuando no hay edición en ese formato
- [x] 5.5 Precargar tapa y contratapa en los `SelectorImagen` y mostrar "Temas (n) ▸" plegable
- [x] 5.6 Guardar con `p_datos`; título de MB por `formatearTitulo()`, nombre de banda de MB tal cual
- [x] 5.7 Aviso discreto "MusicBrainz no responde" y ocultar los bloques de MB sin conexión

## 6. Completar

- [x] 6.1 Editar disco: campo Año (4 cifras, opcional) y acción "Completar desde MusicBrainz" con vista de lo que se va a sumar y opción de reemplazar imágenes propias
- [x] 6.2 Ruta `#/completar` y acceso en Ajustes con el contador de pendientes
- [x] 6.3 Pantalla de pendientes: candidato con tapa, año, edición y temas; "Sí", "Otro ▾", "No es", "Saltar"; búsqueda anticipada del siguiente
- [x] 6.4 Estado "No lo encontramos" con "Buscar a mano" y "Marcar sin datos"

## 7. Consulta

- [x] 7.1 Pantalla de banda: orden `ordenBanda` con "Por año" por defecto y el año en las tarjetas de disco
- [x] 7.2 Detalle: año en la tabla de datos y lista de temas (número, título, duración; un subtítulo por medio si hay varios)

## 8. Verificación

- [x] 8.1 `npm test` y `npm run build` sin errores
- [ ] 8.2 Probar en el celular: alta de "Soda Stereo – Signos" en CD y vinilo, una banda inexistente, MusicBrainz cortado (bloquear el host) y sin conexión
- [ ] 8.3 Completar 5 discos importados desde pendientes, incluido uno "No es", y verificar que no vuelve a aparecer
- [ ] 8.4 Verificar offline que temas, año y tapas de MB se ven igual que los propios
