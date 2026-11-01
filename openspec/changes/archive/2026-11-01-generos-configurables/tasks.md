## 1. Base

- [x] 1.1 Migración `supabase/migrations/20261102000000_generos_configurables.sql`:
  - tabla `ajustes_catalogo` de una fila, con `maximo_generos` de 1 a 5 y valor por defecto 3;
  - RLS de lectura y actualización para miembros, y `grant` a `authenticated`;
  - `insert` de la fila;
  - `bandas_generos_maximo` pasa a `<= 5`.
- [x] 1.2 Mencionar la tabla en el README si hace falta, en la tabla de dónde está cada cosa.

## 2. Lógica

- [x] 2.1 `generos.js`: `GENEROS_POR_DEFECTO` y `RANGO_GENEROS` en lugar de `MAXIMO_GENEROS`, y `agregarGenero(generos, genero, maximo)`.
- [x] 2.2 `discografia.js`: `elegirGeneros(generos, maximo)` corta los propuestos en `maximo`.
- [x] 2.3 Tests:
  - `agregarGenero` con máximos 1, 3 y 5, y con una banda que supera el máximo;
  - `elegirGeneros` de Megadeth con máximos 1, 3 y 5 (con 5 da 4, por el umbral).
- [x] 2.4 `catalogoContexto.jsx`:
  - leer `ajustes_catalogo` en `sincronizar` y cachear `maximoGeneros`, con 3 si falta o falla sin ser error de red;
  - `cambiarMaximoGeneros(n)`;
  - `buscarGenerosSiFalta` propone hasta el máximo.

## 3. Pantallas

- [x] 3.1 `Segmentado` con prop `deshabilitado`.
- [x] 3.2 Ajustes: selector "Géneros por banda" (1 a 5) con su texto de ayuda. Deshabilitado sin conexión o si no se pudo leer el ajuste.
- [x] 3.3 `EditorGeneros`: usa el máximo del catálogo ("Máximo N"). Si la banda lo supera, avisa y no deja agregar.
- [x] 3.4 `CompletarGeneros` y `EditarBanda` (`SelectorGeneros`): propuestos y activables hasta el máximo.

## 4. Verificación

- [x] 4.1 Tests y build en verde.
- [x] 4.2 La usuaria corre la migración en Supabase.
- [x] 4.3 Probar en el celular:
  - subir a 5 y agregar géneros;
  - bajar a 2 con una banda de 3 (conserva y avisa);
  - enlazar una banda nueva con máximo 1 y 5;
  - "Completar géneros";
  - Ajustes sin conexión.
- [x] 4.4 Sincronizar las specs, archivar el change y cerrar el issue #6.
