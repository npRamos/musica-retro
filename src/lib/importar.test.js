import { describe, expect, it } from 'vitest'
import { clasificar, parsearLista } from './importar.js'

describe('parsearLista', () => {
  it('acepta punto y coma, tabulaciones y alias de formato', () => {
    const lineas = parsearLista('Sumo; After Chabón; LP\n\nsoda stereo\tsignos\tcd\n')
    expect(lineas).toHaveLength(2)
    expect(lineas[0]).toMatchObject({ banda: 'Sumo', titulo: 'After Chabón', formato: 'vinilo' })
    expect(lineas[1]).toMatchObject({ banda: 'Soda Stereo', titulo: 'Signos', formato: 'cd', numero: 3 })
  })
  it('marca líneas inválidas con motivo', () => {
    const [faltan, formato] = parsearLista('Sumo; After Chabón\nSumo; After Chabón; casete')
    expect(faltan.error).toMatch(/3 campos/)
    expect(formato.error).toMatch(/casete/)
  })
})

describe('clasificar', () => {
  const bandas = [{ id: 'b1', nombre: 'Soda Stereo', nombre_norm: 'soda stereo' }]
  const discos = [{ id: 'd1', banda_id: 'b1', titulo: 'Signos', titulo_norm: 'signos', formato: 'cd' }]

  it('clasifica nuevos, bandas nuevas, existentes y repetidas', () => {
    const lineas = parsearLista(
      ['Soda Stereo; Signos; CD', 'Soda Stereo; Signos; vinilo', 'Sumo; Divididos por la Felicidad; cd', 'sumo; divididos por la felicidad; c', 'x; y'].join('\n'),
    )
    const { items, resumen } = clasificar(lineas, bandas, discos)
    expect(items.find((i) => i.formato === 'cd' && i.titulo === 'Signos').estado).toBe('existe')
    expect(items.find((i) => i.formato === 'vinilo').estado).toBe('nuevo')
    const sumo = items.find((i) => i.banda === 'Sumo')
    expect(sumo).toMatchObject({ estado: 'banda-nueva', copias: 2, lineas: [3, 4] })
    expect(resumen).toEqual({ nuevos: 2, bandasNuevas: 1, duplicados: 1, repetidas: 1, invalidas: 1 })
  })
})
