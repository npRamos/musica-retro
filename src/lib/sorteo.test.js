import { describe, expect, it } from 'vitest'
import { armarBombo, claveFiltros, contarGeneros, elegir, empezarDeNuevo, rondaDe, sacar } from './sorteo.js'

const bandas = [
  { id: 'meg', nombre: 'Megadeth', generos: ['thrash metal', 'heavy metal', 'speed metal'] },
  { id: 'sod', nombre: 'Soda Stereo', generos: ['new wave', 'pop rock'] },
  { id: 'sum', nombre: 'Sumo', generos: [] },
]
const bandasPorId = new Map(bandas.map((b) => [b.id, b]))
const disco = (id, banda_id, titulo, formato, copias = 1) => ({ id, banda_id, titulo, titulo_norm: titulo.toLowerCase(), formato, copias })
const discos = [
  disco('1', 'meg', 'Rust in Peace', 'cd'),
  disco('2', 'meg', 'Peace Sells', 'vinilo', 3),
  disco('3', 'sod', 'Signos', 'cd'),
  disco('4', 'sod', 'Signos', 'vinilo'),
  disco('5', 'sum', 'Llegando los Monos', 'vinilo'),
]
const titulos = (bolas) => bolas.map((b) => b.discos[0].titulo).sort()

describe('armarBombo', () => {
  it('con Todos, un mismo título en vinilo y CD es una sola bola, con el vinilo primero', () => {
    const bombo = armarBombo(discos, bandasPorId)
    expect(bombo).toHaveLength(4)
    const signos = bombo.find((b) => b.discos[0].titulo === 'Signos')
    expect(signos.discos.map((d) => d.formato)).toEqual(['vinilo', 'cd'])
  })

  it('las copias no cuentan', () => {
    expect(armarBombo(discos, bandasPorId).filter((b) => b.discos[0].titulo === 'Peace Sells')).toHaveLength(1)
  })

  it('filtra por formato', () => {
    expect(titulos(armarBombo(discos, bandasPorId, { formato: 'cd' }))).toEqual(['Rust in Peace', 'Signos'])
    expect(titulos(armarBombo(discos, bandasPorId, { formato: 'vinilo' }))).toEqual(['Llegando los Monos', 'Peace Sells', 'Signos'])
  })

  it('con varios géneros entra la banda que tenga alguno, sin importar cómo están escritos', () => {
    expect(titulos(armarBombo(discos, bandasPorId, { generos: ['Speed Metal', 'pop rock'] }))).toEqual(['Peace Sells', 'Rust in Peace', 'Signos'])
  })

  it('con géneros elegidos, las bandas sin géneros quedan afuera', () => {
    expect(titulos(armarBombo(discos, bandasPorId, { formato: 'vinilo', generos: ['thrash metal'] }))).toEqual(['Peace Sells'])
  })
})

describe('contarGeneros', () => {
  it('cuenta bolas por género en el formato, del más usado al menos usado', () => {
    const { generos, sinGenero } = contarGeneros(discos, bandasPorId, 'todos')
    expect(generos.slice(0, 3)).toEqual([
      { nombre: 'heavy metal', cantidad: 2 },
      { nombre: 'speed metal', cantidad: 2 },
      { nombre: 'thrash metal', cantidad: 2 },
    ])
    expect(generos.find((g) => g.nombre === 'new wave').cantidad).toBe(1)
    expect(sinGenero).toBe(1)
  })

  it('solo ofrece los géneros de las bandas con discos en ese formato', () => {
    const { generos, sinGenero } = contarGeneros(discos, bandasPorId, 'cd')
    expect(generos.map((g) => g.nombre)).toContain('pop rock')
    expect(sinGenero).toBe(0)
  })
})

describe('elegir', () => {
  const bombo = armarBombo(discos, bandasPorId)

  it('elige con el azar entre las que no salieron', () => {
    const salidas = new Set([bombo[0].clave])
    expect(elegir(bombo, salidas, () => 0)).toBe(bombo[1])
    expect(elegir(bombo, salidas, (n) => n - 1)).toBe(bombo.at(-1))
  })

  it('devuelve null cuando ya salieron todas', () => {
    expect(elegir(bombo, new Set(bombo.map((b) => b.clave)))).toBeNull()
  })

  it('con el azar por defecto devuelve alguna bola', () => {
    expect(bombo).toContain(elegir(bombo))
  })
})

describe('ronda', () => {
  const bombo = armarBombo(discos, bandasPorId, { formato: 'cd' })
  const filtros = claveFiltros('cd', [])

  it('no repite hasta agotar y después se puede empezar de nuevo', () => {
    empezarDeNuevo(filtros)
    const primera = sacar(bombo, filtros)
    const segunda = sacar(bombo, filtros)
    expect(segunda).not.toBe(primera)
    expect(sacar(bombo, filtros)).toBeNull()
    expect(rondaDe(filtros).agotada).toBe(true)
    empezarDeNuevo(filtros)
    expect(rondaDe(filtros).salidas.size).toBe(0)
    expect(sacar(bombo, filtros)).not.toBeNull()
  })

  it('se conserva con los mismos filtros (ir al detalle y volver)', () => {
    empezarDeNuevo(filtros)
    const bola = sacar(bombo, filtros)
    expect(rondaDe(filtros).actual).toBe(bola.clave)
    expect(rondaDe(filtros).salidas.has(bola.clave)).toBe(true)
  })

  it('cambiar los filtros empieza de cero', () => {
    sacar(bombo, filtros)
    const otra = rondaDe(claveFiltros('vinilo', []))
    expect(otra.salidas.size).toBe(0)
    expect(otra.actual).toBeNull()
  })

  it('la clave no depende del orden ni de cómo están escritos los géneros', () => {
    expect(claveFiltros('todos', ['Thrash Metal', 'pop rock'])).toBe(claveFiltros('todos', ['pop rock', 'thrash metal']))
  })
})
