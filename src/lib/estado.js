import { normalizar } from './texto.js'

// Estado de un disco: etiquetas según el formato y una observación libre. Los valores son los que acepta la base.

export const ETIQUETAS = {
  rayado: 'Rayado',
  muy_rayado: 'Muy rayado',
  caja_rota: 'Caja rota',
  sin_caja: 'Sin caja',
  tapa_rota: 'Tapa rota',
  necesita_funda: 'Necesita funda',
}

export const ESTADOS_POR_FORMATO = {
  cd: ['rayado', 'muy_rayado', 'caja_rota', 'sin_caja'],
  vinilo: ['rayado', 'muy_rayado', 'tapa_rota', 'necesita_funda'],
}

// Filtro de "Discos con estado" que no es una etiqueta.
export const CON_OBSERVACION = 'observacion'
const TEXTO_OBSERVACION = 'Con observación'

const EXCLUYENTES = { rayado: 'muy_rayado', muy_rayado: 'rayado' }

// La copia del dispositivo puede venir de antes de que existieran estos datos.
export const estadoDe = (disco) => disco.estado ?? []
export const tieneEstado = (disco) => Boolean(estadoDe(disco).length || disco.observacion)
export const textoEstado = (estado = []) => estado.map((e) => ETIQUETAS[e]).join(', ')

// Marca o desmarca una etiqueta. "Rayado" y "Muy rayado" no van juntas: marcar una saca la otra.
export function alternarEstado(estado, valor) {
  if (estado.includes(valor)) return estado.filter((e) => e !== valor)
  return [...estado.filter((e) => e !== EXCLUYENTES[valor]), valor]
}

// Al cambiar de formato se quitan las que no corresponden al nuevo.
export const estadoDelFormato = (estado, formato) => estado.filter((e) => ESTADOS_POR_FORMATO[formato]?.includes(e))

// Columna Estado de una planilla: etiquetas separadas por coma. Devuelve { estado } o { error }.
export function leerEstado(texto, formato) {
  const porTexto = new Map(ESTADOS_POR_FORMATO[formato].map((e) => [normalizar(ETIQUETAS[e]), e]))
  const estado = []
  for (const parte of String(texto).split(',')) {
    const etiqueta = parte.trim()
    if (!etiqueta) continue
    const valor = porTexto.get(normalizar(etiqueta))
    if (!valor) return { error: `Estado inválido para ${formato === 'cd' ? 'CD' : 'vinilo'}: "${etiqueta}"` }
    if (!estado.includes(valor)) estado.push(valor)
  }
  if (estado.includes('rayado') && estado.includes('muy_rayado')) return { error: 'No puede ser "Rayado" y "Muy rayado" a la vez' }
  return { estado }
}

export const discosConEstado = (discos) => discos.filter(tieneEstado)

// Chips del filtro: las etiquetas en uso, en orden fijo, y "Con observación" al final. [{ valor, texto, cantidad }]
export function filtrosDeEstado(discos) {
  const contar = (cumple) => discos.filter(cumple).length
  const chips = Object.keys(ETIQUETAS).map((valor) => ({ valor, texto: ETIQUETAS[valor], cantidad: contar((d) => estadoDe(d).includes(valor)) }))
  chips.push({ valor: CON_OBSERVACION, texto: TEXTO_OBSERVACION, cantidad: contar((d) => Boolean(d.observacion)) })
  return chips.filter((c) => c.cantidad > 0)
}

// Con alguno de los filtros elegidos; sin elegir, todos.
export function filtrarPorEstado(discos, elegidos) {
  if (!elegidos.length) return discos
  return discos.filter((d) => elegidos.some((e) => (e === CON_OBSERVACION ? Boolean(d.observacion) : estadoDe(d).includes(e))))
}
