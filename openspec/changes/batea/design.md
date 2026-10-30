## Context

Es el tercero de tres cambios: `generos-de-bandas` → `sorteo-de-discos` → **`batea`**. Los dos primeros ya están archivados.

`Sorteo.jsx` delega la transición en `Revelacion({ bombo, elegida, activa, alTerminar, children })`:
- la bola elegida se sortea **antes** de animar;
- `activa` es verdadero solo justo después de sortear (al volver del detalle, el resultado se muestra quieto);
- mientras dura, las acciones del resultado están deshabilitadas.

Las tapas se muestran con `Imagen`, a partir de URLs firmadas que el service worker guarda en caché (`urls[ruta]` de `useCatalogo`). Funcionan sin conexión.

Restricciones de identidad visual:
- sin sombras difusas;
- sin degradés lineales violeta→azul o violeta→rosa;
- fondo casi negro con una luz de acento;
- bordes finos.

Muchas tapas de metal son negras: sobre el fondo, la animación puede no notarse.

## Goals / Non-Goals

**Goals:**
- Una animación que se sienta como hojear una batea y sacar un disco, de unos 3 a 4 segundos, fluida en un celular de gama media.
- Que se lea en tema oscuro y claro, también con tapas negras o sin tapa.
- Que se pueda saltar, silenciar, y que respete el movimiento reducido.
- No tocar la lógica del sorteo: misma bola elegida, misma ronda.

**Non-Goals:**
- Vibración.
- Separador con el género en la batea.
- Sonidos grabados.
- Rockola en forma de carrusel.
- Animar otras pantallas.

## Decisions

### 1. Componente `Batea` en lugar de `Revelacion`
`Batea({ bombo, elegida, activa, alTerminar, children })` dibuja el **escenario** y, debajo, `children`: los datos y las acciones, sin la tapa, que ahora está en el escenario.

| Estado | Escenario | `children` |
|---|---|---|
| `activa` | animación completa | ocultos (`invisible`, para no saltar el layout) |
| al terminar | composición final, girando | aparecen con el fundido actual |
| `!activa` (volver del detalle) | composición final, girando | visibles |
| movimiento reducido | composición final, quieta | visibles |

### 2. Fase 1: hojear (~2,7 s)
```
  perspectiva 900px, origen abajo
  ═══════════════════  ← 4 bordes superiores de los discos de atrás (líneas finas, cada vez más tenues)
  ┌─────────────────┐
  │   funda frente  │  rotateX 0 → -80° (cae hacia la usuaria), brillo 1 → 0,35
  │                 │  la siguiente, detrás: translateY 6px → 0, brillo 0,55 → 1
  └─────────────────┘
 ▕▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▏ ← frente de la batea: tapa el 18% de abajo de las fundas;
                         relleno del fondo y borde en color metal
```
- **Secuencia:** `secuenciaBatea(bombo, elegida, azar, largo = 16)` en `sorteo.js`.
  - Elige bolas al azar del bombo, primero las que tienen tapa, y si hacen falta repite para completar `largo - 1`.
  - Evita la misma bola dos veces seguidas cuando hay más de una.
  - Termina siempre con la elegida.
  - Con un bombo de 1 bola, la secuencia es solo la elegida y se pasa directo al final.
- **Tiempos:** `tiemposBatea(n)` da la duración de cada caída, de 60 ms a 400 ms con una curva `t^2,2`, que frena al final. Para las 15 caídas de una secuencia de 16 suma unos 2,7 s.
- **Fundas en el DOM:** solo hay 3 (frente, siguiente, fondo) y se reciclan. Las tapas de la secuencia se **precargan** (`new Image()` + `decode()`) antes de arrancar, con un tope de 600 ms: si alguna no llegó, se arranca igual y queda el placeholder.
- **Animación:** con la API de animaciones del navegador (`element.animate`), con `transform` y `filter: brightness()`, que se componen bien. Cada caída encadena la siguiente con `finished`.
- **Contraste:**
  - Cada funda tiene un borde de 1px en `color-mix(in srgb, var(--texto) 28%, transparent)`.
  - La elegida, cuando queda al frente, cambia a borde de acento.
  - La luz de acento del fondo queda detrás de la batea, porque el escenario no tiene fondo propio.
  - Los bordes de los discos de atrás son líneas de 1px en `--texto` con opacidad 0,35 → 0,1.
