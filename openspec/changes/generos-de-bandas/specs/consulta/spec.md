## MODIFIED Requirements

### Requirement: Pantalla de banda
Al tocar una banda, el sistema SHALL mostrar sus géneros (si tiene) bajo el encabezado y sus discos del formato de la pestaña activa, en la vista (cuadrícula o lista) elegida y ordenados por año (del más antiguo al más nuevo) salvo que la usuaria elija otro orden, con la tapa, el título, el año y la cantidad de copias de cada disco. Los discos sin año MUST ir al final, ordenados por título. El botón atrás del dispositivo MUST volver a la grilla de bandas.

#### Scenario: Entrar a una banda
- **WHEN** la usuaria toca "Soda Stereo" en la pestaña "CDs"
- **THEN** el sistema muestra solo los CDs de Soda Stereo

#### Scenario: Géneros de la banda
- **WHEN** la usuaria entra a "Megadeth", que tiene "thrash metal", "heavy metal" y "speed metal"
- **THEN** ve esos tres géneros bajo el encabezado

#### Scenario: Banda sin géneros
- **WHEN** la banda no tiene géneros
- **THEN** la pantalla no muestra la fila de géneros

#### Scenario: Discografía por año
- **WHEN** la usuaria tiene en CD "Doble Vida" (1988), "Signos" (1986) y "Dynamo" (1992) y entra a Soda Stereo
- **THEN** los discos aparecen en el orden Signos, Doble Vida, Dynamo

#### Scenario: Discos sin año
- **WHEN** la banda tiene un disco sin año
- **THEN** ese disco aparece después de los que tienen año

#### Scenario: Volver
- **WHEN** la usuaria usa el botón atrás del celular en la pantalla de banda
- **THEN** el sistema vuelve a la grilla de bandas de la misma pestaña

#### Scenario: Agregar desde la banda
- **WHEN** la usuaria toca "+" dentro de la pantalla de una banda
- **THEN** el formulario de alta se abre con la banda y el formato precargados
