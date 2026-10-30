## Context

Es el primero de tres cambios: `generos-de-bandas` → `sorteo-de-discos` → `batea`. El sorteo va a filtrar por formato y por género, y la batea es su animación.

Estado actual:
- `bandas` tiene `mbid` (enlace a un artista de MusicBrainz), pero no tiene géneros.
- Una banda solo queda enlazada si se elige el artista de MusicBrainz en el alta, o cuando `completar_disco` le pone el `mbid` del disco que se completó. No hay forma de enlazar una banda directamente.
- Colección (30/10/2026): ~55 bandas, 77 discos, ~15 bandas enlazadas.

MusicBrainz expone géneros votados por la comunidad en `artist/<mbid>?inc=genres`. Probado el 30/10/2026:

```
Megadeth                      La Renga
  thrash metal  42              hard rock   2
  heavy metal   19              blues       1
  speed metal   10              blues rock  1
  metal          9
  rock           2
  hard rock      1
```

Las bandas de metal internacional tienen buenos datos. Las argentinas tienen pocos, a veces poco representativos, y MusicBrainz no tiene nada equivalente a "rock nacional". Por eso MusicBrainz **propone** y la usuaria **corrige**.

La búsqueda de artistas (`artist?query=`) devuelve `tags` (incluye cosas como "american" o "80s"), pero no `genres`. Por eso hace falta el pedido aparte.

## Goals / Non-Goals

**Goals:**
- Que cada banda pueda tener hasta 3 géneros y que estén disponibles sin conexión.
- Que la mayoría de las bandas tengan géneros con poco trabajo: automáticos al enlazar, y un recorrido guiado para el resto.
- Enlazar a MusicBrainz las bandas que no lo están, sin pasar por sus discos.
- Evitar géneros duplicados escritos de otra forma.

**Non-Goals:**
- Géneros por disco o excepciones por disco (por ejemplo, *Load* de Metallica).
- Familias de géneros (Metal ⊃ thrash, heavy…) y renombrar un género en todo el catálogo.
- Traducir los nombres: quedan en inglés, como vienen.
- Géneros en la exportación o la importación CSV.
- Filtrar la grilla del inicio por género. Puede venir después; el sorteo es el primer uso.
- Enlazar una banda a MusicBrainz desde Editar banda. Por ahora se hace desde "Completar géneros".

## Decisions

### 1. Modelo: array en `bandas` más un estado
```
bandas + generos        text[] not null default '{}'   check (cardinality(generos) <= 3)
       + generos_estado text   not null default 'pendiente'
                         check (generos_estado in ('pendiente', 'listo'))
```
- `pendiente`: nadie revisó los géneros todavía. Las bandas en este estado se listan en "Completar géneros".
- `listo`: los géneros vinieron de MusicBrainz automáticamente, se confirmaron en "Completar géneros" o se editaron a mano. Puede haber 0 géneros si la usuaria lo decidió.
- La búsqueda automática **solo** actúa sobre bandas `pendiente`. Así, traer datos de MusicBrainz nunca pisa una edición manual.
- Las bandas existentes quedan `pendiente`.
- **Alternativa descartada: tabla `generos` + `bandas_generos`.** Normaliza mejor y permitiría renombrar, pero suma joins, RLS y caché offline para ~55 bandas. Con un array, el sorteo filtra en memoria sin cambios en la sincronización. Si algún día hace falta renombrar, se puede migrar.

### 2. Nombres: como vienen, comparados normalizados
- Se guardan tal como vienen de MusicBrainz ("thrash metal"). Los escritos a mano se guardan sin espacios sobrantes.
- Dos géneros son el mismo si `normalizar()` los iguala.
- Al agregar uno a mano, si ya existe en el catálogo un género equivalente, **se guarda con la forma existente**. Así no conviven "Thrash Metal" y "thrash metal".
- En la interfaz se muestran con la clase `etiqueta` (condensada, mayúsculas): el uso de mayúsculas al escribir no se nota.

### 3. Qué géneros propone MusicBrainz
`elegirGeneros(genres)` en `discografia.js`:
1. Descarta los que tienen `count <= 0`.
2. Ordena por votos (y por nombre si empatan).
3. Toma como **propuestos** los que tienen al menos el 20% de los votos del primero (mínimo 1 voto), hasta 3.
4. Devuelve también la lista completa (hasta 8), para poder activar otros en "Completar géneros".

Megadeth → thrash, heavy, speed. Metal (9) supera el umbral, pero queda afuera por el tope de 3. La Renga → hard rock, blues, blues rock: la usuaria lo corrige.

**Alternativa descartada: descartar a mano géneros genéricos** como "rock" o "metal". El umbral relativo y el tope ya los dejan afuera cuando hay algo más específico. Cuando son lo único que hay, sirven.

### 4. Cliente: `generosDeArtista(mbid)`
Hace `GET artist/<mbid>?inc=genres` por la cola existente (1 pedido por segundo, cancelable, un reintento ante 503) y devuelve `[{ nombre, votos }]`. Se prueba con respuestas guardadas (Megadeth, La Renga).

### 5. Géneros automáticos al enlazar
En `catalogoContexto`, `buscarGenerosSiFalta(banda, mbid)` se llama donde hoy se llama `buscarLogoSiFalta` (alta, sumar copia con datos, completar disco). **No** se llama al enlazar desde "Completar géneros": esa pantalla ya es la revisión, y "Saltar" tiene que dejar la banda pendiente. Las condiciones:
- Solo si la banda es `pendiente`, tiene `mbid` y no se buscó en esta sesión. Un `Set` en memoria hace de guarda, igual que `logosVistos`.
- **En silencio y sin bloquear:** si MusicBrainz falla, no pasa nada.
- Si hay géneros propuestos, se guardan y la banda pasa a `listo`.
- Si MusicBrainz no tiene géneros, la banda **sigue `pendiente`**, para que aparezca en "Completar géneros" y se carguen a mano.

