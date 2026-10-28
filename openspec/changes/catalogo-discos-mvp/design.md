## Context

Proyecto nuevo, sin código previo. Es un catálogo compartido por una pareja (dos cuentas), con un catálogo chico (~125 discos que crecen despacio). El uso principal es desde el celular, consultando "¿ya lo tengo?" en una disquería, donde la señal suele ser mala. Restricciones:

- **Sin servidor propio.** El hosting es estático (GitHub Pages).
- **Datos privados** y sincronizados entre dispositivos.
- **Portabilidad.** La estructura de la base vive en el repo.
- **Costo $0.** Supabase free tier: hay un slot libre, porque solo está activo el prod de cuidado-abuela.

A diferencia de cuidado-abuela, donde un backend Next se conecta a Postgres por `DATABASE_URL`, acá **el navegador habla directo con Supabase** con `supabase-js`. La seguridad recae entera en Auth + RLS (tablas y Storage).

Inspiración visual (referencia de la usuaria: "Mobile music application – user interface design concept"): fondo casi negro con una **luz violeta difusa tipo escenario**, listas con **separadores de 1px** translúcidos, tipografía sans **liviana** (pesos light) para datos secundarios, **íconos de línea** finos, controles circulares delineados y la carátula como elemento central. A eso se le suma la capa metalera: blackletter en los títulos y etiquetas condensadas en mayúsculas.

## Goals / Non-Goals

**Goals:**
- Consultar el catálogo en menos de 2 segundos desde el celular, incluso sin conexión (con los últimos datos e imágenes conocidos).
- Cargar un disco, con foto de tapa, en pocos toques, con autocompletado de banda y protección contra duplicados.
- Poder corregir errores (bandas mal escritas, títulos, formato) sin entrar al dashboard de Supabase.
- Datos e imágenes inaccesibles para cualquiera que no sea la dueña.
- Una estética rock/metal reconocible que no parezca una plantilla de IA.
- Mantenimiento cero: deploy automático y keep-alive.

**Non-Goals:**
- Multiusuario, compartir catálogo, roles.
- Escritura offline (cola de sincronización).
- Tapas o tracklists automáticos, integración con la API de Spotify o MusicBrainz (etapa 2).
- Recorte manual libre de imágenes (en la etapa 1 el recorte es cuadrado y centrado, con vista previa).

## Decisions

### 1. SPA estática + Supabase directo desde el navegador
- **Elegido:** Vite build → GitHub Pages; `supabase-js` con la anon/publishable key en el bundle; RLS por `owner_id`.
- **Alternativas:** (a) JSON en el repo escrito con la GitHub Contents API y un PAT por dispositivo: sin consultas, sin imágenes cómodas, el token vence y un repo privado pide Pages pago. (b) Backend propio: contradice "sin servidor".
- **Por qué:** el código puede ser público porque no tiene secretos. Los datos y las imágenes quedan privados. Las consultas son reales, la auth es estándar y el patrón (Supabase) ya es conocido.

### 2. Vite + React + Tailwind v4, sin router ni librería de estado
- Vite ya es la opción liviana: el resultado son archivos estáticos sin runtime extra. Evaluamos Preact, pero se descartó para no salir del ecosistema React conocido.
- **Sin react-router:** se usa un router de hash mínimo propio sobre `hashchange`. Así se evitan los 404 de Pages con rutas profundas, y el botón "atrás" de Android funciona sin hacer nada extra:

  ```
  #/vinilos            #/cd                  ← pestañas (grilla de bandas)
  #/vinilos/banda/:id  #/cd/banda/:id        ← discos de esa banda en ese formato
  #/banda/:id/editar                         ← corregir banda / unir
  #/disco/:id                                ← detalle (etapa 1 básico, etapa 2 tracklist)
  #/disco/:id/editar   #/agregar   #/importar   #/ajustes
  ```
- **Estado:** el catálogo completo se carga una vez en memoria (~125 filas + bandas) y se filtra, agrupa y ordena en el cliente. No hace falta React Query ni Redux.

