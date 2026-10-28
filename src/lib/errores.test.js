import { describe, expect, it } from 'vitest'
import { mensajeError } from './errores.js'

describe('mensajeError', () => {
  it('reconoce una cuenta que no es miembro', () => {
    expect(mensajeError({ message: 'Sin acceso al catálogo' })).toMatch(/no está habilitada/)
    expect(mensajeError({ code: '42501', message: 'new row violates row-level security policy' })).toMatch(/no está habilitada/)
  })
  it('reconoce un problema de red', () => {
    expect(mensajeError({ message: 'TypeError: Failed to fetch' }, 'borrar')).toBe('Sin conexión: no se pudo borrar. Probá de nuevo cuando tengas señal.')
  })
  it('muestra el detalle de cualquier otro error', () => {
    expect(mensajeError({ message: 'duplicate key' })).toBe('No se pudo guardar (duplicate key).')
  })
})
