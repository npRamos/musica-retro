## ADDED Requirements

### Requirement: Estado del disco
Al agregar o editar un disco, el sistema SHALL permitir, dentro de la sección plegada "Más datos", marcar etiquetas de estado y escribir una observación libre, ambas opcionales. Las etiquetas MUST depender del formato: Rayado, Muy rayado, Caja rota y Sin caja para CD; Rayado, Muy rayado, Tapa rota y Necesita funda para vinilo. Rayado y Muy rayado MUST excluirse entre sí; las demás MUST poder combinarse. Si se cambia el formato, MUST quitarse las etiquetas que no corresponden al nuevo. La sección "Más datos" MUST estar plegada, salvo que el disco ya tenga un estado. Al sumar copias a un disco existente, su estado MUST NOT cambiar. Al unir dos bandas con el mismo disco, el disco que queda MUST tener las etiquetas de los dos, con Muy rayado en lugar de Rayado, y sus dos observaciones.

#### Scenario: Marcar el estado
- **WHEN** la usuaria edita un CD, abre "Más datos", marca "Rayado" y "Caja rota" y guarda
- **THEN** el disco queda con esos dos estados

#### Scenario: Estado al cargar
- **WHEN** la usuaria agrega un vinilo, abre "Más datos", marca "Necesita funda" y guarda
- **THEN** el disco queda con ese estado

#### Scenario: Oculto por defecto
- **WHEN** la usuaria abre la edición de un disco sin estado
- **THEN** las etiquetas no se ven hasta que abre "Más datos"

#### Scenario: Etiquetas según el formato
- **WHEN** la usuaria edita un vinilo
- **THEN** puede marcar "Tapa rota" y no ve "Caja rota"

#### Scenario: Rayado y muy rayado
- **WHEN** el disco tiene "Rayado" y la usuaria marca "Muy rayado"
- **THEN** queda solo "Muy rayado"

#### Scenario: Observación
- **WHEN** la usuaria escribe "Una de las dos copias está rayada" y guarda
- **THEN** el disco queda con esa observación

#### Scenario: Cambiar de formato
- **WHEN** la usuaria cambia un CD con "Rayado" y "Caja rota" a vinilo y guarda
- **THEN** el disco queda solo con "Rayado"

#### Scenario: Sumar una copia
- **WHEN** la usuaria carga un disco repetido marcando "Rayado" y acepta "Sumar copia"
- **THEN** el disco existente suma la copia y conserva el estado que tenía

#### Scenario: Unir bandas con el mismo disco
- **WHEN** se unen dos bandas con el mismo CD, uno "Rayado" y otro "Muy rayado" y "Sin caja"
- **THEN** queda un solo disco con "Muy rayado" y "Sin caja"