### 3. Auth: contraseña (principal) + magic link (alternativa)
- **Contraseña primero.** El SMTP por defecto de Supabase manda pocos mails por hora, y las invitaciones ya los agotaron en la puesta en marcha. Por eso el ingreso principal es `signInWithPassword`. Las contraseñas se asignan por SQL (`extensions.crypt` + `gen_salt('bf')`), que además marca la cuenta como confirmada. No hay registro ni "olvidé mi contraseña": para dos personas, se cambia por SQL.
- Los mensajes de error no distinguen si falló el mail o la contraseña. Un 429 se muestra como "esperá": para los links, con los segundos si Supabase los informa.

#### Alternativa: magic link + código OTP en el mismo mail
- `signInWithOtp({ email, options: { shouldCreateUser: false, emailRedirectTo } })`.
- El template del mail incluye **el link y el código de 6 dígitos** (`{{ .Token }}`). La pantalla de login ofrece un campo para pegar el código (`verifyOtp({ type: 'email' })`).
- **Por qué el código:** en el celular, el link suele abrirse en el navegador interno de Gmail, que no comparte la sesión con Chrome o Safari, o se termina abriendo en otro dispositivo. El código funciona en cualquier caso.
- Signups deshabilitados en el dashboard. Las cuentas se crean a mano (invite) y se suman a `public.miembros`.
- Con el SMTP por defecto de Supabase no se pueden editar los templates, así que el mail trae solo el link: hay que abrirlo en el mismo dispositivo donde está la app. El código queda disponible si algún día se configura un SMTP propio.
- La sesión persiste en localStorage (default de supabase-js), así que se inicia sesión una vez por dispositivo.

### 4. Modelo de datos y normalización en la base

```
bandas(id uuid pk, owner_id uuid default auth.uid(), nombre text, nombre_norm text,
       imagen_path text null, creado_en timestamptz default now(),
       unique(owner_id, nombre_norm))

discos(id uuid pk, owner_id uuid default auth.uid(), banda_id uuid fk → bandas on delete restrict,
       titulo text, titulo_norm text,
       formato formato_disco ('vinilo' | 'cd'),
       copias int default 1 check (copias >= 1),
       fecha_carga timestamptz default now(),
       spotify_url text null, tapa_path text null,
       unique(owner_id, banda_id, titulo_norm, formato))
```

- **Normalización** (`lower`, `unaccent`, colapsar espacios, `trim`): la calcula un **trigger BEFORE INSERT/UPDATE** que llena `*_norm`. `unaccent` no es IMMUTABLE y por eso no sirve en una columna generada. El trigger evita ese problema.
- Hay una función JS **espejo** (`normalizar()` con `NFD` + quitar diacríticos) que se usa solo para el autocompletado, la búsqueda y la vista previa de importación. La **fuente de verdad** son las unique constraints.
- `formato` es un enum de Postgres: es chico y estable, y dejar afuera un valor inválido es gratis.
- `on delete restrict` en bandas evita perder discos.

### 5. Formato tipo título (presentación)
- `formatearTitulo()` en JS se aplica **al crear** bandas y discos (alta e importación). El valor formateado es el que se guarda.
- Reglas: mayúscula inicial en cada palabra, también después de `/`, `-`, `(` y `"`. Los conectores (`de, del, la, las, el, los, y, e, o, u, a, al, en, con, por, para, un, una, of, the, and, in, on, to`) van en minúscula, salvo como primera palabra o después de `:`. **Las palabras que se escribieron enteras en mayúsculas se respetan** (AC/DC, INXS, U2), salvo que todo el texto tenga varias palabras y esté en mayúsculas ("SODA STEREO"), en cuyo caso se formatea todo. Una sola palabra en mayúsculas ("KISS", "AC/DC") se respeta. Las palabras que abren un paréntesis o una cita se capitalizan aunque sean conectores.
- **Al corregir** (editar banda o disco) se guarda exactamente lo escrito, sin formatear. Esa es la salida para los casos que la regla no adivina ("Él Mató a un Policía Motorizado", "La Renga").
- **Alternativa descartada:** formatear solo al mostrar. No permitiría corregir los casos que la regla rompe ("AC/DC" → "Ac/Dc" sin vuelta atrás).

