import { describe, expect, it } from 'vitest'
import { motivoParaNoAgregar, ordenarDeseados, pendientesDeBanda, rutaCargar } from './deseados.js'

const porId = new Map([
  ['soda', { id: 'soda', nombre: 'Soda Stereo' }],
  ['sumo', { id: 'sumo', nombre: 'Sumo' }],
  ['acdc', { id: 'acdc', nombre: 'AC/DC' }],
])

describe('ordenarDeseados', () => {
  it('por banda y título, sin cambiar la lista original', () => {
    const lista = [
      { id: 1, banda_id: 'sumo', titulo: 'Divididos' },
      { id: 2, banda_id: 'soda', titulo: 'Signos' },
      { id: 3, banda_id: 'soda', titulo: 'Dynamo' },
      { id: 4, banda_id: 'acdc', titulo: 'Powerage' },
    ]
    expect(ordenarDeseados(lista, porId).map((d) => d.id)).toEqual([4, 3, 2, 1])
    expect(lista[0].id).toBe(1)
  })
})

describe('pendientesDeBanda', () => {
  const lista = [
    { id: 'vinilo', banda_id: 'soda', titulo: 'Signos', formato: 'vinilo', anio: 1986 },
    { id: 'cd', banda_id: 'soda', titulo: 'Dynamo', formato: 'cd', anio: 1992 },
    { id: 'libre', banda_id: 'soda', titulo: 'Sueño Stereo', formato: null, anio: 1995 },
    { id: 'sinAnio', banda_id: 'soda', titulo: 'Ruido Blanco', formato: null },
    { id: 'otra', banda_id: 'sumo', titulo: 'After Chabón', formato: 'cd' },
  ]
  it('con el formato de la pestaña o sin formato, por año', () => {
    expect(pendientesDeBanda(lista, 'soda', 'cd').map((d) => d.id)).toEqual(['cd', 'libre', 'sinAnio'])
    expect(pendientesDeBanda(lista, 'soda', 'vinilo').map((d) => d.id)).toEqual(['vinilo', 'libre', 'sinAnio'])
  })
  it('un deseado de otro formato no aparece', () => {
    expect(pendientesDeBanda(lista, 'sumo', 'vinilo')).toEqual([])
  })
})

describe('motivoParaNoAgregar', () => {
  const discos = [{ banda_id: 'soda', titulo: 'Signos', titulo_norm: 'signos', formato: 'cd' }]
  const deseados = [
    { banda_id: 'soda', titulo: 'Dynamo', titulo_norm: 'dynamo', formato: 'vinilo' },
    { banda_id: 'soda', titulo: 'Sueño Stereo', titulo_norm: 'sueno stereo', formato: null },
  ]
  const motivo = (titulo, formato) => motivoParaNoAgregar({ bandaId: 'soda', titulo, formato }, discos, deseados)

  it('ya lo tiene en ese formato o, sin formato, en cualquiera', () => {
    expect(motivo('signos', 'cd')).toBe('ya-lo-tenes')
    expect(motivo('Signos', null)).toBe('ya-lo-tenes')
  })
  it('lo tiene en otro formato: se puede agregar', () => {
    expect(motivo('Signos', 'vinilo')).toBeNull()
  })
  it('ya está en deseados con ese formato o sin formato', () => {
    expect(motivo('Dynamo', 'vinilo')).toBe('ya-esta')
    expect(motivo('Sueño Stereo', 'cd')).toBe('ya-esta')
  })
  it('en deseados con otro formato: se puede agregar', () => {
    expect(motivo('Dynamo', 'cd')).toBeNull()
    expect(motivo('Dynamo', null)).toBeNull()
  })
  it('banda nueva: nunca hay motivo', () => {
    expect(motivoParaNoAgregar({ bandaId: null, titulo: 'Signos', formato: 'cd' }, discos, deseados)).toBeNull()
  })
})

describe('rutaCargar', () => {
  it('lleva al alta con los datos, codificados, y el deseado', () => {
    const consulta = new URLSearchParams(rutaCargar({ id: 'x', titulo: 'Uno & Dos', formato: 'vinilo' }, { nombre: 'AC/DC' }).split('?')[1])
    expect(Object.fromEntries(consulta)).toEqual({ banda: 'AC/DC', titulo: 'Uno & Dos', deseado: 'x', formato: 'vinilo' })
  })
  it('sin formato, no lo manda', () => {
    expect(rutaCargar({ id: 'x', titulo: 'Signos', formato: null }, { nombre: 'Soda' })).not.toContain('formato')
  })
})
