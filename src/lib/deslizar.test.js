import { describe, expect, it } from 'vitest'
import { direccionDeslizar } from './deslizar.js'

const ANCHO = 400
const desde = { x: 200, y: 300 }

describe('direccionDeslizar', () => {
  it('hacia la izquierda es el siguiente, hacia la derecha el anterior', () => {
    expect(direccionDeslizar(desde, { x: 100, y: 300 }, ANCHO)).toBe('siguiente')
    expect(direccionDeslizar(desde, { x: 300, y: 300 }, ANCHO)).toBe('anterior')
  })

  it('un movimiento corto no cuenta', () => {
    expect(direccionDeslizar(desde, { x: 140, y: 300 }, ANCHO)).toBeNull()
    expect(direccionDeslizar(desde, { x: 139, y: 300 }, ANCHO)).toBe('siguiente')
  })

  it('un scroll inclinado no cuenta', () => {
    expect(direccionDeslizar(desde, { x: 100, y: 400 }, ANCHO)).toBeNull()
    expect(direccionDeslizar(desde, { x: 100, y: 370 }, ANCHO)).toBeNull()
    expect(direccionDeslizar(desde, { x: 100, y: 360 }, ANCHO)).toBe('siguiente')
  })

  it('lo que empieza en los bordes queda para el gesto de atrás del sistema', () => {
    expect(direccionDeslizar({ x: 10, y: 300 }, { x: 200, y: 300 }, ANCHO)).toBeNull()
    expect(direccionDeslizar({ x: 390, y: 300 }, { x: 200, y: 300 }, ANCHO)).toBeNull()
    expect(direccionDeslizar({ x: 24, y: 300 }, { x: 200, y: 300 }, ANCHO)).toBe('anterior')
  })
})
