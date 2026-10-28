## ADDED Requirements

### Requirement: Deploy automático a GitHub Pages
Cada push a la rama `main` SHALL construir la app y publicarla en GitHub Pages. La configuración de Supabase MUST tomarse de variables del repositorio, nunca del código.

#### Scenario: Push a main
- **WHEN** se hace push a `main`
- **THEN** un workflow construye la app y la publica en la URL de Pages del repositorio

#### Scenario: Sin claves en el código
- **WHEN** se revisa el repositorio
- **THEN** no contiene la URL ni las claves de Supabase en archivos versionados, salvo un `.env.example` con valores vacíos

### Requirement: Keep-alive de Supabase
Un workflow programado SHALL hacer, al menos cada 3 días, una solicitud a la base que ejecute una consulta, para evitar que el free tier pause el proyecto. El workflow MUST fallar si la solicitud no responde con éxito, y SHALL poder ejecutarse a mano.

#### Scenario: Ping exitoso
- **WHEN** corre el workflow programado
- **THEN** llama a la función `ping` de la base y termina bien

#### Scenario: Base pausada o caída
- **WHEN** la solicitud falla
- **THEN** el workflow termina con error, y GitHub notifica la falla

### Requirement: Estructura de la base versionada
La estructura de la base (tablas, tipos, triggers, funciones y políticas RLS) SHALL estar definida en migrations SQL dentro del repositorio, que se puedan aplicar sobre un proyecto vacío y dejarlo funcional.

#### Scenario: Proyecto nuevo
- **WHEN** se aplican las migrations en orden sobre un proyecto Supabase vacío
- **THEN** la base queda lista para que la app funcione, sin pasos SQL manuales adicionales

### Requirement: Documentación de puesta en marcha
El repositorio SHALL incluir un README con los pasos para crear el proyecto de Supabase, configurar Auth (signups deshabilitados, template con código, URLs de redirección), crear la usuaria, configurar Pages y las variables, y reactivar el keep-alive si GitHub lo desactiva.

#### Scenario: Reinstalar desde cero
- **WHEN** alguien sigue el README en un proyecto Supabase y un repo nuevos
- **THEN** obtiene la app funcionando sin información adicional
