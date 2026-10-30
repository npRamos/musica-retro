## Context

Es el segundo de tres cambios: `generos-de-bandas` → **`sorteo-de-discos`** → `batea`.

- Después de `generos-de-bandas`, cada banda tiene `generos text[]` (0 a 3).
- El catálogo completo, con tapas, está en memoria y en la caché offline (`useCatalogo`): el sorteo no necesita la red.
- La colección hoy: 77 discos y ~55 bandas, con algunos discos en vinilo y en CD.

Encabezado actual del inicio: título, orden (hoja Mostrar y Ordenar), vista (cuadrícula o lista) y Ajustes, en una sola fila fija. En 360px, el título ya se recorta con 3 botones. La pantalla de banda usa `Encabezado` con las acciones orden, vista y Editar banda.

## Goals / Non-Goals

**Goals:**
- Que sortear sea rápido y esté a un toque desde el inicio, con o sin conexión.
- Que "Otro" se sienta justo: no repite hasta agotar.
- Separar las acciones de la app (encabezado) de los controles de la lista (barra), en el inicio y en la banda.
- Dejar una interfaz clara para que `batea` cambie la revelación sin tocar la lógica.

**Non-Goals:**
- La animación de la batea, el sonido y la vibración (`batea`).
- Ponderar el azar (por fecha de compra, por lo menos escuchado, etc.) o llevar un historial de lo escuchado.
- Filtrar la grilla del inicio por género.
- Sortear por banda en lugar de por disco.

## Decisions

### 1. Qué se sortea: álbumes, no ítems
`armarBombo(discos, bandasPorId, { formato, generos })` en `src/lib/sorteo.js`:
1. Filtra los discos por formato (`todos`, `vinilo` o `cd`).
2. Si hay géneros elegidos, deja los discos cuya banda tenga **alguno** de ellos (O). Las bandas sin géneros quedan afuera.
3. Agrupa por `banda_id` + `titulo_norm`. Cada grupo es una **bola** con sus discos (uno por formato).

Así, "Signos" en vinilo y en CD es una sola bola: no tiene el doble de chances. Las copias no cuentan.

**Alternativa descartada: sortear ítems tal cual.** Es más simple, pero premia los discos repetidos en dos formatos, que es justo lo que no queremos.

### 2. Azar uniforme y ronda sin repetir
- `elegir(bolas, salidas)` toma una bola al azar entre las que no salieron, con `crypto.getRandomValues`. El azar es inyectable para los tests.
- La **ronda** es el conjunto de bolas que ya salieron con estos filtros.
- "Otro" suma la actual a la ronda y elige de las que quedan.
- Si no queda ninguna: "Ya salieron los N" y "Empezar de nuevo", que vacía la ronda.
- Cambiar un filtro empieza una ronda nueva y borra el resultado.
- La ronda y el resultado viven **en memoria del módulo** (no en React), así que sobreviven a ir al detalle y volver. Recargar la app empieza de cero, y está bien.

**Alternativa descartada: barajar todo al entrar y recorrer la lista.** Es equivalente, pero cambiar filtros obliga a rebarajar. Elegir entre las que no salieron es igual de simple y más directo.

### 3. Pantalla de sorteo
Una sola pantalla con dos zonas:

```
┌──────────────────────────────┐
│ ←  Sorteo                    │   Encabezado (display: es un título de sección)
├──────────────────────────────┤
│ FORMATO [Todos|Vinilos|CDs]  │   Segmentado existente
│ GÉNERO  [thrash metal 12]    │   chips multiselección, con cantidad de discos
│         [heavy metal 9] […]  │   dentro del formato elegido; ninguno = todos
│ 34 discos                    │
├──────────────────────────────┤
│        ┌──────────┐          │
│        │   TAPA   │          │   resultado (o un lugar vacío antes de sortear)
│        └──────────┘          │
│  Megadeth                    │
│  Rust in Peace · 1990        │
│  [CD] · thrash metal         │
│ [▶ Escuchar en Spotify]      │
│ [Ver disco]       [↻ Otro]   │
└──────────────────────────────┘
```

