import { mismoGenero } from './generos.js'
import { normalizar } from './texto.js'

// Sorteo de discos. El "bombo" son las bolas que entran con los filtros: cada bola es un título de una banda
// con sus discos (uno por formato), para que tenerlo en vinilo y en CD no le dé el doble de chances.

export const FORMATOS_SORTEO = { todos: 'Todos', vinilo: 'Vinilos', cd: 'CDs' }

const comparar = (a, b) => a.localeCompare(b, 'es', { sensitivity: 'base', numeric: true })

const delFormato = (discos, formato) => (formato === 'todos' ? discos : discos.filter((d) => d.formato === formato))
const generosDe = (bola, bandasPorId) => bandasPorId.get(bola.banda_id)?.generos ?? []

function agrupar(discos) {
  const bolas = new Map()
  for (const d of discos) {
    const clave = `${d.banda_id}|${d.titulo_norm ?? normalizar(d.titulo)}`
    if (!bolas.has(clave)) bolas.set(clave, { clave, banda_id: d.banda_id, discos: [] })
    bolas.get(clave).discos.push(d)
  }
  // El vinilo primero: es el que abre "Ver disco" cuando hay dos.
  for (const bola of bolas.values()) bola.discos.sort((a, b) => (a.formato === b.formato ? 0 : a.formato === 'vinilo' ? -1 : 1))
  return [...bolas.values()]
}

// Con géneros elegidos entra la bola cuya banda tenga alguno; las bandas sin géneros quedan afuera.
export function armarBombo(discos, bandasPorId, { formato = 'todos', generos = [] } = {}) {
  const bolas = agrupar(delFormato(discos, formato))
  if (!generos.length) return bolas
  return bolas.filter((bola) => generosDe(bola, bandasPorId).some((g) => generos.some((e) => mismoGenero(g, e))))
}

// Géneros presentes en el formato con cuántas bolas los tienen (del más usado al menos usado),
// y cuántas bolas no tienen géneros (no entran si se filtra por género).
export function contarGeneros(discos, bandasPorId, formato = 'todos') {
  const porClave = new Map()
  let sinGenero = 0
  for (const bola of agrupar(delFormato(discos, formato))) {
    const generos = generosDe(bola, bandasPorId)
    if (!generos.length) sinGenero++
    for (const g of generos) {
      const visto = porClave.get(normalizar(g))
      if (visto) visto.cantidad++
      else porClave.set(normalizar(g), { nombre: g, cantidad: 1 })
    }
  }
  const generos = [...porClave.values()].sort((a, b) => b.cantidad - a.cantidad || comparar(a.nombre, b.nombre))
  return { generos, sinGenero }
}

export function azarSeguro(n) {
  const [valor] = crypto.getRandomValues(new Uint32Array(1))
  return valor % n
}

// Una bola al azar, con la misma probabilidad, entre las que todavía no salieron. null si ya salieron todas.
export function elegir(bolas, salidas = new Set(), azar = azarSeguro) {
  const quedan = bolas.filter((b) => !salidas.has(b.clave))
  return quedan.length ? quedan[azar(quedan.length)] : null
}

export const claveFiltros = (formato, generos) => [formato, ...generos.map(normalizar).sort()].join('|')

// Ronda en curso: las bolas que ya salieron y la que se está mostrando. Vive en el módulo, no en la pantalla,
// para sobrevivir a ir al detalle del disco y volver; recargar la app empieza de cero.
// Con otros filtros es otra ronda.
let ronda = { filtros: null, salidas: new Set(), actual: null, agotada: false }

export function rondaDe(filtros) {
  if (ronda.filtros !== filtros) ronda = { filtros, salidas: new Set(), actual: null, agotada: false }
  return ronda
}

// Saca la siguiente bola de la ronda; si no queda ninguna, la marca agotada.
export function sacar(bombo, filtros, azar) {
  const r = rondaDe(filtros)
  const bola = elegir(bombo, r.salidas, azar)
  r.actual = bola?.clave ?? null
  r.agotada = !bola
  if (bola) r.salidas.add(bola.clave)
  return bola
}

export function empezarDeNuevo(filtros) {
  const r = rondaDe(filtros)
  r.salidas.clear()
  r.actual = null
  r.agotada = false
}
