import { describe, expect, it } from 'vitest'
import { debeInvertirse } from './logo.js'

// n píxeles de un color [r, g, b, a]
const pixeles = (...tramos) => Uint8ClampedArray.from(tramos.flatMap(([n, color]) => Array.from({ length: n }, () => color).flat()))
const transparente = [0, 0, 0, 0]

describe('debeInvertirse', () => {
  it('trazo negro sobre transparente (Metallica): se invierte', () => {
    expect(debeInvertirse(pixeles([30, [0, 0, 0, 255]], [70, transparente]))).toBe(true)
  })
  it('letras blancas con borde negro (Iron Maiden): no', () => {
    expect(debeInvertirse(pixeles([20, [255, 255, 255, 255]], [15, [0, 0, 0, 255]], [65, transparente]))).toBe(false)
  })
  it('rojo, blanco y negro (La Renga): no', () => {
    expect(debeInvertirse(pixeles([20, [220, 30, 40, 255]], [30, [255, 255, 255, 255]], [20, [0, 0, 0, 255]], [30, transparente]))).toBe(false)
  })
  it('logo oscuro pero con fondo propio (sin transparencia): no', () => {
    expect(debeInvertirse(pixeles([100, [10, 10, 10, 255]]))).toBe(false)
  })
  it('imagen vacía: no', () => {
    expect(debeInvertirse(pixeles([10, transparente]))).toBe(false)
  })
})
