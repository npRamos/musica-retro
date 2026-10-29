## Context

Después de `datos-musicbrainz`, las bandas pueden estar enlazadas a un artista de MusicBrainz (`bandas.mbid`). MusicBrainz no tiene imágenes de artistas, pero sus relaciones de URL incluyen el ítem de Wikidata, y Wikidata tiene la propiedad **P154 (logo)**, con el archivo en Wikimedia Commons.

Probado el 28/10/2026 con 18 bandas de la colección:

- **Con logo (7):** Iron Maiden, Metallica, Megadeth, HammerFall, La Renga, AC/DC y Nirvana.
- **Sin logo:** Sumo, Soda Stereo, Almafuerte, Los Rodríguez, Expulsados, Blind Guardian y otras. Casi todas las bandas argentinas chicas quedan afuera.

La cobertura ronda el 40% y es mejor en metal internacional.

- `wikidata.org/wiki/Special:EntityData/<Q>.json` y `commons.wikimedia.org/wiki/Special:FilePath/<archivo>?width=600` (que entrega PNG aunque el original sea SVG) responden con `access-control-allow-origin: *`.
- Los logos son variados: Iron Maiden tiene letras blancas con borde negro; La Renga, texto rojo sobre una estrella blanca con relleno negro; Metallica, trazo negro sobre transparente.

El ícono actual es un vinilo oscuro (`#141218`) sobre fondo casi negro (`#0d0c0f`): en la pantalla de inicio del celular apenas se distingue.

Los discos importados tienen como `fecha_carga` el día de la importación; la edición no permite cambiarla.

## Goals / Non-Goals

**Goals:**
- Tarjetas de banda reconocibles con el logo, legibles en los dos temas.
- Que el logo llegue solo cuando la banda se enlaza, sin trabajo extra.
- Un ícono que se distinga en la pantalla de inicio.
- Poder corregir la fecha de carga sin ensuciar el formulario.

**Non-Goals:**
- Fotos de la banda desde Wikidata (P18). Se podría sumar después como alternativa a la foto propia.
- fanart.tv o TheAudioDB: necesitan una clave, que quedaría pública en el bundle.
- Recolorear los logos (ver Decisión 2).
- Cambiar la fecha desde el alta (es "ahora") o desde la importación (va en `exportar-csv`).

## Decisions

### 1. Logo: MusicBrainz → Wikidata → Commons
```
bandas.mbid ──▶ MB artist/<mbid>?inc=url-rels ──▶ relación "wikidata" (Q42482)
           ──▶ Wikidata EntityData Q42482 ──▶ P154 "Logo_iron_maiden.png"
           ──▶ Commons Special:FilePath/Logo_iron_maiden.png?width=600 ──▶ PNG
```
- El pedido a MusicBrainz pasa por la cola de 1/s del cliente existente. Los de Wikidata y Commons van aparte.
- **Cuándo:**
  - automáticamente, cuando una banda queda enlazada (alta con MusicBrainz o completar) y todavía no tiene `logo_buscado_en`;
  - a mano, desde Editar banda.
- `bandas.logo_buscado_en` evita repetir la búsqueda de bandas que no tienen logo.
- Si hay varios valores de P154, se usa el de rango preferido o, si no hay, el primero.
- **Alternativa descartada:** fanart.tv, que tiene más logos en HD, pero exige una clave de API que quedaría expuesta en un repo público.

### 2. Colores originales sobre fondo oscuro; los logos oscuros, invertidos
- El logo se procesa sin recorte, hasta 600 px en el lado mayor, y se guarda **con transparencia**: WebP con alfa o, si el navegador no codifica WebP, PNG. JPEG no sirve porque pierde la transparencia.
- La tarjeta pone siempre el logo sobre un **fondo oscuro**: el mosaico oscurecido o el tono oscurecido. Pasa en los dos temas, porque la tarjeta es una imagen. Así casi todos los logos se ven con sus colores.
- **Logos oscuros:** al procesarlos se calcula la luminancia media de los píxeles visibles, ponderada por el alfa. Si es baja (< 0,35) y el logo tiene transparencia (menos del 95% de píxeles opacos), se marca `logo_invertir` y se muestra con `filter: invert(1)`. Es el caso de Metallica: un trazo negro que quedaría invisible pasa a blanco.
- Un logo sin transparencia (un JPG con fondo) se muestra tal cual, contenido.
- **Alternativa descartada: monocromo** (`brightness(0) invert(1)`). Se probó con los logos reales: el de La Renga (texto rojo sobre estrella blanca) se convierte en una sola mancha blanca y se pierde el texto.

### 3. Tarjeta de banda
Orden de imagen:
1. la imagen propia de la banda (foto), sin cambios;
2. si hay logo: fondo con el mosaico de tapas **oscurecido** (o el tono tipográfico si no hay tapas) y el logo centrado encima, con un margen de 12%;
3. si no hay logo: lo de hoy (mosaico o tarjeta tipográfica).

