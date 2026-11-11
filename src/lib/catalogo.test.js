import { describe, expect, it } from 'vitest'
import { SIN_GENERO, agruparPorGenero, bandasDeFormato, buscar, chipsDeGeneros, discosDeBanda, discosVecinos, fechaLocal, filtrarPorGenero, filtrarSecciones, generosVigentes, leerAnio, limpiarLinkSpotify, linkSpotify, mediodiaLocal, ordenarBandas, ordenarDiscos, pendientesDeGeneros, seccionesPorOrden } from './catalogo.js'

const bandas = [
  { id: 'b1', nombre: 'Soda Stereo' },
  { id: 'b2', nombre: 'Sumo' },
  { id: 'b3', nombre: 'Él Mató a un Policía Motorizado' },
]
const discos = [
  { id: 'd1', banda_id: 'b1', titulo: 'Signos', formato: 'cd', fecha_carga: '2026-01-01', tapa_path: 'u/discos/d1.webp' },
  { id: 'd2', banda_id: 'b1', titulo: 'Doble Vida', formato: 'cd', fecha_carga: '2026-03-01', tapa_path: null },
  { id: 'd3', banda_id: 'b1', titulo: 'Doble Vida', formato: 'vinilo', fecha_carga: '2026-02-01', tapa_path: null },
  { id: 'd4', banda_id: 'b2', titulo: 'Llegando los Monos', formato: 'vinilo', fecha_carga: '2026-05-01', tapa_path: null },
  { id: 'd5', banda_id: 'b3', titulo: 'La Dinastía Scorpio', formato: 'cd', fecha_carga: '2025-12-01', tapa_path: null },
]
const porId = new Map(bandas.map((b) => [b.id, b]))

describe('bandasDeFormato', () => {
  it('incluye solo bandas con discos en el formato y cuenta por formato', () => {
    const cds = bandasDeFormato(bandas, discos, 'cd')
    expect(cds.map((i) => i.banda.id).sort()).toEqual(['b1', 'b3'])
    expect(cds.find((i) => i.banda.id === 'b1').cantidad).toBe(2)
    expect(cds.find((i) => i.banda.id === 'b1').tapas).toEqual(['u/discos/d1.webp'])
  })
})

describe('ordenarBandas', () => {
  const items = bandasDeFormato(bandas, discos, 'cd')
  it('A→Z ignora tildes', () => {
    expect(ordenarBandas(items, 'az').map((i) => i.banda.nombre)).toEqual(['Él Mató a un Policía Motorizado', 'Soda Stereo'])
  })
  it('Z→A', () => {
    expect(ordenarBandas(items, 'za').map((i) => i.banda.nombre)).toEqual(['Soda Stereo', 'Él Mató a un Policía Motorizado'])
  })
  it('última compra usa el disco más reciente del formato', () => {
    expect(ordenarBandas(items, 'reciente')[0].banda.id).toBe('b1')
  })
})

describe('ordenarDiscos', () => {
  it('por título y por fecha', () => {
    const suyos = discos.filter((d) => d.banda_id === 'b1')
    expect(ordenarDiscos(suyos, 'az').map((d) => d.id)).toEqual(['d2', 'd3', 'd1'])
    expect(ordenarDiscos(suyos, 'reciente').map((d) => d.id)).toEqual(['d2', 'd3', 'd1'])
  })
  it('con bandas: A→Z por banda, año y título; Z→A al revés', () => {
    const conBandas = new Map([
      ['dio', { nombre: 'Dio' }],
      ['acdc', { nombre: 'AC/DC' }],
    ])
    const lista = [
      { id: 'last', banda_id: 'dio', titulo: 'The Last in Line', anio: 1984 },
      { id: 'sin', banda_id: 'dio', titulo: 'Angry Machines' },
      { id: 'holy', banda_id: 'dio', titulo: 'Holy Diver', anio: 1983 },
      { id: 'back', banda_id: 'acdc', titulo: 'Back in Black', anio: 1980 },
    ]
    expect(ordenarDiscos(lista, 'az', conBandas).map((d) => d.id)).toEqual(['back', 'holy', 'last', 'sin'])
    expect(ordenarDiscos(lista, 'za', conBandas).map((d) => d.id)).toEqual(['sin', 'last', 'holy', 'back'])
  })
  it('por año, con los que no tienen año al final por título', () => {
    const conAnio = [
      { id: 'dynamo', titulo: 'Dynamo', anio: 1992 },
      { id: 'zeta', titulo: 'Zeta', anio: null },
      { id: 'signos', titulo: 'Signos', anio: 1986 },
      { id: 'alfa', titulo: 'Alfa' },
      { id: 'doble', titulo: 'Doble Vida', anio: 1988 },
    ]
    expect(ordenarDiscos(conAnio, 'anio').map((d) => d.id)).toEqual(['signos', 'doble', 'dynamo', 'alfa', 'zeta'])
  })
})

