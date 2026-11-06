import { normalizar } from './texto.js'

// Lista de deseados: los discos que se quieren comprar. Sin formato (null), sirve cualquiera.

const comparar = (a, b) => a.localeCompare(b, 'es', { sensitivity: 'base', numeric: true })

// Por banda y título.
export function ordenarDeseados(deseados, bandasPorId) {
  const banda = (d) => bandasPorId.get(d.banda_id)?.nombre ?? ''
  return [...deseados].sort((a, b) => comparar(banda(a), banda(b)) || comparar(a.titulo, b.titulo))
}

// Los de una banda con el formato de la pestaña o sin formato, por año (los que no tienen, al final) y título.
export function pendientesDeBanda(deseados, bandaId, formato) {
  return deseados
    .filter((d) => d.banda_id === bandaId && (!d.formato || d.formato === formato))
    .sort((a, b) => (a.anio ?? 9999) - (b.anio ?? 9999) || comparar(a.titulo, b.titulo))
}

// Por qué no se puede agregar: 'ya-lo-tenes', 'ya-esta' o null. bandaId: null si la banda todavía no existe.
export function motivoParaNoAgregar({ bandaId, titulo, formato = null }, discos, deseados) {
  if (!bandaId) return null
  const q = normalizar(titulo)
  const mismo = (d) => d.banda_id === bandaId && (d.titulo_norm ?? normalizar(d.titulo)) === q
  if (discos.some((d) => mismo(d) && (!formato || d.formato === formato))) return 'ya-lo-tenes'
  if (deseados.some((d) => mismo(d) && (!d.formato || d.formato === formato))) return 'ya-esta'
  return null
}

// Alta de un disco con los datos del deseado: al guardarlo, el deseado se resuelve.
export function rutaCargar(deseado, banda) {
  const datos = { banda: banda?.nombre ?? '', titulo: deseado.titulo, deseado: deseado.id, ...(deseado.formato && { formato: deseado.formato }) }
  return `agregar?${new URLSearchParams(datos)}`
}
