## ADDED Requirements

### Requirement: Lista de deseados
Ajustes SHALL ofrecer la entrada "Lista de deseados", con la cantidad de deseados, que abre una pantalla con los discos que se quieren comprar, ordenados por banda y título. Cada deseado MUST mostrar el disco, la banda y el formato, si tiene uno. La lista MUST ser compartida entre todos los miembros del catálogo. Sin conexión, la lista MUST poder consultarse, y agregar, quitar o cargar deseados MUST estar deshabilitado, indicando el motivo.

#### Scenario: Ver la lista
- **WHEN** la usuaria abre "Lista de deseados" desde Ajustes
- **THEN** ve los deseados ordenados por banda y título

#### Scenario: Lista compartida
- **WHEN** un miembro agrega un deseado
- **THEN** los demás miembros lo ven al sincronizar

#### Scenario: Lista vacía
- **WHEN** no hay deseados
- **THEN** la pantalla indica que la lista está vacía y ofrece agregar uno

#### Scenario: Sin conexión
- **WHEN** la usuaria abre la lista sin conexión
- **THEN** ve los deseados guardados en el dispositivo, sin poder agregar, quitar ni cargar

### Requirement: Agregar un deseado
El sistema SHALL permitir agregar un deseado indicando banda, disco y, opcionalmente, un formato, con "Cualquiera" por defecto. Los campos de banda y disco MUST sugerir datos del catálogo y de MusicBrainz, como en el alta de un disco. La banda MAY no estar en el catálogo. Si el disco ya se tiene en ese formato o, sin formato elegido, en cualquiera, MUST NOT agregarse y el sistema MUST avisar "Ya lo tenés". Si el mismo disco ya está en deseados con ese formato o sin formato elegido, MUST NOT agregarse y el sistema MUST avisar "Ya está en deseados".

#### Scenario: Con formato
- **WHEN** la usuaria agrega "Signos" de Soda Stereo en vinilo
- **THEN** el deseado queda guardado en vinilo

#### Scenario: Sin formato
- **WHEN** la usuaria agrega "Signos" de Soda Stereo sin elegir formato
- **THEN** el deseado queda guardado para cualquier formato

#### Scenario: Banda que no está en el catálogo
- **WHEN** la usuaria agrega un disco de una banda de la que no tiene ninguno
- **THEN** el deseado queda guardado y la banda no aparece en las pestañas hasta tener un disco

#### Scenario: Ya lo tiene
- **WHEN** la usuaria quiere agregar "Signos" en CD y ya lo tiene en CD
- **THEN** el sistema avisa "Ya lo tenés" y no lo agrega

#### Scenario: Lo tiene en otro formato
- **WHEN** la usuaria quiere agregar "Signos" en vinilo y solo lo tiene en CD
- **THEN** el deseado queda guardado en vinilo

#### Scenario: Repetido
- **WHEN** la usuaria quiere agregar "Signos" en vinilo y ya está en deseados en vinilo
- **THEN** el sistema avisa "Ya está en deseados" y no lo agrega

### Requirement: Cargar un deseado
Desde un deseado, el sistema SHALL ofrecer "Cargar", que abre el alta de un disco con la banda, el disco y el formato precargados, y sigue el mismo proceso de siempre. Si el deseado se eligió de MusicBrainz, el alta MUST arrancar con ese disco elegido. Sin formato en el deseado, el alta MUST pedirlo. Al guardar el disco, o al sumar copias a uno existente, el deseado MUST desaparecer de la lista, aunque se haya cambiado el título o el formato. Si la usuaria sale del alta sin guardar, el deseado MUST quedar en la lista.

#### Scenario: Comprar un deseado
- **WHEN** la usuaria toca "Cargar" en "Signos" de Soda Stereo en vinilo y guarda
- **THEN** el disco queda cargado en vinilo y el deseado deja de estar en la lista

#### Scenario: Datos de MusicBrainz
- **WHEN** el deseado se eligió de MusicBrainz y la usuaria toca "Cargar"
- **THEN** el alta arranca con ese disco elegido y busca sus ediciones, tapa y temas

#### Scenario: Deseado sin formato
- **WHEN** la usuaria toca "Cargar" en un deseado sin formato
- **THEN** el alta tiene banda y disco precargados, y pide elegir el formato

#### Scenario: Cambia el título durante el alta
- **WHEN** la usuaria toca "Cargar", cambia el título y guarda
- **THEN** el disco queda cargado con el título nuevo y el deseado deja de estar en la lista

#### Scenario: Ya estaba cargado
- **WHEN** la usuaria toca "Cargar", el alta detecta un duplicado y acepta "Sumar copia"
- **THEN** el disco suma la copia y el deseado deja de estar en la lista

