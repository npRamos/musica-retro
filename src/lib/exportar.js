import { NOMBRE_FORMATO_SINGULAR, fechaLocal, ordenarDiscos } from './catalogo.js'

// Planilla CSV (para Excel en español y Google Sheets) y texto para copiar o mandar por WhatsApp.

export const ALCANCES = { todo: 'Todo', vinilo: 'Vinilos', cd: 'CDs' }
const SLUG_ALCANCE = { todo: 'todo', vinilo: 'vinilos', cd: 'cds' }

const deAlcance = (discos, alcance) => (alcance === 'todo' ? discos : discos.filter((d) => d.formato === alcance))
// Por banda y, dentro de cada una, por año y título: como la discografía en la app.
const ordenados = (discos, bandasPorId) => ordenarDiscos(discos, 'az', bandasPorId)

// ─── CSV ────────────────────────────────────────────────────────────────
export const COLUMNAS = ['Banda', 'Disco', 'Formato', 'Copias', 'Año', 'Cargado', 'Spotify']
const FORMATO_CSV = { vinilo: 'Vinilo', cd: 'CD' }

// RFC 4180: entre comillas si tiene ; comillas o salto de línea, con las comillas duplicadas.
export function celdaCsv(valor) {
  const texto = valor == null ? '' : String(valor)
  return /[;"\r\n]/.test(texto) ? `"${texto.replaceAll('"', '""')}"` : texto
}

export function fechaCsv(fecha) {
  const [a, m, d] = fechaLocal(fecha).split('-')
  return `${d}/${m}/${a}`
}

// BOM + ";" + CRLF: Excel en español lo abre en columnas y con las tildes bien.
export function generarCsv(discos, bandasPorId, alcance = 'todo') {
  const filas = ordenados(deAlcance(discos, alcance), bandasPorId).map((d) => [
    bandasPorId.get(d.banda_id)?.nombre ?? '',
    d.titulo,
    FORMATO_CSV[d.formato],
    d.copias,
    d.anio ?? '',
    fechaCsv(d.fecha_carga),
    d.spotify_url ?? '',
  ])
  return `﻿${[COLUMNAS, ...filas].map((fila) => fila.map(celdaCsv).join(';')).join('\r\n')}\r\n`
}

export const nombreArchivo = (alcance, hoy = new Date()) => `musica-retro-${SLUG_ALCANCE[alcance]}-${fechaLocal(hoy)}.csv`

// ─── Texto ──────────────────────────────────────────────────────────────
const linea = (d, conFormato) =>
  `• ${d.titulo}${d.anio ? ` (${d.anio})` : ''}${conFormato ? ` · ${NOMBRE_FORMATO_SINGULAR[d.formato]}` : ''}${d.copias > 1 ? ` ×${d.copias}` : ''}`

// Bandas en negrita (sintaxis de WhatsApp), un disco por línea. El formato va solo si se mezclan los dos.
export function textoCatalogo(discos, bandasPorId, alcance = 'todo') {
  const lista = ordenados(deAlcance(discos, alcance), bandasPorId)
  const bloques = []
  for (const d of lista) {
    const banda = bandasPorId.get(d.banda_id)?.nombre ?? ''
    if (bloques.at(-1)?.banda !== banda) bloques.push({ banda, lineas: [] })
    bloques.at(-1).lineas.push(linea(d, alcance === 'todo'))
  }
  return [`*Música Retro* · ${ALCANCES[alcance]} (${lista.length})`, ...bloques.map((b) => `*${b.banda}*\n${b.lineas.join('\n')}`)].join('\n\n')
}

// Los discos de una banda, de los dos formatos.
export function textoBanda(banda, discos) {
  const suyos = ordenados(
    discos.filter((d) => d.banda_id === banda.id),
    new Map([[banda.id, banda]]),
  )
  return `*${banda.nombre}*\n${suyos.map((d) => linea(d, true)).join('\n')}`
}

// WhatsApp acepta hasta 65.536 caracteres por mensaje; se deja margen.
export const LIMITE_WHATSAPP = 60000
export const enlaceWhatsapp = (texto) => `https://wa.me/?text=${encodeURIComponent(texto)}`
