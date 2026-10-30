# imagenes Specification

## Purpose
Manejar las imágenes de discos y bandas: tapa, contratapa, imagen y logo de banda, sacadas con la cámara, elegidas de la galería o traídas de Cover Art Archive y Wikidata, procesadas en el dispositivo, guardadas en almacenamiento privado, disponibles sin conexión y borradas cuando dejan de usarse.
## Requirements
### Requirement: Tapa de disco desde cámara o galería
El sistema SHALL permitir asignar una tapa a un disco, al darlo de alta o al editarlo, sacando una foto con la cámara o eligiendo una imagen de la galería. Antes de guardar, MUST mostrar una vista previa con opción de descartarla.

#### Scenario: Sacar foto
- **WHEN** la usuaria elige "Sacar foto" en el alta de un disco desde el celular
- **THEN** se abre la cámara trasera y, al tomar la foto, el sistema muestra la vista previa recortada

#### Scenario: Elegir de galería
- **WHEN** la usuaria elige "Elegir de galería" y selecciona una imagen
- **THEN** el sistema muestra la vista previa recortada

#### Scenario: Descartar
- **WHEN** la usuaria toca "Otra" en la vista previa
- **THEN** el sistema descarta la imagen y permite elegir o sacar otra

### Requirement: Contratapa del disco
Además de la tapa, el sistema SHALL permitir asignar una contratapa a cada disco (para ver la lista de temas), con las mismas opciones de cámara o galería. La contratapa MUST NOT recortarse: conserva su proporción y se guarda con hasta 1200 píxeles en el lado mayor, para que los temas se puedan leer. Al tocar la tapa o la contratapa en el detalle, el sistema SHALL mostrarla entera en una capa sobre el detalle oscurecido. Tocar la imagen MUST alternar entre verla entera y ampliada al doble, con desplazamiento dentro de la capa.

#### Scenario: Cargar contratapa de un CD
- **WHEN** la usuaria saca una foto de la contratapa rectangular de un CD
- **THEN** el sistema la guarda completa, sin cortar los bordes, y la muestra en el detalle del disco

#### Scenario: Leer los temas
- **WHEN** la usuaria toca la contratapa en el detalle
- **THEN** se abre en una capa sobre el detalle, entera y centrada, con un botón para cerrarla

#### Scenario: Ampliar la contratapa
- **WHEN** la usuaria toca la contratapa abierta en la capa
- **THEN** la imagen se amplía al doble y se puede desplazar para leer los temas; otro toque la vuelve a mostrar entera

#### Scenario: Cerrar la imagen con la ✕
- **WHEN** la usuaria toca la ✕ con la tapa abierta en la capa
- **THEN** la capa se cierra y sigue en el detalle del disco, en el mismo lugar

### Requirement: Imagen de banda
El sistema SHALL permitir asignar, reemplazar o quitar una imagen propia de una banda desde la edición de la banda, con las mismas opciones de cámara o galería.

#### Scenario: Asignar imagen de banda
- **WHEN** la usuaria asigna una foto a "Sumo"
- **THEN** la tarjeta de "Sumo" muestra esa imagen en las dos pestañas

#### Scenario: Quitar imagen de banda
- **WHEN** la usuaria quita la imagen de una banda
- **THEN** la tarjeta vuelve a mostrar el mosaico de tapas o la tarjeta tipográfica

### Requirement: Procesamiento en el dispositivo
Antes de subirla, el sistema MUST recortar la imagen en cuadrado centrado, respetando su orientación, reducirla a 600×600 píxeles como máximo y comprimirla (WebP, o JPEG si el navegador no soporta WebP).

#### Scenario: Foto grande del celular
- **WHEN** la usuaria saca una foto de 12 MP
- **THEN** el archivo subido es cuadrado, de 600×600 como máximo y pesa menos de 150 KB

### Requirement: Almacenamiento privado
Las imágenes MUST guardarse en un almacenamiento privado, accesible solo con la sesión de la dueña. MUST NOT existir URLs públicas permanentes.

