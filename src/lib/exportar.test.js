import { describe, expect, it } from 'vitest'
import { celdaCsv, enlaceWhatsapp, generarCsv, nombreArchivo, textoBanda, textoCatalogo } from './exportar.js'

const bandas = [
  { id: 'bs', nombre: 'Black Sabbath' },
  { id: 'acdc', nombre: 'AC/DC' },
  { id: 'soda', nombre: 'Soda Stereo' },
]
const porId = new Map(bandas.map((b) => [b.id, b]))
const discos = [
  { id: 1, banda_id: 'bs', titulo: 'Paranoid', formato: 'cd', copias: 1, anio: 1970, fecha_carga: '2026-10-28T15:00:00Z' },
  { id: 2, banda_id: 'bs', titulo: 'Sabotage', formato: 'cd', copias: 2, anio: 1975, fecha_carga: '2026-10-28T15:00:00Z' },
  { id: 3, banda_id: 'acdc', titulo: 'Back in Black', formato: 'cd', copias: 1, anio: 1980, fecha_carga: '2025-03-15T15:00:00Z' },
  { id: 4, banda_id: 'soda', titulo: 'Canción Animal', formato: 'vinilo', copias: 1, anio: null, fecha_carga: '2026-01-02T15:00:00Z', spotify_url: 'https://open.spotify.com/album/x' },
  { id: 5, banda_id: 'soda', titulo: 'Uno; "Dos"', formato: 'cd', copias: 1, fecha_carga: '2026-01-02T15:00:00Z' },
]

describe('CSV', () => {
  it('BOM, encabezado, ";" y CRLF; orden por banda, año y título', () => {
    const csv = generarCsv(discos, porId, 'todo')
    expect(csv.startsWith('﻿Banda;Disco;Formato;Copias;Año;Cargado;Spotify\r\n')).toBe(true)
    const filas = csv.slice(1).trimEnd().split('\r\n')
    expect(filas).toHaveLength(6)
    expect(filas[1]).toBe('AC/DC;Back in Black;CD;1;1980;15/03/2025;')
    expect(filas[2]).toBe('Black Sabbath;Paranoid;CD;1;1970;28/10/2026;')
    expect(filas[3]).toBe('Black Sabbath;Sabotage;CD;2;1975;28/10/2026;')
    expect(filas[4]).toBe('Soda Stereo;Canción Animal;Vinilo;1;;02/01/2026;https://open.spotify.com/album/x')
    expect(filas[5]).toBe('Soda Stereo;"Uno; ""Dos""";CD;1;;02/01/2026;')
  })
  it('alcance y nombre de archivo', () => {
    expect(generarCsv(discos, porId, 'vinilo').trimEnd().split('\r\n')).toHaveLength(2)
    expect(nombreArchivo('cd', new Date(2026, 9, 28))).toBe('musica-retro-cds-2026-10-28.csv')
    expect(nombreArchivo('vinilo', new Date(2026, 0, 5))).toBe('musica-retro-vinilos-2026-01-05.csv')
  })
  it('celdas', () => {
    expect(celdaCsv(null)).toBe('')
    expect(celdaCsv('a\nb')).toBe('"a\nb"')
    expect(celdaCsv(3)).toBe('3')
  })
})

describe('texto', () => {
  it('CDs: agrupado por banda, sin formato, con año y copias', () => {
    expect(textoCatalogo(discos, porId, 'cd')).toBe(
      ['*Música Retro* · CDs (4)', '*AC/DC*\n• Back in Black (1980)', '*Black Sabbath*\n• Paranoid (1970)\n• Sabotage (1975) ×2', '*Soda Stereo*\n• Uno; "Dos"'].join('\n\n'),
    )
  })
  it('Todo: cada disco con su formato', () => {
    const texto = textoCatalogo(discos, porId, 'todo')
    expect(texto.split('\n')[0]).toBe('*Música Retro* · Todo (5)')
    expect(texto).toContain('• Canción Animal · vinilo')
    expect(texto).toContain('• Sabotage (1975) · CD ×2')
  })
  it('una banda, con los dos formatos', () => {
    expect(textoBanda(bandas[0], discos)).toBe('*Black Sabbath*\n• Paranoid (1970) · CD\n• Sabotage (1975) · CD ×2')
  })
  it('enlace de WhatsApp', () => {
    expect(enlaceWhatsapp('*Sumo*\n• Llegando los Monos')).toBe('https://wa.me/?text=*Sumo*%0A%E2%80%A2%20Llegando%20los%20Monos')
  })
})
