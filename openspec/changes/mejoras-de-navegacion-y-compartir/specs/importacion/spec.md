## ADDED Requirements

### Requirement: Link de Spotify al importar
Al importar, un link de Spotify MUST ser de un álbum de `open.spotify.com` y MUST guardarse sin parámetros. Una línea con un link que no cumple MUST marcarse como inválida, indicando el motivo.

#### Scenario: Link con parámetros
- **WHEN** una línea trae `https://open.spotify.com/album/abc?si=123`
- **THEN** el disco se importa con `https://open.spotify.com/album/abc`

#### Scenario: Link que no es de un álbum
- **WHEN** una línea trae el link de un perfil de Spotify
- **THEN** la línea se marca como inválida e indica que el link tiene que ser de un álbum
