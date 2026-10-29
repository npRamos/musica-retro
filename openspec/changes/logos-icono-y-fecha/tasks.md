## 1. Ícono de la app

- [x] 1.1 `public/icono.svg`: vinilo sobre vidrio líquido violeta (gradiente radial, manchas difusas, reflejo y sombra del disco)
- [x] 1.2 Exportar `icono-192.png`, `icono-512.png` e `icono-maskable-512.png` (disco dentro de la zona segura) con Inkscape
- [ ] 1.3 Verificar en el celular el acceso directo (normal y recortado en círculo en Android)

## 2. Fecha de carga

- [x] 2.1 `FormDisco` (edición): sección plegada "Más datos" con `input type="date"` precargado con la fecha local de `fecha_carga`
- [x] 2.2 Validar que no sea futura; guardar a las 12:00 local y solo si cambió (`actualizarDisco` acepta `fecha_carga`)
- [x] 2.3 Test de la conversión fecha local ↔ `timestamptz` (sin correrse de día)

## 3. Base de datos

- [x] 3.1 Migration: `bandas.logo_path`, `bandas.logo_invertir`, `bandas.logo_buscado_en`; `image/png` en `allowed_mime_types` del bucket
- [x] 3.2 `fusionar_bandas`: el destino conserva su logo o hereda el del origen; el que sobra vuelve como huérfano
- [x] 3.3 Probar la migration en un Postgres descartable y aplicarla en Supabase

## 4. Buscar y procesar logos

- [x] 4.1 Cliente: `logoDeArtista(mbid)`: MusicBrainz `inc=url-rels` (en la cola) → Wikidata P154 (rango preferido o el primero) → Commons `Special:FilePath?width=600` como `Blob`; `null` si no hay
- [x] 4.2 `procesarLogo(blob)`: hasta 600 px sin recorte, WebP con alfa o PNG; marcar `invertir` si es oscuro (luminancia media < 0,35) y tiene transparencia
- [x] 4.3 Tests del cliente con respuestas reales guardadas (Iron Maiden con logo, Sumo sin logo)

## 5. Datos en el cliente

- [x] 5.1 `catalogoContexto`: sumar `logo_path, logo_invertir, logo_buscado_en` al select y firmar `logo_path` con las demás imágenes (caché offline)
- [x] 5.2 `cambiarLogoBanda(banda, blob | null)`: sube, reemplaza o quita, borra el anterior y marca `logo_buscado_en`
- [x] 5.3 Búsqueda automática después de enlazar una banda (alta con MusicBrainz, completar un disco o pendientes) si no tiene `logo_buscado_en`; en silencio y sin bloquear

## 6. Interfaz

- [x] 6.1 `PortadaBanda`: imagen propia → logo sobre mosaico oscurecido o tono oscuro → mosaico → tipográfica; `invert(1)` solo si `logo_invertir`
- [x] 6.2 Vista lista: miniatura con logo sobre el tono cuando no hay imagen propia
- [x] 6.3 `EditarBanda`: sección "Logo" con vista previa, "Buscar en Wikidata" (si tiene `mbid`), "Elegir archivo" y "Quitar"

## 7. Agrupar por banda o ver todos los discos

- [x] 7.1 Preferencia `agrupar` (`bandas` por defecto) y `ordenarDiscos` A→Z por banda, año y título (con tests)
- [x] 7.2 Hoja "Orden y vista" con los grupos Mostrar y Ordenar
- [x] 7.3 `Inicio`: vista "Todos los discos" con tarjetas de disco y nombre de banda, en cuadrícula o lista

## 8. Verificación

- [x] 8.1 `npm test` y `npm run build` sin errores
- [ ] 8.2 En el celular: completar un disco de Iron Maiden y ver el logo en la grilla en los dos temas; banda sin logo igual que antes; logo propio; quitar logo
- [ ] 8.3 Corregir la fecha de carga de un disco importado y verificar "Última compra"
- [ ] 8.4 Alternar entre "Por banda" y "Todos los discos" en las dos pestañas y con los tres órdenes