### 6. Completar géneros (`#/generos`)
Desde Ajustes, con la cantidad de bandas pendientes. Arma la cola al entrar: bandas `pendiente` en orden alfabético, igual que "Completar pendientes". Al salir sincroniza una vez.

```
                       ┌───────────── banda sin mbid ─────────────┐
                       ▼                                          │
  banda ──▶ ¿tiene mbid? ──no──▶ PASO ARTISTA                     │
               │                  candidato = elegirArtista(buscarArtistas(nombre))
               │                  "¿Es esta?  Megadeth · US (thrash band)"
               │                  [Sí] [Otra] [No está] [Saltar]
               │                    │     │        │
               │      enlaza mbid ◀─┘     │        └──▶ PASO GÉNEROS (sin propuestas)
               │      + logo si falta     ▼
               │                  lista de resultados + campo para buscar otro nombre
              sí
               ▼
         PASO GÉNEROS
         chips de MB: propuestos marcados, el resto activables (máx 3 marcados)
         + campo "Agregar género" con autocompletado
         [Guardar]  [Saltar]
```

- **Sin candidato** (nadie con nombre igual y buen puntaje): muestra directamente la lista de resultados con "No está".
- **Guardar** con 0 géneros es válido: la banda queda `listo`, sin géneros.
- **Saltar** la deja `pendiente`: vuelve a aparecer la próxima vez.
- **Enlazar** solo escribe `bandas.mbid`. No toca los discos ni su `mb_estado`.
- Los géneros de la banda siguiente se piden mientras se decide la actual, igual que el prefetch de "Completar pendientes".
- **Sin conexión,** muestra el aviso de que hace falta señal, como "Completar pendientes".

### 7. Editor de géneros (componente compartido)
Lo usan "Completar géneros" y "Editar banda":
- Chips marcados, cada uno con su ✕.
- Campo "Agregar género" con sugerencias en dos bloques:
  1. géneros del catálogo que coinciden con lo escrito, con la cantidad de bandas;
  2. géneros de MusicBrainz de esta banda, si se trajeron.
- Siempre muestra la opción "Agregar «texto»".
- Con 3 marcados, el campo se deshabilita y muestra "Máximo 3".
- En **Editar banda:** sección "Géneros" con el editor y "Traer de MusicBrainz" si la banda tiene `mbid`. Traer agrega los propuestos como sugerencias activables; no reemplaza los actuales sin que la usuaria los marque. Al guardar, si los géneros cambiaron, se escriben y la banda pasa a `listo`. Si no cambiaron, no se toca el estado.

### 8. Pantalla de banda
Una fila de chips bajo el encabezado, con los géneros de la banda. No se muestra si no tiene. Los chips son solo informativos en este cambio.

### 9. Unir bandas
En `fusionar_bandas`, el destino conserva sus géneros si está `listo`. Si está `pendiente` y el origen está `listo`, hereda los géneros y el estado del origen. La nueva versión sale de la última versión de la función (`20261030000000_logos.sql`) y solo suma ese bloque.

### 10. Escritura
- `cambiarGenerosBanda(banda, generos)` → `update bandas set generos, generos_estado = 'listo'`.
- `enlazarBanda(banda, mbid)` → `update bandas set mbid`.
- Las dos actualizan directo la tabla, como `cambiarLogoBanda`; las políticas RLS de miembros ya lo permiten.
- La normalización y la resolución contra géneros existentes se hacen en el cliente (`src/lib/generos.js`, con tests). La base solo valida el máximo de 3.

## Risks / Trade-offs

- [Géneros poco representativos en bandas argentinas] → Se guardan solos, pero son editables. Si MusicBrainz no trae ninguno, la banda queda en "Completar géneros".
- [El automático guarda algo que la usuaria no revisó] → Es una decisión tomada: se corrige en Editar banda. El estado `listo` evita que vuelva a pisarse.
- [Enlazar al artista equivocado, como un homónimo] → Se muestran el país y la desambiguación. Además, solo se propone automáticamente si el nombre coincide normalizado con buen puntaje; si no, se elige de la lista.
- [Dos bandas del catálogo enlazadas al mismo artista, que probablemente son duplicadas] → No se impide. Queda para "Unir bandas". Fuera de alcance.
- [Fragmentación de géneros escritos a mano] → La resolución contra géneros existentes al agregar, y el autocompletado con los del catálogo primero.
- [~40 bandas por recorrer, 1 o 2 pedidos de MusicBrainz cada una] → Unos 2 segundos por banda con prefetch. Se puede retomar.

## Migration Plan

1. Migration `20261101000000_generos.sql`: columnas, checks y nueva `fusionar_bandas`. Probar en un Postgres descartable y aplicarla en Supabase antes del deploy del cliente.
2. El cliente nuevo pide las columnas en el select. Una versión vieja en caché del service worker las ignora sin romperse.
3. Rollback: las columnas son aditivas. Se pueden dejar o borrar con `alter table … drop column`. `fusionar_bandas` vuelve a la versión de logos.

## Open Questions

- Ninguna bloqueante. El umbral del 20% se puede ajustar con los datos reales al recorrer las ~40 bandas.
