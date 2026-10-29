import { describe, expect, it } from 'vitest'
import { formatearTitulo, normalizar } from './texto.js'

describe('normalizar', () => {
  it('ignora mayúsculas, tildes y espacios sobrantes', () => {
    expect(normalizar('  Él Mató a un  Policía Motorizado ')).toBe('el mato a un policia motorizado')
    expect(normalizar('soda  stéreo ')).toBe(normalizar('Soda Stereo'))
    expect(normalizar('Señales')).toBe('senales')
  })
  it('iguala las comillas tipográficas con las rectas', () => {
    expect(normalizar('Don’t Stop')).toBe(normalizar("Don't Stop"))
    expect(normalizar('“Hola”')).toBe('"hola"')
  })
})

describe('formatearTitulo', () => {
  it('capitaliza cada palabra', () => {
    expect(formatearTitulo('los piojos')).toBe('Los Piojos')
  })
  it('deja los conectores en minúscula salvo al inicio', () => {
    expect(formatearTitulo('divididos por la felicidad')).toBe('Divididos por la Felicidad')
    expect(formatearTitulo('el mató a un policía motorizado')).toBe('El Mató a un Policía Motorizado')
  })
  it('respeta siglas', () => {
    expect(formatearTitulo('AC/DC')).toBe('AC/DC')
    expect(formatearTitulo('back in black INXS')).toBe('Back in Black INXS')
  })
  it('formatea todo si está todo en mayúsculas', () => {
    expect(formatearTitulo('SODA STEREO')).toBe('Soda Stereo')
  })
  it('capitaliza después de guiones, barras y paréntesis', () => {
    expect(formatearTitulo('hi-fi (en vivo)')).toBe('Hi-Fi (En Vivo)')
  })
  it('colapsa espacios', () => {
    expect(formatearTitulo('  sumo   ')).toBe('Sumo')
  })
})
