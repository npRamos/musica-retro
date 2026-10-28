import { formatearTitulo, normalizar } from './texto.js'

const ALIAS_FORMATO = { vinilo: 'vinilo', vinil: 'vinilo', lp: 'vinilo', v: 'vinilo', cd: 'cd', c: 'cd' }

export function interpretarFormato(texto) {
  return ALIAS_FORMATO[normalizar(texto)] ?? null
}

// Una línea por disco: "banda; disco; formato" (también separado por tabulaciones).
export function parsearLista(texto) {
  return texto
    .split(/\r?\n/)
    .map((original, i) => ({ numero: i + 1, original }))
    .filter(({ original }) => original.trim() !== '')
    .map(({ numero, original }) => {
      const campos = original.split(original.includes('\t') ? '\t' : ';').map((c) => c.trim())
      if (campos.length !== 3) return { numero, original, error: 'Tiene que tener 3 campos: banda; disco; formato' }
      const [banda, titulo, formatoTexto] = campos
      if (!banda) return { numero, original, error: 'Falta la banda' }
      if (!titulo) return { numero, original, error: 'Falta el disco' }
      const formato = interpretarFormato(formatoTexto)
      if (!formato) return { numero, original, error: `Formato desconocido: "${formatoTexto}"` }
      return { numero, original, banda: formatearTitulo(banda), titulo: formatearTitulo(titulo), formato }
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
    if (item) {
      item.copias += 1
      item.lineas.push(l.numero)
    } else {
      items.set(clave, { banda: l.banda, titulo: l.titulo, formato: l.formato, copias: 1, lineas: [l.numero] })
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
