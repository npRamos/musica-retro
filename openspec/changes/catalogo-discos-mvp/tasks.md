## 1. Setup del proyecto

- [x] 1.1 Inicializar git y crear el proyecto Vite + React en `musica-retro/`, con `base: '/musica-retro/'`
- [x] 1.2 Instalar y configurar Tailwind v4 (`@tailwindcss/vite`), `@supabase/supabase-js`, `vite-plugin-pwa` y Vitest
- [x] 1.3 Crear `.env.example` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) y agregar `.env*` al `.gitignore` (salvo el example)
- [x] 1.4 Crear el cliente Supabase (`src/lib/supabase.js`) leyendo las variables de entorno

## 2. Base de datos (migrations)

- [x] 2.1 Migration inicial: extensión `unaccent`, enum `formato_disco`, tablas `bandas` (con `imagen_path`) y `discos` (con `tapa_path`, `spotify_url`), defaults, checks, FK `on delete restrict` y unique constraints por `owner_id`
- [x] 2.2 Función `normalizar(text)` y triggers BEFORE INSERT/UPDATE que llenan `nombre_norm` y `titulo_norm`
- [x] 2.3 Habilitar RLS y crear policies `owner_id = auth.uid()` para `authenticated` en las dos tablas. Sin acceso para `anon`
- [x] 2.4 RPC `agregar_disco` (busca o crea la banda; devuelve `creado` o `duplicado` con el disco)
- [x] 2.5 RPC `sumar_copia(p_disco, p_cantidad)` atómica
- [x] 2.6 RPC `importar_discos(p_items jsonb, p_duplicados)` transaccional con resumen
- [x] 2.7 RPC `renombrar_banda` (devuelve `ok` o `conflicto`) y `fusionar_bandas` (mueve discos, suma copias en los choques, borra el origen, devuelve las rutas huérfanas)
- [x] 2.8 RPC `ping()` con grant a `anon`
- [x] 2.9 Bucket privado `imagenes` y policies de `storage.objects` por carpeta `<uid>/`
- [ ] 2.10 Aplicar las migrations en el proyecto Supabase y verificar con SQL que `anon` no lee filas ni imágenes y que una alta duplicada devuelve `duplicado`

## 3. Utilidades puras (con tests)

- [x] 3.1 `normalizar()`, espejo de la SQL (mayúsculas, tildes, espacios)
- [x] 3.2 `formatearTitulo()`: palabras capitalizadas, conectores en minúscula, siglas respetadas, todo-mayúsculas formateado
- [x] 3.3 Ordenamiento: A→Z / Z→A con `localeCompare('es')` y última compra (máx `fecha_carga` por banda y formato)
- [x] 3.4 Agrupación por pestaña: bandas con discos en un formato, contadores, mosaico de tapas
- [x] 3.5 Búsqueda: coincidencias en la pestaña activa + conteo en el otro formato
- [x] 3.6 Link de Spotify (guardado o búsqueda) y validación de `open.spotify.com`
- [x] 3.7 Parser de importación: separador `;` o tabulación, alias de formato, líneas inválidas con motivo, repetidas combinadas, clasificación contra el catálogo

## 4. Identidad visual (base)

- [x] 4.1 Tokens de color: temas "escenario" y "fanzine" × acentos violeta "Sabbath" y rojo sangre, con `@theme`, `[data-theme]` y `[data-acento]`. Verificar contraste AA
- [x] 4.2 Fondo con luz de escenario (radial tenue del acento) + grano sutil; superficies semitransparentes sin blur y separadores de 1px
- [x] 4.3 Pirata One, Barlow Condensed y Barlow (Light/Regular/Medium) desde Google Fonts con `display=swap`; clases tipográficas
- [x] 4.4 Set de íconos SVG de línea (vinilo, CD, cámara, galería, orden, grilla, lista, editar, Spotify, atrás, ajustes, buscar, más)
- [x] 4.5 Componentes base: botón primario, botón circular delineado, FAB "+", input, pestañas con subrayado, banner, diálogo de confirmación, hoja de selección (menú de orden)
- [x] 4.6 Preferencias: tema por dispositivo (sistema → manual) y acento sincronizado en `user_metadata` + localStorage, aplicados antes del primer pintado

## 5. Acceso

- [x] 5.1 Pantalla de ingreso: mail → `signInWithOtp` con `shouldCreateUser: false` y `emailRedirectTo`
- [x] 5.2 Paso de código: 6 dígitos → `verifyOtp({ type: 'email' })`, con errores y "reenviar mail"
- [x] 5.3 Manejo de sesión: detectar la sesión al volver del magic link y `onAuthStateChange`; proteger la app
- [x] 5.4 Cerrar sesión: `signOut` + borrar la caché local de datos e imágenes

## 6. Datos, sincronización y offline

- [x] 6.1 Módulo de catálogo: cargar bandas y discos, y generar las URLs firmadas de todas las imágenes en una llamada
- [x] 6.2 Caché en localStorage (`{ datos, urls, actualizadoEn }`): mostrar la caché al abrir y refrescar después; try/catch
- [x] 6.3 Estado de conexión (`navigator.onLine` + fallo al refrescar), banner "Sin conexión · datos del <fecha>" y bloqueo de las escrituras
- [x] 6.4 Precarga en segundo plano de todas las imágenes no cacheadas (de a 4) y limpieza de las huérfanas
- [x] 6.5 `navigator.storage.persist()` al iniciar sesión

## 7. Imágenes

