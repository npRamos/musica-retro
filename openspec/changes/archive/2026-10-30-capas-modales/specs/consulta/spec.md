## ADDED Requirements

### Requirement: Capas sobre la pantalla
El visor de imágenes, los diálogos de confirmación y las hojas de opciones SHALL abrirse como capas sobre la pantalla actual, con el fondo oscurecido, y MUST NOT agregar entradas al historial de navegación. Cada capa MUST cerrarse con su botón de cerrar o cancelar, tocando fuera de su contenido y con la tecla Escape. En Android con Chrome (en el navegador o con la app instalada), el botón atrás del celular MUST cerrar la capa abierta y dejar a la usuaria en la misma pantalla. En ningún navegador, el botón atrás con una capa abierta MUST sacar a la usuaria de la app. Una capa que no se puede cerrar todavía (por ejemplo, mientras se borra un disco) SHALL ignorar Escape, tocar fuera y el primer atrás.

#### Scenario: Atrás cierra el visor
- **WHEN** la usuaria abre la tapa de un disco en Chrome para Android y usa el botón atrás
- **THEN** se cierra la imagen y sigue en el detalle del disco

#### Scenario: Atrás otra vez después de cerrar
- **WHEN** la usuaria cerró el visor con atrás y vuelve a usar atrás
- **THEN** el sistema vuelve a la pantalla de la banda, sin pasos intermedios

#### Scenario: Atrás cierra la confirmación de borrado
- **WHEN** la usuaria tiene abierto "¿Borrar este disco?" en Chrome para Android y usa el botón atrás
- **THEN** se cierra el diálogo sin borrar nada y sigue en el detalle del disco

#### Scenario: Atrás cierra una hoja de opciones
- **WHEN** la usuaria tiene abierta la hoja de orden en la pantalla principal y usa el botón atrás
- **THEN** se cierra la hoja y la pantalla principal queda igual

#### Scenario: Tocar fuera
- **WHEN** la usuaria toca el fondo oscurecido fuera del contenido de una capa
- **THEN** la capa se cierra

#### Scenario: Escape en escritorio
- **WHEN** la usuaria aprieta Escape con una capa abierta en la computadora
- **THEN** la capa se cierra y la pantalla de atrás no cambia

#### Scenario: Navegador sin soporte
- **WHEN** la usuaria usa atrás con una capa abierta en un navegador que no cierra capas con atrás (por ejemplo, Firefox para Android)
- **THEN** el sistema vuelve a la pantalla anterior de la app, sin salir de ella
