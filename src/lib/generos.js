import { normalizar } from './texto.js'

// Géneros de una banda: hasta 3, con el nombre tal como viene de MusicBrainz o como se escribió.
// Dos géneros son el mismo si normalizar() los iguala ("Thrash  Metal" = "thrash metal").

export const MAXIMO_GENEROS = 3

const comparar = (a, b) => a.localeCompare(b, 'es', { sensitivity: 'base', numeric: true })

export const mismoGenero = (a, b) => normalizar(a) === normalizar(b)

// Escrito a mano: sin espacios sobrantes.
export const limpiarGenero = (texto = '') => texto.replace(/\s+/g, ' ').trim()

// Géneros que usa el catálogo y cuántas bandas los tienen: [{ nombre, bandas }], del más usado al menos usado.
export function generosDelCatalogo(bandas) {
  const porClave = new Map()
  for (const banda of bandas) {
    for (const genero of banda.generos ?? []) {
      const clave = normalizar(genero)
      const visto = porClave.get(clave)
      if (visto) visto.bandas++
      else porClave.set(clave, { nombre: genero, bandas: 1 })
    }
  }
  return [...porClave.values()].sort((a, b) => b.bandas - a.bandas || comparar(a.nombre, b.nombre))
}

// Forma con la que se guarda: la que ya usa el catálogo si es el mismo género; si no, la escrita, limpia.
export function resolverGenero(texto, catalogo) {
  const limpio = limpiarGenero(texto)
  return catalogo.find((g) => mismoGenero(g.nombre, limpio))?.nombre ?? limpio
}

// Suma un género al final. Devuelve la misma lista si está vacío, ya lo tiene o llegó al máximo.
export function agregarGenero(generos, genero) {
  if (!genero || generos.length >= MAXIMO_GENEROS || generos.some((g) => mismoGenero(g, genero))) return generos
  return [...generos, genero]
}

export const quitarGenero = (generos, genero) => generos.filter((g) => !mismoGenero(g, genero))

// Los mismos géneros, sin importar el orden ni cómo están escritos.
export const mismosGeneros = (a = [], b = []) => a.length === b.length && a.every((g) => b.some((h) => mismoGenero(g, h)))

// Géneros del catálogo para lo escrito, sin los que ya tiene la banda: primero los que empiezan así,
// después el resto, cada grupo del más usado al menos usado. Sin texto, los más usados.
export function sugerirGeneros(catalogo, texto, marcados = [], limite = 6) {
  const q = normalizar(texto)
  const empieza = (g) => (normalizar(g.nombre).startsWith(q) ? 0 : 1)
  return catalogo
    .filter((g) => normalizar(g.nombre).includes(q) && !marcados.some((m) => mismoGenero(m, g.nombre)))
    .sort((a, b) => empieza(a) - empieza(b))
    .slice(0, limite)
}