### 6. Escrituras atómicas con RPC (`security invoker`)
- `agregar_disco(p_banda text, p_titulo text, p_formato, p_copias int default 1)`: busca o crea la banda por `nombre_norm`. Si el disco ya existe, devuelve `{estado: 'duplicado', disco}` sin insertar. Si no, inserta y devuelve `{estado: 'creado', disco}`.
- `sumar_copia(p_disco uuid, p_cantidad int default 1)`: `update ... set copias = copias + p_cantidad` (atómico).
- `importar_discos(p_items jsonb, p_duplicados text)`, donde `p_duplicados` vale `'omitir'` o `'sumar'`: una sola transacción que reutiliza la lógica de `agregar_disco` y devuelve un resumen.
- `renombrar_banda(p_banda uuid, p_nombre text)`: si el `nombre_norm` nuevo coincide con otra banda, devuelve `{estado: 'conflicto', banda}` sin cambios. Si no, renombra y devuelve `ok`.
- `fusionar_bandas(p_origen uuid, p_destino uuid)`: mueve los discos de origen a destino. Si un disco choca (mismo título + formato), suma sus copias al de destino y borra el de origen. Al final borra la banda de origen. Todo en una transacción. Devuelve las rutas de imágenes que quedaron huérfanas para que el cliente las borre de Storage.
- `ping()`: devuelve `1`, tiene grant a `anon` y no toca datos. La usa el keep-alive.
- La edición de un disco (título, banda, formato) va con `update` directo. Si choca con la unique constraint (código `23505`), la UI avisa "Ya tenés ese disco" y ofrece ir al existente.
- Las RPC corren como `security invoker`, así que RLS sigue aplicando.
- Al borrar el último disco de una banda, la banda también se borra (con su imagen): una banda sin discos no aparecería en ninguna pestaña.

### 7. RLS: catálogo compartido entre miembros
- Tabla `miembros(user_id)` y función `es_miembro()` (`security definer`, solo consulta si `auth.uid()` está en la lista).
- Policies `for all to authenticated using (es_miembro()) with check (es_miembro())` en bandas, discos y `storage.objects` del bucket `imagenes`.
- `owner_id` pasa a llamarse `cargado_por` (quién lo cargó) y la unicidad es del catálogo entero: `unique(nombre_norm)` y `unique(banda_id, titulo_norm, formato)`.
- **Por qué una lista de miembros** y no "cualquier usuario autenticado": si alguna vez se activaran los registros por error, una cuenta nueva no vería nada.
- `anon` no tiene ningún acceso a las tablas; `miembros` no es legible desde la API.
- Implementado en la migration `20261028000000_catalogo_compartido.sql`, sobre la inicial.

### 8. Imágenes (tapas y bandas)
- **Captura:** dos botones, "Sacar foto" (`<input type="file" accept="image/*" capture="environment">`) y "Elegir de galería" (sin `capture`).
- **Procesamiento en el dispositivo:** `createImageBitmap` (respeta la orientación EXIF) → **recorte cuadrado centrado** → 600×600 en canvas → `toBlob('image/webp', 0.75)`, con JPEG si el navegador no codifica WebP (Safari viejo). Resultado: ~40–60 KB. Con la contratapa (~120–180 KB), unos 200 KB por disco: ~5.000 discos en el 1 GB del plan gratis. Se muestra una vista previa con "Usar" o "Otra".
- **Storage:** bucket **privado** `imagenes`. Rutas `<uid>/discos/<disco_id>.<ext>` y `<uid>/bandas/<banda_id>.<ext>`. Las policies sobre `storage.objects` exigen `(storage.foldername(name))[1] = auth.uid()::text`. Al reemplazar se hace upsert. Al borrar un disco o al unir bandas se borra el archivo.
- **Lectura:** después de cargar el catálogo, un solo `createSignedUrls` con todas las rutas (validez de 7 días). Las URLs firmadas se guardan junto a la caché.
- **Offline:** runtime caching del service worker (CacheFirst) para el host de Storage, con un `cacheKeyWillBeUsed` que **quita el `token` de la query**. Así la clave de caché es la ruta y una URL firmada nueva no invalida la imagen guardada.
- **Cache-busting:** al reemplazar una imagen se guarda `?v=<timestamp>` en el `*_path` (o se cambia el nombre del archivo) para que la caché no muestre la versión vieja.
- **Alternativa descartada:** bucket público con rutas no adivinables. Es más simple, pero cualquier link compartido queda abierto para siempre, y la usuaria pidió privacidad.