- [x] 7.1 Selector de imagen: "Sacar foto" (`capture="environment"`) y "Elegir de galería"
- [x] 7.2 Procesamiento: `createImageBitmap` → recorte cuadrado centrado → 800×800 → WebP 0.82 (JPEG si no hay WebP), con vista previa "Usar" / "Otra"
- [x] 7.3 Subida a `imagenes/<uid>/{discos|bandas}/<id>.<ext>` con upsert, guardando la ruta con versión para cache-busting; borrado al quitar
- [x] 7.4 Componente de imagen con placeholder (ícono de formato o tarjeta tipográfica) y carga diferida

## 8. Consulta (navegación estilo álbumes)

- [x] 8.1 Router de hash mínimo con las rutas del design y el botón atrás funcionando
- [x] 8.2 Header sticky: logo, buscador, pestañas "Vinilos N" / "CDs M", toggle cuadrícula/lista, menú de orden y acceso a Ajustes; pestaña, vista y orden persistidos
- [x] 8.3 Tarjeta de banda (imagen propia → mosaico 2×2 de tapas → tipográfica) y fila de banda con miniatura
- [x] 8.4 Grilla de bandas por pestaña (2 columnas en el celular, más en pantallas anchas) con el orden elegido
- [x] 8.5 Pantalla de banda: discos de ese formato en cuadrícula o lista con el orden elegido; ✎ editar banda; "+" con banda y formato precargados
- [x] 8.6 Detalle de disco: tapa grande, datos, Escuchar en Spotify, Editar, Borrar
- [x] 8.7 Buscador: discos coincidentes en la pestaña activa, aviso "También lo tenés en <formato> (N)" que cambia de pestaña, "No lo tenés" con "Agregarlo" precargado
- [x] 8.8 Pantalla de Ajustes: tema, acento, cerrar sesión, ir a Importar

## 9. Alta, edición y corrección

- [x] 9.1 Formulario de alta: banda con autocompletado, título, formato, copias (default 1) y tapa opcional; `formatearTitulo()` al crear
- [x] 9.2 Guardar con `agregar_disco` (+ subida de la tapa). Ante `duplicado`, diálogo "Ya lo tenés (N copias)" con "Sumar copia" / "Cancelar"
- [x] 9.3 Edición de disco: título, banda (con autocompletado y creación), formato, copias ≥ 1, tapa y Spotify. Se guarda tal cual lo escrito; ante `23505`, aviso con acceso al existente
- [x] 9.4 Borrar un disco con confirmación (+ borrar la tapa)
- [x] 9.5 Edición de banda: nombre (tal cual), imagen (sacar, elegir o quitar); ante un conflicto, diálogo "¿Unir?" → `fusionar_bandas` → borrar las imágenes huérfanas → navegar al destino
- [x] 9.6 Actualizar el catálogo en memoria, la caché y las URLs después de cada escritura
- [x] 9.7 FAB "+" deshabilitado sin conexión

## 10. Importación

- [x] 10.1 Pantalla Importar: textarea, vista previa por línea, resumen de totales y toggle "Sumar duplicados como copias" (apagado por defecto)
- [x] 10.2 Confirmar → `importar_discos`; resumen al terminar o error conservando el texto; refrescar el catálogo

## 11. PWA

- [x] 11.1 Configurar `vite-plugin-pwa`: manifest (nombre, colores, íconos), precache del shell y runtime caching de Storage con una clave sin `token`
- [x] 11.2 Íconos de la app (192/512 + maskable) con la estética del proyecto

## 12. Operación

- [x] 12.1 Workflow `deploy.yml`: build con las variables del repo y `actions/deploy-pages` en cada push a `main`
- [x] 12.2 Workflow `keepalive.yml`: cron cada 3 días + `workflow_dispatch`, POST a `/rest/v1/rpc/ping`, que falla si la respuesta no es 2xx
- [x] 12.3 README: setup de Supabase (migrations, Auth con signups off, template con `{{ .Token }}`, Site/Redirect URLs, invitar a la usuaria), setup de Pages y variables, desarrollo local y cómo reactivar el keep-alive
- [ ] 12.4 Configurar Supabase y GitHub según el README, hacer el primer deploy y correr el keep-alive a mano

## 13. Exportación a CSV

- [ ] 13.1 `generarCsv(discos, bandasPorId, alcance)` en `src/lib/exportar.js`: encabezado, orden, escapado RFC 4180, BOM, `\r\n`, fechas `AAAA-MM-DD`; con tests
- [ ] 13.2 Parser de importación: aceptar ≥ 3 campos, ignorar el encabezado y respetar comillas; tests de ida y vuelta (exportar → importar)
- [ ] 13.3 Entrega: `navigator.share` con archivo si `canShare` lo permite; si no, descarga con `<a download>`; nombre `musica-retro-{alcance}-AAAA-MM-DD.csv`
- [ ] 13.4 Ajustes: "Exportar CSV" con una hoja Todo / Solo vinilos / Solo CDs y sus cantidades; disponible también sin conexión

## 14. Verificación final

- [ ] 14.1 Probar en el celular: login con código, alta con foto, duplicado → sumar copia, mismo disco en otro formato, edición, borrado, corrección y unión de bandas
- [ ] 14.2 Probar el modo avión: abrir desde el ícono, ver las tapas (también de bandas no visitadas), buscar, escrituras deshabilitadas
- [ ] 14.3 Revisión visual en los dos temas y los dos acentos a 360px: sin scroll horizontal, áreas táctiles ≥ 44px, blackletter solo en títulos, nombres largos
- [ ] 14.4 Recorrido pestaña → banda → disco → atrás → atrás; cuadrícula/lista y orden persistidos
- [ ] 14.5 Importar la colección real y revisar los totales
- [ ] 14.6 Exportar a CSV desde el celular (compartir) y desde la compu (descarga), abrirlo en una planilla y reimportarlo
