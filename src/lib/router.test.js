import { describe, expect, it } from 'vitest'
import { claveDe, pasosHasta } from './router.js'

describe('claveDe', () => {
  it('trata las pestañas como el inicio', () => {
    expect(claveDe('')).toBe('')
    expect(claveDe('vinilos')).toBe('')
    expect(claveDe('cd')).toBe('')
  })
  it('identifica la banda sin el formato', () => {
    expect(claveDe('cd/banda/7')).toBe('banda/7')
    expect(claveDe('vinilos/banda/7')).toBe('banda/7')
    expect(claveDe('banda/7')).toBe('banda/7')
  })
  it('distingue la edición de la banda de la banda', () => {
    expect(claveDe('banda/7/editar')).toBe('banda/7/editar')
  })
  it('el sorteo es su propia pantalla, hija del inicio', () => {
    expect(claveDe('sorteo')).toBe('sorteo')
  })
  it('ignora la consulta y la barra inicial', () => {
    expect(claveDe('agregar?banda=Sumo&formato=cd')).toBe('agregar')
    expect(claveDe('/disco/3')).toBe('disco/3')
  })
})

describe('pasosHasta', () => {
  const pila = ['cd', 'cd/banda/7', 'disco/3', 'disco/3/editar']

  it('cuenta los pasos hasta la entrada', () => {
    expect(pasosHasta(pila, 'disco/3/editar')).toBe(1)
    expect(pasosHasta(pila, 'disco/3')).toBe(2)
    expect(pasosHasta(pila, 'banda/7')).toBe(3)
    expect(pasosHasta(pila, '')).toBe(4)
  })
  it('elige la entrada más cercana', () => {
    expect(pasosHasta(['cd', 'disco/3', 'cd/banda/7', 'disco/3'], 'disco/3')).toBe(1)
    expect(pasosHasta(['vinilos', 'cd/banda/7', 'cd'], '')).toBe(1)
  })
  it('devuelve null si no está, con la pila vacía o sin pila', () => {
    expect(pasosHasta(pila, 'banda/8')).toBeNull()
    expect(pasosHasta([], '')).toBeNull()
    expect(pasosHasta(undefined, '')).toBeNull()
  })
})
