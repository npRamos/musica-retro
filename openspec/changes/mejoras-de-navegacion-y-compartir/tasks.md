## 1. Barra de scroll (#7)

- [x] 1.1 Incluir en este change el cambio de `src/index.css` que ya está sin commitear.
- [x] 1.2 Quitar de `Carrusel.jsx` las clases que ocultaban su barra y ya no hacen falta.

## 2. Spotify (#11)

- [x] 2.1 `catalogo.js`: `limpiarLinkSpotify(url)` devuelve el link limpio del álbum o `null`, y acepta el prefijo de idioma.
- [x] 2.2 `linkSpotify` usa el link limpio y, si es `null`, abre la búsqueda.
- [x] 2.3 `FormDisco.jsx`: valida con la función nueva, muestra el error "Tiene que ser el link de un álbum" y guarda el link limpio.
- [x] 2.4 `importar.js`: valida y guarda el link limpio.
- [x] 2.5 `exportar.js`: exporta el link limpio, o la celda vacía si no es de un álbum.
- [x] 2.6 Tests:
  - link con `?si=`, con idioma, de un perfil, de un tema y de otro dominio;
  - `linkSpotify` en cada caso;
  - importación y planilla con esos links.

## 3. Cambiar de disco (#12)

- [x] 3.1 `catalogo.js`: `discosDeBanda(discos, bandaId, formato, orden)` y `discosVecinos(lista, id)`. `Banda.jsx` pasa a usar `discosDeBanda`. Con tests.
- [x] 3.2 Función pura que decide si un movimiento es un cambio de disco, según recorrido, proporción y distancia al borde. Con tests.
- [x] 3.3 Hook `useDeslizar` con pointer events, que ignora lo que empieza en el carrusel o en un `<dialog>`.
- [x] 3.4 `Disco.jsx`: conectar el gesto con `touch-action: pan-y` y `navegar(..., { reemplazar: true })`, sin ningún elemento visible.
- [x] 3.5 Hacer que un disco abierto con el gesto empiece arriba, aunque ya se haya visitado.

## 4. Géneros en la lista (#13)

- [x] 4.1 `Inicio.jsx`: títulos de género con `text-xl` y separador fino, sin color de acento.
- [x] 4.2 `catalogo.js`: secciones de la lista ordenada por género, con el género principal o el primero elegido, para bandas y discos. Con tests.
- [x] 4.3 `Inicio.jsx`: mostrar esas secciones en el orden "Género", en "Por banda" y en "Todos los discos".
- [x] 4.4 `indice.js`: `criterioDe` devuelve `null` también con `orden === 'genero'`, y se quita ese caso de `marcaDe`. Actualizar los tests.
- [x] 4.5 `preferencias.js`: `generosFiltro`, vacío por defecto.
- [x] 4.6 `catalogo.js`: chips con cantidades, incluido "Sin género", y filtro de bandas y discos, ignorando los géneros que no están en el formato. Con tests.
- [x] 4.7 Componente de chips en píldora con scroll horizontal, y sumarlo a `Inicio.jsx` solo en las vistas por género y sin búsqueda.
- [x] 4.8 `Inicio.jsx`: la barra cuenta lo filtrado, y la selección entra en la `version` de `Indice`.

## 5. Compartir el disco sorteado (#9)

- [ ] 5.1 Probar en un celular real, con una imagen de prueba, qué opciones ofrece Instagram al recibirla desde la web. Registrar el resultado en este change.
- [x] 5.2 Sacar `compartirPlanilla` de `Compartir.jsx` y generalizarla a `compartirArchivo(archivo, titulo)`, que comparte o descarga. Se sigue usando para la planilla.
- [x] 5.3 `src/lib/imagenCompartir.js`: generar el JPEG de 1080×1920 con tapa o ícono, disco asomado, textos con corte de línea y nombre de la app, esperando las fuentes.
- [x] 5.4 `Sorteo.jsx`: generar la imagen cuando termina la animación, y sumar el botón "Compartir", que dice "Preparando…" mientras tanto y llama a `share` de forma síncrona.

## 6. Verificación

- [x] 6.1 Tests y build en verde.
- [ ] 6.2 Confirmar qué dice "Link de Spotify" en un disco donde falla el #11. Si está vacío, revisar la causa antes de cerrar el issue.
- [ ] 6.3 Probar en el celular:
  - **Scroll:** una lista larga, con y sin índice.
  - **Spotify:** el botón en un disco cargado por cada miembro.
  - **Gesto:** cambiar de disco y volver atrás; deslizar sobre la tapa, con y sin contratapa; con el visor abierto; hacer scroll vertical sin cambiar de disco; usar el gesto de atrás del sistema.
  - **Géneros:** filtrar por uno y varios, cambiar de pestaña, volver a abrir la app, buscar y usar el índice.
  - **Compartir:** a Instagram, cancelar el menú, un disco sin tapa, tema claro y sin conexión.
- [ ] 6.4 Sincronizar las specs, archivar el change y cerrar los issues #7, #9, #11, #12 y #13.
