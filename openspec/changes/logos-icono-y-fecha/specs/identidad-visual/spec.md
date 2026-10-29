## ADDED Requirements

### Requirement: Ícono de la aplicación
El ícono de la app (acceso directo y pestaña del navegador) SHALL mostrar el dibujo del vinilo de la marca sobre un fondo violeta tipo vidrio líquido, con contraste suficiente para distinguir el disco. La versión para Android (maskable) MUST mantener el disco completo dentro de la zona segura, sin que el recorte lo corte. La restricción de no usar glassmorphism aplica a la interfaz, no al ícono.

#### Scenario: Pantalla de inicio
- **WHEN** la usuaria agrega la app a la pantalla de inicio de un celular con fondo oscuro
- **THEN** el ícono se distingue: el disco oscuro sobre el vidrio violeta

#### Scenario: Recorte circular en Android
- **WHEN** Android muestra el ícono recortado en círculo
- **THEN** el disco se ve completo
