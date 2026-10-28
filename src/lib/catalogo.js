import { normalizar } from './texto.js'

export const FORMATOS = ['vinilo', 'cd']
export const NOMBRE_FORMATO = { vinilo: 'Vinilos', cd: 'CDs' }
export const NOMBRE_FORMATO_SINGULAR = { vinilo: 'vinilo', cd: 'CD' }
export const ORDENES = { az: 'A → Z', za: 'Z → A', reciente: 'Última compra' }

const comparar = (a, b) => a.localeCompare(b, 'es', { sensitivity: 'base', numeric: true })

export const otroFormato = (formato) => (formato === 'vinilo' ? 'cd' : 'vinilo')

export function contarPorFormato(discos) {
  const cuenta = { vinilo: 0, cd: 0 }
  for (const d of discos) cuenta[d.formato] += 1
  return cuenta
}

// Bandas que tienen al menos un disco en el formato, con sus discos y datos para la tarjeta.
export function bandasDeFormato(bandas, discos, formato) {
  const porBanda = new Map()
  for (const d of discos) {
    if (d.formato !== formato) continue
    if (!porBanda.has(d.banda_id)) porBanda.set(d.banda_id, [])
    porBanda.get(d.banda_id).push(d)
  }
  return bandas
    .filter((b) => porBanda.has(b.id))
    .map((banda) => {
      const suyos = porBanda.get(banda.id)
      return {
        banda,
        discos: suyos,
        cantidad: suyos.length,
        ultima: suyos.reduce((max, d) => (d.fecha_carga > max ? d.fecha_carga : max), ''),
        tapas: ordenarDiscos(suyos, 'reciente').map((d) => d.tapa_path).filter(Boolean).slice(0, 4),
      }
    })
}

export function ordenarBandas(items, orden) {
  const copia = [...items]
  if (orden === 'reciente') return copia.sort((a, b) => (b.ultima > a.ultima ? 1 : b.ultima < a.ultima ? -1 : comparar(a.banda.nombre, b.banda.nombre)))
  copia.sort((a, b) => comparar(a.banda.nombre, b.banda.nombre))
  return orden === 'za' ? copia.reverse() : copia
}

export function ordenarDiscos(discos, orden, bandasPorId) {
  const nombre = (d) => (bandasPorId ? `${bandasPorId.get(d.banda_id)?.nombre ?? ''} ${d.titulo}` : d.titulo)
  const copia = [...discos]
  if (orden === 'reciente') return copia.sort((a, b) => (b.fecha_carga > a.fecha_carga ? 1 : b.fecha_carga < a.fecha_carga ? -1 : 0))
  copia.sort((a, b) => comparar(nombre(a), nombre(b)))
  return orden === 'za' ? copia.reverse() : copia
}

// Discos que coinciden por título o banda en el formato activo, y cuántos hay en el otro.
export function buscar(discos, bandasPorId, texto, formato) {
  const q = normalizar(texto)
  if (!q) return { enFormato: [], enOtro: 0 }
  const coincide = (d) => normalizar(d.titulo).includes(q) || normalizar(bandasPorId.get(d.banda_id)?.nombre ?? '').includes(q)
  const enFormato = []
  let enOtro = 0
  for (const d of discos) {
    if (!coincide(d)) continue
    if (d.formato === formato) enFormato.push(d)
    else enOtro += 1
  }
  return { enFormato, enOtro }
}

export function linkSpotify(disco, banda) {
  if (disco.spotify_url) return disco.spotify_url
  return `https://open.spotify.com/search/${encodeURIComponent(`${banda?.nombre ?? ''} ${disco.titulo}`.trim())}`
}

export function esLinkSpotifyValido(url) {
  try {
    const u = new URL(url)
    return u.protocol === 'https:' && u.hostname === 'open.spotify.com'
  } catch {
    return false
  }
}

// Índice de un color estable a partir de un nombre (para tarjetas sin imagen).
export function tonoDe(nombre, cantidad) {
  let h = 0
  for (const c of normalizar(nombre)) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return h % cantidad
}