describe('buscar', () => {
  it('busca por título sin tildes dentro del formato', () => {
    expect(buscar(discos, porId, 'dinastia', 'cd').enFormato.map((d) => d.id)).toEqual(['d5'])
  })
  it('busca por banda', () => {
    expect(buscar(discos, porId, 'soda', 'cd').enFormato).toHaveLength(2)
  })
  it('avisa coincidencias en el otro formato', () => {
    const r = buscar(discos, porId, 'signos', 'vinilo')
    expect(r.enFormato).toHaveLength(0)
    expect(r.enOtro).toBe(1)
  })
})

describe('spotify', () => {
  it('usa el link guardado o arma una búsqueda', () => {
    expect(linkSpotify({ titulo: 'Llegando los Monos' }, { nombre: 'Sumo' })).toBe('https://open.spotify.com/search/Sumo%20Llegando%20los%20Monos')
    expect(linkSpotify({ titulo: 'x', spotify_url: 'https://open.spotify.com/album/1' }, null)).toBe('https://open.spotify.com/album/1')
  })
  it('abre el álbum limpio, y la búsqueda si el link guardado no es de un álbum', () => {
    expect(linkSpotify({ titulo: 'x', spotify_url: 'https://open.spotify.com/album/abc?si=123' }, null)).toBe('https://open.spotify.com/album/abc')
    expect(linkSpotify({ titulo: 'Signos', spotify_url: 'https://open.spotify.com/user/nadia' }, { nombre: 'Soda' })).toBe('https://open.spotify.com/search/Soda%20Signos')
  })
  it('abre la playlist guardada, limpia', () => {
    expect(linkSpotify({ titulo: 'x', spotify_url: 'https://open.spotify.com/playlist/0JAGbTK5y60Xj4V?si=123' }, null)).toBe('https://open.spotify.com/playlist/0JAGbTK5y60Xj4V')
  })
  it('limpia los links de álbum o playlist y rechaza el resto', () => {
    expect(limpiarLinkSpotify('https://open.spotify.com/album/abc')).toBe('https://open.spotify.com/album/abc')
    expect(limpiarLinkSpotify(' https://open.spotify.com/album/abc/?si=123&utm_source=x ')).toBe('https://open.spotify.com/album/abc')
    expect(limpiarLinkSpotify('https://open.spotify.com/intl-es/album/abc')).toBe('https://open.spotify.com/album/abc')
    expect(limpiarLinkSpotify('https://open.spotify.com/playlist/0JAGbTK5y60Xj4V')).toBe('https://open.spotify.com/playlist/0JAGbTK5y60Xj4V')
    expect(limpiarLinkSpotify('https://open.spotify.com/playlist/abc?si=123&pt=x')).toBe('https://open.spotify.com/playlist/abc')
    expect(limpiarLinkSpotify('https://open.spotify.com/intl-es/playlist/abc/')).toBe('https://open.spotify.com/playlist/abc')
    expect(limpiarLinkSpotify('https://open.spotify.com/artist/abc')).toBeNull()
    expect(limpiarLinkSpotify('https://open.spotify.com/user/nadia')).toBeNull()
    expect(limpiarLinkSpotify('https://open.spotify.com/track/abc')).toBeNull()
    expect(limpiarLinkSpotify('https://evil.com/album/abc')).toBeNull()
    expect(limpiarLinkSpotify('http://open.spotify.com/album/abc')).toBeNull()
    expect(limpiarLinkSpotify('cualquier cosa')).toBeNull()
    expect(limpiarLinkSpotify(null)).toBeNull()
  })
})

