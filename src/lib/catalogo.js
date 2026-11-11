import { mismoGenero } from './generos.js'
import { normalizar } from './texto.js'

export const FORMATOS = ['vinilo', 'cd']
export const NOMBRE_FORMATO = { vinilo: 'Vinilos', cd: 'CDs' }
export const NOMBRE_FORMATO_SINGULAR = { vinilo: 'vinilo', cd: 'CD' }
export const ORDENES = { az: 'A → Z', za: 'Z → A', reciente: 'Última compra', genero: 'Género' }
// Dentro de una banda se suma la discografía por año (el orden por defecto ahí); por género no, porque es uno solo.
export const ORDENES_BANDA = { anio: 'Por año', az: ORDENES.az, za: ORDENES.za, reciente: ORDENES.reciente }
// Cómo se muestran las pestañas: por banda, por género (secciones) o todos los discos sueltos.
export const AGRUPACIONES = { bandas: 'Por banda', generos: 'Por género', discos: 'Todos los discos' }

const comparar = (a, b) => a.localeCompare(b, 'es', { sensitivity: 'base', numeric: true })

// Por género: por el primero de la banda (el más votado, o el primero que se eligió); sin géneros, al final.
const generoPrincipal = (banda) => banda?.generos?.[0] ?? null
function porGenero(a, b) {
  if (!a || !b) return (a ? 0 : 1) - (b ? 0 : 1)
  return comparar(a, b)
}

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
  if (orden === 'genero') return copia.sort((a, b) => porGenero(generoPrincipal(a.banda), generoPrincipal(b.banda)) || comparar(a.banda.nombre, b.banda.nombre))
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
  const genero = (d) => (orden === 'genero' ? generoPrincipal(bandasPorId?.get(d.banda_id)) : null)
  if (bandasPorId) copia.sort((a, b) => porGenero(genero(a), genero(b)) || comparar(banda(a), banda(b)) || porAnio(a, b) || comparar(a.titulo, b.titulo))
  else copia.sort((a, b) => comparar(a.titulo, b.titulo))
  return orden === 'za' ? copia.reverse() : copia
}

// Bandas para "Completar géneros": con los géneros sin revisar y al menos un disco (las que solo tienen deseados, no).
export function pendientesDeGeneros(bandas, discos) {
  const conDiscos = new Set(discos.map((d) => d.banda_id))
  return bandas.filter((b) => b.generos_estado === 'pendiente' && conDiscos.has(b.id))
}

// Los discos de una banda en un formato, en el orden de su pantalla.
export const discosDeBanda = (discos, bandaId, formato, orden) =>
  ordenarDiscos(discos.filter((d) => d.banda_id === bandaId && d.formato === formato), orden)

// El anterior y el siguiente de un disco dentro de la lista; en los extremos, null.
export function discosVecinos(lista, id) {
  const i = lista.findIndex((d) => d.id === id)
  if (i === -1) return { anterior: null, siguiente: null }
  return { anterior: lista[i - 1] ?? null, siguiente: lista[i + 1] ?? null }
}

// Secciones por género, en orden alfabético y "Sin género" (genero: null) al final. Dentro de cada sección se
// respeta el orden de los elementos. generosDe(elemento) dice en qué secciones va; vacío, en "Sin género".
function armarSecciones(elementos, generosDe) {
  const secciones = new Map()
  const sinGenero = []
  for (const item of elementos) {
    const generos = generosDe(item)
    if (!generos.length) sinGenero.push(item)
    for (const g of generos) {
      const clave = normalizar(g)
      if (!secciones.has(clave)) secciones.set(clave, { genero: g, items: [] })
      secciones.get(clave).items.push(item)
    }
  }
  const lista = [...secciones.values()].sort((a, b) => comparar(a.genero, b.genero))
  return sinGenero.length ? [...lista, { genero: null, items: sinGenero }] : lista
}

// Agrupada por género: una banda con varios géneros aparece en cada uno.
export const agruparPorGenero = (items) => armarSecciones(items, (item) => item.banda.generos ?? [])

export const SIN_GENERO = 'Sin género'
const generoElegido = (genero, elegidos) => elegidos.some((e) => mismoGenero(e, genero ?? SIN_GENERO))
const generosDeBanda = (banda) => banda?.generos ?? []

export const seVePorGenero = (agrupar, orden) => agrupar === 'generos' || orden === 'genero'

// Ordenada por género: cada elemento aparece una sola vez, bajo su género principal o, con un filtro activo, bajo el
// primero de sus géneros que esté elegido. Si no, una banda elegida por su segundo género se vería bajo otro título.
export function seccionesPorOrden(elementos, bandaDe, elegidos = []) {
  return armarSecciones(elementos, (item) => {
    const generos = generosDeBanda(bandaDe(item))
    const titulo = generos.find((g) => generoElegido(g, elegidos)) ?? generos[0]
    return titulo ? [titulo] : []
  })
}

// Chips del filtro: [{ nombre, cantidad }] en el orden de las secciones.
export function chipsDeGeneros(elementos, bandaDe) {
  return armarSecciones(elementos, (item) => generosDeBanda(bandaDe(item))).map((s) => ({ nombre: s.genero ?? SIN_GENERO, cantidad: s.items.length }))
}

// Los elegidos que existen en la lista actual: los demás se ignoran, sin borrarse de la preferencia.
export const generosVigentes = (filtro, chips) => chips.filter((c) => filtro.some((f) => mismoGenero(f, c.nombre))).map((c) => c.nombre)

export function filtrarPorGenero(elementos, bandaDe, elegidos) {
  if (!elegidos.length) return elementos
  return elementos.filter((item) => {
    const generos = generosDeBanda(bandaDe(item))
    return generos.length ? generos.some((g) => generoElegido(g, elegidos)) : generoElegido(null, elegidos)
  })
}

export const filtrarSecciones = (secciones, elegidos) => (elegidos.length ? secciones.filter((s) => generoElegido(s.genero, elegidos)) : secciones)

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

// El link limpio del álbum o de la playlist, o null si es de otra cosa (un tema, un perfil). Saca los parámetros,
// como el `si` que identifica a quien copió el link, y el prefijo de idioma.
const RUTA_DISCO = /^\/(?:intl-[a-z]{2}\/)?(album|playlist)\/([A-Za-z0-9]+)\/?$/
export function limpiarLinkSpotify(url) {
  try {
    const u = new URL(String(url ?? '').trim())
    if (u.protocol !== 'https:' || u.hostname !== 'open.spotify.com') return null
    const [, tipo, id] = RUTA_DISCO.exec(u.pathname) ?? []
    return id ? `https://open.spotify.com/${tipo}/${id}` : null
  } catch {
    return null
  }
}

export function linkSpotify(disco, banda) {
  return limpiarLinkSpotify(disco.spotify_url) ?? `https://open.spotify.com/search/${encodeURIComponent(`${banda?.nombre ?? ''} ${disco.titulo}`.trim())}`
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

// Índice de un color estable a partir de un nombre (para tarjetas sin imagen).
export function tonoDe(nombre, cantidad) {
  let h = 0
  for (const c of normalizar(nombre)) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return h % cantidad
}
