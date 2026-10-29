## ADDED Requirements

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
