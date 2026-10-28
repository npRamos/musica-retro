import { useEffect, useState } from 'react'

// Router de hash mínimo: #/vinilos, #/cd/banda/:id, #/disco/:id?x=y …
function leerRuta() {
  const [camino = '', consulta = ''] = location.hash.replace(/^#\/?/, '').split('?')
  return { partes: camino.split('/').filter(Boolean), consulta: new URLSearchParams(consulta) }
}

export function useRuta() {
  const [ruta, setRuta] = useState(leerRuta)
  useEffect(() => {
    const actualizar = () => setRuta(leerRuta())
    addEventListener('hashchange', actualizar)
    addEventListener('popstate', actualizar)
    return () => {
      removeEventListener('hashchange', actualizar)
      removeEventListener('popstate', actualizar)
    }
  }, [])
  return ruta
}

// Las entradas creadas por la app llevan una marca para saber si "atrás" queda dentro de ella.
export function navegar(destino, { reemplazar = false } = {}) {
  const url = `#/${destino.replace(/^\/+/, '')}`
  if (reemplazar) history.replaceState(history.state, '', url)
  else history.pushState({ app: true }, '', url)
  dispatchEvent(new HashChangeEvent('hashchange'))
}

export function volver(alternativa) {
  if (history.state?.app) history.back()
  else navegar(alternativa, { reemplazar: true })
}

export const SLUG_FORMATO = { vinilo: 'vinilos', cd: 'cd' }
export const FORMATO_DE_SLUG = { vinilos: 'vinilo', cd: 'cd' }
