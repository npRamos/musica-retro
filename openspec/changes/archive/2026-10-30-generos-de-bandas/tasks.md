## 1. Base de datos

- [x] 1.1 Migration `20261101000000_generos.sql`: `bandas.generos text[] not null default '{}'` con `check (cardinality(generos) <= 3)` y `bandas.generos_estado` (`pendiente` | `listo`, por defecto `pendiente`)
- [x] 1.2 `fusionar_bandas` a partir de la versión de `20261030000000_logos.sql`: el destino conserva sus géneros si está `listo`; si no, hereda géneros y estado del origen
- [x] 1.3 Probar la migration en un Postgres descartable (incluida la unión con géneros) y aplicarla en Supabase

## 2. Reglas de géneros

- [x] 2.1 `elegirGeneros(genres)` en `discografia.js`: descarta votos ≤ 0, ordena por votos y nombre, propone hasta 3 con ≥ 20% de los votos del primero y devuelve la lista completa (hasta 8)
- [x] 2.2 `src/lib/generos.js`: limpiar un género escrito, resolverlo contra los géneros existentes del catálogo (forma existente si coincide normalizado), agregar sin repetir y con máximo 3, y sugerencias del catálogo con cantidad de bandas para un texto
- [x] 2.3 Tests de 2.1 (Megadeth y La Renga, sin géneros, votos negativos) y de 2.2

## 3. Cliente de MusicBrainz

- [x] 3.1 `generosDeArtista(mbid)`: `artist/<mbid>?inc=genres` por la cola, devuelve `[{ nombre, votos }]`
- [x] 3.2 Tests con respuestas guardadas de Megadeth y La Renga

## 4. Datos en el cliente

- [x] 4.1 `catalogoContexto`: sumar `generos, generos_estado` al select de bandas (llega a la caché offline)
- [x] 4.2 `cambiarGenerosBanda(banda, generos)`: escribe los géneros y pasa la banda a `listo`
- [x] 4.3 `enlazarBanda(banda, mbid)`: escribe `mbid` y dispara `buscarLogoSiFalta`
- [x] 4.4 `buscarGenerosSiFalta(banda, mbid)`: solo bandas `pendiente`, con guarda en memoria, en silencio. Guarda los propuestos si hay; si no, deja `pendiente`. Llamarla junto a cada `buscarLogoSiFalta` (alta, sumar copia, completar disco)

## 5. Editor de géneros

- [x] 5.1 Componente de chips con ✕ y campo "Agregar género" con sugerencias (catálogo con cantidad, géneros de MusicBrainz si los hay, "Agregar «texto»"); deshabilitado con 3 y aviso "Máximo 3"
- [x] 5.2 Respetar la identidad visual: chips con la clase `etiqueta`, borde fino, sin sombras ni emojis, áreas táctiles de 44px

## 6. Completar géneros

- [x] 6.1 Ruta `#/generos` en `App.jsx` y entrada en Ajustes con la cantidad de bandas pendientes (deshabilitada sin conexión o sin pendientes)
- [x] 6.2 Pantalla `CompletarGeneros.jsx`: cola alfabética de bandas `pendiente` armada al entrar, contador "n de N", aviso sin conexión, pantalla final "Listo", sincronizar al salir; saltear bandas borradas o unidas mientras tanto
- [x] 6.3 Paso artista para bandas sin `mbid`: candidato con `elegirArtista(buscarArtistas(nombre))`, acciones Sí / Otra / No está / Saltar; "Otra" con la lista de resultados y campo de búsqueda; sin candidato, directo a la lista
- [x] 6.4 Paso géneros: propuestos marcados, resto activables, editor de 5.1, Guardar (vale con 0) / Saltar
- [x] 6.5 Prefetch de los géneros de la banda siguiente si está enlazada

## 7. Editar banda y pantalla de banda

- [x] 7.1 `EditarBanda`: sección "Géneros" con el editor y "Traer de MusicBrainz" (si tiene `mbid`), que suma sugerencias sin reemplazar; guardar solo si cambiaron
- [x] 7.2 `Banda`: fila de chips bajo el encabezado, oculta si no hay géneros

## 8. Verificación

- [x] 8.1 `npm test` y `npm run build` sin errores
- [x] 8.2 Probar en el celular: alta con banda nueva de MusicBrainz (géneros automáticos), recorrer "Completar géneros" con una banda enlazada, una sin enlazar y una que no está, editar géneros, ver la banda sin conexión
- [x] 8.3 Sincronizar las specs y archivar el change

## 9. Agrupar y ordenar por género

- [x] 9.1 `catalogo.js`: orden `genero` (primer género de la banda, sin géneros al final) en `ordenarBandas` y `ordenarDiscos`; la pantalla de banda no lo ofrece; `agruparPorGenero` en secciones alfabéticas con "Sin género" al final; tests
- [x] 9.2 `Inicio`: "Por género" en Mostrar, con secciones (nombre y cantidad) y la banda en cada uno de sus géneros