#### Scenario: Acceso sin sesión
- **WHEN** alguien intenta leer una imagen sin sesión o con una URL firmada vencida
- **THEN** el almacenamiento rechaza la solicitud

### Requirement: Imágenes sin conexión
El sistema SHALL guardar en el dispositivo las imágenes ya vistas, para mostrarlas sin conexión. Al reemplazar una imagen MUST mostrarse la nueva, no la guardada.

#### Scenario: Ver tapas sin señal
- **WHEN** la usuaria abre la app sin conexión después de haber visto las tapas con conexión
- **THEN** las tapas se muestran desde la caché del dispositivo

#### Scenario: Reemplazar tapa
- **WHEN** la usuaria reemplaza la tapa de un disco
- **THEN** en todos los dispositivos, al sincronizar, se ve la tapa nueva

### Requirement: Limpieza de imágenes
El sistema MUST borrar del almacenamiento la tapa de un disco borrado y la imagen de una banda eliminada al unir bandas.

#### Scenario: Borrar disco con tapa
- **WHEN** la usuaria borra un disco que tenía tapa
- **THEN** el archivo de la tapa se elimina del almacenamiento

### Requirement: Tapa y contratapa desde Cover Art Archive
Cuando la edición elegida de MusicBrainz tiene tapa o contratapa en Cover Art Archive, el sistema SHALL descargarlas y procesarlas igual que una foto (la tapa recortada en cuadrado, la contratapa sin recortar) y guardarlas en el almacenamiento privado. Las imágenes MUST NOT quedar guardadas como links a Cover Art Archive, para que se vean sin conexión.

#### Scenario: Tapa precargada
- **WHEN** la usuaria elige "Signos" en CD
- **THEN** el formulario muestra la tapa y la contratapa de esa edición en la vista previa, con la opción de cambiarlas

#### Scenario: Ver sin señal
- **WHEN** la usuaria guardó un disco con la tapa de Cover Art Archive y después lo abre sin conexión
- **THEN** la tapa se ve igual que una foto propia

#### Scenario: La descarga falla
- **WHEN** la imagen de Cover Art Archive no se puede descargar
- **THEN** el lugar queda vacío para elegir una foto y el disco se puede guardar igual

### Requirement: Logo de banda
Cada banda SHALL poder tener un logo, además de su imagen propia. Cuando una banda queda enlazada a MusicBrainz y nunca se buscó su logo, el sistema SHALL buscarlo en Wikidata y, si existe, guardarlo en el almacenamiento privado sin recortarlo y conservando la transparencia. Desde la edición de la banda, el sistema SHALL permitir buscar el logo en Wikidata, elegir un archivo propio o quitarlo. Un logo quitado MUST NOT volver a buscarse solo. Al reemplazar o quitar un logo, o al unir o borrar la banda, el archivo anterior MUST borrarse del almacenamiento.

#### Scenario: Logo automático
- **WHEN** la usuaria completa desde MusicBrainz el primer disco de Iron Maiden
- **THEN** la banda queda con el logo de Iron Maiden de Wikidata, sin que haga nada más

#### Scenario: Banda sin logo en Wikidata
- **WHEN** una banda enlazada no tiene logo en Wikidata
- **THEN** la banda queda sin logo, no se vuelve a buscar automáticamente y la tarjeta se ve como antes

#### Scenario: Logo propio
- **WHEN** la usuaria elige un PNG con fondo transparente en "Elegir archivo"
- **THEN** el sistema lo guarda como logo de la banda, con la transparencia

#### Scenario: Quitar
- **WHEN** la usuaria quita el logo de una banda
- **THEN** el logo se borra y no reaparece al completar otros discos de esa banda

#### Scenario: Wikidata no responde
- **WHEN** la búsqueda automática falla por un error de red
- **THEN** la banda queda sin logo y la búsqueda se reintenta en la próxima oportunidad

