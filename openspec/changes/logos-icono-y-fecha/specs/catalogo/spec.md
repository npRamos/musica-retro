## MODIFIED Requirements

### Requirement: Edición de disco
El sistema SHALL permitir modificar el título, la banda, el formato, las copias (entero ≥ 1), el año (entre 1900 y 2100, opcional), la tapa, la contratapa, un link de Spotify opcional (que MUST pertenecer a `open.spotify.com`) y, dentro de una sección plegada "Más datos", la fecha de carga (que MUST NOT ser futura). El título editado MUST guardarse exactamente como se escribió. Si la edición lo convierte en un disco que ya existe, el sistema MUST NOT guardarla y SHALL ofrecer ir al disco existente.

#### Scenario: Corregir título
- **WHEN** la usuaria cambia el título "Sigons" por "Signos" y guarda
- **THEN** el sistema guarda "Signos" tal cual

#### Scenario: Copias inválidas
- **WHEN** la usuaria intenta guardar 0 copias
- **THEN** el sistema no guarda e indica que el mínimo es 1

#### Scenario: Link de Spotify inválido
- **WHEN** la usuaria pega un link que no es de `open.spotify.com`
- **THEN** el sistema no lo guarda e indica el error

#### Scenario: Edición que genera duplicado
- **WHEN** la usuaria cambia el formato de "Signos" de CD a vinilo y ya tiene "Signos" en vinilo
- **THEN** el sistema no guarda, avisa "Ya tenés ese disco" y ofrece ir al existente

#### Scenario: Año a mano
- **WHEN** la usuaria escribe el año 1994 en un disco que no está en MusicBrainz y guarda
- **THEN** el disco queda con año 1994 y se ordena con ese año dentro de su banda

#### Scenario: Año inválido
- **WHEN** la usuaria escribe el año 94
- **THEN** el sistema no guarda e indica que el año tiene que tener 4 cifras

#### Scenario: Fecha de carga oculta
- **WHEN** la usuaria abre la edición de un disco
- **THEN** la fecha de carga no se ve hasta que abre "Más datos"

#### Scenario: Corregir la fecha de carga
- **WHEN** la usuaria cambia la fecha de carga de un disco importado al 15/03/2019 y guarda
- **THEN** el detalle muestra "15 de marzo de 2019" y el disco se ordena con esa fecha en "Última compra"

#### Scenario: Fecha futura
- **WHEN** la usuaria elige una fecha posterior a hoy
- **THEN** el sistema no guarda e indica que la fecha no puede ser futura
