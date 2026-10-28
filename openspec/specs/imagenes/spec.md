# imagenes Specification

## Purpose
TBD - created by archiving change catalogo-discos-mvp. Update Purpose after archive.
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
Además de la tapa, el sistema SHALL permitir asignar una contratapa a cada disco (para ver la lista de temas), con las mismas opciones de cámara o galería. La contratapa MUST NOT recortarse: conserva su proporción y se guarda con hasta 1200 píxeles en el lado mayor, para que los temas se puedan leer.

#### Scenario: Cargar contratapa de un CD
- **WHEN** la usuaria saca una foto de la contratapa rectangular de un CD
- **THEN** el sistema la guarda completa, sin cortar los bordes, y la muestra en el detalle del disco

#### Scenario: Leer los temas
- **WHEN** la usuaria toca la contratapa en el detalle
- **THEN** se abre a pantalla completa y se puede ampliar con dos dedos

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

