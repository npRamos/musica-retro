import { normalizar } from './texto.js'

export const FORMATOS = ['vinilo', 'cd']
export const NOMBRE_FORMATO = { vinilo: 'Vinilos', cd: 'CDs' }
export const NOMBRE_FORMATO_SINGULAR = { vinilo: 'vinilo', cd: 'CD' }
export const ORDENES = { az: 'A → Z', za: 'Z → A', reciente: 'Última compra' }
// Dentro de una banda se suma la discografía por año (el orden por defecto ahí).
export const ORDENES_BANDA = { anio: 'Por año', ...ORDENES }

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
  const nombre = (d) => d.titulo
  const copia = [...discos]
  if (orden === 'reciente') return copia.sort((a, b) => (b.fecha_carga > a.fecha_carga ? 1 : b.fecha_carga < a.fecha_carga ? -1 : 0))
  // Por año: del más viejo al más nuevo; los que no tienen año, al final por título.
  const porAnio = (a, b) => (a.anio ?? 9999) - (b.anio ?? 9999)
  if (orden === 'anio') return copia.sort((a, b) => porAnio(a, b) || comparar(nombre(a), nombre(b)))
  // Con bandas (todos los discos, búsqueda): por banda y, dentro de cada una, como discografía.
  const banda = (d) => bandasPorId?.get(d.banda_id)?.nombre ?? ''
  if (bandasPorId) copia.sort((a, b) => comparar(banda(a), banda(b)) || porAnio(a, b) || comparar(a.titulo, b.titulo))
  else copia.sort((a, b) => comparar(a.titulo, b.titulo))
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

// Año opcional: vacío o 4 cifras entre 1900 y 2100.
export function leerAnio(texto) {
  const t = String(texto ?? '').trim()
  if (!t) return { anio: null }
  const n = Number(t)
  if (!/^\d{4}$/.test(t) || n < 1900 || n > 2100) return { error: 'El año tiene que tener 4 cifras' }
  return { anio: n }
}

// Fecha de carga: "aaaa-mm-dd" en hora local (para un input date) y vuelta a las 12:00 locales,
// así ningún huso horario la corre de día.
const dosCifras = (n) => String(n).padStart(2, '0')
export function fechaLocal(fecha) {
  const d = new Date(fecha)
  return `${d.getFullYear()}-${dosCifras(d.getMonth() + 1)}-${dosCifras(d.getDate())}`
}
export function mediodiaLocal(dia) {
  const [a, m, d] = dia.split('-').map(Number)
  return new Date(a, m - 1, d, 12).toISOString()
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
