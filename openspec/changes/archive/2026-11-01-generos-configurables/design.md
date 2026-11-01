## Context

- **Dónde está fijo el 3:**
  - `MAXIMO_GENEROS = 3` en `src/lib/generos.js`, usado por `agregarGenero` y por `EditorGeneros` (textos "Máximo 3");
  - `slice(0, 3)` en `elegirGeneros` (`src/lib/discografia.js`), que decide qué géneros se proponen y se guardan solos al enlazar;
  - el control `bandas_generos_maximo check (cardinality(generos) <= 3)` en la base.
- **El catálogo es uno solo y compartido entre miembros** (`public.miembros` y `es_miembro()` en las políticas RLS). Las preferencias de vista (`preferencias.js`) son por dispositivo. El acento, por cuenta.
- **El catálogo se cachea** en `localStorage` (`CLAVE_CACHE`) para usarlo sin conexión.
- **Decisiones de la usuaria:**
  - el ajuste es del catálogo;
  - bajar el máximo conserva los géneros;
  - subirlo no agrega nada solo ("Traer de MusicBrainz" alcanza);
  - el rango es de 1 a 5;
  - el mismo número limita lo que se guarda y lo que se muestra.

## Goals / Non-Goals

**Goals:**
- Un máximo de géneros por banda, configurable de 1 a 5, igual para todo el catálogo.
- Cambiar el máximo nunca borra ni agrega géneros por su cuenta.

**Non-Goals:**
- Mostrar menos géneros de los que se guardan.
- Volver a pasar las bandas por "Completar géneros" al subir el máximo.
- Que la base imponga el máximo configurado: solo impone el tope del rango (5).
- Ajustes del catálogo en general (más allá de este número).

## Decisions

### Tabla de una fila `public.ajustes_catalogo`

```sql
create table public.ajustes_catalogo (
  id             boolean primary key default true check (id),   -- una sola fila
  maximo_generos integer not null default 3 check (maximo_generos between 1 and 5)
);
insert into public.ajustes_catalogo default values;
```

- **Permisos:** RLS con `select` y `update` para `es_miembro()`, igual que bandas y discos. No hay `insert` ni `delete` desde la app: la fila la crea la migración.
- **El tope de la base:** el control de `bandas.generos` pasa a `<= 5`.

**Alternativas descartadas:**
- **Preferencia por dispositivo:** con el catálogo compartido, otra persona vería bandas "pasadas" del límite, y el valor cambiaría según el celular.
- **Metadatos del usuario (como el acento):** son por cuenta, no por catálogo.
- **Una columna en `miembros`:** mezcla quién entra con cómo es el catálogo.

La tabla también deja un lugar natural para un `catalogo_id` si algún día hay varios catálogos.

### La base no impone el máximo configurado

Imponerlo en la base exigiría un trigger que deje conservar géneros "de más" al bajar el máximo y solo impida agregar. Los miembros son de confianza (catálogo por invitación) y la app ya controla el agregado, así que la base solo garantiza el rango (≤ 5).

### Carga, caché y escritura en el contexto

- **Carga:** `sincronizar` lee `ajustes_catalogo` junto con bandas y discos, y guarda `maximoGeneros` en `datos`, que se cachea con el resto.
- **Sin conexión:** se usa el último valor cacheado, o 3 si no hay ninguno.
- **Si la tabla todavía no existe:** el pedido falla con un error que no es de red. En ese caso se usa 3 y la sincronización sigue, así la app no se rompe si el deploy llega antes que la migración. El selector de Ajustes queda deshabilitado con un aviso.
- **Escritura:** `cambiarMaximoGeneros(n)` hace `update ajustes_catalogo set maximo_generos = n where id` y vuelve a sincronizar. Requiere conexión.

### El máximo como parámetro en las funciones puras

- `generos.js` reemplaza `MAXIMO_GENEROS` por `GENEROS_POR_DEFECTO = 3` y `RANGO_GENEROS = { minimo: 1, maximo: 5 }`.
- **`agregarGenero(generos, genero, maximo = GENEROS_POR_DEFECTO)`:** no agrega si `generos.length >= maximo`. Eso también cubre una banda que ya supera el máximo.
- **`elegirGeneros(generos, maximo = GENEROS_POR_DEFECTO)`:** `propuestos` se corta en `maximo`. `todos` sigue hasta 8, que es más que el tope de 5.

Los componentes y el contexto pasan `maximoGeneros`. Los tests cubren 1, 3 y 5 y el caso de una banda que ya supera el máximo.

### UI

- **Ajustes:** un `Segmentado` "Géneros por banda" con 1 · 2 · 3 · 4 · 5. Debajo dice: "Para todo el catálogo. Bajarlo no borra los géneros que ya tienen las bandas." `Segmentado` suma una prop `deshabilitado`, que se usa sin conexión o si el ajuste no se pudo leer.
- **`EditorGeneros`** (edición de banda y "Completar géneros"):
  - "Máximo N" en lugar de "Máximo 3".
  - Si la banda tiene más géneros que el máximo: "Tiene más géneros que el máximo del catálogo (N). Quitá alguno para agregar otro."
  - Los chips activables de MusicBrainz se deshabilitan al llegar al máximo, como hoy.
- **"Completar géneros":** marca de entrada hasta N propuestos.

## Risks / Trade-offs

- **[Deploy antes de correr la migración]** → Se usa 3, como hoy, y el selector queda deshabilitado. Y como la base sigue con el control de 3, no hay forma de guardar más.
- **[Con 5, más ruido de MusicBrainz]** → Se sigue aplicando el umbral del 20% de los votos del primero, así que con pocos votos se proponen menos de 5.
- **[Con más géneros, las bandas aparecen en más secciones "por género" y entran en más sorteos filtrados]** → Es el efecto buscado al subir el máximo. No requiere cambios en esas pantallas.

## Migration Plan

1. La usuaria corre `20261102000000_generos_configurables.sql` en el SQL Editor de Supabase.
2. Push y deploy.
3. **Para volver atrás:** quitar la tabla y volver el control a `<= 3`. Antes hay que recortar las bandas que tengan más de 3 géneros, porque si no la base no deja aplicar el control.
