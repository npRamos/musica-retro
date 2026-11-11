## MODIFIED Requirements

### Requirement: Link de Spotify en la planilla
La columna Spotify de la planilla MUST tener el link limpio del álbum o de la playlist, sin parámetros. Si el link guardado no es de un álbum ni de una playlist, la celda MUST quedar vacía.

#### Scenario: Link con parámetros
- **WHEN** un disco tiene guardado `https://open.spotify.com/album/abc?si=123`
- **THEN** la planilla muestra `https://open.spotify.com/album/abc`

#### Scenario: Link de una playlist
- **WHEN** un disco tiene guardado `https://open.spotify.com/playlist/abc?si=123`
- **THEN** la planilla muestra `https://open.spotify.com/playlist/abc`

#### Scenario: Link que no es de un álbum ni de una playlist
- **WHEN** un disco tiene guardado el link de un perfil de Spotify
- **THEN** la celda de Spotify queda vacía
