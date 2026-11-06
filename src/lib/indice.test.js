import { describe, expect, it } from 'vitest'
import { criterioDe, marcaDe, primerasMarcas, ralear } from './indice.js'

describe('criterioDe', () => {
  it('letras para A → Z y Z → A, meses, y por género los títulos de las secciones', () => {
    expect(criterioDe('az', 'bandas')).toBe('letra')
    expect(criterioDe('za', 'discos')).toBe('letra')
    expect(criterioDe('reciente', 'discos')).toBe('mes')
    expect(criterioDe('az', 'generos')).toBeNull()
    expect(criterioDe('genero', 'bandas')).toBeNull()
    expect(criterioDe('genero', 'discos')).toBeNull()
  })
})

describe('marcaDe', () => {
  const letra = (nombre) => marcaDe({ nombre }, null, 'letra')

  it('la primera letra sin tildes, en mayúscula', () => {
    expect(letra('Él Mató a un Policía Motorizado')).toBe('E')
    expect(letra('almafuerte')).toBe('A')
    expect(letra('Ñu')).toBe('N')
  })

  it('números y signos van en #', () => {
    expect(letra('2 Minutos')).toBe('#')
    expect(letra('¡Ay!')).toBe('#')
    expect(letra('')).toBe('#')
  })

  it('mes y año con la fecha local', () => {
    expect(marcaDe(null, new Date(2026, 10, 1, 0, 30).toISOString(), 'mes')).toBe('nov 2026')
    expect(marcaDe(null, new Date(2025, 0, 31, 23, 30).toISOString(), 'mes')).toBe('ene 2025')
  })
})

describe('primerasMarcas', () => {
  it('marca solo el primero de cada tramo, también en Z → A', () => {
    expect(primerasMarcas(['A', 'A', 'B', 'D', 'D'])).toEqual(['A', null, 'B', 'D', null])
    expect(primerasMarcas(['S', 'R', 'R', 'A'])).toEqual(['S', 'R', null, 'A'])
    expect(primerasMarcas([])).toEqual([])
  })
})

describe('ralear', () => {
  it('saltea las marcas pegadas a la última mostrada y conserva la primera', () => {
    const marcas = [
      { texto: 'A', y: 0 },
      { texto: 'B', y: 10 },
      { texto: 'C', y: 30 },
      { texto: 'D', y: 40 },
      { texto: 'E', y: 100 },
    ]
    expect(ralear(marcas, 24).map((m) => m.texto)).toEqual(['A', 'C', 'E'])
    expect(ralear([], 24)).toEqual([])
  })
})
