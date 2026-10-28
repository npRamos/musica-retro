## Why

La colección (unos 100 CDs y 25 vinilos) creció lo suficiente como para olvidar qué discos ya tengo, y ya llegaron duplicados por regalo o compra. Necesito un catálogo privado y visual que pueda consultar y actualizar desde el celular, en especial parada en una disquería, y que esté siempre sincronizado entre dispositivos sin mantener un servidor propio.

## What Changes

- Nueva app web estática (Vite + React + Tailwind) publicada en GitHub Pages, mobile-first.
- Datos en Supabase (Postgres + Auth + Storage). La estructura vive como migrations SQL en el repo para poder portarla.
- Acceso privado con magic link (y código de un solo uso en el mismo mail). Hay una sola usuaria, los registros nuevos están deshabilitados y los datos se protegen con RLS.
- Alta de discos con banda, título y formato (vinilo/CD). La fecha de carga es automática y las copias arrancan en 1 por defecto.
- **Tapas de discos e imágenes de bandas** desde la cámara o la galería. Se recortan en cuadrado, se comprimen en el dispositivo y se guardan en un bucket privado.
- Autocompletado de bandas: si la banda no existe, se crea al guardar. La comparación ignora mayúsculas, tildes y espacios.
- **Formato tipo título** al crear bandas y discos ("los piojos" → "Los Piojos"), respetando siglas escritas en mayúsculas (AC/DC). Al corregir a mano se guarda exactamente lo escrito.
- Detección de duplicados (misma banda + título + formato) con la opción de sumar una copia en lugar de crear otro ítem.
- **Corrección de bandas**: renombrar, cambiar la imagen y unir dos bandas cuando el nombre corregido coincide con una que ya existe.
- Edición de disco (título, banda, formato, copias, tapa, link de Spotify) y borrado.
- Navegación estilo "álbumes" de Google Fotos: dos pestañas (**Vinilos** y **CDs**), cada una con una cuadrícula de tarjetas grandes por banda (con su imagen o un mosaico de sus tapas). Se puede cambiar a vista lista. Al tocar una banda se ven sus discos de ese formato, y al tocar un disco se abre su detalle.
- **Orden elegible**: A→Z (por defecto), Z→A o última compra.
- Buscador por disco o banda dentro de la pestaña activa, que avisa si lo tenés en el otro formato.
- Importación de una lista pegada (`banda; disco; formato`) con vista previa antes de guardar.
- Botón "Escuchar en Spotify" que abre la búsqueda web de Spotify, sin usar su API.
- Caché local de solo lectura (datos e imágenes) para consultar sin conexión; la app es instalable (PWA).
- GitHub Action programada que hace un ping a Supabase para evitar que el free tier pause el proyecto.
- Deploy automático a GitHub Pages con GitHub Actions.
- Identidad visual rock/metal propia, con tema oscuro y claro y **color de acento elegible: violeta "Sabbath" (por defecto) o rojo sangre**.

**Fuera de alcance (etapa 2):** tapas y tracklist automáticos vía MusicBrainz / Cover Art Archive, links a temas individuales e integración con la API de Spotify.

## Capabilities

### New Capabilities
- `acceso`: ingreso privado con magic link o código, sesión persistente por dispositivo, una sola usuaria y aislamiento de datos por dueña.
- `catalogo`: modelo de bandas y discos; alta, edición, borrado, autocompletado y creación de bandas, formato tipo título, normalización, detección de duplicados y corrección/unión de bandas.
- `imagenes`: tapas de discos e imágenes de bandas desde la cámara o la galería, con recorte, compresión, almacenamiento privado y caché offline.
- `consulta`: pestañas por formato, cuadrícula/lista de bandas, orden elegible, pantalla de banda, detalle de disco, buscador con aviso de otro formato, link a Spotify y consulta offline.
- `importacion`: carga masiva pegando líneas de texto, con validación y vista previa (bandas nuevas, duplicados, líneas inválidas).
- `identidad-visual`: estética rock/metal, temas oscuro y claro, acento violeta o rojo, tipografía y diseño mobile-first.
- `operacion`: deploy a GitHub Pages, keep-alive de Supabase, migrations versionadas y README de puesta en marcha.

### Modified Capabilities
<!-- Ninguna: proyecto nuevo. -->

## Impact

- **Repo nuevo** `musica-retro`: código público (no contiene secretos) y datos privados en Supabase.
- **Supabase**: un proyecto nuevo en el free tier (hay lugar: solo está activo el prod de cuidado-abuela). Usa Auth (magic link, signups off, URL de redirección a Pages) y Storage (bucket privado `imagenes`; ~150 imágenes de ~100 KB, muy lejos del límite de 1 GB).
- **GitHub**: Pages habilitado y dos workflows (deploy y keep-alive). Variables: URL y anon key de Supabase.
- **Dependencias**: `react`, `react-dom`, `@supabase/supabase-js`, `tailwindcss` v4, `vite` y `vite-plugin-pwa`. Fuentes desde Google Fonts.
