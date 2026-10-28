## ADDED Requirements

### Requirement: Ingreso con contraseña
El sistema SHALL permitir el ingreso con mail y contraseña como opción principal, sin enviar ningún mail. Las contraseñas MUST asignarlas la administradora; la app no ofrece registro ni recuperación de contraseña.

#### Scenario: Ingreso correcto
- **WHEN** la usuaria escribe su mail y su contraseña y toca "Entrar"
- **THEN** el sistema inicia la sesión y muestra el catálogo

#### Scenario: Contraseña incorrecta
- **WHEN** el mail o la contraseña no coinciden
- **THEN** el sistema muestra "Mail o contraseña incorrectos" sin indicar cuál de los dos falló

### Requirement: Cambiar y recuperar la contraseña
Con la sesión iniciada, el sistema SHALL permitir cambiar la contraseña desde Ajustes sin enviar mails. Sin sesión, SHALL ofrecer "¿Olvidaste tu contraseña?": envía un link por mail y, al abrirlo, MUST pedir una contraseña nueva antes de mostrar el catálogo. La contraseña nueva MUST tener al menos 8 caracteres y escribirse dos veces.

#### Scenario: Cambiar desde Ajustes
- **WHEN** la usuaria con sesión iniciada escribe dos veces una contraseña nueva de 8 o más caracteres
- **THEN** el sistema la guarda y confirma "Contraseña cambiada"

#### Scenario: Olvidó la contraseña
- **WHEN** la usuaria pide el link de recuperación y lo abre en el dispositivo
- **THEN** el sistema muestra la pantalla "Nueva contraseña" y, al guardarla, entra al catálogo

#### Scenario: No coinciden
- **WHEN** las dos contraseñas escritas son distintas
- **THEN** el sistema no guarda y lo indica

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

### Requirement: Solo cuentas invitadas, sin registro
El sistema MUST NOT permitir la creación de cuentas nuevas desde la app. Solo pueden ingresar las cuentas invitadas previamente por la administradora.

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

### Requirement: Catálogo compartido entre miembros
El sistema SHALL ofrecer un único catálogo compartido: todas las cuentas listadas como miembros ven y editan las mismas bandas, discos e imágenes. El sistema MUST impedir el acceso a cualquier solicitud sin sesión o de una cuenta que no sea miembro.

#### Scenario: Lo que carga uno lo ve el otro
- **WHEN** un miembro agrega un disco con tapa
- **THEN** el otro miembro, al sincronizar, ve ese disco y su tapa

#### Scenario: Duplicado entre miembros
- **WHEN** un miembro carga un disco que el otro ya había cargado (misma banda, título y formato)
- **THEN** el sistema avisa que ya está en el catálogo y ofrece sumar copia

#### Scenario: Cuenta que no es miembro
- **WHEN** una cuenta con sesión iniciada no está en la lista de miembros
- **THEN** no ve ninguna banda, disco ni imagen, y no puede guardar nada

#### Scenario: Acceso anónimo a la API
- **WHEN** se consulta la API de datos sin sesión, usando solo la clave pública
- **THEN** el sistema no devuelve ninguna banda ni disco

