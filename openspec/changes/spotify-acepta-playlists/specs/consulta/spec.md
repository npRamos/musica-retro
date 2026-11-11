## MODIFIED Requirements

### Requirement: Abrir en Spotify
El detalle de disco SHALL ofrecer la acción "Escuchar en Spotify". Si el disco tiene guardado un link de álbum o de playlist, MUST abrir ese álbum o esa playlist con un link limpio, sin parámetros, sin importar quién cargó el link. Si no tiene link, o el link guardado no es de un álbum ni de una playlist, MUST abrir la búsqueda web de Spotify con banda y título.

#### Scenario: Disco sin link guardado
- **WHEN** la usuaria elige "Escuchar en Spotify" en "Sumo – Llegando los Monos"
- **THEN** el sistema abre `https://open.spotify.com/search/` con "Sumo Llegando los Monos" codificado en la URL

#### Scenario: Disco con link guardado
- **WHEN** el disco tiene un link de álbum de Spotify guardado
- **THEN** el sistema abre ese álbum

#### Scenario: Disco con una playlist guardada
- **WHEN** el link guardado es `https://open.spotify.com/playlist/abc?si=123`
- **THEN** el sistema abre `https://open.spotify.com/playlist/abc`

#### Scenario: Link con parámetros
- **WHEN** el link guardado es `https://open.spotify.com/album/abc?si=123`
- **THEN** el sistema abre `https://open.spotify.com/album/abc`

#### Scenario: Link con idioma
- **WHEN** el link guardado es `https://open.spotify.com/intl-es/album/abc`
- **THEN** el sistema abre `https://open.spotify.com/album/abc`

#### Scenario: Link que no es de un álbum ni de una playlist
- **WHEN** el link guardado es de un perfil o de un tema de Spotify
- **THEN** el sistema abre la búsqueda con banda y título
