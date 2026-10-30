## Why

A veces no sabemos qué escuchar de lo que tenemos. Un sorteo entre los discos de la colección, por formato y por género, propone uno y lo vuelve a tirar si no convence: es una forma divertida de redescubrir la colección. Para darle un lugar, además hay que ordenar el encabezado del inicio. Hoy mezcla acciones de la app (ajustes) con controles de la lista (orden y vista), y no hay lugar para un cuarto botón en 360px.

## What Changes

- **Sorteo de discos** (pantalla nueva `#/sorteo`):
  - Filtros por formato (Todos, Vinilos o CDs) y por uno o más géneros. Se recuerdan en el dispositivo.
  - Sortea un disco al azar. Si se tiene en vinilo y en CD, cuenta una sola vez.
  - Muestra la tapa, la banda, el título, el año, los formatos y los géneros.
  - Acciones: "Escuchar en Spotify", "Ver disco" y "Otro". "Otro" no repite discos ya salidos hasta que se agotan.
  - Funciona sin conexión.
  - La revelación es un fundido breve. La animación de la batea llega en el change `batea`.
- **Encabezados por nivel:**
  - El encabezado del inicio queda con las acciones de la app: el título, **Sortear** y Ajustes.
  - Orden y vista bajan a una **barra de la lista**, debajo de las pestañas. La barra no es fija y muestra la cantidad (bandas, discos o resultados), el orden actual (abre la hoja de Mostrar y Ordenar) y el cambio entre cuadrícula y lista.
  - En la pantalla de una banda pasa lo mismo: el encabezado se queda con "Editar banda" y la barra tiene la cantidad de discos, el orden y la vista.
- **Navegación:** el sorteo cuelga del inicio. Abrir el disco sorteado es un salto lateral y atrás vuelve al sorteo con el mismo resultado.

## Capabilities

### New Capabilities
- `sorteo`: sortear un disco de la colección con filtros de formato y género, volver a sortear sin repetir, acciones sobre el resultado y funcionamiento sin conexión.

### Modified Capabilities
- `consulta`: los controles de orden y vista pasan a una barra de la lista (nuevo requisito "Barra de la lista"). "Navegación jerárquica" suma la pantalla de sorteo y el salto lateral al disco sorteado.

## Impact

- **Código:**
  - pantalla nueva `src/pantallas/Sorteo.jsx`;
  - `src/lib/sorteo.js` (armar la lista para sortear, contar géneros, elegir al azar, ronda sin repetir), con tests;
  - componente `BarraLista` en `ui.jsx`;
  - cambios en `Inicio.jsx`, `Banda.jsx`, `App.jsx` (ruta), `preferencias.js` (filtros del sorteo) e `Iconos.jsx` (ícono de dado).
- **Base:** sin cambios. Usa `bandas.generos` de `generos-de-bandas`.
- **Depende de `generos-de-bandas`:** hay que archivar ese change antes que este.
- **Prepara `batea`,** que reemplaza la revelación por la animación de hojear discos.
