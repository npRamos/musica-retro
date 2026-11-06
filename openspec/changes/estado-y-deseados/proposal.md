## Why

Los issues #8 y #10 suman información que el catálogo hoy no puede guardar: en qué estado está cada disco y cuáles se quieren comprar. Sin esto, los discos con problemas no se pueden encontrar, y la lista de deseados queda fuera de la app. Van juntos porque los dos necesitan migración y tocan las mismas funciones de la base y de sincronización.

## What Changes

- **#8 Estado del disco:**
  - cada disco puede tener etiquetas de estado y una observación libre;
    - **CD:** Rayado, Muy rayado, Caja rota y Sin caja;
    - **Vinilo:** Rayado, Muy rayado, Tapa rota y Necesita funda;
  - se carga en la sección plegada "Más datos", que también se suma al alta;
  - el detalle lo muestra en una sección plegada, solo si el disco tiene algún estado, y las tarjetas nunca;
  - una pantalla nueva, "Discos con estado", lista los que tienen algún problema y permite filtrarlos;
  - se exporta y se importa en la planilla, con las columnas nuevas Estado y Observación.
- **#10 Lista de deseados:**
  - la lista es compartida entre los miembros del catálogo y se abre desde Ajustes;
  - cada deseado tiene banda, disco y un formato opcional;
  - la pantalla de una banda muestra sus pendientes en una sección plegada;
  - desde un deseado se abre el alta con los datos precargados, y al guardar el deseado desaparece;
  - si el disco se carga, se importa o se edita por otro camino, el deseado que coincide también se resuelve.
- **Migración:** columnas nuevas en `discos`, tabla `deseados` y nuevas versiones de `fusionar_bandas` e `importar_discos`.

## Capabilities

### New Capabilities

- `deseados`: lista compartida de discos que se quieren comprar, pendientes por banda y paso de deseado a disco cargado.

### Modified Capabilities

- `catalogo`: se suma "Estado del disco".
- `consulta`: se suman "Estado en el detalle" y "Discos con estado".
- `exportacion`: "Descargar el catálogo como planilla" suma las columnas Estado y Observación.
- `importacion`: "Importar lista pegada" acepta esas columnas e "Importación atómica" las guarda.

## Impact

- **Base:** `supabase/migrations/20261106000000_estado_y_deseados.sql`.
  - `discos` suma `estado` y `observacion`.
  - Tabla `public.deseados`, con RLS para miembros.
  - Trigger que resuelve los deseados cuando aparece el disco.
  - Nuevas versiones de `fusionar_bandas` e `importar_discos`.
  - **La usuaria la corre en Supabase antes del deploy.**
- **`src/lib/catalogoContexto.jsx`:** sincroniza y cachea los deseados, suma sus operaciones, guarda el estado y no borra una banda que todavía tiene deseados.
- **Código nuevo:**
  - `src/lib/estado.js` y `src/lib/deseados.js`, con tests;
  - `src/pantallas/Deseados.jsx`, `src/pantallas/FormDeseado.jsx` y `src/pantallas/Estados.jsx`.
- **Pantallas que cambian:** `FormDisco.jsx`, `Disco.jsx`, `Banda.jsx`, `Ajustes.jsx`, `CompletarGeneros.jsx` y las rutas de `App.jsx`.
- **`src/lib/exportar.js` y `src/lib/importar.js`:** las columnas nuevas. Con tests.
- **`src/lib/router.js`:** corrige la ruta de vinilos: la pantalla de una banda en vinilo no se abría, y hace falta para ver sus pendientes.
- **Sin relación de orden con `mejoras-de-navegacion-y-compartir`:** los dos changes se pueden implementar y archivar en cualquier orden, porque no modifican los mismos requisitos.