### 8b. Contratapa
- Columna `discos.contratapa_path` (migration `20261028010000_contratapa.sql`): dos lugares fijos, tapa y contratapa, en vez de una tabla de imágenes genérica. Alcanza para el caso y mantiene simple la carga.
- Procesamiento: **sin recorte** (las contratapas de CD no son cuadradas) y hasta **1200 px** (calidad 70%) en el lado mayor para que la lista de temas sea legible; si el archivo supera ~900 KB, se recodifica con menos calidad (el bucket acepta hasta 1 MB).
- Detalle: carrusel con `scroll-snap` (deslizar tapa ↔ contratapa) e indicador de puntos. Tocar una imagen abre un visor a pantalla completa, donde el zoom es el nativo del navegador (pellizcar). El botón atrás cierra el visor.
- `fusionar_bandas` conserva la contratapa en los discos repetidos y devuelve la que sobra como huérfana. Al borrar un disco se borran las dos imágenes.
- Costo: con tapa y contratapa, ~200 KB por disco. Con ~125 discos son ~25 MB en Storage y en la caché del celular; el 1 GB del plan gratis alcanza para ~5.000 discos.

### 9. Offline: el catálogo vive también en el celular
Consultar sin señal es un requisito central, no un extra. Hay tres capas guardadas en el dispositivo:

```
 ┌─────────────── en el celular ───────────────┐
 │ 1. App shell   → Service Worker (precache)  │  la app abre sin red
 │ 2. Datos       → localStorage {datos,       │  bandas + discos (~50 KB)
 │                   actualizadoEn}            │
 │ 3. Imágenes    → Cache Storage (por ruta)   │  todas las tapas (~15 MB)
 └─────────────────────────────────────────────┘
          ▲  sincroniza al abrir y después de cada escritura
          │
       Supabase
```

- Después de cada carga exitosa, el catálogo se guarda en `localStorage`. Todos los accesos van envueltos en try/catch.
- Al abrir la app, **primero se muestra la caché** y después se refresca desde Supabase.
- **Precarga de imágenes:** después de sincronizar, en segundo plano (`requestIdleCallback`, de a 4 en paralelo), se piden todas las imágenes que todavía no están en la caché. Así, aunque no hayas mirado una banda, sus tapas están disponibles sin señal. Las imágenes de discos borrados se sacan de la caché.
- `navigator.storage.persist()` al iniciar sesión, para que el navegador no borre los datos guardados cuando le falta espacio.
- Sin red: banner "Sin conexión · datos del <fecha>". Agregar, editar, borrar, importar y subir imágenes quedan deshabilitados.
- `vite-plugin-pwa` genera el manifest y el service worker (precache del app shell + runtime caching de las imágenes, ver la Decisión 8).
- Se descartó IndexedDB para los datos porque ~125 filas entran holgadas en localStorage y el código queda más simple. Si el catálogo crece mucho, se migra.

### 10. Navegación estilo "álbumes" (Google Fotos)

