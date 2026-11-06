## Why

Los issues #7, #9, #11, #12 y #13 piden mejoras de uso que no necesitan cambios en la base: una barra de scroll de más, un enlace a Spotify que no siempre lleva al álbum, moverse entre discos sin volver a la lista, géneros difíciles de distinguir y filtrar, y compartir el disco sorteado en Instagram. Van juntos porque se pueden publicar sin migración.

## What Changes

- **#7 Barra de scroll:** se oculta la barra del navegador en toda la app, sin quitar el desplazamiento.
- **#11 Enlace a Spotify:**
  - se abre siempre el link limpio del álbum, sin parámetros como `?si=`, también en los discos que ya lo tienen guardado;
  - un link guardado que no es de un álbum (un perfil, por ejemplo) se ignora y se abre la búsqueda;
  - al editar o importar, solo se aceptan links de álbum.
- **#12 Cambiar de disco:** en el detalle, deslizar fuera de la imagen pasa al disco anterior o siguiente de la banda, en ese formato y en el orden de su pantalla.
  - Deslizar sobre la imagen solo cambia entre tapa y contratapa.
  - Solo existe el gesto: no se agrega ningún botón ni indicador.
- **#13 Géneros en la lista:**
  - los títulos de género son más grandes que el nombre de la banda;
  - el orden "Género" sin agrupar también muestra títulos;
  - una fila de chips permite filtrar por uno o varios géneros, y la selección queda guardada en el dispositivo.
- **#9 Compartir el disco sorteado:** el resultado del sorteo suma la acción "Compartir".
  - Genera una imagen vertical del disco y abre el menú de compartir del celular, desde donde se elige Instagram.
  - Donde no se puede compartir, descarga la imagen.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `consulta`:
  - cambia "Abrir en Spotify" e "Índice al desplazarse";
  - se suman "Cambiar de disco deslizando", "Títulos de género en la lista" y "Filtrar la lista por género".
- `catalogo`: "Edición de disco" solo acepta links de álbum de Spotify.
- `importacion`: se suma "Link de Spotify al importar".
- `exportacion`: se suma "Link de Spotify en la planilla".
- `identidad-visual`: se suma "Sin barras de desplazamiento".
- `sorteo`: cambia "Sortear un disco" y se suma "Compartir el disco sorteado".

## Impact

- **Sin migración:** no cambia la base ni las dependencias.
- **`src/index.css`:** ya tiene sin commitear el cambio de la barra de scroll, que entra en este change.
- **`src/lib/catalogo.js`:** normaliza los links de Spotify, arma la lista de discos de una banda y los títulos de género. Con tests.
- **`src/lib/indice.js`:** el orden por género pasa a usar los títulos como marcas. Con tests.
- **`src/lib/preferencias.js`:** suma los géneros elegidos para filtrar.
- **`src/pantallas/Inicio.jsx`:** chips, títulos y filtro.
- **`src/pantallas/Banda.jsx` y `src/pantallas/Disco.jsx`:** comparten la lista de discos, y el detalle suma el gesto.
- **`src/pantallas/FormDisco.jsx`, `src/lib/importar.js` y `src/lib/exportar.js`:** usan el link normalizado.
- **`src/pantallas/Sorteo.jsx`:** suma la acción de compartir.
- **Código nuevo:** generación de la imagen para compartir (`src/lib/imagenCompartir.js`). La función para compartir un archivo sale de `src/componentes/Compartir.jsx` para que la usen la planilla y el sorteo.