#### Scenario: Sale sin guardar
- **WHEN** la usuaria toca "Cargar" y vuelve atrás sin guardar
- **THEN** el deseado sigue en la lista

### Requirement: Resolver un deseado al tener el disco
Cuando un alta, una importación o una edición dejan en el catálogo un disco con la misma banda y el mismo título normalizado que un deseado, y el deseado no tiene formato o tiene ese mismo formato, el deseado MUST desaparecer de la lista. Un deseado en otro formato MUST quedar en la lista.

#### Scenario: Alta sin pasar por el deseado
- **WHEN** "Signos" en vinilo está en deseados y la usuaria carga ese disco en vinilo desde el botón +
- **THEN** el deseado deja de estar en la lista

#### Scenario: Importación
- **WHEN** "Signos" sin formato está en deseados y se importa "Signos" de Soda Stereo en CD
- **THEN** el deseado deja de estar en la lista

#### Scenario: Otro formato
- **WHEN** "Signos" en vinilo está en deseados y la usuaria carga "Signos" en CD
- **THEN** el deseado en vinilo sigue en la lista

### Requirement: Quitar un deseado
El sistema SHALL permitir quitar un deseado previa confirmación explícita.

#### Scenario: Confirmar
- **WHEN** la usuaria elige quitar un deseado y confirma
- **THEN** el deseado deja de estar en la lista

#### Scenario: Cancelar
- **WHEN** la usuaria elige quitar un deseado y cancela
- **THEN** el deseado sigue en la lista

### Requirement: Pendientes en la pantalla de banda
La pantalla de una banda SHALL mostrar, debajo de sus discos y solo si hay alguno, una sección plegada "Pendientes" con la cantidad, que lista los deseados de esa banda con el formato de la pestaña activa o sin formato. Tocar un pendiente MUST abrir "Cargar". La pantalla SHALL ofrecer también "Agregar a deseados", con la banda precargada y el formato en "Cualquiera".

#### Scenario: Ver los pendientes
- **WHEN** la usuaria entra a Soda Stereo en "Vinilos" y hay dos deseados de la banda en vinilo
- **THEN** ve "Pendientes (2)" plegado y, al abrirlo, esos dos discos

#### Scenario: Deseado sin formato
- **WHEN** un deseado de Soda Stereo no tiene formato
- **THEN** aparece en los pendientes de "Vinilos" y de "CDs"

#### Scenario: Deseado de otro formato
- **WHEN** la usuaria está en "CDs" y el único deseado de la banda es en vinilo
- **THEN** la pantalla no muestra la sección "Pendientes"

#### Scenario: Agregar desde la banda
- **WHEN** la usuaria toca "Agregar a deseados" en la pantalla de Soda Stereo
- **THEN** se abre el formulario con la banda precargada y el formato en "Cualquiera"

### Requirement: Deseados al cambiar una banda
Renombrar una banda MUST conservar sus deseados. Al unir dos bandas, sus deseados MUST pasar a la banda que queda, sin repetidos, y los que coincidan con un disco de esa banda MUST resolverse. Una banda con deseados MUST NOT borrarse al quedarse sin discos. Una banda sin discos MUST borrarse al quitarle su último deseado. Una banda sin discos MUST NOT aparecer en "Completar géneros" ni contarse en su cantidad de Ajustes.

#### Scenario: Renombrar
- **WHEN** la usuaria renombra "Soda Estereo" a "Soda Stereo" y tenía un deseado
- **THEN** el deseado aparece con el nombre nuevo

#### Scenario: Unir con deseados repetidos
- **WHEN** las dos bandas que se unen tienen "Signos" en vinilo en deseados
- **THEN** queda un solo deseado

#### Scenario: Unir y ya tener el disco
- **WHEN** "Soda Estereo" tiene "Signos" en vinilo en deseados, "Soda Stereo" ya lo tiene cargado en vinilo y se unen
- **THEN** el deseado deja de estar en la lista

#### Scenario: Borrar el último disco
- **WHEN** la usuaria borra el último disco de una banda que tiene deseados
- **THEN** la banda sale de las pestañas y sus deseados siguen en la lista

#### Scenario: Quitar el último deseado
- **WHEN** la usuaria quita el único deseado de una banda sin discos
- **THEN** la banda se borra del catálogo

#### Scenario: Completar géneros
- **WHEN** una banda solo tiene deseados y sus géneros están sin revisar
- **THEN** no aparece en "Completar géneros" ni se cuenta en Ajustes

#### Scenario: Primer disco de la banda
- **WHEN** la usuaria carga el primer disco de esa banda y sus géneros siguen sin revisar
- **THEN** la banda pasa a aparecer en "Completar géneros"