```
 ┌──────────────────────────────┐   ┌──────────────────────────────┐   ┌────────────────────┐
 │ MÚSICA RETRO        ⚙  ▦≡ ⇅ │   │ ← SODA STEREO      ✎ ▦≡ ⇅   │   │ ← [ TAPA GRANDE ]  │
 │ 🔍 buscar…                   │   │   CD · 4 discos              │   │ Signos             │
 │ [ VINILOS 25 ] [ CDS 100 ]   │   │ ┌──────┐ ┌──────┐           │   │ SODA STEREO · CD   │
 │ ┌──────────┐ ┌──────────┐    │──▶│ │[tapa]│ │[tapa]│           │──▶│ x1 · 27/10/2026    │
 │ │ [imagen  │ │ [mosaico │    │   │ │Signos│ │Doble │           │   │ ▶ Escuchar Spotify │
 │ │  banda]  │ │  tapas]  │    │   │ │  x1  │ │Vida x2│          │   │ Editar · Borrar    │
 │ │SODA STEREO│ │ SUMO    │    │   │ └──────┘ └──────┘           │   │ ── etapa 2 ──      │
 │ │ 4 discos │ │ 3 discos │    │   │                        [+]   │   │ tracklist          │
 │ └──────────┘ └──────────┘[+] │   └──────────────────────────────┘   └────────────────────┘
 └──────────────────────────────┘
```

- **Pestañas = formato.** Cada pestaña muestra solo las bandas con al menos un disco en ese formato, con el contador del formato.
- **Tarjeta de banda (grilla, por defecto):** cuadrada, 2 columnas en el celular y más en pantallas anchas. La imagen se elige en este orden: (1) la imagen propia de la banda; (2) un **mosaico 2×2** con las tapas de sus discos de ese formato (1 tapa = tapa completa); (3) una tarjeta **tipográfica** con el nombre grande y un tono derivado de un hash del nombre, dentro de una paleta acotada. Debajo, el nombre en Barlow Condensed y la cantidad de discos.
- **Tarjeta de disco:** tapa cuadrada (o un placeholder con el ícono SVG del formato), con título y copias debajo.
- **Vista lista:** filas compactas con una miniatura de 48px. El toggle cuadrícula/lista se guarda en localStorage.
- **Orden (⇅):** A→Z (por defecto), Z→A, Última compra. En bandas, "última compra" es el `max(fecha_carga)` de sus discos en ese formato. En discos es su `fecha_carga`, de la más reciente a la más vieja. La opción se guarda en localStorage y aplica a las grillas de bandas, de discos y a los resultados de búsqueda. El orden alfabético usa `localeCompare('es', { sensitivity: 'base' })`.
- **Pantalla de banda:** los discos de esa banda en el formato de la pestaña. ✎ abre la edición de la banda. El "+" precarga banda y formato.
- **Detalle de disco:** tapa grande, banda, título, formato, copias, fecha de carga, Spotify, Editar y Borrar. Está pensado para sumar el tracklist en la etapa 2 sin cambiar la navegación.
- **Buscador:** filtra dentro de la pestaña activa y, con texto, muestra directamente los discos que coinciden. Si hay coincidencias en la otra pestaña, muestra el aviso tocable **"También lo tenés en CD (1) →"**, que cambia de pestaña conservando la búsqueda.

### 11. Corrección de bandas
- Pantalla "Editar banda": nombre (se guarda tal cual), imagen (sacar, elegir o quitar) y la lista de discos que tiene en los dos formatos.
- Si el nombre nuevo choca con otra banda: diálogo **"Ya existe «Soda Stereo» (5 discos). ¿Unir las dos?"**. Al confirmar se llama a `fusionar_bandas` y se navega a la banda de destino.
- En la edición de un disco también se puede cambiar su banda (con autocompletado; si la banda no existe, se crea).

### 12. Link a Spotify
- Si el disco tiene `spotify_url`, se usa ese link. Si no, `https://open.spotify.com/search/` + `encodeURIComponent("<banda> <título>")`. En el celular abre la app de Spotify si está instalada.
- En la edición se puede pegar un `spotify_url` opcional. Se valida que el dominio sea `open.spotify.com`.

