import { describe, expect, it } from 'vitest'
import { nombreImagen, partirLineas } from './imagenCompartir.js'

const medir = (t) => t.length // cada carácter mide 1

describe('partirLineas', () => {
  it('reparte por palabras según el ancho', () => {
    expect(partirLineas('Rust in Peace', medir, 20, 3)).toEqual(['Rust in Peace'])
    expect(partirLineas('Divididos por la Felicidad', medir, 12, 3)).toEqual(['Divididos', 'por la', 'Felicidad'])
  })

  it('corta lo que sobra con puntos suspensivos', () => {
    const lineas = partirLineas('uno dos tres cuatro cinco', medir, 6, 2)
    expect(lineas).toHaveLength(2)
    expect(lineas[0]).toBe('uno')
    expect(lineas[1].endsWith('…')).toBe(true)
    expect(lineas[1].length).toBeLessThanOrEqual(6)
  })

  it('recorta una palabra que no entra', () => {
    expect(partirLineas('Supercalifragilístico', medir, 8, 3)).toEqual(['Superca…'])
  })
})

describe('nombreImagen', () => {
  it('arma el nombre sin tildes ni signos', () => {
    expect(nombreImagen('Canción Animal')).toBe('musica-retro-cancion-animal.jpg')
    expect(nombreImagen('...And Justice for All')).toBe('musica-retro-and-justice-for-all.jpg')
    expect(nombreImagen('¿?')).toBe('musica-retro-disco.jpg')
  })
})
