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

describe('planilla con encabezado', () => {
  it('ida y vuelta: lo exportado se vuelve a leer igual', async () => {
    const { generarCsv } = await import('./exportar.js')
    const bandas = new Map([['b', { id: 'b', nombre: 'Black Sabbath' }]])
    const discos = [
      { banda_id: 'b', titulo: 'Sabotage', formato: 'cd', copias: 2, anio: 1975, fecha_carga: '2019-03-15T15:00:00Z', spotify_url: 'https://open.spotify.com/album/1' },
      { banda_id: 'b', titulo: 'Uno; "Dos"', formato: 'vinilo', copias: 1, anio: null, fecha_carga: '2026-01-02T15:00:00Z' },
    ]
    const [sabotage, raro] = parsearLista(generarCsv(discos, bandas))
    expect(sabotage).toMatchObject({ banda: 'Black Sabbath', titulo: 'Sabotage', formato: 'cd', copias: 2, anio: 1975, spotify_url: 'https://open.spotify.com/album/1' })
    expect(new Date(sabotage.fecha_carga).getDate()).toBe(new Date('2019-03-15T15:00:00Z').getDate())
    expect(raro).toMatchObject({ titulo: 'Uno; "Dos"', formato: 'vinilo', copias: 1 })
    expect(raro.anio).toBeUndefined()
  })

  it('columnas por nombre, en cualquier orden y con alias (la planilla de Excel: Artista, Álbum)', () => {
    const lineas = parsearLista('N.º;Álbum;Artista;Género;Formato\n1;Killers;Iron Maiden;Heavy;CD')
    expect(lineas).toHaveLength(1)
    expect(lineas[0]).toMatchObject({ banda: 'Iron Maiden', titulo: 'Killers', formato: 'cd', numero: 2 })
  })

  it('datos inválidos con motivo', () => {
    const lineas = parsearLista(['Banda;Disco;Formato;Copias;Año;Cargado;Spotify', 'A;B;CD;0;;;', 'A;C;CD;;86;;', 'A;D;CD;;;31/02/2020;', 'A;E;CD;;;;https://otro.com/x', 'A;F;;;;;'].join('\n'))
    expect(lineas.map((l) => l.error)).toEqual([
      'Copias inválidas: "0"',
      'El año tiene que tener 4 cifras: "86"',
      'Fecha inválida: "31/02/2020"',
      'El link de Spotify tiene que ser de open.spotify.com',
      'Falta el formato',
    ])
  })

  it('repetidas suman las copias de cada fila', () => {
    const lineas = parsearLista('Banda;Disco;Formato;Copias\nSoda Stereo;Signos;CD;2\nsoda stereo;signos;cd;1')
    const { items } = clasificar(lineas, [], [])
    expect(items).toHaveLength(1)
    expect(items[0].copias).toBe(3)
  })

  it('sin encabezado sigue igual y tolera el BOM', () => {
    expect(parsearLista('﻿Sumo; After Chabón; LP')[0]).toMatchObject({ banda: 'Sumo', formato: 'vinilo' })
  })
})
