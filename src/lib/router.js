import { useEffect, useState } from 'react'

// Router de hash mínimo: #/vinilos, #/cd/banda/:id, #/disco/:id?x=y …
function leerRuta() {
  const [camino = '', consulta = ''] = location.hash.replace(/^#\/?/, '').split('?')
  return { partes: camino.split('/').filter(Boolean), consulta: new URLSearchParams(consulta) }
}

// Identifica la pantalla en la jerarquía: las pestañas son el inicio y la banda no depende del formato.
export function claveDe(ruta) {
  const camino = ruta.replace(/^\/+/, '').split('?')[0]
  if (['', 'vinilos', 'cd'].includes(camino)) return ''
  return camino.replace(/^(vinilos|cd)\/banda\//, 'banda/')
}

// Cuántas entradas hay que retroceder hasta la más cercana con esa clave, o null si no está.
export function pasosHasta(pila = [], clave) {
  const i = pila.findLastIndex((ruta) => claveDe(ruta) === clave)
  return i === -1 ? null : pila.length - i
}

// Cada entrada de la app guarda las rutas que tiene detrás (de la más vieja a la más nueva).
const rutaActual = () => location.hash.replace(/^#\/?/, '')
const pilaActual = () => history.state?.pila ?? []
const url = (destino) => `#/${destino.replace(/^\/+/, '')}`

// Reemplazo que subir deja para cuando history.go llegue a la entrada; lo aplica el listener de useRuta.
let pendiente = null

function aplicarPendiente() {
  if (pendiente && claveDe(rutaActual()) === pendiente.clave) history.replaceState({ app: true, pila: pilaActual() }, '', url(pendiente.destino))
  pendiente = null
}

export function useRuta() {
  const [ruta, setRuta] = useState(leerRuta)
  useEffect(() => {
    const actualizar = () => setRuta(leerRuta())
    const alVolver = () => {
      aplicarPendiente()
      actualizar()
    }
    addEventListener('hashchange', actualizar)
    addEventListener('popstate', alVolver)
    return () => {
      removeEventListener('hashchange', actualizar)
      removeEventListener('popstate', alVolver)
    }
  }, [])
  return ruta
}

// Bajar o saltar a otra pantalla: agrega una entrada (o reemplaza la actual, conservando lo que tiene detrás).
export function navegar(destino, { reemplazar = false } = {}) {
  pendiente = null
  if (reemplazar) history.replaceState({ app: true, pila: pilaActual() }, '', url(destino))
  else history.pushState({ app: true, pila: [...pilaActual(), rutaActual()] }, '', url(destino))
  dispatchEvent(new HashChangeEvent('hashchange'))
}

// Subir en la jerarquía: retrocede hasta la entrada del destino si está detrás; si no, reemplaza la actual.
// Con `en`, la entrada a la que se retrocede es otra pantalla (por ejemplo, la banda que se unió) y se cambia por el destino.
export function subir(destino, { en = destino } = {}) {
  const clave = claveDe(en)
  const pila = pilaActual()
  const pasos = pasosHasta(pila, clave)
  if (pasos === null) return navegar(destino, { reemplazar: true })
  const llegada = pila[pila.length - pasos]
  pendiente = llegada === destino.replace(/^\/+/, '') ? null : { clave, destino }
  history.go(-pasos)
}

// Flecha ← del encabezado: lo mismo que el atrás del celular; sin nada de la app detrás, va a la pantalla padre.
export function volver(alternativa) {
  if (pilaActual().length > 0) history.back()
  else navegar(alternativa, { reemplazar: true })
}

export const SLUG_FORMATO = { vinilo: 'vinilos', cd: 'cd' }
export const FORMATO_DE_SLUG = { vinilo: 'vinilo', cd: 'cd' }
