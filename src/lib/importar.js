import { esLinkSpotifyValido, leerAnio, mediodiaLocal } from './catalogo.js'
import { formatearTitulo, normalizar } from './texto.js'

const ALIAS_FORMATO = { vinilo: 'vinilo', vinil: 'vinilo', lp: 'vinilo', v: 'vinilo', cd: 'cd', c: 'cd' }

export function interpretarFormato(texto) {
  return ALIAS_FORMATO[normalizar(texto)] ?? null
}

// Nombres de columna aceptados en una fila de encabezado (normalizados).
const COLUMNAS = {
  banda: ['banda', 'artista'],
  titulo: ['disco', 'album', 'titulo'],
  formato: ['formato'],
  copias: ['copias'],
  anio: ['ano', 'anio'],
  fecha: ['cargado', 'fecha', 'fecha_carga', 'fecha de carga'],
  spotify: ['spotify', 'spotify_url'],
}

// Separa una línea en campos con ";" o tabulación, respetando las comillas de un CSV: "Uno; ""Dos""".
export function partirCampos(linea) {
  const separador = linea.includes('\t') ? '\t' : ';'
  const campos = []
  let actual = ''
  let entreComillas = false
  for (let i = 0; i < linea.length; i++) {
    const c = linea[i]
    if (entreComillas) {
      if (c === '"' && linea[i + 1] === '"') {
        actual += '"'
        i++
      } else if (c === '"') entreComillas = false
      else actual += c
    } else if (c === '"' && actual.trim() === '') {
      actual = ''
      entreComillas = true
    } else if (c === separador) {
      campos.push(actual.trim())
      actual = ''
    } else actual += c
  }
  campos.push(actual.trim())
  return campos
}

// Encabezado: la primera línea, si tiene las columnas de banda y disco. Devuelve { campo: índice } o null.
function leerEncabezado(campos) {
  const nombres = campos.map(normalizar)
  const indice = {}
  for (const [campo, alias] of Object.entries(COLUMNAS)) {
    const i = nombres.findIndex((n) => alias.includes(n))
    if (i >= 0) indice[campo] = i
  }
  return indice.banda !== undefined && indice.titulo !== undefined ? indice : null
}

// "15/03/2025", "5/3/2025" o "2025-03-15" → mediodía local; null si no es una fecha válida o es futura.
function leerFecha(texto) {
  const dma = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(texto)
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(texto)
  const [a, m, d] = dma ? [dma[3], dma[2], dma[1]].map(Number) : iso ? [iso[1], iso[2], iso[3]].map(Number) : []
  if (!a) return null
  const fecha = new Date(a, m - 1, d, 12)
  if (fecha.getFullYear() !== a || fecha.getMonth() !== m - 1 || fecha.getDate() !== d || fecha > new Date()) return null
  return mediodiaLocal(`${a}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`)
}

// Datos opcionales de una fila con encabezado. Devuelve { datos } o { error }.
function leerOpcionales(campos, indice) {
  const valor = (campo) => (indice[campo] === undefined ? '' : (campos[indice[campo]] ?? '').trim())
  const datos = {}
  if (valor('copias')) {
    const n = Number(valor('copias'))
    if (!Number.isInteger(n) || n < 1) return { error: `Copias inválidas: "${valor('copias')}"` }
    datos.copias = n
  }
  if (valor('anio')) {
    const { anio, error } = leerAnio(valor('anio'))
    if (error) return { error: `${error}: "${valor('anio')}"` }
    datos.anio = anio
  }
  if (valor('fecha')) {
    const fecha = leerFecha(valor('fecha'))
    if (!fecha) return { error: `Fecha inválida: "${valor('fecha')}"` }
    datos.fecha_carga = fecha
  }
  if (valor('spotify')) {
    if (!esLinkSpotifyValido(valor('spotify'))) return { error: 'El link de Spotify tiene que ser de open.spotify.com' }
    datos.spotify_url = valor('spotify')
  }
  return { datos }
}

// Una línea por disco: "banda; disco; formato" (también separado por tabulaciones).
// Con una fila de encabezado (Banda, Disco, Formato, Copias, Año, Cargado, Spotify) las columnas van por nombre.
export function parsearLista(texto) {
  const lineas = texto
    .replace(/^﻿/, '')
    .split(/\r?\n/)
    .map((original, i) => ({ numero: i + 1, original }))
    .filter(({ original }) => original.trim() !== '')
  const indice = lineas.length ? leerEncabezado(partirCampos(lineas[0].original)) : null
  const cuerpo = indice ? lineas.slice(1) : lineas

  return cuerpo.map(({ numero, original }) => {
    const campos = partirCampos(original)
    if (!indice && campos.length !== 3) return { numero, original, error: 'Tiene que tener 3 campos: banda; disco; formato' }
    const [banda, titulo, formatoTexto] = indice ? [campos[indice.banda] ?? '', campos[indice.titulo] ?? '', campos[indice.formato] ?? ''] : campos
    if (!banda) return { numero, original, error: 'Falta la banda' }
    if (!titulo) return { numero, original, error: 'Falta el disco' }
    if (!formatoTexto) return { numero, original, error: 'Falta el formato' }
    const formato = interpretarFormato(formatoTexto)
    if (!formato) return { numero, original, error: `Formato desconocido: "${formatoTexto}"` }
    const { datos = {}, error } = indice ? leerOpcionales(campos, indice) : {}
    if (error) return { numero, original, error }
    return { numero, original, banda: formatearTitulo(banda), titulo: formatearTitulo(titulo), formato, ...datos }
  })
}

// Combina repetidas y clasifica contra el catálogo actual.
export function clasificar(lineas, bandas, discos) {
  const bandaPorNorm = new Map(bandas.map((b) => [b.nombre_norm ?? normalizar(b.nombre), b]))
  const existentes = new Map(discos.map((d) => [`${d.banda_id}|${d.titulo_norm ?? normalizar(d.titulo)}|${d.formato}`, d]))

  const invalidas = lineas.filter((l) => l.error)
  const items = new Map()
  for (const l of lineas) {
    if (l.error) continue
    const clave = `${normalizar(l.banda)}|${normalizar(l.titulo)}|${l.formato}`
    const item = items.get(clave)
    // Las repetidas suman sus copias; año, fecha y Spotify quedan los de la primera.
    if (item) {
      item.copias += l.copias ?? 1
      item.lineas.push(l.numero)
    } else {
      const { banda, titulo, formato, copias = 1, anio, fecha_carga, spotify_url } = l
      items.set(clave, { banda, titulo, formato, copias, anio, fecha_carga, spotify_url, lineas: [l.numero] })
    }
  }

  const bandasNuevas = new Set()
  const resultado = [...items.values()].map((item) => {
    const bandaNorm = normalizar(item.banda)
    const banda = bandaPorNorm.get(bandaNorm)
    if (banda) {
      const existente = existentes.get(`${banda.id}|${normalizar(item.titulo)}|${item.formato}`)
      if (existente) return { ...item, banda: banda.nombre, estado: 'existe', existente }
      return { ...item, banda: banda.nombre, estado: 'nuevo' }
    }
    bandasNuevas.add(bandaNorm)
    return { ...item, estado: 'banda-nueva' }
  })

  return {
    items: resultado,
    invalidas,
    resumen: {
      nuevos: resultado.filter((i) => i.estado !== 'existe').length,
      bandasNuevas: bandasNuevas.size,
      duplicados: resultado.filter((i) => i.estado === 'existe').length,
      repetidas: resultado.filter((i) => i.lineas.length > 1).length,
      invalidas: invalidas.length,
    },
  }
}
