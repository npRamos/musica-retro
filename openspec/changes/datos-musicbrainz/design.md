## Context

La etapa 1 dejó un catálogo funcionando: SPA estática en GitHub Pages que habla directo con Supabase (RLS por miembros), alta manual con fotos de tapa y contratapa, importación de texto y caché offline. Este change suma datos de **MusicBrainz** (MB) y **Cover Art Archive** (CAA) sin agregar servidor.

Se probó contra la API real (28/10/2026):

- `musicbrainz.org/ws/2` y toda la cadena de redirecciones de CAA (→ archive.org) responden con `access-control-allow-origin: *`. Se puede pedir JSON e imágenes desde el navegador y procesarlas en canvas.
- No piden clave. Límite de **1 pedido/s por IP**; la primera llamada de la prueba devolvió `503` "server is currently busy".
- Soda Stereo tiene **43** release-groups de tipo álbum (7 de estudio; el resto, en vivo y compilados). "Signos" tiene **7 ediciones**: el vinilo AR 1986 tiene tapa pero no contratapa; el CD AR 1986 tiene tapa, contratapa, librillo y disco.
- Los títulos vienen en minúscula tipo oración ("Canción animal"). Los temas de vinilo vienen numerados `A1`, `B1`…
- CAA ofrece miniaturas de 250, 500 y 1200 px.

Decisiones de la usuaria: importar la colección ya como texto y completarla después de a uno; guardar el año y ordenar por año dentro de la banda por defecto; los grupos (estudio, en vivo, compilados) visibles en la lista.

## Goals / Non-Goals

**Goals:**
- Cargar un disco eligiendo banda y disco, con tapa, contratapa, temas y año precargados.
- Completar los discos ya cargados (importados o manuales) con un toque por disco.
- Que nada dependa de MB: sin señal, sin resultados o con MB caído, la carga manual sigue igual.
- Respetar el límite de MB sin que la usuaria lo note.

**Non-Goals:**
- Imágenes de bandas (MB no tiene fotos de artistas).
- Búsqueda por tema, links a temas, API de Spotify.
- Emparejamiento automático masivo durante la importación (se descartó: la opción B de la usuaria).
- Editar la lista de temas a mano.
- Exportación (va en el change `exportar-csv`).

## Decisions

### 1. Cliente MB en el navegador con cola propia
- Módulo `src/lib/musicbrainz.js`. Todos los pedidos a `musicbrainz.org` pasan por una **cola serial** con al menos **1100 ms** entre pedidos, `AbortController` (al cambiar el texto se cancela lo pendiente) y timeout de 8 s. Un `503` se reintenta una vez a los 2 s; después, error "MusicBrainz no responde".
- Caché en memoria por URL durante la sesión (volver atrás o cambiar de formato no repite pedidos).
- CAA no comparte el límite de MB y va fuera de la cola.
- **Alternativa descartada:** un proxy (Edge Function de Supabase) para fijar `User-Agent` y cachear. Agrega un componente que mantener; con dos usuarias el volumen es mínimo.

### 2. Tres niveles: banda → disco → edición
```
artist (banda) ──▶ release-group (disco) ──▶ release (edición) ──▶ temas + imágenes
  la usuaria         la usuaria                la app (cambiable)
```
- **Banda:** `GET /artist?query=<texto>&limit=5`. Se muestra nombre + país o desambiguación ("tributo").
- **Discos de una banda con `mbid`:** `GET /release-group?artist=<mbid>&type=album|ep&limit=100` (paginado si hay más). Se agrupan por tipo secundario: **Estudio** (sin secundario), **EP**, **En vivo** (`Live`), **Compilados** (`Compilation`, `Remix`, `Soundtrack`, etc.). Cada grupo ordenado por año. Todos los grupos visibles; el texto escrito filtra en el cliente.
- **Banda sin `mbid`** (cargada a mano o elegida del catálogo sin enlazar): no se fuerza un artista. Mientras escribe el título se busca `GET /release-group?query=releasegroup:"<título>" AND artist:"<banda>"`. Al elegir un disco, su artista enlaza la banda.
- **Ediciones:** `GET /release?release-group=<id>&inc=media&limit=100` trae el formato de cada medio y los flags `cover-art-archive.front/back`. La app elige con este orden de preferencia:
  1. formato coincidente (`/vinyl/i` para vinilo; `/CD/` para CD),
  2. tiene tapa,
  3. tiene contratapa,
  4. país `AR`,
  5. fecha más vieja.

  Si ninguna coincide en formato, se usa la mejor del resto y se avisa "No encontramos la edición en vinilo". El selector "Edición ▾" lista todas, con la opción "Ninguna" (solo banda y título, sin temas ni imágenes).