### 13. Importación
- Se parsea en el cliente. Separador `;` o tabulación. Las líneas vacías se ignoran.
- Formato tolerante: `vinilo | vinil | lp | v` → `vinilo`; `cd | c` → `cd`.
- Se aplica `formatearTitulo()` a banda y título.
- La vista previa clasifica cada línea como: nueva, banda nueva, ya existe en el catálogo, repetida en la lista (se combina con `copias = n`) o inválida (con el motivo).
- Para los duplicados contra el catálogo, la opción por defecto es **omitir**. Hay un toggle "sumarlos como copias".
- La importación no lleva imágenes. Se agregan después desde el detalle.

### 13b. Exportación a CSV
- Se genera en el cliente a partir del catálogo en memoria, así que funciona sin conexión. No hace falta RPC ni Storage.
- Columnas `banda;disco;formato;copias;fecha_carga;spotify_url`. Separador `;` (el de Excel en configuración regional española y el mismo de la importación), BOM UTF-8, fin de línea `\r\n`, fecha `AAAA-MM-DD` (local). Escapado RFC 4180: comillas dobles si el campo tiene `;`, `"` o salto de línea.
- Orden: formato (vinilo, cd), banda y título A→Z con `localeCompare('es')`.
- Entrega: si `navigator.canShare({ files: [archivo] })` responde que sí, se usa `navigator.share` (hoja de compartir del celular). Si no, o si la usuaria cancela por error, se descarga con `<a download>` sobre un `Blob`.
- Nombre: `musica-retro-{todo|vinilos|cds}-AAAA-MM-DD.csv`.
- Ida y vuelta: el parser de importación pasa a aceptar ≥ 3 campos (usa los tres primeros), ignora la primera línea si es el encabezado y respeta los campos entre comillas.
- Dónde: en Ajustes, "Exportar CSV" abre una hoja con Todo / Solo vinilos / Solo CDs y la cantidad de discos de cada opción.

### 14. Identidad visual rock/metal
Tokens en CSS (`@theme` de Tailwind v4 + variables en `:root`, `[data-theme]` y `[data-acento]`):

| Token | Oscuro ("escenario") | Claro ("fanzine") |
|---|---|---|
| fondo | `#0d0c0f` asfalto | `#efe9dd` papel fotocopia |
| superficie | `#18161b` | `#e4dccb` |
| texto | `#ebe5f0` hueso | `#141214` tinta |
| texto-suave | `#9b95a3` | `#5a5450` |
| metal (bordes) | `#3d3942` acero | `#2a2725` |

| Acento | Oscuro: relleno / texto | Claro: relleno / texto |
|---|---|---|
| **violeta "Sabbath"** (default) | `#7a2bd1` / `#b88cff` | `#5b1a9e` / `#5b1a9e` |
| rojo sangre | `#c1121f` / `#ff5c66` | `#a10e19` / `#a10e19` |

- Sobre el relleno de acento, el texto va siempre en blanco o hueso. El "texto de acento" es una variante legible sobre el fondo (AA).
- **Elección de acento:** en Ajustes. Se guarda en `user_metadata` de Supabase (se sincroniza entre dispositivos) y en localStorage (para que se aplique al instante al arrancar). El tema claro/oscuro, en cambio, es **por dispositivo**: sigue `prefers-color-scheme`, con un toggle manual.
- **Tipografía:** *Pirata One* (blackletter legible) **solo** en el logo y los títulos de sección. *Barlow Condensed* en mayúsculas con tracking para etiquetas, pestañas y nombres de banda. *Barlow* para el cuerpo.
- **Lenguaje gráfico (según la referencia):**
  - Fondo: casi negro con una **luz de escenario**, un `radial-gradient` grande y muy tenue del color de acento desde arriba (≈ 12–18% de opacidad en oscuro, ≈ 8% en claro), más un grano de ruido sutil. Cambia con el acento elegido. Es la única "luz" de la interfaz.
  - Superficies: oscuras y semitransparentes sobre la luz, **sin blur** (no es glassmorphism), con **separadores de 1px** en `metal` al 40–60%.
  - Esquinas rectas en tarjetas y tapas (0–2px). Los controles de acción son **circulares y delineados**, como los botones del reproductor de la referencia, incluido el "+" flotante (anillo de acento con relleno al presionar).
  - Íconos SVG propios **de línea** (trazo de 1.5px): vinilo, CD, cámara, galería, orden, grilla/lista, editar, Spotify, atrás.
  - Texto secundario en Barlow **Light/Regular**. Los datos clave (banda, título) en pesos medios.
  - Sin sombras difusas. La profundidad la dan la luz de fondo y los separadores.
