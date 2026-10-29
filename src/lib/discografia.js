import { normalizar } from './texto.js'

// Transformaciones puras de las respuestas de MusicBrainz: agrupar discos, elegir la edición, temas.

export const GRUPOS = [
  { clave: 'estudio', titulo: 'Estudio' },
  { clave: 'ep', titulo: 'EP' },
  { clave: 'vivo', titulo: 'En vivo' },
  { clave: 'compilados', titulo: 'Compilados' },
]

const comparar = (a, b) => a.localeCompare(b, 'es', { sensitivity: 'base', numeric: true })

export function anioDe(fecha) {
  const m = /^(\d{4})/.exec(fecha ?? '')
  return m ? Number(m[1]) : null
}

// Live va a "En vivo"; cualquier otro tipo secundario (compilación, remix, banda sonora…) a "Compilados".
function grupoDe(rg) {
  const secundarios = rg['secondary-types'] ?? []
  if (secundarios.includes('Live')) return 'vivo'
  if (secundarios.length) return 'compilados'
  if (rg['primary-type'] === 'EP') return 'ep'
  return 'estudio'
}

export function simplificarArtista(a) {
  return { id: a.id, nombre: a.name, pais: a.country ?? null, desambiguacion: a.disambiguation || null, score: a.score ?? 100 }
}

export function simplificarDisco(rg) {
  const artista = rg['artist-credit']?.[0]?.artist
  return {
    id: rg.id,
    titulo: rg.title,
    anio: anioDe(rg['first-release-date']),
    grupo: grupoDe(rg),
    score: rg.score ?? 100,
    artista: artista ? { id: artista.id, nombre: artista.name } : null,
  }
}

const porAnio = (a, b) => (a.anio ?? 9999) - (b.anio ?? 9999) || comparar(a.titulo, b.titulo)

// Grupos no vacíos, en el orden de GRUPOS, cada uno por año. El texto filtra por título.
export function agruparDiscos(discos, texto = '') {
  const q = normalizar(texto)
  const filtrados = q ? discos.filter((d) => normalizar(d.titulo).includes(q)) : discos
  return GRUPOS.map((g) => ({ ...g, discos: filtrados.filter((d) => d.grupo === g.clave).sort(porAnio) })).filter((g) => g.discos.length)
}

// ─── Ediciones ──────────────────────────────────────────────────────────
const ES_FORMATO = { vinilo: (f) => /vinyl/i.test(f), cd: (f) => /\bCD\b/i.test(f) }

export function simplificarEdicion(r) {
  return {
    id: r.id,
    fecha: r.date ?? '',
    pais: r.country ?? null,
    formatos: (r.media ?? []).map((m) => m.format).filter(Boolean),
    tapa: Boolean(r['cover-art-archive']?.front),
    contratapa: Boolean(r['cover-art-archive']?.back),
  }
}

export const coincideFormato = (edicion, formato) => edicion.formatos.some((f) => ES_FORMATO[formato]?.(f))

// Formato coincidente, con tapa, con contratapa, argentina y la más vieja, en ese orden de prioridad.
export function elegirEdicion(ediciones, formato) {
  if (!ediciones.length) return { edicion: null, coincide: false }
  const clave = (e) => [coincideFormato(e, formato) ? 0 : 1, e.tapa ? 0 : 1, e.contratapa ? 0 : 1, e.pais === 'AR' ? 0 : 1, e.fecha || '9999']
  const edicion = [...ediciones].sort((a, b) => {
    const [ka, kb] = [clave(a), clave(b)]
    for (let i = 0; i < ka.length; i++) if (ka[i] !== kb[i]) return ka[i] < kb[i] ? -1 : 1
    return 0
  })[0]
  return { edicion, coincide: coincideFormato(edicion, formato) }
}

// "CD · AR · 1986", "2×12" Vinilo · 1990"
export function describirEdicion(e) {
  const cuenta = new Map()
  for (const f of e.formatos) cuenta.set(f, (cuenta.get(f) ?? 0) + 1)
  const formatos = [...cuenta].map(([f, n]) => `${n > 1 ? `${n}×` : ''}${f.replace(/Vinyl/i, 'Vinilo')}`).join(' + ')
  return [formatos || 'Sin formato', e.pais, anioDe(e.fecha)].filter(Boolean).join(' · ')
}

// ─── Temas ──────────────────────────────────────────────────────────────
// release?inc=recordings → [{medio, formato, temas: [{n, titulo, ms}]}]
export function convertirTemas(release) {
  return (release.media ?? [])
    .map((m, i) => ({
      medio: m.position ?? i + 1,
      formato: m.format ?? null,
      temas: (m.tracks ?? []).map((t) => ({ n: t.number ?? String(t.position), titulo: t.title, ms: t.length ?? null })),
    }))
    .filter((m) => m.temas.length)
}

export const contarTemas = (temas) => (temas ?? []).reduce((total, m) => total + m.temas.length, 0)

export function duracion(ms) {
  if (!ms) return ''
  const s = Math.round(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export const tituloMedio = (medio, total) => (total > 1 ? `Disco ${medio.medio}` : null)

// ─── Candidatos para completar ──────────────────────────────────────────
export const elegirArtista = (artistas, nombre) =>
  artistas.find((a) => a.score >= 90 && normalizar(a.nombre) === normalizar(nombre)) ?? null

// Título igual (normalizado). En resultados de búsqueda (aproximado), si no hay, el primero con buen puntaje.
export function elegirDisco(discos, titulo, { aproximado = false } = {}) {
  const q = normalizar(titulo)
  return discos.find((d) => normalizar(d.titulo) === q) ?? (aproximado ? discos.find((d) => d.score >= 90) : null) ?? null
}
