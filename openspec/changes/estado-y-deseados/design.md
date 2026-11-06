## Context

El catálogo es compartido: bandas y discos son visibles para todos los miembros, con RLS por `es_miembro()`. La app lee todo en `sincronizar`, lo cachea en el dispositivo y solo escribe con conexión.

Hay tres restricciones que condicionan este diseño:

- Una fila de `discos` representa un título en un formato, con un contador de copias. No hay filas por copia.
- Al borrar el último disco de una banda, `borrarDisco` borra también la banda (`catalogoContexto.jsx:197`).
- `fusionar_bandas` e `importar_discos` son funciones SQL que se reemplazan enteras en cada migración que las cambia.

El alta ya acepta `banda`, `titulo` y `formato` por la URL (`App.jsx:107`).

## Goals / Non-Goals

**Goals:**

- Registrar el estado de un disco sin que ocupe lugar en el uso diario, y poder encontrar los que tienen algún problema.
- Tener una lista de deseados compartida que termine en el mismo proceso de alta de siempre.
- Que un deseado sobreviva a renombrar o unir bandas.

**Non-Goals:**

- Estado por copia.
- Escala de grading (Goldmine o similar).
- Editar un deseado: se quita y se vuelve a agregar.
- Listas de deseados por persona.
- Guardar el historial de deseados comprados.
- Sumar deseados a la planilla, al sorteo o al buscador.

## Decisions

### Estado: etiquetas más observación

`discos.estado` es un `text[]` y `discos.observacion` un `text` opcional. Un `check` limita los valores permitidos e impide tener `rayado` y `muy_rayado` juntos.

| Valor | Etiqueta | CD | Vinilo |
|---|---|---|---|
| `rayado` | Rayado | Sí | Sí |
| `muy_rayado` | Muy rayado | Sí | Sí |
| `caja_rota` | Caja rota | Sí | No |
| `sin_caja` | Sin caja | Sí | No |
| `tapa_rota` | Tapa rota | No | Sí |
| `necesita_funda` | Necesita funda | No | Sí |

Se pueden combinar, porque el disco y su envase se dañan por separado. Cualquier otra situación, como "una de las dos copias está rayada", va en la observación. La relación entre etiqueta y formato la controla la app, y al cambiar el formato se quitan las que no corresponden.

**Alternativas descartadas:**
- Un solo valor no permite "rayado y caja rota".
- Solo texto libre no permite filtrar.
- Una tabla por copia exige rehacer el modelo de discos para un caso poco frecuente.

### Estado en la interfaz

- **Carga:** en "Más datos", con chips en píldora que se activan y un campo de observación. Esa sección solo existía al editar, y ahora aparece también en el alta, sin la fecha. Queda plegada salvo que el disco tenga un estado cargado.
- **Lectura:** el detalle suma una sección plegada "Más datos" solo si el disco tiene etiquetas u observación. Al abrirla se ven esos datos. Las tarjetas no lo muestran.
- **Búsqueda:** Ajustes suma una entrada con la cantidad, que abre `#/estados`. La pantalla muestra los dos formatos juntos y filtra con chips. La selección vive en la ruta (`estados?filtro=…`), para que siga igual al volver de un disco, y no se recuerda en el dispositivo. Funciona sin conexión.

Tener un estado significa tener alguna etiqueta o una observación.

### Alta con estado: un update después de crear

`agregarDisco` llama a `agregar_disco` y, si hay estado, hace un `update`, igual que `ponerImagen` con las imágenes. Si el alta termina en "Sumar copia", el estado del disco existente no se toca, igual que el resto de sus datos.

**Alternativa descartada:** agregar el estado a `agregar_disco`. Obliga a reemplazar esa función sin ganar nada importante.

### Unir bandas con el mismo disco

Cuando `fusionar_bandas` junta dos filas del mismo disco, une las etiquetas y `muy_rayado` gana sobre `rayado`. Si las dos tienen observación distinta, las concatena con " · ".

### Deseados: tabla con `banda_id`

```sql
deseados (
  id, banda_id, titulo, titulo_norm,
  formato,           -- null: cualquiera
  anio, mb_release_group,
  creado_en,
  unique (banda_id, titulo_norm, formato)
)
-- Y un índice único parcial: un solo deseado sin formato por banda y título.
```