- **En tema claro** valen los mismos tokens: el borde usa `--texto`, que es oscuro en ese tema.

### 3. Fase 2: final de rockola (~1 s)
```
  ┌───────────┐                 ┌───────────┐
  │   TAPA    │       →         │   TAPA    │◎◎◎◎
  │           │                 │           │◎ ◉ ◎  ← vinilo asomado ~40%, gira 33⅓ (1,8 s por vuelta)
  └───────────┘                 └───────────┘◎◎◎◎
  sube 24px, la batea se desvanece      etiqueta central = la tapa recortada en círculo
```
1. La funda elegida sube y crece apenas (escala 1,04). Los bordes de atrás y el frente de la batea se desvanecen.
2. El disco sale hacia la derecha, desde atrás de la funda, hasta asomar un 40%, y empieza a girar.
   - **Vinilo:** círculo `#0b0a0c` con surcos (`repeating-radial-gradient` de líneas de 1px en `--texto` al 12%, gris sobre negro), un brillo diagonal tenue que gira con el disco, y en el centro la tapa recortada en círculo como etiqueta, con su agujero.
   - **CD:** disco plateado (`conic-gradient` de grises, sin violeta ni azul), centro transparente con aro. Gira una vuelta rápida y frena.
   - Si la bola tiene vinilo y CD, se muestra el vinilo.
3. Golpe suave de sonido. Aparecen los datos y se llama a `alTerminar`.

En la composición final, para que el vinilo asomado entre en 360px, la funda ocupa el 62% del ancho. El vinilo **sigue girando** mientras se ve el resultado, con una animación CSS infinita, que es barata. Con movimiento reducido no gira.

### 4. Sonido: Web Audio, sin archivos
`src/lib/sonido.js`:
- `crearSonido()` crea un `AudioContext` la primera vez, dentro del toque en "Sortear" u "Otro", que es un gesto de la usuaria.
- `clac(intensidad)` es un ruido blanco de ~15 ms por un filtro pasabanda de ~2,2 kHz, con una envolvente corta. Su volumen baja un poco a medida que la batea frena.
- `golpe()` es un seno de 90 Hz de ~140 ms, para cuando el disco cae en el plato.
- Si no hay `AudioContext` o falla, no suena y no pasa nada.

La preferencia `sorteoSonido` está activada por defecto y se cambia con un `BotonCirculo` en el encabezado del sorteo, con los íconos de sonido y silencio. En iPhone, la llave de silencio también lo calla; está bien.

### 5. Saltar
Mientras anima, el escenario es un botón ("Tocá para saltar", con un texto chico debajo). Al tocarlo:
- se cancelan las animaciones en curso;
- se pasa directo a la composición final, sin golpe de sonido;
- se llama a `alTerminar`.

"Otro" con una animación en curso no aplica, porque las acciones están deshabilitadas.

### 6. Movimiento reducido
`matchMedia('(prefers-reduced-motion: reduce)')`: composición final quieta, sin sonido, `alTerminar` enseguida. Es lo mismo que hoy, cambiando la tapa por la composición.

**Alternativas descartadas:**
- **Canvas o WebGL:** más control, pero más código y peor accesibilidad. Con 3 fundas recicladas, el DOM con transforms alcanza.
- **Una librería de animaciones** (GSAP, Motion): suma peso al bundle para algo que la API del navegador resuelve.
- **Carrusel de rockola:** se eligió la batea para la búsqueda y la rockola solo para el final.

## Risks / Trade-offs

- [Fluidez en celulares modestos] → Solo se anima `transform` y `filter` en 3 elementos, con `will-change` durante la animación. Probarlo en el celular real.
- [Las tapas tardan en cargar y se ve el placeholder] → Precarga con tope de 600 ms. Las tapas ya suelen estar en la caché del service worker.
- [El sonido molesta] → Se silencia y se recuerda. Con movimiento reducido no suena.
- [Bombos chicos: con 2 o 3 discos la secuencia repite tapas] → Se nota que es la misma batea. Aceptado; con 1 disco se va directo al final.
- [`filter` y 3D en Safari] → Si se ve mal, se cambia el brillo por una capa negra con opacidad.

## Migration Plan

Sin migraciones. Deploy normal. Rollback: revertir el commit (vuelve el fundido).

## Open Questions

- Los tiempos finos (70 a 450 ms, 16 caídas) y el volumen se ajustan probando en el celular.
