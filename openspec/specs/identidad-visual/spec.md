# identidad-visual Specification

## Purpose
Dar a la app su aspecto propio: estética rock/metal, tema oscuro y claro, color de acento elegible, diferenciación visual de vinilo y CD, diseño pensado primero para el celular e ícono de la aplicación.
## Requirements
### Requirement: Estética rock/metal propia
La interfaz SHALL combinar una identidad rock/metal (tipografía blackletter solo en el logo y los títulos de sección, etiquetas condensadas en mayúsculas) con el estilo de la referencia: fondo casi negro con una luz difusa del color de acento, separadores finos, íconos de línea, controles circulares delineados y las imágenes como protagonistas. La interfaz MUST NOT usar degradés lineales violeta→azul o violeta→rosa, glassmorphism con blur, sombras difusas, tarjetas muy redondeadas, emojis como íconos, ni Inter como fuente principal.

#### Scenario: Tipografía display acotada
- **WHEN** se muestra cualquier pantalla
- **THEN** la fuente blackletter aparece solo en el logo y los títulos de sección, nunca en datos de discos, campos ni botones

#### Scenario: Acento no invasivo
- **WHEN** se muestra el catálogo
- **THEN** el color de acento se usa solo en la acción primaria, la pestaña activa, los avisos, la selección y la luz tenue del fondo, nunca como relleno de áreas grandes

### Requirement: Tema oscuro y claro
El sistema SHALL ofrecer un tema oscuro ("escenario") y uno claro ("fanzine"). Por defecto MUST seguir la preferencia del sistema operativo, y SHALL permitir un cambio manual que se recuerde en el dispositivo.

#### Scenario: Preferencia del sistema
- **WHEN** el celular está en modo oscuro y la usuaria nunca eligió un tema
- **THEN** la app se muestra en tema oscuro

#### Scenario: Elección manual
- **WHEN** la usuaria elige el tema claro
- **THEN** la app usa el tema claro y lo mantiene en las próximas visitas en ese dispositivo

#### Scenario: Contraste legible
- **WHEN** se muestra texto sobre el fondo en cualquier combinación de tema y acento
- **THEN** el contraste del texto principal y del texto de acento cumple al menos WCAG AA (4.5:1)

### Requirement: Color de acento elegible
El sistema SHALL permitir elegir el color de acento entre violeta "Sabbath" (por defecto) y rojo sangre. La elección MUST sincronizarse entre los dispositivos de la usuaria y aplicarse al instante, incluida la luz del fondo.

#### Scenario: Acento por defecto
- **WHEN** la usuaria nunca eligió un acento
- **THEN** la app usa el violeta

#### Scenario: Cambiar a rojo
- **WHEN** la usuaria elige rojo sangre en Ajustes
- **THEN** la app cambia el acento al instante y, al abrirla en otro dispositivo con conexión, también se ve en rojo

### Requirement: Identificación visual del formato
Cada disco sin tapa SHALL mostrar un placeholder con un ícono propio, distinto para vinilo y para CD. Los badges de formato MUST distinguir los dos formatos.

#### Scenario: Disco sin tapa
- **WHEN** se lista un vinilo sin tapa
- **THEN** su tarjeta muestra el ícono de vinilo en lugar de la tapa

### Requirement: Mobile-first
La interfaz SHALL estar diseñada primero para el celular: buscador y pestañas fijos arriba, acción de agregar al alcance del pulgar, áreas táctiles de al menos 44px y ningún scroll horizontal desde 320px de ancho.

#### Scenario: Pantalla angosta
- **WHEN** la app se abre en una pantalla de 360px de ancho
- **THEN** no hay scroll horizontal, la grilla muestra 2 columnas y el botón de agregar es visible y alcanzable

### Requirement: Ícono de la aplicación
El ícono de la app (acceso directo y pestaña del navegador) SHALL mostrar el dibujo del vinilo de la marca sobre un fondo violeta tipo vidrio líquido, con contraste suficiente para distinguir el disco. La versión para Android (maskable) MUST mantener el disco completo dentro de la zona segura, sin que el recorte lo corte. La restricción de no usar glassmorphism aplica a la interfaz, no al ícono.

#### Scenario: Pantalla de inicio
- **WHEN** la usuaria agrega la app a la pantalla de inicio de un celular con fondo oscuro
- **THEN** el ícono se distingue: el disco oscuro sobre el vidrio violeta

#### Scenario: Recorte circular en Android
- **WHEN** Android muestra el ícono recortado en círculo
- **THEN** el disco se ve completo