describe('pendientesDeGeneros', () => {
  it('sin revisar y con discos; las que solo tienen deseados no entran', () => {
    const bandas = [
      { id: 'a', generos_estado: 'pendiente' },
      { id: 'b', generos_estado: 'pendiente' },
      { id: 'c', generos_estado: 'listo' },
    ]
    const discos = [{ banda_id: 'a' }, { banda_id: 'c' }]
    expect(pendientesDeGeneros(bandas, discos).map((b) => b.id)).toEqual(['a'])
    expect(pendientesDeGeneros(bandas, [...discos, { banda_id: 'b' }]).map((b) => b.id)).toEqual(['a', 'b'])
  })
})

describe('discos de una banda', () => {
  const lista = [
    { id: 'c', banda_id: 'soda', formato: 'cd', titulo: 'Dynamo', anio: 1992 },
    { id: 'a', banda_id: 'soda', formato: 'cd', titulo: 'Signos', anio: 1986 },
    { id: 'b', banda_id: 'soda', formato: 'cd', titulo: 'Doble Vida', anio: 1988 },
    { id: 'v', banda_id: 'soda', formato: 'vinilo', titulo: 'Sueño Stereo', anio: 1995 },
    { id: 'x', banda_id: 'otra', formato: 'cd', titulo: 'Otro', anio: 1990 },
  ]

  it('solo esa banda y ese formato, en el orden pedido', () => {
    expect(discosDeBanda(lista, 'soda', 'cd', 'anio').map((d) => d.id)).toEqual(['a', 'b', 'c'])
    expect(discosDeBanda(lista, 'soda', 'cd', 'az').map((d) => d.id)).toEqual(['b', 'c', 'a'])
  })

  it('el anterior y el siguiente, sin dar la vuelta', () => {
    const orden = discosDeBanda(lista, 'soda', 'cd', 'anio')
    expect(discosVecinos(orden, 'b')).toMatchObject({ anterior: { id: 'a' }, siguiente: { id: 'c' } })
    expect(discosVecinos(orden, 'a')).toMatchObject({ anterior: null, siguiente: { id: 'b' } })
    expect(discosVecinos(orden, 'c')).toMatchObject({ anterior: { id: 'b' }, siguiente: null })
    expect(discosVecinos(orden, 'nada')).toEqual({ anterior: null, siguiente: null })
  })
})

describe('lista por género', () => {
  const item = (nombre, generos) => ({ banda: { nombre, generos } })
  const deItem = (i) => i.banda
  const megadeth = item('Megadeth', ['thrash metal', 'heavy metal'])
  const sabbath = item('Black Sabbath', ['heavy metal'])
  const sumo = item('Sumo', [])
  const items = [sabbath, megadeth, sumo]
  const nombres = (s) => s.items.map((i) => i.banda.nombre)

  it('chips en orden alfabético, con cantidades y "Sin género" al final', () => {
    expect(chipsDeGeneros(items, deItem)).toEqual([
      { nombre: 'heavy metal', cantidad: 2 },
      { nombre: 'thrash metal', cantidad: 1 },
      { nombre: 'Sin género', cantidad: 1 },
    ])
  })

  it('un género que no está en la lista se ignora', () => {
    const chips = chipsDeGeneros(items, deItem)
    expect(generosVigentes(['Heavy  Metal', 'new wave'], chips)).toEqual(['heavy metal'])
    expect(generosVigentes(['new wave'], chips)).toEqual([])
  })

  it('filtra por alguno de los elegidos, y sin elegidos deja todo', () => {
    expect(filtrarPorGenero(items, deItem, [])).toBe(items)
    expect(filtrarPorGenero(items, deItem, ['thrash metal'])).toEqual([megadeth])
    expect(filtrarPorGenero(items, deItem, ['thrash metal', SIN_GENERO])).toEqual([megadeth, sumo])
    expect(filtrarPorGenero(items, deItem, [SIN_GENERO])).toEqual([sumo])
  })

  it('agrupada: una banda solo aparece en las secciones elegidas', () => {
    const secciones = filtrarSecciones(agruparPorGenero(items), ['thrash metal'])
    expect(secciones.map((s) => s.genero)).toEqual(['thrash metal'])
    expect(nombres(secciones[0])).toEqual(['Megadeth'])
    expect(filtrarSecciones(agruparPorGenero(items), [SIN_GENERO]).map((s) => s.genero)).toEqual([null])
    expect(filtrarSecciones(agruparPorGenero(items), [])).toHaveLength(3)
  })

  it('ordenada: cada banda una sola vez, bajo su género principal', () => {
    const secciones = seccionesPorOrden(items, deItem)
    expect(secciones.map((s) => s.genero)).toEqual(['heavy metal', 'thrash metal', null])
    expect(secciones.map(nombres)).toEqual([['Black Sabbath'], ['Megadeth'], ['Sumo']])
  })

  it('ordenada con filtro: bajo el primero de sus géneros elegidos', () => {
    const secciones = seccionesPorOrden(filtrarPorGenero(items, deItem, ['heavy metal']), deItem, ['heavy metal'])
    expect(secciones.map((s) => s.genero)).toEqual(['heavy metal'])
    expect(nombres(secciones[0])).toEqual(['Black Sabbath', 'Megadeth'])
  })
})

