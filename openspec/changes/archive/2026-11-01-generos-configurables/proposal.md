## Why

Issue #6: hoy cada banda puede tener hasta 3 géneros. Ese número está fijo en el código y en la base, y hay gente que va a querer más o menos. Tiene que poder ajustarse, con 3 por defecto.

## What Changes

- **Nuevo ajuste "Géneros por banda"** en Ajustes, de 1 a 5, con 3 por defecto.
  - Es del catálogo: se guarda en la base y vale para todos los que lo comparten y en todos los dispositivos.
  - Cambiarlo requiere conexión. Sin conexión se ve el último valor conocido.
- **Qué controla el máximo:**
  - cuántos géneros se pueden agregar a mano en la edición de una banda y en "Completar géneros";
  - cuántos géneros de MusicBrainz se proponen y se guardan solos al enlazar.
- **Bajar el máximo no borra nada.** Las bandas que tienen más géneros los conservan y se siguen viendo todos. Al editarlas, el sistema avisa que hay que quitar alguno para poder agregar otro.
- **Subir el máximo no agrega géneros solo.** Para sumar más a una banda ya revisada se usa "Traer de MusicBrainz" en su edición.
- **Se guardan y se muestran los mismos:** no hay un límite aparte para mostrar.
- **Migración:** tabla de configuración del catálogo (una fila), y el control de la base pasa de "hasta 3" a "hasta 5", que es el tope del rango.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `generos`:
  - "Géneros de una banda" pasa de un máximo fijo de 3 al máximo configurado;
  - "Géneros propuestos por MusicBrainz" propone hasta ese máximo;
  - se suma "Máximo de géneros configurable".

## Impact

- **Base:** `supabase/migrations/20261102000000_generos_configurables.sql`.
  - Tabla `public.ajustes_catalogo`, con una única fila, `maximo_generos` entre 1 y 5 y valor por defecto 3.
  - RLS para miembros: leer y actualizar.
  - El control `bandas_generos_maximo` pasa a `<= 5`.
  - **La usuaria la corre en Supabase antes del deploy.**
- **`src/lib/catalogoContexto.jsx`:**
  - carga y cachea `maximoGeneros` con el catálogo;
  - suma `cambiarMaximoGeneros`;
  - `buscarGenerosSiFalta` propone hasta el máximo.
- **`src/lib/generos.js` y `src/lib/discografia.js`:** el máximo pasa a ser un parámetro (`agregarGenero`, `elegirGeneros`). Con tests.
- **`src/componentes/Generos.jsx`, `src/pantallas/CompletarGeneros.jsx` y `src/pantallas/EditarBanda.jsx`:** usan el máximo del catálogo y avisan cuando una banda lo supera.
- **`src/pantallas/Ajustes.jsx`:** el selector de 1 a 5.