- **Temas:** `GET /release/<id>?inc=recordings`.
- Cuatro pedidos a MB en el peor caso por alta (~4 s en total, la mayoría mientras la usuaria todavía escribe o elige).

### 3. Imágenes: copiar a nuestro bucket
- CAA: `GET coverartarchive.org/release/<id>` (JSON con tipos `Front`/`Back`). Se baja `front` y `back` en **1200 px** (`thumbnails["1200"]`), se convierte en `Blob` y entra por `procesarImagen` como una foto: tapa recortada a 600 px, contratapa sin recorte hasta 1200 px.
- El formulario guarda esos `Blob` en el mismo estado que `SelectorImagen` (`imagen` / `contratapa`), así el guardado no cambia y la usuaria puede reemplazarlos por una foto.
- **Alternativa descartada:** guardar la URL de CAA. Rompe la consulta offline (la caché del SW es por ruta de Storage), depende de archive.org y expone qué discos se miran.
- Al completar un disco que ya tiene una foto propia, **no se pisa**: las imágenes de MB solo llenan lugares vacíos, salvo que la usuaria elija reemplazarlas.

### 4. Modelo de datos
Migration `2026xxxx_musicbrainz.sql`:
```
bandas  + mbid uuid null

discos  + anio smallint null check (anio between 1900 and 2100)
        + temas jsonb null           -- [{medio:1, formato:"CD", temas:[{n:"1", titulo:"Sin sobresaltos", ms:264000}]}]
        + mb_release_group uuid null
        + mb_release uuid null
        + mb_estado text not null default 'pendiente'
              check (mb_estado in ('pendiente','enlazado','sin_coincidencia'))
```
- **`temas` en `jsonb`** y no en tabla: es de solo lectura, se muestra entero y viaja con el catálogo a la caché local (~125 discos × ~12 temas ≈ 60 KB en localStorage).
- **`anio`** es el año del **disco** (`first-release-date` del release-group), no el de la edición: sirve para ordenar la discografía.
- **`mb_estado`:** los discos existentes quedan `pendiente`. "✗ No es" pasa a `sin_coincidencia` (no vuelve a aparecer en pendientes, pero se puede completar desde la edición). Cargar a mano con "Usar lo que escribí" deja `pendiente`.
- `bandas.mbid` **sin** unique: dos bandas locales podrían apuntar al mismo artista por un error de tipeo; eso se resuelve con la unión de bandas que ya existe. El autocompletado muestra un artista MB ya enlazado como la banda local.
- `fusionar_bandas`: si el destino no tiene `mbid`, hereda el del origen.

### 5. RPC
- `agregar_disco(p_banda, p_titulo, p_formato, p_copias, p_datos jsonb default null)`. `p_datos = {banda_mbid, anio, temas, mb_release_group, mb_release}`. Al crear la banda o encontrarla sin `mbid`, se le asigna `banda_mbid`. Al crear el disco con `mb_release`, queda `enlazado`. Hay que hacer **`drop function` de la firma vieja** antes de crear la nueva (si no, Postgres crea una sobrecarga y `importar_discos` llamaría a la vieja).
- `completar_disco(p_disco uuid, p_datos jsonb)`: escribe `anio`, `temas`, `mb_*`, `mb_estado = 'enlazado'` y el `mbid` de la banda si le falta. Devuelve el disco. Las imágenes se suben después desde el cliente, como hoy.
- "✗ No es": `update discos set mb_estado = 'sin_coincidencia'` directo (RLS alcanza).
- Duplicado al dar de alta con datos de MB ("Sumar copia"): si el disco existente está `pendiente`, además de sumar la copia se completa con los datos elegidos.

### 6. Nombres que vienen de MB
- **Banda:** se guarda como la escribe MB ("Patricio Rey y sus Redonditos de Ricota"). Los nombres de artista en MB están cuidados y `formatearTitulo()` arruinaría algunos.
- **Disco:** se pasa por `formatearTitulo()` ("Canción animal" → "Canción Animal"), para que lo cargado por MB y lo importado como texto se vean igual.
- **Al completar** un disco existente, banda y título **no cambian**: se suman año, temas, imágenes y enlaces.
- Los títulos de los temas se guardan tal cual.

### 7. Formulario de alta
```
Banda   [catálogo ▸ MusicBrainz ▸ "+ Usar «x» tal cual"]
Formato [Vinilo | CD]          ← sube antes del disco: define la edición
Disco   [Estudio · EP · En vivo · Compilados ▸ "+ Usar lo que escribí"]
Edición CD · AR · 1986 ▾       ← aparece al elegir un disco
Tapa / Contratapa              ← precargadas, reemplazables
Temas (8) ▸                    ← plegado
Copias · Guardar
```
- Las sugerencias de MB aparecen después de 2 caracteres y 500 ms sin escribir. Las del catálogo siguen siendo instantáneas y van primero.
- Cambiar el formato con un disco ya elegido vuelve a elegir la edición (salvo que la usuaria la haya elegido a mano).
- Sin conexión, no se muestran los bloques de MB (el guardado ya está deshabilitado sin conexión).
- Si MB falla, un aviso discreto bajo el campo ("MusicBrainz no responde"); el resto del formulario no cambia.

