import { describe, expect, it } from 'vitest'
import {
  agruparDiscos,
  anioDe,
  contarTemas,
  convertirTemas,
  describirEdicion,
  duracion,
  elegirArtista,
  elegirDisco,
  elegirEdicion,
  elegirLogo,
  simplificarDisco,
  simplificarEdicion,
  tituloMedio,
} from './discografia.js'

const rg = (title, fecha, primario = 'Album', secundarios = []) => ({
  id: title,
  title,
  'first-release-date': fecha,
  'primary-type': primario,
  'secondary-types': secundarios,
})

const discos = [
  rg('Doble vida', '1988'),
  rg('Signos', '1986'),
  rg('Ruido blanco', '1987', 'Album', ['Live']),
  rg('Zona de promesas', '1993', 'Album', ['Remix']),
  rg('Languis', '1989', 'EP'),
  rg('Chau Soda', '1997-10-21', 'Album', ['Compilation']),
  rg('Sin fecha', ''),
].map(simplificarDisco)

describe('agruparDiscos', () => {
  it('agrupa en estudio, EP, en vivo y compilados, cada grupo por año', () => {
    const grupos = agruparDiscos(discos)
    expect(grupos.map((g) => g.clave)).toEqual(['estudio', 'ep', 'vivo', 'compilados'])
    expect(grupos[0].discos.map((d) => d.titulo)).toEqual(['Signos', 'Doble vida', 'Sin fecha'])
    expect(grupos[3].discos.map((d) => d.titulo)).toEqual(['Zona de promesas', 'Chau Soda'])
  })
  it('filtra por título sin tildes y omite grupos vacíos', () => {
    const grupos = agruparDiscos(discos, 'SIG')
    expect(grupos).toHaveLength(1)
    expect(grupos[0].discos[0].titulo).toBe('Signos')
  })
})

describe('anioDe', () => {
  it('toma el año de fechas completas o parciales', () => {
    expect(anioDe('1997-10-21')).toBe(1997)
    expect(anioDe('1986')).toBe(1986)
    expect(anioDe('')).toBeNull()
    expect(anioDe(undefined)).toBeNull()
  })
})

const edicion = (id, formatos, { pais = 'AR', fecha = '1986', front = true, back = false } = {}) =>
  simplificarEdicion({
    id,
    date: fecha,
    country: pais,
    media: formatos.map((format) => ({ format })),
    'cover-art-archive': { front, back },
  })

// Las 7 ediciones reales de "Signos" (consultadas el 28/10/2026)
const signos = [
  edicion('vinilo-ar-86', ['12" Vinyl']),
  edicion('digital-07', ['Digital Media'], { fecha: '2007-07-24', back: true }),
  edicion('cd-us-90', ['CD'], { pais: 'US', fecha: '1990' }),
  edicion('cd-ar-91', ['CD'], { fecha: '1991' }),
  edicion('cd-ar-86', ['CD'], { back: true }),
  edicion('cd-ar-07-sin', ['CD'], { fecha: '2007-07-24', front: false }),
  edicion('cd-ar-07', ['CD'], { fecha: '2007', back: true }),
]

describe('elegirEdicion', () => {
  it('CD: el argentino de 1986 con tapa y contratapa', () => {
    expect(elegirEdicion(signos, 'cd')).toEqual({ edicion: signos[4], coincide: true })
  })
  it('vinilo: el vinilo aunque no tenga contratapa', () => {
    expect(elegirEdicion(signos, 'vinilo').edicion.id).toBe('vinilo-ar-86')
  })
  it('sin ediciones en el formato: la mejor del resto y lo avisa', () => {
    const r = elegirEdicion(signos.filter((e) => e.id !== 'vinilo-ar-86'), 'vinilo')
    expect(r.coincide).toBe(false)
    expect(r.edicion.id).toBe('cd-ar-86')
  })
  it('una edición CD + DVD cuenta como CD', () => {
    expect(elegirEdicion([edicion('x', ['CD', 'DVD-Video'])], 'cd').coincide).toBe(true)
  })
  it('sin ediciones', () => {
    expect(elegirEdicion([], 'cd')).toEqual({ edicion: null, coincide: false })
  })
})

describe('describirEdicion', () => {
  it('formato, país y año', () => {
    expect(describirEdicion(signos[4])).toBe('CD · AR · 1986')
    expect(describirEdicion(edicion('x', ['12" Vinyl', '12" Vinyl'], { pais: null, fecha: '1990-05' }))).toBe('2×12" Vinilo · 1990')
  })
})

const release = {
  media: [
    { position: 1, format: 'CD', tracks: [{ number: '1', position: 1, title: 'Sin sobresaltos', length: 264000 }, { number: '2', position: 2, title: 'El rito', length: 368000 }] },
    { position: 2, format: 'CD', tracks: [{ number: '1', position: 1, title: 'Extra', length: null }] },
    { position: 3, format: 'DVD-Video', tracks: [] },
  ],
}

describe('temas', () => {
  it('convierte los medios y omite los vacíos', () => {
    const temas = convertirTemas(release)
    expect(temas).toHaveLength(2)
    expect(temas[0]).toEqual({
      medio: 1,
      formato: 'CD',
      temas: [
        { n: '1', titulo: 'Sin sobresaltos', ms: 264000 },
        { n: '2', titulo: 'El rito', ms: 368000 },
      ],
    })
    expect(contarTemas(temas)).toBe(3)
    expect(contarTemas(null)).toBe(0)
  })
  it('duración m:ss', () => {
    expect(duracion(264000)).toBe('4:24')
    expect(duracion(343960)).toBe('5:44')
    expect(duracion(null)).toBe('')
  })
  it('título de medio solo si hay varios', () => {
    expect(tituloMedio({ medio: 2 }, 2)).toBe('Disco 2')
    expect(tituloMedio({ medio: 1 }, 1)).toBeNull()
  })
})

describe('candidatos', () => {
  const artistas = [
    { id: 'a', nombre: 'Rey Patricio', score: 100 },
    { id: 'b', nombre: 'Patricio Rey y sus Redonditos de Ricota', score: 94 },
  ]
  it('artista con nombre igual normalizado y buen puntaje', () => {
    expect(elegirArtista(artistas, 'patricio rey y sus redonditos de ricota').id).toBe('b')
    expect(elegirArtista(artistas, 'Los Redondos')).toBeNull()
  })
  it('disco por título igual; aproximado solo en búsquedas', () => {
    const lista = [{ titulo: 'Canción animal', score: 100 }, { titulo: '2 en 1', score: 76 }]
    expect(elegirDisco(lista, 'Cancion Animal').titulo).toBe('Canción animal')
    expect(elegirDisco(lista, 'Otro')).toBeNull()
    expect(elegirDisco(lista, 'Otro', { aproximado: true }).titulo).toBe('Canción animal')
    expect(elegirDisco([{ titulo: 'x', score: 60 }], 'Otro', { aproximado: true })).toBeNull()
  })
})

describe('elegirLogo', () => {
  const decl = (valor, rank = 'normal') => ({ rank, mainsnak: { datavalue: { value: valor } } })
  it('prefiere el de rango preferido y descarta los obsoletos', () => {
    expect(elegirLogo([decl('viejo.png', 'deprecated'), decl('a.svg'), decl('b.svg', 'preferred')])).toBe('b.svg')
    expect(elegirLogo([decl('viejo.png', 'deprecated'), decl('a.svg')])).toBe('a.svg')
  })
  it('sin logo', () => {
    expect(elegirLogo(undefined)).toBeNull()
    expect(elegirLogo([decl('x.png', 'deprecated')])).toBeNull()
  })
})