describe('leerAnio', () => {
  it('vacío es sin año; acepta 4 cifras entre 1900 y 2100', () => {
    expect(leerAnio('')).toEqual({ anio: null })
    expect(leerAnio(' 1986 ')).toEqual({ anio: 1986 })
    expect(leerAnio('86').error).toBe('El año tiene que tener 4 cifras')
    expect(leerAnio('3000').error).toBeTruthy()
    expect(leerAnio('19a6').error).toBeTruthy()
  })
})

describe('fecha de carga', () => {
  it('ida y vuelta sin correrse de día', () => {
    const iso = mediodiaLocal('2019-03-15')
    expect(new Date(iso).getHours()).toBe(12)
    expect(fechaLocal(iso)).toBe('2019-03-15')
    expect(fechaLocal(new Date(2026, 9, 28, 23, 59))).toBe('2026-10-28')
    expect(fechaLocal(new Date(2026, 0, 1, 0, 1))).toBe('2026-01-01')
  })
})

describe('géneros', () => {
  const banda = (id, nombre, generos) => ({ banda: { id, nombre, generos } })
  const items = [
    banda('meg', 'Megadeth', ['thrash metal', 'heavy metal']),
    banda('sum', 'Sumo', []),
    banda('ren', 'La Renga', ['hard rock']),
    banda('ant', 'Anthrax', ['thrash metal']),
  ]

  it('ordena las bandas por su primer género y el nombre, sin género al final', () => {
    expect(ordenarBandas(items, 'genero').map((i) => i.banda.nombre)).toEqual(['La Renga', 'Anthrax', 'Megadeth', 'Sumo'])
  })

  it('ordena los discos por el primer género de su banda y después como A → Z', () => {
    const bandasPorId = new Map(items.map((i) => [i.banda.id, i.banda]))
    const discos = [
      { id: 'peace', banda_id: 'meg', titulo: 'Peace Sells', anio: 1986 },
      { id: 'monos', banda_id: 'sum', titulo: 'Llegando los Monos', anio: 1986 },
      { id: 'rust', banda_id: 'meg', titulo: 'Rust in Peace', anio: 1990 },
      { id: 'pesados', banda_id: 'ren', titulo: 'Despedazado por mil partes', anio: 1996 },
    ]
    expect(ordenarDiscos(discos, 'genero', bandasPorId).map((d) => d.id)).toEqual(['pesados', 'peace', 'rust', 'monos'])
  })

  it('agrupa por género en orden alfabético, con la banda en cada uno de sus géneros y Sin género al final', () => {
    const secciones = agruparPorGenero(items)
    expect(secciones.map((s) => s.genero)).toEqual(['hard rock', 'heavy metal', 'thrash metal', null])
    expect(secciones[2].items.map((i) => i.banda.nombre)).toEqual(['Megadeth', 'Anthrax'])
    expect(secciones[3].items.map((i) => i.banda.nombre)).toEqual(['Sumo'])
  })
})
