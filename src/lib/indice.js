import { normalizar } from './texto.js'

// Índice al costado de la lista: qué marca le toca a cada elemento (letra, género o mes) según cómo se ve.

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

// null: agrupada por género, las marcas son los títulos de las secciones.
export function criterioDe(orden, agrupar) {
  if (agrupar === 'generos') return null
  if (orden === 'reciente') return 'mes'
  if (orden === 'genero') return 'genero'
  return 'letra'
}

// La ñ cae en la N (normalizar le quita la tilde); lo que no empieza con letra va en "#".
export function marcaDe(banda, fecha, criterio) {
  if (criterio === 'genero') return banda?.generos?.[0] ?? 'Sin género'
  if (criterio === 'mes') {
    if (!fecha) return '—'
    const d = new Date(fecha)
    return `${MESES[d.getMonth()]} ${d.getFullYear()}`
  }
  const inicial = normalizar(banda?.nombre ?? '').charAt(0)
  return /\p{L}/u.test(inicial) ? inicial.toUpperCase() : '#'
}

// La marca de cada elemento, solo en el primero de cada tramo (null en los demás): es el que lleva data-marca.
export function primerasMarcas(marcas) {
  return marcas.map((m, i) => (i === 0 || m !== marcas[i - 1] ? m : null))
}

// marcas: [{ texto, y }] de arriba abajo. Se saltean las que quedan a menos de `separacion` de la última mostrada.
export function ralear(marcas, separacion) {
  const visibles = []
  for (const m of marcas) if (!visibles.length || m.y - visibles.at(-1).y >= separacion) visibles.push(m)
  return visibles
}
