import { describe, expect, it } from 'vitest'
import { bandasDeFormato, buscar, esLinkSpotifyValido, leerAnio, linkSpotify, ordenarBandas, ordenarDiscos } from './catalogo.js'

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
  it('valida el dominio', () => {
    expect(esLinkSpotifyValido('https://open.spotify.com/album/abc')).toBe(true)
    expect(esLinkSpotifyValido('https://evil.com/open.spotify.com')).toBe(false)
    expect(esLinkSpotifyValido('cualquier cosa')).toBe(false)
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
