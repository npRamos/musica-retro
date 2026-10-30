## MODIFIED Requirements

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
