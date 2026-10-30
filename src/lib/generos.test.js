import { describe, expect, it } from 'vitest'
import {
  agregarGenero,
  generosDelCatalogo,
  limpiarGenero,
  mismosGeneros,
  quitarGenero,
  resolverGenero,
  sugerirGeneros,
} from './generos.js'

const bandas = [
  { nombre: 'Megadeth', generos: ['thrash metal', 'heavy metal', 'speed metal'] },
  { nombre: 'Metallica', generos: ['thrash metal', 'heavy metal'] },
  { nombre: 'Slayer', generos: ['thrash metal'] },
  { nombre: 'La Renga', generos: ['hard rock', 'rock nacional'] },
  { nombre: 'Sumo', generos: [] },
  { nombre: 'Caché viejo' }, // sin el campo: datos guardados antes de los géneros
]
const catalogo = generosDelCatalogo(bandas)

describe('generosDelCatalogo', () => {
  it('cuenta las bandas de cada género, del más usado al menos usado', () => {
    expect(catalogo).toEqual([
      { nombre: 'thrash metal', bandas: 3 },
      { nombre: 'heavy metal', bandas: 2 },
      { nombre: 'hard rock', bandas: 1 },
      { nombre: 'rock nacional', bandas: 1 },
      { nombre: 'speed metal', bandas: 1 },
    ])
  })
  it('junta los escritos de otra forma con la primera forma vista', () => {
    expect(generosDelCatalogo([{ generos: ['Thrash Metal'] }, { generos: ['thrash metal'] }])).toEqual([{ nombre: 'Thrash Metal', bandas: 2 }])
  })
})

describe('resolverGenero', () => {
  it('usa la forma que ya tiene el catálogo', () => {
    expect(resolverGenero('Thrash  Metal', catalogo)).toBe('thrash metal')
    expect(resolverGenero(' ROCK NACIONAL ', catalogo)).toBe('rock nacional')
  })
  it('un género nuevo queda como se escribió, sin espacios sobrantes', () => {
    expect(resolverGenero('  Post   Punk ', catalogo)).toBe('Post Punk')
    expect(limpiarGenero('   ')).toBe('')
  })
})

describe('agregar y quitar', () => {
  it('no repite un género escrito de otra forma', () => {
    expect(agregarGenero(['heavy metal'], 'Heavy Metal')).toEqual(['heavy metal'])
    expect(agregarGenero(['heavy metal'], 'speed metal')).toEqual(['heavy metal', 'speed metal'])
  })
  it('máximo 3, y nada vacío', () => {
    const tres = ['a', 'b', 'c']
    expect(agregarGenero(tres, 'd')).toBe(tres)
    expect(agregarGenero([], '')).toEqual([])
  })
  it('quita sin importar cómo está escrito', () => {
    expect(quitarGenero(['hard rock', 'blues'], 'Blues')).toEqual(['hard rock'])
  })
  it('compara sin importar el orden ni la escritura', () => {
    expect(mismosGeneros(['blues', 'hard rock'], ['Hard Rock', 'blues'])).toBe(true)
    expect(mismosGeneros(['blues'], ['blues', 'hard rock'])).toBe(false)
    expect(mismosGeneros([], undefined)).toBe(true)
  })
})

describe('sugerirGeneros', () => {
  it('sugiere los del catálogo que coinciden, con la cantidad de bandas', () => {
    expect(sugerirGeneros(catalogo, 'thr')).toEqual([{ nombre: 'thrash metal', bandas: 3 }])
  })
  it('primero los que empiezan con lo escrito, después los que lo contienen', () => {
    expect(sugerirGeneros(catalogo, 'ROCK').map((g) => g.nombre)).toEqual(['rock nacional', 'hard rock'])
    expect(sugerirGeneros(catalogo, 'metal').map((g) => g.nombre)).toEqual(['thrash metal', 'heavy metal', 'speed metal'])
  })
  it('sin los que ya tiene la banda; sin texto, los más usados', () => {
    expect(sugerirGeneros(catalogo, 'metal', ['Thrash Metal']).map((g) => g.nombre)).toEqual(['heavy metal', 'speed metal'])
    expect(sugerirGeneros(catalogo, '', [], 2).map((g) => g.nombre)).toEqual(['thrash metal', 'heavy metal'])
  })
})
