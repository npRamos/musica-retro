## ADDED Requirements

### Requirement: Ingreso con magic link o código
El sistema SHALL permitir el ingreso mediante un mail que contiene un magic link y un código de un solo uso. Ingresar con cualquiera de los dos MUST iniciar la sesión.

#### Scenario: Ingreso con el link
- **WHEN** la usuaria ingresa su mail, pide el acceso y abre el link recibido en el mismo navegador
- **THEN** el sistema inicia la sesión y muestra el catálogo

#### Scenario: Ingreso con el código
- **WHEN** la usuaria pide el acceso y escribe en la app el código de 6 dígitos recibido por mail
- **THEN** el sistema inicia la sesión y muestra el catálogo

#### Scenario: Código inválido o vencido
- **WHEN** la usuaria escribe un código incorrecto o vencido
- **THEN** el sistema muestra un error y permite pedir un nuevo mail

### Requirement: Una sola usuaria, sin registro
El sistema MUST NOT permitir la creación de cuentas nuevas desde la app. Solo una cuenta creada previamente por la administradora puede ingresar.

#### Scenario: Mail no registrado
- **WHEN** alguien pide acceso con un mail que no tiene cuenta
- **THEN** el sistema no crea una cuenta y no se puede iniciar sesión

### Requirement: Sesión persistente por dispositivo
El sistema SHALL mantener la sesión iniciada en cada dispositivo entre visitas hasta que la usuaria cierre la sesión.

#### Scenario: Volver a abrir la app
- **WHEN** la usuaria vuelve a abrir la app en un dispositivo donde ya ingresó
- **THEN** el sistema muestra el catálogo sin pedir un nuevo ingreso

#### Scenario: Cerrar sesión
- **WHEN** la usuaria elige "Cerrar sesión"
- **THEN** el sistema cierra la sesión, borra la caché local del catálogo y muestra la pantalla de ingreso

### Requirement: Datos aislados por dueña
El sistema MUST impedir el acceso a bandas y discos a cualquier solicitud que no esté autenticada como la dueña de esos datos.

#### Scenario: Acceso anónimo a la API
- **WHEN** se consulta la API de datos sin sesión, usando solo la clave pública
- **THEN** el sistema no devuelve ninguna banda ni disco

#### Scenario: Escritura con otra dueña
- **WHEN** una solicitud autenticada intenta crear un disco con un `owner_id` distinto del propio
- **THEN** el sistema rechaza la operación
