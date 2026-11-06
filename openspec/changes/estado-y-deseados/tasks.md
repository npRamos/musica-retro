## 1. Base

- [x] 1.1 ~~Comprobar en Supabase que PostgreSQL sea 15 o superior.~~ Ya no hace falta: la unicidad usa dos restricciones que funcionan en cualquier versión.
- [x] 1.2 Migración `supabase/migrations/20261106000000_estado_y_deseados.sql`, parte de estado:
  - `discos.estado text[] not null default '{}'` y `discos.observacion text`;
  - `check` de valores permitidos y de `rayado` y `muy_rayado` juntos.
- [x] 1.3 Misma migración, parte de deseados:
  - tabla `deseados` con `unique (banda_id, titulo_norm, formato)`, un índice único parcial para los que no tienen formato, y `banda_id` con `on delete restrict`;
  - trigger de normalización del título;
  - RLS para miembros y `grant` a `authenticated`.
- [x] 1.4 Trigger `after insert or update of banda_id, titulo, formato` en `discos`, que borra los deseados que coinciden.
- [x] 1.5 Nueva versión de `fusionar_bandas`, a partir de `20261101000000_generos.sql`:
  - une etiquetas y observaciones de los discos repetidos;
  - borra los deseados que chocarían, mueve el resto y resuelve los que coinciden con un disco de la banda que queda.
- [x] 1.6 Nueva versión de `importar_discos`, a partir de `20261031000000_importar_planilla.sql`, que guarda `estado` y `observacion` en los discos creados.
- [x] 1.7 Mencionar la tabla en el README si hace falta.
- [x] 1.8 La usuaria corre la migración en Supabase.

## 2. Estado: lógica

- [x] 2.1 `src/lib/estado.js`: etiquetas por formato, interpretar y alternar etiquetas, quitar las que no corresponden y saber si un disco tiene estado. Con tests.
- [x] 2.2 `catalogoContexto.jsx`: leer `estado` y `observacion`, tolerar la caché vieja y guardarlos en `agregarDisco` y `actualizarDisco`.
- [x] 2.3 `exportar.js`: columnas Estado y Observación. Actualizar los tests.
- [x] 2.4 `importar.js`: columnas nuevas y validación según el formato. Pasarlas también en `importar` de `catalogoContexto.jsx`. Con tests.

## 3. Estado: pantallas

- [x] 3.1 `FormDisco.jsx`: "Más datos" también en el alta, con chips en píldora y observación. La fecha sigue siendo solo de la edición. Queda abierta si el disco tiene estado.
- [x] 3.2 `FormDisco.jsx`: quitar las etiquetas que no corresponden al cambiar de formato.
- [x] 3.3 `Disco.jsx`: sección plegada "Más datos" con el estado, solo si el disco tiene alguno.
- [x] 3.4 `src/pantallas/Estados.jsx` y ruta `estados`: lista, chips y salto al detalle.
- [x] 3.5 `Ajustes.jsx`: entrada "Discos con estado", con la cantidad.

## 4. Deseados: lógica

- [x] 4.1 `src/lib/deseados.js`: orden de la lista, pendientes de una banda por formato, y comprobar si ya se tiene o ya está en deseados. Con tests.
- [x] 4.2 `catalogoContexto.jsx`: leer y cachear `deseados`, tolerar la caché vieja, y sumar `agregarDeseado` y `quitarDeseado`, que borra la banda si queda sin discos ni deseados.
- [x] 4.3 `borrarDisco`: no borrar la banda si le quedan deseados.

## 5. Deseados: pantallas

- [x] 5.1 `src/pantallas/FormDeseado.jsx` y ruta `deseados/agregar`: banda y disco con los campos del alta, y formato con "Cualquiera" por defecto. Crea y enlaza la banda si hace falta, guarda los datos de MusicBrainz y muestra los avisos de repetido.
- [x] 5.2 `src/pantallas/Deseados.jsx` y ruta `deseados`: lista, "Cargar", quitar con confirmación, botón + y estado vacío. Deshabilita las escrituras sin conexión.
- [x] 5.3 `Ajustes.jsx`: entrada "Lista de deseados", con la cantidad.
- [x] 5.4 `App.jsx` y `FormDisco.jsx`: aceptar `deseado=<id>`, arrancar con el disco de MusicBrainz si lo tiene, y borrar el deseado al crear el disco o sumar copias.
- [x] 5.5 `Banda.jsx`: sección plegada "Pendientes (N)" y "Agregar a deseados" junto a "Compartir esta banda".
- [x] 5.6 `CompletarGeneros.jsx` y `Ajustes.jsx`: considerar solo las bandas con al menos un disco.
- [x] 5.7 `router.js`: `FORMATO_DE_SLUG` no tenía la clave `vinilos`, y la pantalla de una banda en vinilo no se abría. Sin esto no se ven sus pendientes. Con test.

## 6. Verificación

- [x] 6.1 Tests y build en verde.
- [ ] 6.2 Probar en el celular el estado:
  - marcar y quitar, en alta y edición, en CD y vinilo;
  - cambiar de formato;
  - sumar una copia;
  - "Discos con estado", con filtros y sin conexión;
  - exportar y reimportar una planilla.
- [ ] 6.3 Probar en el celular los deseados:
  - agregar con y sin formato, de una banda nueva y de una existente;
  - los avisos de repetido y "Ya lo tenés";
  - cargar un deseado de MusicBrainz y uno escrito a mano, cambiando el título y sumando una copia;
  - resolver cargando desde + y desde una importación;
  - pendientes por formato en la pantalla de banda;
  - renombrar y unir bandas;
  - borrar el último disco de una banda con deseados, y quitar el último deseado de una banda sin discos;
  - comprobar que una banda con solo deseados no aparece en "Completar géneros", y que entra al cargarle su primer disco;
  - ver la lista desde otra cuenta del catálogo y sin conexión.
- [ ] 6.4 Sincronizar las specs, archivar el change y cerrar los issues #8 y #10.