### 8. Completar
- **Un disco:** "Completar desde MusicBrainz" en Editar disco. Abre los mismos selectores (disco y edición) con banda, título y formato del disco, y muestra lo que se va a sumar antes de confirmar.
- **Pendientes:** ruta `#/completar`, accesible desde Ajustes con el contador ("Completar pendientes · 87"). Toma los discos `pendiente` en orden alfabético por banda. Para cada uno busca un candidato:
  1. el artista: el `mbid` de la banda o, si no tiene, una búsqueda con nombre normalizado igual y score ≥ 90;
  2. el release-group cuyo título normalizado coincide, o el primero de la búsqueda por título;
  3. la edición según la Decisión 2.

  Muestra tapa, año, edición y cantidad de temas, con **✗ No es · Otro ▾ · ✓ Sí** y "Saltar". Mientras la usuaria decide, se busca el candidato del disco siguiente. Si no hay candidato, se muestra "No lo encontramos" con "Buscar a mano" o "Marcar sin datos".
- El modo se puede dejar en cualquier momento; el progreso es el `mb_estado` de cada disco.

### 9. Consulta
- **Orden en la pantalla de banda:** nueva preferencia por dispositivo `ordenBanda`, con valor por defecto `anio`. Opciones: **Por año** (de más viejo a más nuevo; los que no tienen año, al final y por título), A→Z, Z→A, Última compra. La grilla de bandas y la búsqueda siguen con la preferencia `orden` actual (A→Z por defecto).
- **Detalle:** año en la tabla de datos; lista de temas debajo del carrusel, con número y duración (`m:ss`). Con varios medios, un subtítulo por medio ("Disco 1", "Disco 2"). Los números de vinilo se muestran como vienen (`A1`, `B1`).
- `catalogoContexto` suma `anio, temas, mb_estado` al `select` de discos y `mbid` al de bandas.

## Risks / Trade-offs

- [MB limita o se cae (503)] → Cola de 1 pedido/s, un reintento y degradación a carga manual. Nunca bloquea el guardado.
- [El navegador no permite fijar `User-Agent` y MB pide identificarse] → En las pruebas responde igual; el volumen es mínimo. Si algún día lo bloquean, se agrega un proxy (Decisión 1, alternativa).
- [La edición elegida no es la que tiene la usuaria (temas o tapa distintos)] → Selector "Edición ▾" en el alta y "Completar desde MusicBrainz" para corregir después.
- [Pocas contratapas en CAA, sobre todo en vinilos y ediciones argentinas] → El lugar queda vacío para la foto propia. El modo pendientes deja identificados los discos que la necesitan.
- [Empates o falsos positivos en pendientes (compilados con el mismo nombre, bandas homónimas)] → Siempre hay confirmación; "Otro ▾" muestra todos los discos y ediciones de la banda.
- [Diferencias de normalización entre comillas tipográficas de MB (’) y las escritas (')] → Sumar `’ ‘ “ ”` → `' "` a `normalizar()` en SQL y JS.
- [Bajar imágenes de 1200 px con señal mala] → Se piden recién cuando hay disco y edición elegidos. Se puede guardar sin esperar: si la imagen no llegó, no se guarda.
- [Bandas con cientos de release-groups (The Beatles)] → Paginación de a 100, con tope de 3 páginas; más allá, la búsqueda por título.

## Migration Plan

1. Migration nueva: columnas, checks, `drop function` + `create` de `agregar_disco`, `completar_disco`, ajuste de `fusionar_bandas`, comillas en `normalizar()` (el trigger recalcula al actualizar; se hace un `update` sin cambios para recalcular `*_norm` existentes).
2. Deploy del front. Los discos existentes aparecen como pendientes; nada cambia en su visualización hasta completarlos.
3. Rollback: el front viejo ignora las columnas nuevas. `agregar_disco` con el parámetro opcional sigue aceptando la llamada vieja.

## Open Questions

- ¿Los títulos de disco de MB pasan por `formatearTitulo()` (elegido) o se guardan tal cual? Se puede cambiar sin migración.
- ¿Ofrecer "Lado A / Lado B" como subtítulos en vinilos (agrupar por la letra del número) o alcanza con los números `A1`, `B1`?
