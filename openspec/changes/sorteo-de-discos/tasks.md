## 1. Lógica del sorteo

- [x] 1.1 `src/lib/sorteo.js`: `armarBombo(discos, bandasPorId, { formato, generos })`, que filtra por formato y por géneros (O; bandas sin géneros afuera si hay filtro) y agrupa por `banda_id` + `titulo_norm` en bolas con sus discos
- [x] 1.2 `contarGeneros(...)`: géneros presentes en el formato elegido con la cantidad de bolas, de mayor a menor; `sinGenero`: bolas que quedan afuera por no tener géneros
- [x] 1.3 `elegir(bolas, salidas, azar)`: elección uniforme entre las que no salieron, con `crypto.getRandomValues` por defecto y azar inyectable
- [x] 1.4 Ronda y resultado en memoria del módulo: se reinician al cambiar los filtros y sobreviven a ir al detalle y volver
- [x] 1.5 Tests: formato, géneros (O, sin géneros), mismo disco en dos formatos = una bola, copias no cuentan, sin repetir, agotado, cambio de filtros

## 2. Preferencias, ícono y ruta

- [x] 2.1 `preferencias.js`: `sorteoFormato` (`todos`) y `sorteoGeneros` (`[]`)
- [x] 2.2 `IconoDado` de línea en `Iconos.jsx`
- [x] 2.3 Ruta `#/sorteo` en `App.jsx`; `claveDe` la reconoce como pantalla hija del inicio

## 3. Pantalla de sorteo

- [x] 3.1 `Sorteo.jsx`: encabezado "Sorteo", filtros (segmentado de formato, chips de género multiselección con cantidad, "Ver todos (N)" si son muchos) y cantidad de discos que entran
- [x] 3.2 Avisos: "N discos sin género no entran" con salto a "Completar géneros", y "No hay discos con esos filtros" con "Sortear" deshabilitado
- [x] 3.3 Resultado: tapa (o placeholder de formato), banda, título, año, badges de formato y géneros; acciones "Escuchar en Spotify" (primaria, `linkSpotify`), "Ver disco" (el vinilo si hay dos) y "Otro"
- [x] 3.4 Filtros plegados en un resumen de una línea mientras hay resultado; tocarlo los despliega
- [x] 3.5 "Ya salieron los N" con "Empezar de nuevo"
- [x] 3.6 `Revelacion({ bombo, elegida, alTerminar, children })`: fundido de ~250 ms, sin transición con `prefers-reduced-motion`, acciones deshabilitadas mientras dura

## 4. Barra de la lista

- [x] 4.1 `BarraLista` en `ui.jsx`: botón "cantidad · orden ▾" y `BotonCirculo` de vista, no fija, áreas táctiles ≥ 44px
- [x] 4.2 `Inicio`: encabezado con título, "Sortear un disco" y Ajustes; barra con "N bandas" / "N discos" / "N resultados", que abre la hoja Mostrar y Ordenar existente; aviso de otro formato debajo de la barra
- [x] 4.3 `Banda`: encabezado con "Editar banda" y subtítulo con el formato; barra con "N discos · orden ▾" (hoja Ordenar existente) y vista
- [ ] 4.4 Verificar en 360px que "Música Retro" se lee completo y que no hay scroll horizontal

## 5. Verificación

- [x] 5.1 `npm test` y `npm run build` sin errores
- [ ] 5.2 Probar en el celular: sortear con y sin filtros, "Otro" hasta agotar, ver el disco y volver, Spotify, sin conexión, atrás desde el sorteo
- [ ] 5.3 Sincronizar las specs y archivar el change (después de archivar `generos-de-bandas`)