- **Bold sin invadir:** el acento solo en la acción primaria, la pestaña activa (subrayado de 3px), los avisos, la selección y la luz de fondo. Nunca como relleno de áreas grandes.
- **Prohibido (anti-plantilla IA):** degradés lineales violeta→azul o violeta→rosa, glassmorphism con blur, `rounded-2xl` en tarjetas, sombras difusas, emojis como íconos, Inter como fuente principal.
- Mobile-first: botón "+" fijo al alcance del pulgar, header (buscador + pestañas) sticky, áreas táctiles ≥ 44px.

### 15. Deploy y keep-alive
- `deploy.yml`: en cada push a `main` corre `npm ci && npm run build` con `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (variables del repo) y después `actions/deploy-pages`. Vite usa `base: '/musica-retro/'`.
- `keepalive.yml`: cron cada 3 días + `workflow_dispatch`. Hace POST a `/rest/v1/rpc/ping` y falla si la respuesta no es 2xx.
- Migrations en `supabase/migrations/*.sql`, aplicadas con Supabase CLI (`supabase db push`) o pegadas en el SQL Editor.

## Risks / Trade-offs

- [GitHub desactiva los workflows programados después de 60 días sin actividad en el repo] → El keep-alive hace un commit de "latido" (`.github/latido`) si el último commit tiene ≥ 50 días. Como es un push con `GITHUB_TOKEN`, no dispara un redeploy. Respaldo: GitHub avisa por mail y se reactiva con un clic.
- [El ping podría no contar como "actividad" para Supabase] → `ping()` ejecuta SQL en la base. Verificarlo en las primeras semanas.
- [La anon key queda visible en el bundle] → Es el diseño previsto por Supabase. RLS bloquea todo para `anon` y los signups están apagados.
- [Las URLs firmadas vencen] → Se regeneran en cada carga con conexión. Sin conexión, el SW sirve la imagen por ruta, sin depender del token.
- [El recorte centrado corta mal una foto torcida] → Hay vista previa y "Otra". El recorte manual queda para más adelante.
- [Fotos pesadas o HEIC en iPhone] → `createImageBitmap` decodifica lo que el navegador soporta (Safari soporta HEIC). Si falla, se muestra un error claro.
- [`formatearTitulo()` adivina mal un nombre] → Se corrige editando, y la corrección se guarda tal cual.
- [La normalización JS y la SQL difieren en casos raros] → La base decide (unique constraint).
- [Los límites de envío de mails de Supabase] → Alcanza para una sola usuaria. Si molesta, se configura un SMTP propio.

## Migration Plan

1. Crear el proyecto en Supabase (región São Paulo o US East).
2. Aplicar las migrations (`supabase db push` o el SQL Editor): extensión, tablas, triggers, RLS, RPC, bucket `imagenes` y policies de Storage.
3. Auth: habilitar el proveedor Email, **deshabilitar signups**, editar el template del magic link para incluir `{{ .Token }}` y configurar Site URL y Redirect URLs con la URL de Pages y `http://localhost:5173`.
4. Invitar a la usuaria desde el dashboard.
5. Crear el repo en GitHub, habilitar Pages (fuente: GitHub Actions) y cargar las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
6. Push a `main` → deploy. Ejecutar el keep-alive a mano una vez.
7. Importar la colección actual y después sumar las tapas desde el celular.

Rollback: es una app nueva sin dependientes. Ante un error en un deploy, se revierte el commit y se redeploya.

## Open Questions

- Nombre y logo de la app ("Música Retro" provisorio).
- ¿Hace falta un recorte manual (arrastrar o hacer zoom) para las fotos de tapas? Queda para después de probar el recorte centrado.