`banda_id` referencia a `bandas` con `on delete restrict`, como `discos`, y el título se normaliza con el mismo trigger. Son dos restricciones porque una `unique` común trata cada `null` como distinto; `unique nulls not distinct` lo resolvería con una sola, pero exige PostgreSQL 15. Si la banda todavía no existe, se crea una fila en `bandas` con `bandaPorNombre`, y se enlaza si se eligió un artista de MusicBrainz. RLS y permisos siguen el patrón de `discos`.

**Alternativa descartada:** guardar el nombre de la banda como texto. Es más simple, pero el vínculo se pierde al renombrar o unir, y no se puede reutilizar lo que ya hace `fusionar_bandas`.

### Bandas que solo tienen deseados

Las pestañas ya filtran por discos, así que estas bandas no aparecen en la grilla (`bandasDeFormato`). Hay que ajustar tres cosas:

- `borrarDisco` no borra la banda si le quedan deseados.
- Al quitar el último deseado de una banda sin discos, se borra la banda, con el mismo criterio que al borrar su último disco.
- "Completar géneros" y su cantidad en Ajustes solo consideran bandas con al menos un disco. Cuando una de estas bandas tenga su primer disco, entra como cualquier otra.

### Del deseado al disco

La acción "Cargar" navega a `agregar?banda=…&titulo=…&formato=…&deseado=<id>`, y el alta sigue siendo la misma pantalla.

- Si el deseado se eligió de MusicBrainz, guarda `mb_release_group` y `anio`, y el alta arranca con ese disco elegido. Así busca ediciones, tapa y temas sin volver a elegirlo.
- Sin formato, el campo queda sin elegir y se pide como siempre.
- Al guardar, tanto si se crea el disco como si se suman copias, se borra el deseado por su `id`. Se borra por `id` porque la usuaria puede haber cambiado el título o el formato durante el alta.

### Resolución automática: trigger en `discos`

Un trigger `after insert or update of banda_id, titulo, formato` borra los deseados de esa banda y título, con ese formato o sin formato. Cubre el alta normal, la importación y la edición con una sola regla.

La coincidencia es por título normalizado. Si un disco se carga con un título distinto al deseado, el deseado queda y se quita a mano.

Un deseado en un formato que ya se tiene se rechaza en la app con "Ya lo tenés". Si el mismo título ya está en deseados con ese formato o sin formato elegido, el aviso es "Ya está en deseados".

### Unir bandas con deseados

`fusionar_bandas` borra de la banda de origen los deseados que chocarían con los de destino y mueve el resto. Al final, borra los deseados que coinciden con un disco de la banda que queda. Ese paso es explícito porque el trigger no alcanza: si el disco ya estaba en la banda de destino, nadie lo modifica y el trigger no se dispara.

### Pendientes en la pantalla de banda

Una sección plegada "Pendientes (N)" va debajo de los discos, solo si hay alguno. Muestra los deseados de esa banda con el formato de la pestaña o sin formato, y tocar uno abre "Cargar". "Agregar a deseados" va junto a "Compartir esta banda", con la banda precargada y el formato en "Cualquiera".

### Sincronización y caché

`sincronizar` lee `deseados` junto con el resto, y falla igual que con bandas y discos si no se puede. Como la migración se corre antes del deploy, no hace falta tolerar que falte la tabla. La caché de versiones anteriores no tiene estos datos, así que se lee con `deseados ?? []` y `estado ?? []`.

## Risks / Trade-offs

- **Reemplazar `fusionar_bandas` e `importar_discos` puede pisar lógica existente** → Se parte de la última versión de cada una (`20261101000000_generos.sql` y `20261031000000_importar_planilla.sql`) y se prueba unir e importar.
- **El alta con estado no es atómica** → Si falla el `update`, el disco queda creado sin estado y la app muestra el error. Se puede completar editándolo.
- **Un título que no coincide deja un deseado sin resolver** → Se quita a mano. Al entrar desde "Cargar" no pasa, porque se borra por `id`.
- **Sumar columnas puede afectar a quien reimporta planillas viejas** → Son opcionales y se aceptan planillas sin ellas.

## Migration Plan

1. La usuaria corre la migración en Supabase.
2. Deploy de la app. Antes de este paso, la versión publicada sigue funcionando, porque ignora las columnas y la tabla nuevas.

**Rollback:** volver a la versión anterior de la app. Las columnas y la tabla pueden quedar en la base sin afectarla, aunque las funciones SQL nuevas siguen activas, y son compatibles con esa versión.