- **Antes de sortear:** el lugar del resultado muestra el botón grande "Sortear".
- **Con resultado,** los filtros se pliegan en un resumen de una línea ("CDs · thrash metal · 34 discos ▾") para que la tapa y las acciones entren sin scroll en 360px. Al tocarlo se despliegan.
- **Chips de género:** solo aparecen los géneros presentes en los discos del formato elegido, ordenados por cantidad. Si un género elegido deja de existir, se descarta.
- **Discos sin género:** si hay géneros elegidos y quedan discos afuera porque su banda no tiene géneros, se muestra "N discos sin género no entran" con un enlace a "Completar géneros".
- **Sin discos que cumplan los filtros:** "No hay discos con esos filtros", y "Sortear" queda deshabilitado.
- **Con una sola bola** se puede sortear igual.
- **Escuchar en Spotify:** `linkSpotify` del disco del resultado.
- **Ver disco:** si la bola tiene un solo disco, abre ese. Si tiene vinilo y CD, abre el **vinilo**; los dos formatos se ven como badges en el resultado.
- **Otro:** se ve como acción secundaria; la primaria es escuchar.

### 4. Revelación intercambiable
`Sorteo.jsx` delega la transición en un componente `Revelacion({ bombo, elegida, alTerminar, children })`.

En este cambio es un **fundido breve** (~250 ms) de la tarjeta del resultado. Con `prefers-reduced-motion`, aparece sin transición. `batea` lo reemplaza por la animación de hojear discos, con el mismo contrato: recibe el bombo y la bola elegida de antemano, y llama a `alTerminar` cuando la animación muestra la elegida. Mientras dura, las acciones del resultado están deshabilitadas.

### 5. Filtros en preferencias
`preferencias.js` suma `sorteoFormato` (`todos` por defecto) y `sorteoGeneros` (`[]`). Se guardan en el dispositivo; no se sincronizan entre dispositivos.

### 6. Barra de la lista y encabezados por nivel
Componente `BarraLista({ cantidad, orden, onOrden, vista, onVista })` en `ui.jsx`.
- Es una fila **no fija**, al principio del `<main>`, con borde inferior fino.
- **A la izquierda**, la cantidad y el orden actual como un solo botón ("18 bandas · A → Z ▾") que abre la hoja que ya existe.
- **A la derecha**, `BotonCirculo` para cambiar entre cuadrícula y lista.

**Inicio:**
- El encabezado queda con el título, `BotonCirculo` "Sortear un disco" (ícono de dado, de línea) y Ajustes.
- La cantidad de la barra depende de lo que se ve: "N bandas", "N discos" (vista sin agrupar) o "N resultados" (buscando).
- Con resultados en el otro formato, el aviso "También lo tenés en…" va debajo de la barra.

**Banda:**
- El encabezado se queda con "Editar banda".
- El subtítulo pasa a mostrar solo el formato ("CDs"), porque la cantidad está en la barra.
- La barra muestra "N discos · Por año ▾" y la vista.

Las hojas y preferencias de orden no cambian: solo se mueve dónde se tocan.

**Alternativas descartadas:**
- **Cuarto botón en el encabezado:** el título queda apretado y la mezcla de niveles empeora.
- **Barra de navegación inferior:** demasiado para dos o tres destinos, compite con el FAB y obliga a rehacer la navegación.
- **Segundo FAB:** confunde con "agregar".
- **Sorteo como tercera pestaña:** las pestañas son formatos.

### 7. Navegación
- **Ruta `#/sorteo`**, hija del inicio: atrás y la flecha ← vuelven al inicio.
- **"Ver disco"** es un salto lateral con `navegar('disco/<id>')`. Atrás vuelve al sorteo, y el resultado y la ronda siguen en memoria (decisión 2).
- **"Completar géneros"** desde el aviso también es un salto lateral.
- La clave de pantalla en `claveDe` es `sorteo`.

## Risks / Trade-offs

- [Muchos discos sin tapa: el resultado se ve pobre] → Se usa el placeholder de formato como en el resto de la app. El problema visual pesa más en `batea`, y se trata ahí.
- [Muchos chips de género en 360px] → Se muestran los más usados y "Ver todos (N)" despliega el resto. Con ~55 bandas y 3 géneros por banda, se esperan unos 20 a 40 géneros.
- [Bandas sin géneros no entran al filtrar] → Es intencional, y el aviso lleva a completarlos.
- [La barra de la lista cambia un gesto aprendido] → El orden actual ahora se lee sin abrir nada. La hoja es la misma.
- [Ronda en memoria: se pierde al recargar] → Aceptado: el sorteo es un momento, no un historial.

## Migration Plan

Sin migraciones. Deploy normal después de archivar `generos-de-bandas`. Rollback: revertir el commit.

## Open Questions

- Con vinilo y CD del mismo disco, "Ver disco" abre el vinilo. Si en el uso se siente mal, se puede ofrecer elegir.
