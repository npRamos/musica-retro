import { describe, expect, it } from 'vitest'
import { CON_OBSERVACION, alternarEstado, discosConEstado, estadoDelFormato, filtrarPorEstado, filtrosDeEstado, leerEstado, textoEstado, tieneEstado } from './estado.js'

describe('tieneEstado', () => {
  it('con etiquetas u observación; un disco de la copia vieja no tiene', () => {
    expect(tieneEstado({ estado: ['rayado'] })).toBe(true)
    expect(tieneEstado({ estado: [], observacion: 'Salta en el tema 3' })).toBe(true)
    expect(tieneEstado({ estado: [], observacion: null })).toBe(false)
    expect(tieneEstado({})).toBe(false)
  })
})

describe('alternarEstado', () => {
  it('marca y desmarca', () => {
    expect(alternarEstado([], 'caja_rota')).toEqual(['caja_rota'])
    expect(alternarEstado(['caja_rota', 'rayado'], 'caja_rota')).toEqual(['rayado'])
  })
  it('rayado y muy rayado se excluyen; las demás se combinan', () => {
    expect(alternarEstado(['rayado', 'caja_rota'], 'muy_rayado')).toEqual(['caja_rota', 'muy_rayado'])
    expect(alternarEstado(['muy_rayado'], 'rayado')).toEqual(['rayado'])
    expect(alternarEstado(['rayado'], 'sin_caja')).toEqual(['rayado', 'sin_caja'])
  })
})

describe('estadoDelFormato', () => {
  it('quita las que no corresponden al formato nuevo', () => {
    expect(estadoDelFormato(['rayado', 'caja_rota'], 'vinilo')).toEqual(['rayado'])
    expect(estadoDelFormato(['muy_rayado', 'necesita_funda'], 'cd')).toEqual(['muy_rayado'])
    expect(estadoDelFormato(['rayado'], null)).toEqual([])
  })
})

describe('leerEstado', () => {
  it('interpreta sin distinguir mayúsculas ni tildes, y vacío es sin estado', () => {
    expect(leerEstado('rayado, Caja Rota', 'cd')).toEqual({ estado: ['rayado', 'caja_rota'] })
    expect(leerEstado('NECESITA FUNDA', 'vinilo')).toEqual({ estado: ['necesita_funda'] })
    expect(leerEstado('Rayado,, rayado', 'cd')).toEqual({ estado: ['rayado'] })
    expect(leerEstado('', 'cd')).toEqual({ estado: [] })
  })
  it('rechaza lo que no corresponde al formato', () => {
    expect(leerEstado('Tapa rota', 'cd').error).toBe('Estado inválido para CD: "Tapa rota"')
    expect(leerEstado('Caja rota', 'vinilo').error).toBe('Estado inválido para vinilo: "Caja rota"')
    expect(leerEstado('Roto', 'cd').error).toMatch(/Roto/)
  })
  it('rechaza rayado y muy rayado juntos', () => {
    expect(leerEstado('Rayado, Muy rayado', 'cd').error).toMatch(/a la vez/)
  })
  it('ida y vuelta con el texto de la planilla', () => {
    expect(leerEstado(textoEstado(['muy_rayado', 'sin_caja']), 'cd')).toEqual({ estado: ['muy_rayado', 'sin_caja'] })
  })
})

describe('discos con estado', () => {
  const rayado = { id: 1, estado: ['rayado'] }
  const funda = { id: 2, estado: ['necesita_funda', 'rayado'], observacion: 'Vino así' }
  const nota = { id: 3, estado: [], observacion: 'Una copia está rayada' }
  const sano = { id: 4, estado: [] }
  const discos = [rayado, funda, nota, sano]

  it('solo los que tienen algo', () => {
    expect(discosConEstado(discos)).toEqual([rayado, funda, nota])
  })
  it('chips de lo que está en uso, en orden fijo y con cantidades', () => {
    expect(filtrosDeEstado(discos)).toEqual([
      { valor: 'rayado', texto: 'Rayado', cantidad: 2 },
      { valor: 'necesita_funda', texto: 'Necesita funda', cantidad: 1 },
      { valor: CON_OBSERVACION, texto: 'Con observación', cantidad: 2 },
    ])
  })
  it('filtra por alguno de los elegidos; sin elegir, todos', () => {
    expect(filtrarPorEstado(discos, [])).toBe(discos)
    expect(filtrarPorEstado(discos, ['necesita_funda'])).toEqual([funda])
    expect(filtrarPorEstado(discos, ['necesita_funda', CON_OBSERVACION])).toEqual([funda, nota])
  })
})
