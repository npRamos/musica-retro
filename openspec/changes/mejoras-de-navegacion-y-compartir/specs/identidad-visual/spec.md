## ADDED Requirements

### Requirement: Sin barras de desplazamiento
La app MUST NOT mostrar las barras de desplazamiento del navegador en ninguna pantalla. Todo lo que se desplaza MUST seguir desplazándose igual.

#### Scenario: Lista larga
- **WHEN** la usuaria desplaza una lista larga con el índice activado
- **THEN** se ve solo la manija del índice, sin una segunda barra al costado

#### Scenario: Sin índice
- **WHEN** la usuaria desactivó el índice y desplaza una lista larga
- **THEN** la lista se desplaza sin ninguna barra visible