El nombre sigue debajo de la tarjeta, como ahora. En vista lista, la miniatura de 48 px usa el logo sobre el tono cuando no hay imagen propia.

### 4. Editar banda
Sección "Logo" con:
- la vista previa;
- "Buscar en Wikidata", solo si la banda tiene `mbid`;
- "Elegir archivo", para un logo propio desde la galería o los archivos, ideal un PNG con transparencia;
- "Quitar".

Al quitarlo, se marca `logo_buscado_en` para que no vuelva solo.

### 5. Modelo
```
bandas + logo_path text null
       + logo_invertir boolean not null default false
       + logo_buscado_en timestamptz null
```
- Ruta en Storage: `<uid>/bandas/<id>-logo-<timestamp>.<ext>`. Se borra al quitarlo o reemplazarlo, y también al borrar o unir bandas: `fusionar_bandas` devuelve el logo huérfano, igual que la imagen.
- El bucket acepta `image/png`: hay que sumarlo a `allowed_mime_types`.

### 6. Ícono de la app
- El mismo vinilo (surcos, arco de brillo, etiqueta violeta) sobre un fondo de **vidrio líquido violeta**:
  - gradiente radial `#a978f5` → `#6b28c9` → `#2b0e57`;
  - tres manchas de luz difusas (lavanda arriba a la izquierda, violeta abajo a la derecha, profundo abajo a la izquierda);
  - un reflejo blanco arriba y una línea de refracción;
  - una sombra suave bajo el disco para que flote.
- Versiones:
  - `icono.svg`: favicon, con el disco de radio 182;
  - `icono-192.png` e `icono-512.png`;
  - `icono-maskable-512.png`: disco de radio 150, dentro de la zona segura del 80% que Android recorta.
- Los PNG se exportan del SVG con Inkscape.
- **Excepción a la identidad visual:** el spec prohíbe el "glassmorphism con blur" en la **interfaz**. El ícono vive fuera de ella (pantalla de inicio, pestaña del navegador), así que se suma como requisito aparte y la interfaz no cambia.

### 7. Agrupar por banda o ver todos los discos
- Nueva preferencia por dispositivo `agrupar`: `bandas` (por defecto, la vista actual) o `discos`.
- **Dónde se elige:** en la hoja del botón ⇅, que pasa a llamarse "Orden y vista", con dos grupos: **Mostrar** (Por banda / Todos los discos) y **Ordenar** (A→Z, Z→A, Última compra).
  - **Alternativa descartada:** un cuarto botón en el encabezado. Con 360 px de ancho cortaría el título "Música Retro".
- **Vista "Todos los discos":** las tarjetas de disco del formato, con el nombre de la banda (como en los resultados de búsqueda), en la vista cuadrícula o lista elegida.
- **Orden:**
  - A→Z ordena por banda, después por año (los que no tienen año al final) y después por título. Así los discos de una banda quedan juntos como discografía: Dio – Holy Diver (1983), Dio – The Last in Line (1984).
  - Z→A invierte el A→Z.
  - Última compra ordena por fecha de carga.

  El mismo criterio se aplica a los resultados de búsqueda.

### 8. Fecha de carga
- En Editar disco, un `<details>` cerrado con el título "Más datos" que contiene un `input type="date"` ("Fecha de carga").
- Se guarda a las 12:00 hora local del día elegido, para que ningún huso horario la corra de día. Solo se envía si cambió.
- No se acepta una fecha futura.

## Risks / Trade-offs

- [Cobertura de logos ~40%, baja en bandas argentinas] → La tarjeta sigue funcionando como hoy, y el logo propio cubre el resto.
- [Un logo con detalles finos queda ilegible en monocromo a 160 px] → Se puede quitar o reemplazar desde Editar banda.
- [Logos en Commons con licencias "PD-textlogo" o marcas registradas] → Uso privado, sin redistribución. Es lo mismo que pasa con las tapas.
- [Wikidata o Commons no responden] → La búsqueda automática falla en silencio, sin marcar `logo_buscado_en`, y se reintenta la próxima vez.
- [Los PNG del ícono pesan más (157 KB contra 42 KB) por los degradés] → Entran en el precache una sola vez. Aceptable.

## Migration Plan

1. Migration: columnas nuevas, `image/png` en el bucket y `fusionar_bandas` con el logo huérfano.
2. Deploy. Los íconos nuevos llegan con la actualización del service worker. En Android puede hacer falta reinstalar el acceso directo para ver el ícono nuevo.
3. Rollback: el front anterior ignora las columnas nuevas.

## Open Questions

- ¿Sumar después la foto de la banda de Wikidata (P18) como alternativa cuando no hay logo?
